const blockedProducts = [
  "Soap",
  "Free Gifts",
  "Innerwear Vests",
  "Bra",
  "Shaving and Hair Removal",
  "Water Bottle",
  "Toothpaste and Tooth Powder",
  "Baby Body Wash and Soap",
  "Sanitary Napkins",
  "Baby Wipes and Buds",
];

const videoOnlyProducts = [
  "Face Wash and Cleanser",
  "Day Cream",
  "Perfume",
  "Face Sunscreen",
  "Shampoo",
  "Serum and Gel",
  "Body Wash and Shower Gel",
  "Deodorant",
  "Body Cream and Lotion",
  "Mask and Peel",
  "Roll-Ons",
  "Hair Serum",
  "Body Mist and Spray",
  "Conditioner",
  "Foundation",
  "Compact",
  "Toner",
  "Hair Oil",
  "Face Scrub and Exfoliator",
  "Concealer",
  "Face Primer",
  "Hair Masks",
  "Hair Colour",
  "BB and CC Cream",
  "Hair Brush and Comb",
  "Skin Care Combo",
  "Body Sunscreen",
  "Hair Spray",
  "Nail Polish Remover",
  "Fragrance Gift Set",
  "Talcum Powder",
  "Night Cream",
  "Under Eye Creams and Serums",
  "Trimmer",
  "Hair Gels and Wax",
  "Setting Spray",
  "Body Scrub and Exfoliator",
  "Facial Kit",
  "Makeup Remover",
  "Facial Wipes and Tissues",
  "Sheet Masks",
  "Body Wax and Essentials",
  "Hair Care Combo",
  "Hair Accessory",
];

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const aliases = {
  "face wash": "face wash and cleanser",
  "baby soap": "baby body wash and soap",
  "hair gel": "hair gels and wax",
  "under eye serum": "under eye creams and serums",
  "hair colour": "hair colour",
  "hair color": "hair colour",
  "body lotion": "body cream and lotion",
  "sunscreen": "face sunscreen",
  "hair comb": "hair brush and comb",
  "toothpaste": "toothpaste and tooth powder",
  "shaving cream": "shaving and hair removal",
  "sanitary pad": "sanitary napkins",
  "sanitary pads": "sanitary napkins",
};

function checkProduct(productName) {
  const input = normalize(productName);

  if (!input) {
    return {
      found: false,
      message: "Please enter a product name.",
    };
  }

  const searchName = aliases[input] || input;

  const blocked = blockedProducts.find(
    (product) => normalize(product) === searchName
  );

  if (blocked) {
    return {
      found: true,
      product: blocked,
      image: false,
      video: false,
    };
  }

  const videoOnly = videoOnlyProducts.find(
    (product) => normalize(product) === searchName
  );

  if (videoOnly) {
    return {
      found: true,
      product: videoOnly,
      image: false,
      video: true,
    };
  }

  return {
    found: false,
    product: productName,
  };
}

module.exports = { checkProduct };