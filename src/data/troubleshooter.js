const questions = {
  start: {
    text: "💗 Let's troubleshoot your Myntra UGC issue.\n\nWhat do you need help with?",
    options: [
      { text: "📸 Image post rejected", next: "image" },
      { text: "🎬 Video post rejected", next: "video" },
      { text: "💰 Payment or earnings", next: "payment" },
      { text: "🛍️ Product eligibility", next: "product" },
      { text: "👑 Level and benefits", next: "level" },
      { text: "👤 Profile guidelines", next: "profile" },
    ],
  },
  image: {
    text: "📸 Check your image. Does it contain a watermark, added text, or a collage edit?",
    options: [
      { text: "✅ No", next: "image_quality" },
      { text: "❌ Yes", next: "watermark" },
    ],
  },
  image_quality: {
    text: "🔎 Is the product clearly visible in a clean, well-lit image?",
    options: [
      { text: "✅ Yes", next: "image_colour" },
      { text: "❌ No", next: "visibility" },
    ],
  },
  image_colour: {
    text: "🎨 Is the image in colour (not black-and-white or sepia) and does it follow the solo-post requirement?",
    options: [
      { text: "✅ Yes", next: "image_done" },
      { text: "❌ No", next: "image_profile_issue" },
    ],
  },
  video: {
    text: "🎬 Is your video at least 5 seconds long?",
    options: [
      { text: "✅ Yes", next: "video_format" },
      { text: "❌ No", next: "video_length" },
    ],
  },
  video_format: {
    text: "💗 Is it a Review, Try-On, Haul, or Voiceover, with the product clearly highlighted?",
    options: [
      { text: "✅ Yes", next: "video_authentic" },
      { text: "❌ No", next: "video_type" },
    ],
  },
  video_authentic: {
    text: "🤖 Is the video original—not AI-generated, a repost, a Boomerang, or stitched together from pictures?",
    options: [
      { text: "✅ Yes", next: "video_done" },
      { text: "❌ No", next: "video_prohibited" },
    ],
  },
  payment: {
    text: "💰 Which payment issue are you facing?",
    options: [
      { text: "Fixed pay for posts", next: "fixed_pay" },
      { text: "Payment says In Progress", next: "in_progress" },
      { text: "Payment for deleted post", next: "deleted_post" },
      { text: "Find my earnings", next: "find_earnings" },
    ],
  },
  product: {
    text: "🛍️ Use Product Eligibility in the main menu and enter the product category. Unknown categories are not automatically treated as eligible; check the latest Myntra rules if no match is found.",
    options: [{ text: "💗 Back to troubleshooting", next: "start" }],
  },
  level: {
    text: "🏆 Your current level and benefits are shown in the Myntra UGC dashboard. The supplied Level 4 screenshot says Trendsetter creators should create 1 image and 1 video post per month to retain that level.",
    options: [{ text: "💗 Back to troubleshooting", next: "start" }],
  },
  profile: {
    text: "👤 Use original media only. Avoid AI-generated content, reposts, and non-organic clicks. Keep your profile updated with high-quality, well-lit content. Non-compliance may affect UGC and Affiliate program eligibility, according to the message you shared.",
    options: [{ text: "💗 Back to troubleshooting", next: "start" }],
  },
};

const answers = {
  watermark: "🚫 Remove watermarks, added text, and collage edits. Use original content and follow the current image guidelines.",
  visibility: "👀 Make the product clearly visible and use a clean, well-lit image. Your supplied bot guidelines previously mentioned a 60% visibility rule, but verify that requirement in the current Myntra rules before relying on it.",
  image_profile_issue: "📸 Use a colour image and follow the solo-post requirement in the guidelines supplied for this bot. Check the latest Myntra instructions if you're unsure.",
  video_length: "🎬 The guidelines currently loaded in this bot say videos should be at least 5 seconds long. Check the rejection reason in the Myntra app too.",
  video_type: "💗 Use an approved format: Review, Try-On, Haul, or Voiceover. Keep the product clearly highlighted.",
  video_prohibited: "🚫 The profile message you shared says to use original media only and disallows AI-generated content and reposts. Your supplied bot guidelines also disallow Boomerangs and videos stitched from pictures.",
  image_done: "✅ Your answers match the checks in this flow. This does not guarantee approval; product eligibility and other current Myntra rules may also apply.",
  video_done: "✅ Your answers match the checks in this flow. This does not guarantee approval; product eligibility and other current Myntra rules may also apply.",
  fixed_pay: "💰 According to the Myntra support reply you shared, effective January 2026, fixed pay is capped at a creator's first 15 posts over their lifetime. After that, variable pay is based on clicks and tier. Check the current UGC Levels & Rewards policy for details.",
  in_progress: "💳 The Myntra support reply you shared says that if the payment status shows ‘In Progress’ under Payment & Currencies, the payout has already been processed. Check your payment details and contact Myntra Help Center if it still appears unresolved.",
  deleted_post: "⚠️ The Myntra support reply you shared says payouts do not apply to deleted posts.",
  find_earnings: "📊 Open your Myntra profile, then Payment & Currencies → Myntra Credits & MynCash. The support reply you shared says incentives based on clicks can be tracked under the Monthwise Breakup section.",
};

module.exports = { questions, answers };
