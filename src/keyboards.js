const { Markup } = require("telegraf");

const mainMenu = Markup.inlineKeyboard([
  [Markup.button.callback("🛍️ Product Eligibility", "product_eligibility")],
  [Markup.button.callback("📸 UGC Content Eligibility", "ugc_content_eligibility")],
  [
    Markup.button.callback("📋 UGC Guidelines", "content_guidelines"),
    Markup.button.callback("💰 Rewards & Earnings", "ugc_rewards"),
  ],
  [
    Markup.button.callback("❌ Rejected Posts", "post_rejected"),
    Markup.button.callback("💳 MynCash & Payments", "myncash"),
  ],
  [
    Markup.button.callback("🤝 Affiliate Program", "affiliate"),
    Markup.button.callback("🏆 Levels & Benefits", "levels"),
  ],
  [Markup.button.callback("🛠️ Troubleshooting", "troubleshooter")],
  [Markup.button.callback("📞 Other Help", "other")],
]);

const backButton = Markup.inlineKeyboard([
  [Markup.button.callback("🏠 Back to Main Menu", "main_menu")],
]);

function joinKeyboard(channelLink, youtubeLink) {
  const buttons = [];
  if (channelLink) buttons.push([Markup.button.url("📢 Join Telegram Channel", channelLink)]);
  if (youtubeLink) buttons.push([Markup.button.url("▶️ Subscribe on YouTube", youtubeLink)]);
  buttons.push([Markup.button.callback("✅ I've Joined & Subscribed", "check_membership")]);
  return Markup.inlineKeyboard(buttons);
}

function troubleshooterKeyboard(item) {
  const buttons = (item.options || []).map((option) => [
    Markup.button.callback(option.text, `trouble_${option.next}`),
  ]);
  if (item.retry) buttons.push([Markup.button.callback("🔄 Start Again", "troubleshooter")]);
  buttons.push([Markup.button.callback("🏠 Main Menu", "main_menu")]);
  return Markup.inlineKeyboard(buttons);
}

module.exports = { mainMenu, backButton, joinKeyboard, troubleshooterKeyboard };
