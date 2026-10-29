const { Telegraf, Markup } = require("telegraf");
require("dotenv").config();

const { mainMenu, backButton, joinKeyboard, troubleshooterKeyboard } = require("./keyboards");
const { checkProduct } = require("./data/ugcGuidelines");
const { questions, answers } = require("./data/troubleshooter");

if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN is missing from environment variables.");
if (!process.env.CHANNEL_ID || !process.env.CHANNEL_LINK) throw new Error("CHANNEL_ID or CHANNEL_LINK is missing from environment variables.");
if (!questions || typeof questions !== "object" || !answers || typeof answers !== "object") {
  throw new Error("Invalid troubleshooter.js format: export questions and answers objects.");
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const waitingForProduct = new Set();

const CONTENT = {
  ugc_content_eligibility: {
    title: "📸 UGC Content Eligibility",
    text: `
<b>Before uploading UGC content</b>

✅ Use original media that you created.
✅ Keep the product clearly visible and the content well-lit.
✅ For videos, use a Review, Try-On, Haul, or Voiceover format.
✅ Follow the applicable product category restrictions.

🚫 The profile message you shared says AI-generated content, reposts, and non-organic clicks are not permitted. The supplied bot guidelines also list Boomerangs and videos stitched from pictures as prohibited.

⚠️ Eligibility can depend on the product category and current Myntra rules. Use <b>Product Eligibility</b> to check the categories loaded in this bot. If no category match is found, verify in the Myntra app rather than assuming it is eligible.
`,
  },
  content_guidelines: {
    title: "📋 UGC Content Guidelines",
    text: `
<b>✨ Basic UGC Guidelines</b>

🎬 <b>Video</b>
• Use an approved format: Review, Try-On, Haul, or Voiceover.
• Keep the product clearly visible and highlighted.
• The guidelines currently loaded in this bot say videos should be at least 5 seconds long.

📸 <b>Images</b>
• Use a clean, well-lit background.
• Keep the product clearly visible.
• Avoid watermarks, added text, and collage edits.
• Use colour images, not black-and-white or sepia.
• Follow the applicable solo-post requirement.

🚫 The profile message you shared says AI-generated content, reposts, and non-organic clicks are not permitted. The supplied bot guidelines also prohibit Boomerangs and videos stitched from pictures.

👗 For apparel, the existing guidance in this bot says to show both yourself and the product.

Please check the Myntra app for the latest requirements.
`,
  },
  ugc_rewards: {
    title: "💰 UGC Rewards & Earnings",
    text: `
<b>💰 Current policy information shared with this bot</b>

• Effective January 2026, fixed pay is capped at the first <b>15 posts over a creator's lifetime</b>, according to the Myntra support replies you shared.
• After that threshold, creators are eligible for variable pay based on clicks and tier.
• Click-based incentives can be tracked in the <b>Monthwise Breakup</b> section of the dashboard.
• Payouts do not apply to deleted posts, according to the support reply.

UGC rewards and affiliate commissions are separate. Policy and reward details may change; check the current Myntra UGC Levels & Rewards page and your dashboard.
`,
  },
  post_rejected: {
    title: "❌ Post Rejected?",
    text: `
<b>🔍 What to check</b>

📸 <b>Images</b>
• Product visibility and lighting.
• Watermarks, added text, or collage edits.
• Colour and the applicable solo-post rule.

🎬 <b>Videos</b>
• Whether the product is clearly highlighted.
• Whether the format is Review, Try-On, Haul, or Voiceover.
• Whether the content is original and follows the current rules.

<b>What to do:</b>
1. Check the rejection reason in the Myntra app.
2. Correct the specific issue.
3. Re-upload only if permitted.

⚠️ Re-uploading does not guarantee approval or payment. The support reply says payouts do not apply to deleted posts.
`,
  },
  myncash: {
    title: "💳 MynCash & Payments",
    text: `
<b>💳 Check your payment</b>

📊 To review incentives, open your Myntra profile → <b>Payment & Currencies → Myntra Credits & MynCash</b>. Check the <b>Monthwise Breakup</b> section for click-based incentives.

According to the Myntra support reply you shared, a status of <b>In Progress</b> under Payment & Currencies means the payout has already been processed.

Remember:
• Effective January 2026, fixed pay is capped at the first 15 posts over a creator's lifetime, according to the support reply.
• After that, variable pay is based on clicks and tier.
• Payouts do not apply to deleted posts.
• UGC rewards and affiliate commissions are separate.

For unresolved issues, contact Myntra through the Help Center and share relevant screenshots.
`,
  },
  affiliate: {
    title: "🤝 Affiliate Program",
    text: `
<b>🤝 Affiliate earnings</b>

The Level 4 Trendsetter screenshot you shared displays <b>12% commission per order</b> purchased through shared links. Actual commissions may depend on current program terms and eligible orders.

Keep in mind:
• UGC rewards and affiliate commissions are separate.
• Use original content and avoid non-organic clicks.
• Check your current affiliate dashboard for the applicable rate and terms.
`,
  },
  levels: {
    title: "🏆 Creator Levels & Benefits",
    text: `
<b>🏆 Level 4 — Trendsetter</b>

According to the screenshot you shared:
⭐ Create <b>1 image post and 1 video post per month</b> to retain this level.
🤝 Affiliate commission: <b>12% per order</b> purchased through shared links.
💰 Engagement-based rewards: <b>2 MynCash per click</b> on your post.

Check your own Myntra UGC dashboard for your current level and applicable benefits. The information above reflects the screenshot provided and may change under current program terms.
`,
  },
  other: {
    title: "📞 Other Help",
    text: `
<b>📞 Need additional help?</b>

Keep these details ready:
• Affected product or post.
• Screenshots of the issue.
• Relevant earning month.
• Existing support ticket number.

Open the Myntra app and visit the Help Center to raise or follow up on your issue.

🔒 Never share your password, OTP, Telegram bot token, or webhook secret.
`,
  },
};

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function isChannelMember(userId) {
  try {
    const member = await bot.telegram.getChatMember(process.env.CHANNEL_ID, userId);
    return member.status === "creator" || member.status === "administrator" || member.status === "member" || (member.status === "restricted" && member.is_member === true);
  } catch (error) {
    console.error("Membership check failed:", error.message);
    return false;
  }
}

async function showJoinPrompt(ctx) {
  return ctx.reply(
    "🌸 <b>Welcome to MyntraUGCCare!</b>\n<i>Powered by MynStyle07</i>\n\nTo access the bot:\n1️⃣ Join our Telegram channel.\n2️⃣ Subscribe to our YouTube channel.\n3️⃣ Tap the verification button.\n\n🔒 Telegram membership is checked automatically. YouTube subscription is not automatically verified.",
    { parse_mode: "HTML", ...joinKeyboard(process.env.CHANNEL_LINK, process.env.YOUTUBE_CHANNEL_LINK) },
  );
}

async function showMainMenu(ctx) {
  return ctx.reply(
    "💖 <b>MYNTRA UGC CARE</b>\n<i>Powered by MynStyle07</i>\n\nYour guide to Myntra UGC!\n\n🛍️ Product eligibility\n📸 UGC content eligibility\n📋 Content guidelines\n💰 Rewards and earnings\n❌ Rejected posts\n💳 MynCash and payments\n🛠️ Troubleshooting\n\n<b>Choose an option below:</b>",
    { parse_mode: "HTML", ...mainMenu },
  );
}

async function sendSection(ctx, key) {
  const section = CONTENT[key];
  if (!section) return ctx.reply("Sorry, this section is unavailable.", backButton);
  return ctx.reply(`<b>${section.title}</b>\n${section.text}`, { parse_mode: "HTML", ...backButton });
}

async function showTroubleshooter(ctx, key) {
  // Leaf nodes are answers, not questions. This fixes the old dead-end buttons.
  if (answers[key]) {
    return ctx.reply(answers[key], {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("🔄 Start Again", "troubleshooter")],
        [Markup.button.callback("🏠 Main Menu", "main_menu")],
      ]),
    });
  }
  const question = questions[key];
  if (!question) return ctx.reply("Sorry, this troubleshooting option is unavailable.", backButton);
  waitingForProduct.delete(ctx.from.id);
  return ctx.reply(question.text, { parse_mode: "HTML", ...troubleshooterKeyboard(question) });
}

