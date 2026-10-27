const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();

const {
  mainMenu,
  backButton,
  joinKeyboard,
  troubleshooterKeyboard,
} = require("./keyboards");

const { checkProduct } = require("./data/ugcGuidelines");
const { questions, answers } = require("./data/troubleshooter");

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing from .env");
}

if (!process.env.CHANNEL_ID || !process.env.CHANNEL_LINK) {
  throw new Error("CHANNEL_ID or CHANNEL_LINK is missing from .env");
}

if (
  !questions ||
  typeof questions !== "object" ||
  Array.isArray(questions) ||
  !answers ||
  typeof answers !== "object"
) {
  throw new Error(
    "Invalid troubleshooter.js format. Export questions and answers as objects.",
  );
}

const bot = new Telegraf(process.env.BOT_TOKEN);

const waitingForProduct = new Set();
const waitingForTroubleshooting = new Set();

const CONTENT = {
  content_guidelines: {
    title: "📋 UGC Content Guidelines",
    text: `
<b>✨ Basic UGC Guidelines</b>

📱 <b>Video format</b>
• Prefer portrait orientation (9:16).
• Videos should be at least 5 seconds long.
• Highlight the product clearly.
• Approved formats: Review, Try-On, Haul, or Voiceover.

📸 <b>Image quality</b>
• Use a clean, aesthetic background.
• Keep the product clearly visible.
• Avoid watermarks, text overlays, and collage edits.
• Use colour images, not black-and-white or sepia.
• Follow the solo-post requirement.

👗 <b>Apparel</b>
Show both yourself and the product in apparel posts.

⚠️ AI-generated content, Boomerangs, and videos stitched from pictures are prohibited under the guidelines supplied for this bot.

Please check the Myntra app for the latest rules.
`,
  },

  ugc_rewards: {
    title: "💰 UGC Rewards & Earnings",
    text: `
<b>💰 Understand your UGC rewards</b>

Your rewards may depend on:
• Creator level.
• Eligible image and video posts.
• Applicable reward rules.
• Approval of your content.

<b>Before posting:</b>
✅ Check product eligibility.
✅ Follow content guidelines.
✅ Check your UGC dashboard.

⚠️ Reward amounts and eligibility can change. Check the Myntra app for current rates.

UGC rewards and affiliate commissions are separate.
`,
  },

  post_rejected: {
    title: "❌ Post Rejected?",
    text: `
<b>🔍 Check these common issues</b>

📸 <b>Images</b>
• Product is not clearly visible.
• Background is cluttered.
• Watermarks, text overlays, or collage edits are present.
• Image orientation or quality does not meet the guidelines.

🎬 <b>Videos</b>
• Video is shorter than 5 seconds.
• Product is not highlighted.
• Format is not approved.
• Video is stitched from pictures.

<b>What to do:</b>
1. Check the rejection reason in the Myntra app.
2. Correct the identified issue.
3. Re-upload only if permitted.

⚠️ Re-uploading does not guarantee approval or payment.
`,
  },

  myncash: {
    title: "💳 MynCash & Payments",
    text: `
<b>💳 Check your payment issue</b>

First, identify your earning type:

🛍️ <b>UGC rewards</b>
Check your UGC dashboard and reward status.

🤝 <b>Affiliate commission</b>
Check eligible orders and payout status.

Also verify:
• Bank details.
• KYC and PAN, where required.
• Applicable payout cycle.
• Any required tax documentation.

⚠️ MynCash rewards and affiliate payouts are different.

For unresolved issues, contact support through the Myntra app's Help Center.
`,
  },

  affiliate: {
    title: "🤝 Affiliate Program",
    text: `
<b>🤝 Affiliate earnings</b>

Affiliate commissions may depend on eligible purchases made through your links.

Remember:
• Rates can vary by category and applicable rules.
• Cancelled or returned orders may not qualify.
• Some categories may be excluded.
• Payouts may require KYC, bank details, or tax documents.

Check your current affiliate dashboard for the latest terms.

UGC rewards and affiliate commissions are separate.
`,
  },

  levels: {
    title: "🏆 Creator Levels",
    text: `
<b>🏆 Creator levels</b>

The levels listed in the information available to this bot are:

🌱 Curator
✨ Stylist
💎 Maestro
👑 Trendsetter

Your level may affect certain benefits or earning opportunities.

Open your Myntra UGC dashboard to check your current level and applicable benefits.

⚠️ Criteria and benefits may change.
`,
  },

  other: {
    title: "📞 Other Help",
    text: `
<b>📞 Need additional help?</b>

Keep these details ready:
• Affected product or post.
• Screenshots of the issue.
• Relevant earning period.
• Existing support ticket number.

Open the Myntra app and visit the Help Center to raise or follow up on your issue.

🔒 Never share your password or OTP.
`,
  },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function isChannelMember(userId) {
  try {
    const member = await bot.telegram.getChatMember(
      process.env.CHANNEL_ID,
      userId,
    );

    return (
      member.status === "creator" ||
      member.status === "administrator" ||
      member.status === "member" ||
      (member.status === "restricted" && member.is_member === true)
    );
  } catch (error) {
    console.error("Membership check failed:", error.message);
    return false;
  }
}

async function showJoinPrompt(ctx) {
  await ctx.reply(
    `
🌸 <b>Welcome to Myntra GlamCare!</b>
<i>Powered by MynStyle07</i>

To access the bot:
1️⃣ Join our Telegram channel.
2️⃣ Subscribe to our YouTube channel.
3️⃣ Tap the verification button.

🔒 Telegram membership is checked automatically. YouTube subscription is not automatically verified.
`,
    {
      parse_mode: "HTML",
      ...joinKeyboard(
        process.env.CHANNEL_LINK,
        process.env.YOUTUBE_CHANNEL_LINK,
      ),
    },
  );
}

async function showMainMenu(ctx) {
  await ctx.reply(
    `
💖 <b>MYNTRA GLAMCARE</b>
<i>Powered by MynStyle07</i>

Your personal guide to Myntra UGC!

🛍️ Product eligibility
📋 Content guidelines
💰 Rewards and earnings
❌ Rejected posts
💳 MynCash and payments
🛠️ Troubleshooting

<b>Choose an option below:</b>
`,
    {
      parse_mode: "HTML",
      ...mainMenu,
    },
  );
}

async function sendSection(ctx, key) {
  const section = CONTENT[key];

  if (!section) {
    return ctx.reply("Section not found.", backButton);
  }

  return ctx.reply(`<b>${section.title}</b>\n${section.text}`, {
    parse_mode: "HTML",
    ...backButton,
  });
}

async function showTroubleshooter(ctx, questionKey) {
  const question = questions[questionKey];

  if (!question) {
    return ctx.reply(
      "Sorry, this troubleshooting question is unavailable.",
      backButton,
    );
  }

  waitingForProduct.delete(ctx.from.id);
  waitingForTroubleshooting.add(ctx.from.id);

  return ctx.reply(question.text, {
    parse_mode: "HTML",
    ...troubleshooterKeyboard(question),
  });
}

// Restrict features to Telegram channel members.
bot.use(async (ctx, next) => {
  const isStart = ctx.message?.text?.trim().startsWith("/start");
  const isMembershipCheck = ctx.callbackQuery?.data === "check_membership";

  if (isStart || isMembershipCheck) {
    return next();
  }

  if (!ctx.from) {
    return next();
  }

  const member = await isChannelMember(ctx.from.id);

  if (!member) {
    await showJoinPrompt(ctx);
    return;
  }

  return next();
});

bot.start(async (ctx) => {
  waitingForProduct.delete(ctx.from.id);
  waitingForTroubleshooting.delete(ctx.from.id);

  if (!(await isChannelMember(ctx.from.id))) {
    return showJoinPrompt(ctx);
  }

  return showMainMenu(ctx);
});

bot.action("check_membership", async (ctx) => {
  await ctx.answerCbQuery();

  if (!(await isChannelMember(ctx.from.id))) {
    return ctx.reply(
      "❌ I couldn't verify your Telegram membership. Join the channel and try again.",
      {
        ...joinKeyboard(
          process.env.CHANNEL_LINK,
          process.env.YOUTUBE_CHANNEL_LINK,
        ),
      },
    );
  }

  await ctx.reply("✅ Telegram membership verified!");
  return showMainMenu(ctx);
});

bot.action("main_menu", async (ctx) => {
  await ctx.answerCbQuery();

  waitingForProduct.delete(ctx.from.id);
  waitingForTroubleshooting.delete(ctx.from.id);

  return showMainMenu(ctx);
});

bot.action("product_eligibility", async (ctx) => {
  await ctx.answerCbQuery();

  waitingForProduct.add(ctx.from.id);
  waitingForTroubleshooting.delete(ctx.from.id);

  return ctx.reply(
    `
🛍️ <b>Product Eligibility Checker</b>

Send a product name, for example:
• Soap
• Anti-dandruff shampoo
• Face wash
• Body lotion

I'll return one of these results:
🖼️ Images + Video
🎥 Video only
🚫 Nothing
`,
    {
      parse_mode: "HTML",
      ...backButton,
    },
  );
});

for (const key of Object.keys(CONTENT)) {
  bot.action(key, async (ctx) => {
    await ctx.answerCbQuery();

    waitingForProduct.delete(ctx.from.id);
    waitingForTroubleshooting.delete(ctx.from.id);

    return sendSection(ctx, key);
  });
}

// Start troubleshooting using the object-based question structure.
bot.action("troubleshooter", async (ctx) => {
  await ctx.answerCbQuery();
  return showTroubleshooter(ctx, "start");
});

// Register each possible troubleshooting destination.
// This correctly iterates over object keys, not the object itself.
for (const questionKey of Object.keys(questions)) {
  bot.action(`trouble_${questionKey}`, async (ctx) => {
    await ctx.answerCbQuery();
    return showTroubleshooter(ctx, questionKey);
  });
}

// Handle product names and text messages.
bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const message = ctx.message.text.trim();

  if (message.startsWith("/")) return;

  if (waitingForProduct.has(userId)) {
    waitingForProduct.delete(userId);

    try {
      const result = checkProduct(message);

      if (!result || !result.found) {
        return ctx.reply(
          `🔎 I couldn't find a confident match for "${escapeHtml(message)}".\n\nTry a more specific product name.`,
          {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([
              [
                Markup.button.callback(
                  "🔄 Try Another Product",
                  "product_eligibility",
                ),
              ],
              [Markup.button.callback("🏠 Main Menu", "main_menu")],
            ]),
          },
        );
      }

      const image = Boolean(result.image);
      const video = Boolean(result.video);

      let decision;
      let explanation;

      if (image && video) {
        decision = "🖼️ Images + Video";
        explanation = "Both image and video are marked as allowed.";
      } else if (video) {
        decision = "🎥 Video only";
        explanation = "Video is marked as allowed; image is not.";
      } else {
        decision = "🚫 Nothing";
        explanation = "Neither image nor video is marked as allowed.";
      }

      return ctx.reply(
        `
🛍️ <b>PRODUCT ELIGIBILITY RESULT</b>

📦 <b>Product:</b> ${escapeHtml(result.product || message)}

━━━━━━━━━━━━━━━━━━
<b>${decision}</b>
━━━━━━━━━━━━━━━━━━

${explanation}

⚠️ Confirm uncertain cases using the latest Myntra UGC rules.
`,
        {
          parse_mode: "HTML",
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback(
                "🔄 Check Another Product",
                "product_eligibility",
              ),
            ],
            [Markup.button.callback("📋 UGC Guidelines", "content_guidelines")],
            [Markup.button.callback("🏠 Main Menu", "main_menu")],
          ]),
        },
      );
    } catch (error) {
      console.error("Product eligibility error:", error);
      return ctx.reply(
        "⚠️ Something went wrong while checking the product.",
        backButton,
      );
    }
  }

  if (waitingForTroubleshooting.has(userId)) {
    return ctx.reply(
      "💗 Please select one of the troubleshooting options above.",
      backButton,
    );
  }
});

bot.catch((error, ctx) => {
  console.error(`Error processing update ${ctx.update?.update_id}:`, error);
});

bot
  .launch()
  .then(() => {
    console.log("🌸 Myntra GlamCare Bot is running!");
    console.log("✨ Powered by MynStyle07");
  })
  .catch((error) => {
    console.error("Failed to start bot:", error);
    process.exit(1);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
