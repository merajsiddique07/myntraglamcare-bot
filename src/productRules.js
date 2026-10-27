const checkProductRules = [
  {
    keywords: ["body scrub", "exfoliator", "body exfoliator"],
    result: "Video only",
  },
  {
    keywords: ["facial kit", "face kit"],
    result: "Video only",
  },
  {
    keywords: ["makeup remover", "make up remover"],
    result: "Video only",
  },
  {
    keywords: ["facial wipes", "face wipes", "tissues", "facial tissues"],
    result: "Video only",
  },
  {
    keywords: ["sheet mask", "sheet masks"],
    result: "Video only",
  },
  {
    keywords: ["body wax", "body wax essentials"],
    result: "Video only",
  },
  {
    keywords: ["hair care combo", "haircare combo"],
    result: "Video only",
  },
  {
    keywords: ["hair accessory", "hair accessories"],
    result: "Video only",
  },
  {
    keywords: ["soap", "bathing soap"],
    result: "Nothing",
  },
  {
    keywords: ["shampoo", "perfume"],
    result: "Video only",
  },
];

function checkProduct(productName) {
  const product = productName.toLowerCase().trim();

  const matchedRule = productRules.find((rule) =>
    rule.keywords.some((keyword) => product.includes(keyword)),
  );

  if (matchedRule) {
    return matchedRule.result;
  }

  return null;
}

module.exports = { checkProductRules };