bot.use(async (ctx, next) => {
  const isStart = ctx.message?.text?.trim().startsWith("/start");
  const isMembershipCheck = ctx.callbackQuery?.data === "check_membership";
  if (isStart || isMembershipCheck || !ctx.from) return next();
  if (!(await isChannelMember(ctx.from.id))) {
    if (ctx.callbackQuery) await ctx.answerCbQuery().catch(() => {});
    return showJoinPrompt(ctx);
  }
  return next();
});

bot.start(async (ctx) => {
  waitingForProduct.delete(ctx.from.id);
  if (!(await isChannelMember(ctx.from.id))) return showJoinPrompt(ctx);
  return showMainMenu(ctx);
});

bot.action("check_membership", async (ctx) => {
  await ctx.answerCbQuery();
  if (!(await isChannelMember(ctx.from.id))) {
    return ctx.reply("❌ I couldn't verify your Telegram membership. Please join the channel and try again.", { ...joinKeyboard(process.env.CHANNEL_LINK, process.env.YOUTUBE_CHANNEL_LINK) });
  }
  await ctx.reply("✅ Telegram membership verified!");
  return showMainMenu(ctx);
});

bot.action("main_menu", async (ctx) => {
  await ctx.answerCbQuery();
  waitingForProduct.delete(ctx.from.id);
  return showMainMenu(ctx);
});

