const questions = {
  start: {
    text: "💗 Let's find out why your UGC post might have been rejected!\n\nWhat type of post was rejected?",
    options: [
      { text: "📸 Image Post", next: "image" },
      { text: "🎬 Video Post", next: "video" },
      { text: "🛍️ Product Eligibility", next: "product" },
    ],
  },

  image: {
    text: "📸 Check your image against these guidelines.\n\nDoes your image contain a watermark, text overlay, or collage edit?",
    options: [
      { text: "✅ No", next: "image_quality" },
      { text: "❌ Yes", next: "watermark" },
    ],
  },

  image_quality: {
    text: "🔎 Is your image in portrait 9:16 orientation and high resolution?",
    options: [
      { text: "✅ Yes", next: "image_product" },
      { text: "❌ No", next: "orientation" },
    ],
  },

  image_product: {
    text: "🛍️ Is at least 60% of the product visible?",
    options: [
      { text: "✅ Yes", next: "image_colour" },
      { text: "❌ No", next: "visibility" },
    ],
  },

  image_colour: {
    text: "🎨 Is your image colourful, with no black-and-white or sepia filter?",
    options: [
      { text: "✅ Yes", next: "image_final" },
      { text: "❌ No", next: "colour" },
    ],
  },

  image_final: {
    text: "👤 Does your image show only you, without a group of people?",
    options: [
      { text: "✅ Yes", next: "image_done" },
      { text: "❌ No", next: "group" },
    ],
  },

  video: {
    text: "🎬 Let's check your video!\n\nIs your video at least 5 seconds long?",
    options: [
      { text: "✅ Yes", next: "video_format" },
      { text: "❌ No", next: "video_length" },
    ],
  },

  video_format: {
    text: "💗 Does your video use an approved format: Review, Try-On, Haul, or Voiceover?",
    options: [
      { text: "✅ Yes", next: "video_product" },
      { text: "❌ No", next: "video_type" },
    ],
  },

  video_product: {
    text: "🛍️ Is the product clearly visible and highlighted in your video?",
    options: [
      { text: "✅ Yes", next: "video_authentic" },
      { text: "❌ No", next: "visibility" },
    ],
  },

  video_authentic: {
    text: "🤖 Is your video authentic—not AI-generated, a Boomerang, or stitched together from pictures?",
    options: [
      { text: "✅ Yes", next: "video_done" },
      { text: "❌ No", next: "video_prohibited" },
    ],
  },

  product: {
    text: "🛍️ Product eligibility can affect whether a post is accepted.\n\nCheck the Product Eligibility option in the main menu before uploading.",
    options: [
      { text: "💗 Check Another Issue", next: "start" },
    ],
  },
};

const answers = {
  watermark: "🚫 Your post may violate the watermark/text-overlay or collage-edit rule. Use an original image without watermarks or added text.",

  orientation: "📱 Your image should use portrait 9:16 orientation and high resolution, according to your supplied guidelines.",

  visibility: "👀 Make the product clearly visible. Your supplied guidelines state that at least 60% of the product should be visible.",

  colour: "🎨 Use a colourful image. Black-and-white and sepia posts are not allowed under your supplied guidelines.",

  group: "👤 Your supplied guidelines specify solo posts. Try a post featuring only yourself.",

  video_length: "🎬 Your supplied guidelines state that videos must be at least 5 seconds long, with the product clearly highlighted.",

  video_type: "💗 Use one of the approved video formats: Review, Try-On, Haul, or Voiceover.",

  video_prohibited: "🚫 Your supplied guidelines prohibit AI-generated content, Boomerangs, and videos stitched together from pictures.",

  image_done: "💗 Your answers match the image checks in this troubleshooter. However, other rules—including product eligibility—may still affect approval.",

  video_done: "💗 Your answers match the video checks in this troubleshooter. However, other rules—including product eligibility—may still affect approval.",
};

module.exports = { questions, answers };