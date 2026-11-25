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

// IDs retain the storefront's existing URL format so saved product links continue to work.
export const CATALOG_ITEMS = [
  { id: "penguin-frosted-standard", name: "Little Penguin Globe", theme: "Penguin", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "penguin-frosted-premium", name: "Little Penguin Globe with Tree", theme: "Penguin", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "penguin-classic-standard", name: "Snowfall Penguin", theme: "Penguin", edition: "standard", finish: "Classic", hasTree: false },
  { id: "penguin-classic-premium", name: "Snowfall Penguin with Tree", theme: "Penguin", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "santa-frosted-standard", name: "North Pole Santa", theme: "Santa", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "santa-frosted-premium", name: "North Pole Santa with Tree", theme: "Santa", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "santa-classic-standard", name: "Holiday Hearth Santa", theme: "Santa", edition: "standard", finish: "Classic", hasTree: false },
  { id: "santa-classic-premium", name: "Holiday Hearth Santa with Tree", theme: "Santa", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "star-frosted-standard", name: "Winter Wish Star", theme: "Star", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "star-frosted-premium", name: "Winter Wish Star with Tree", theme: "Star", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "star-classic-standard", name: "Golden Hour Star", theme: "Star", edition: "standard", finish: "Classic", hasTree: false },
  { id: "star-classic-premium", name: "Golden Hour Star with Tree", theme: "Star", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "reindeer-frosted-standard", name: "Woodland Reindeer", theme: "Reindeer", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "reindeer-frosted-premium", name: "Woodland Reindeer with Tree", theme: "Reindeer", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "reindeer-classic-standard", name: "Copper Bell Reindeer", theme: "Reindeer", edition: "standard", finish: "Classic", hasTree: false },
  { id: "reindeer-classic-premium", name: "Copper Bell Reindeer with Tree", theme: "Reindeer", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "elf-frosted-standard", name: "Evergreen Elf", theme: "Elf", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "elf-frosted-premium", name: "Evergreen Elf with Tree", theme: "Elf", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "elf-classic-standard", name: "Peppermint Workshop Elf", theme: "Elf", edition: "standard", finish: "Classic", hasTree: false },
  { id: "elf-classic-premium", name: "Peppermint Workshop Elf with Tree", theme: "Elf", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "snowman-frosted-standard", name: "First Snow Snowman", theme: "Snowman", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "snowman-frosted-premium", name: "First Snow Snowman with Tree", theme: "Snowman", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "snowman-classic-standard", name: "Snowday Scarf Snowman", theme: "Snowman", edition: "standard", finish: "Classic", hasTree: false },
  { id: "snowman-classic-premium", name: "Snowday Scarf Snowman with Tree", theme: "Snowman", edition: "premium-tree", finish: "Classic", hasTree: true },

  { id: "christmas-tree-frosted-standard", name: "Pine and Pearl Tree", theme: "Christmas Tree", edition: "standard", finish: "Frosted", hasTree: false },
  { id: "christmas-tree-frosted-premium", name: "Pine and Pearl Tree with Mini Tree", theme: "Christmas Tree", edition: "premium-tree", finish: "Frosted", hasTree: true },
  { id: "christmas-tree-classic-standard", name: "Candlelight Evergreen", theme: "Christmas Tree", edition: "standard", finish: "Classic", hasTree: false },
  { id: "christmas-tree-classic-premium", name: "Candlelight Evergreen with Mini Tree", theme: "Christmas Tree", edition: "premium-tree", finish: "Classic", hasTree: true }
];

export const THEMES = Object.freeze([...new Set(CATALOG_ITEMS.map((item) => item.theme))]);
