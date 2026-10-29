const { blockedProducts, videoOnlyProducts, normalize, aliases } = require("./productRules");

const blockedNormalized = blockedProducts.map((name) => ({ name, normalized: normalize(name) }));
const videoOnlyNormalized = videoOnlyProducts.map((name) => ({ name, normalized: normalize(name) }));

function checkProduct(productName) {
  const input = normalize(productName);
  if (!input) return { found: false, message: "Please enter a product name." };

  const searchName = aliases[input] ? normalize(aliases[input]) : input;

  // Exact matches first to avoid accidentally matching a different category.
  const blocked = blockedNormalized.find((item) => item.normalized === searchName);
  if (blocked) return { found: true, product: blocked.name, image: false, video: false, result: "Nothing" };

  const videoOnly = videoOnlyNormalized.find((item) => item.normalized === searchName);
  if (videoOnly) return { found: true, product: videoOnly.name, image: false, video: true, result: "Video only" };

  // Allow a user's longer product name to match a known category, but only when
  // the complete category phrase occurs in the input (e.g. "XYZ shampoo").
  const blockedInPhrase = blockedNormalized.find((item) => item.normalized.length >= 4 && (` ${searchName} `).includes(` ${item.normalized} `));
  if (blockedInPhrase) return { found: true, product: blockedInPhrase.name, image: false, video: false, result: "Nothing" };

  const videoInPhrase = videoOnlyNormalized.find((item) => item.normalized.length >= 4 && (` ${searchName} `).includes(` ${item.normalized} `));
  if (videoInPhrase) return { found: true, product: videoInPhrase.name, image: false, video: true, result: "Video only" };

  // Per the owner-provided rule: any category not explicitly listed as blocked or video-only allows both formats.
  return {
    found: true,
    product: String(productName).trim(),
    image: true,
    video: true,
    result: "Images + Video",
  };
}

module.exports = { checkProduct };