bot.action("product_eligibility", async (ctx) => {
  await ctx.answerCbQuery();
  waitingForProduct.add(ctx.from.id);
  return ctx.reply("🛍️ <b>Product Eligibility Checker</b>\n\nSend a product/category name, for example:\n• Soap\n• Shampoo\n• Face wash\n• Body lotion\n\nResults currently supported by the loaded rules:\n🖼️ Images + Video (only if a verified rule is added)\n🎥 Video only\n🚫 Nothing\n\nIf no category is found, I'll ask you to verify it rather than guess.", { parse_mode: "HTML", ...backButton });
});

for (const key of Object.keys(CONTENT)) {
  bot.action(key, async (ctx) => {
    await ctx.answerCbQuery();
    waitingForProduct.delete(ctx.from.id);
    return sendSection(ctx, key);
  });
}

bot.action("troubleshooter", async (ctx) => {
  await ctx.answerCbQuery();
  waitingForProduct.delete(ctx.from.id);
  return showTroubleshooter(ctx, "start");
});

for (const key of new Set([...Object.keys(questions), ...Object.keys(answers)])) {
  bot.action(`trouble_${key}`, async (ctx) => {
    await ctx.answerCbQuery();
    return showTroubleshooter(ctx, key);
  });
}

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const message = ctx.message.text.trim();
  if (!message || message.startsWith("/")) return;
  if (!waitingForProduct.has(userId)) return;

  try {
    const result = checkProduct(message);
    if (!result.found) {
      return ctx.reply(`🔎 I couldn't match <b>${escapeHtml(message)}</b> to a category in the loaded rules.\n\nPlease try a category name such as Soap, Shampoo, Face Wash, or Body Lotion. If it still doesn't match, check the latest Myntra UGC rules in the app.`, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("🔄 Check Another Product", "product_eligibility")],
          [Markup.button.callback("🏠 Main Menu", "main_menu")],
        ]),
      });
    }
    waitingForProduct.delete(userId);
    const decision = result.result || (result.image && result.video ? "Images + Video" : result.video ? "Video only" : "Nothing");
    const explanation = decision === "Nothing"
      ? "This category is listed as not eligible for image or video posts in the rules loaded into this bot."
      : decision === "Video only"
        ? "This category is listed as video-only in the rules loaded into this bot."
        : "This category is listed as allowing images and video in the rules loaded into this bot.";
    return ctx.reply(`🛍️ <b>PRODUCT ELIGIBILITY RESULT</b>\n\n📦 <b>Category:</b> ${escapeHtml(result.product || message)}\n\n━━━━━━━━━━━━━━━━━━\n<b>${escapeHtml(decision)}</b>\n━━━━━━━━━━━━━━━━━━\n\n${explanation}\n\n⚠️ These results reflect the categories currently loaded in this bot. Check Myntra's latest rules if unsure.`, {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("🔄 Check Another Product", "product_eligibility")],
        [Markup.button.callback("📋 UGC Guidelines", "content_guidelines")],
        [Markup.button.callback("🏠 Main Menu", "main_menu")],
      ]),
    });
  } catch (error) {
    console.error("Product eligibility error:", error.message);
    return ctx.reply("⚠️ Something went wrong while checking that category. Please try again.", backButton);
  }
});

bot.catch((error, ctx) => {
  console.error(`Error processing update ${ctx.update?.update_id}:`, error.message);
});

module.exports = bot;
