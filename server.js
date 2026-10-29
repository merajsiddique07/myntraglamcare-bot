require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const bot = require("./src/bot");

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!process.env.BOT_TOKEN || !WEBHOOK_SECRET) {
  throw new Error("BOT_TOKEN and WEBHOOK_SECRET must be configured.");
}

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("🌸 MyntraUGCCareBot is running!");
});

app.post("/telegram-webhook", async (req, res) => {
  const receivedSecret = Buffer.from(
    req.get("X-Telegram-Bot-Api-Secret-Token") || ""
  );
  const expectedSecret = Buffer.from(WEBHOOK_SECRET);

  if (
    receivedSecret.length !== expectedSecret.length ||
    !crypto.timingSafeEqual(receivedSecret, expectedSecret)
  ) {
    return res.sendStatus(403);
  }

  try {
    await bot.handleUpdate(req.body);
    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook processing failed:", error.message);
    return res.sendStatus(500);
  }
});

app.listen(PORT, async () => {
  console.log(`🌸 MyntraGlamCare listening on port ${PORT}`);

  const renderUrl = process.env.RENDER_EXTERNAL_URL;

  if (!renderUrl) {
    console.error("RENDER_EXTERNAL_URL is not configured.");
    return;
  }

  try {
    await bot.telegram.setWebhook(
      `${renderUrl.replace(/\/+$/, "")}/telegram-webhook`,
      { secret_token: WEBHOOK_SECRET }
    );

    console.log("✅ Telegram webhook registered!");
    console.log("✨ Powered by MynStyle07");
  } catch (error) {
    console.error("Webhook registration failed:", error.message);
  }
});