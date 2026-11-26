/*
 * PRODUCT PHOTOS — two steps to add or swap images:
 * 1. Put each PNG in assets/products/<product-name>/ (for example, assets/products/snowman/).
 * 2. Add or replace its relative path in PRODUCT_IMAGES below, using the product's catalog ID.
 * Products without assigned photos automatically use their themed SVG artwork.
 */
import { renderGlobe } from "./globe-art.js";

/*
 * WHITE PALACE CATALOG AND PRICING
 * Change STANDARD_PRICE once to update every Standard globe's base price.
 * Change PREMIUM_TREE_ADDON once to update every Premium (+ Tree) globe's extra cost.
 * A finish adjustment is added after those values. Set priceOverride on one catalog item
 * to replace its calculated price when that individual product needs a special price.
 */
const STANDARD_PRICE = 5;
const PREMIUM_TREE_ADDON = 0.5;
const CURRENCY_SYMBOL = "$";
export const PRODUCT_IMAGES = Object.freeze({
  "snowman-frosted-standard": [
    "./assets/products/snowman/IMG_0964-removebg-preview.png",
    "./assets/products/snowman/IMG_0966-removebg-preview.png",
    "./assets/products/snowman/IMG_0969-removebg-preview.png"
  ]
});
const FINISH_PRICE_ADJUSTMENTS = {
  Frosted: 0,
  Classic: 1
};

export const PRICING_CONFIG = Object.freeze({
  standardPrice: STANDARD_PRICE,
  premiumTreeAddon: PREMIUM_TREE_ADDON,
  currencySymbol: CURRENCY_SYMBOL,
  finishPriceAdjustments: Object.freeze({ ...FINISH_PRICE_ADJUSTMENTS })
});

export function getItemPrice(item) {
  if (Number.isFinite(item.priceOverride)) return item.priceOverride;
  const treeAddon = item.hasTree || item.edition === "premium-tree" ? PREMIUM_TREE_ADDON : 0;
  const finishAdjustment = FINISH_PRICE_ADJUSTMENTS[item.finish] || 0;
  return STANDARD_PRICE + treeAddon + finishAdjustment;
}

export function getProductPlaceholderImage(product) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderGlobe(product))}`;
}

export function getProductImages(product) {
  const productImages = Array.isArray(product.images)
    ? product.images
    : typeof product.images === "string" ? [product.images] : [];
  const validProductImages = productImages.filter((image) => typeof image === "string" && image.trim());
  const validMappedImages = (PRODUCT_IMAGES[product.id] || [])
    .filter((image) => typeof image === "string" && image.trim());
  const assignedImages = validProductImages.length ? validProductImages : validMappedImages;
  return assignedImages.length ? assignedImages : [getProductPlaceholderImage(product)];
}

// IDs retain the storefront's existing URL format so saved product links continue to work.
export const CATALOG_ITEMS = [
  { id: "penguin-frosted-standard", name: "Frosted Glacier Penguin", theme: "Penguin", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "penguin-frosted-premium", name: "Frosted Glacier Penguin with Tree", theme: "Penguin", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "penguin-classic-standard", name: "Classic Snowfall Penguin", theme: "Penguin", edition: "standard", finish: "Classic", hasTree: false },
  { id: "penguin-classic-premium", name: "Classic Snowfall Penguin with Tree", theme: "Penguin", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "santa-frosted-standard", name: "Frosted North Star Santa", theme: "Santa", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "santa-frosted-premium", name: "Frosted North Star Santa with Tree", theme: "Santa", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "santa-classic-standard", name: "Classic Holiday Hearth Santa", theme: "Santa", edition: "standard", finish: "Classic", hasTree: false },
  { id: "santa-classic-premium", name: "Classic Holiday Hearth Santa with Tree", theme: "Santa", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "star-frosted-standard", name: "Frosted Crystal Wish Star", theme: "Star", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "star-frosted-premium", name: "Frosted Crystal Wish Star with Tree", theme: "Star", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "star-classic-standard", name: "Classic Starlight Star", theme: "Star", edition: "standard", finish: "Classic", hasTree: false },
  { id: "star-classic-premium", name: "Classic Starlight Star with Tree", theme: "Star", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "reindeer-frosted-standard", name: "Frosted Icebell Reindeer", theme: "Reindeer", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "reindeer-frosted-premium", name: "Frosted Icebell Reindeer with Tree", theme: "Reindeer", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "reindeer-classic-standard", name: "Classic Yuletide Reindeer", theme: "Reindeer", edition: "standard", finish: "Classic", hasTree: false },
  { id: "reindeer-classic-premium", name: "Classic Yuletide Reindeer with Tree", theme: "Reindeer", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "elf-frosted-standard", name: "Frosted Tinsel Elf", theme: "Elf", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "elf-frosted-premium", name: "Frosted Tinsel Elf with Tree", theme: "Elf", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "elf-classic-standard", name: "Classic Peppermint Workshop Elf", theme: "Elf", edition: "standard", finish: "Classic", hasTree: false },
  { id: "elf-classic-premium", name: "Classic Peppermint Workshop Elf with Tree", theme: "Elf", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "snowman-frosted-standard", name: "Frosted First Snow Snowman", theme: "Snowman", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "snowman-frosted-premium", name: "Frosted First Snow Snowman with Tree", theme: "Snowman", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "snowman-classic-standard", name: "Classic Snowday Snowman", theme: "Snowman", edition: "standard", finish: "Classic", hasTree: false },
  { id: "snowman-classic-premium", name: "Classic Snowday Snowman with Tree", theme: "Snowman", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "christmas-tree-frosted-standard", name: "Frosted Snowkissed Evergreen", theme: "Christmas Tree", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "christmas-tree-frosted-premium", name: "Frosted Snowkissed Evergreen with Mini Tree", theme: "Christmas Tree", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "christmas-tree-classic-standard", name: "Classic Candlelight Evergreen", theme: "Christmas Tree", edition: "standard", finish: "Classic", hasTree: false },
  { id: "christmas-tree-classic-premium", name: "Classic Candlelight Evergreen with Mini Tree", theme: "Christmas Tree", edition: "premium-tree", finish: "Classic", hasTree: true }
];

export const THEMES = Object.freeze([...new Set(CATALOG_ITEMS.map((item) => item.theme))]);
