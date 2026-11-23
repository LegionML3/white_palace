/*
 * WHITE PALACE PRICE SETTINGS
 * Change BASE_GLOBE_PRICE or PREMIUM_TREE_UPCHARGE here to update all catalog prices.
 * Standard price = BASE_GLOBE_PRICE + EDITION_OVERRIDES[edition].
 * Premium price = BASE_GLOBE_PRICE + PREMIUM_TREE_UPCHARGE + EDITION_OVERRIDES[edition].
 * All dollar values are numbers; app.js formats them for display.
 */
const BASE_GLOBE_PRICE = 5;
const PREMIUM_TREE_UPCHARGE = 2;
// Product-detail compatible aliases for the centralized pricing API.
const STANDARD_PRICE = BASE_GLOBE_PRICE;
const CURRENCY = "USD";
const EDITION_OVERRIDES = {
  "Frosted": 0,
  "Classic": 1,
  "Heirloom": 2,
  "Midnight": 3
};

const THEMES = ["Penguin", "Santa", "Star", "Reindeer", "Elf", "Snowman", "Christmas Tree"];
const EDITIONS = ["Frosted", "Classic", "Heirloom"];

const THEME_DETAILS = {
  Penguin: { slug: "penguin", outline: "PENGUIN", finish: "Polar pearl", accent: "#d9b85f" },
  Santa: { slug: "santa", outline: "SANTA", finish: "Holiday red", accent: "#a33a34" },
  Star: { slug: "star", outline: "STAR", finish: "Starlight gold", accent: "#d9b85f" },
  Reindeer: { slug: "reindeer", outline: "REINDEER", finish: "Woodland white", accent: "#b88770" },
  Elf: { slug: "elf", outline: "ELF", finish: "Evergreen mist", accent: "#668f7f" },
  Snowman: { slug: "snowman", outline: "SNOWMAN", finish: "Classic snow", accent: "#6f95b1" },
  "Christmas Tree": { slug: "christmas-tree", outline: "TREE", finish: "Pine and pearl", accent: "#557f71" }
};

function formatPrice(theme, edition, version) {
  const editionOverride = EDITION_OVERRIDES[edition] || 0;
  const premium = version === "Premium" ? PREMIUM_TREE_UPCHARGE : 0;
  return BASE_GLOBE_PRICE + editionOverride + premium;
}

function calculateProductPrice(product) {
  return formatPrice(product.theme, product.edition, product.version);
}

function createCatalog() {
  const catalog = [];

  THEMES.forEach((theme) => {
    EDITIONS.forEach((edition) => {
      ["Standard", "Premium"].forEach((version) => {
        catalog.push({
          id: `${theme}-${edition}-${version}`.toLowerCase().replaceAll(" ", "-"),
          name: theme,
          theme,
          outline: THEME_DETAILS[theme].outline,
          edition,
          finish: THEME_DETAILS[theme].finish,
          version,
          price: formatPrice(theme, edition, version),
          image: null,
          alt: `${edition} ${theme} ${version === "Premium" ? "snow globe with a miniature tree" : "snow globe"}`
        });
      });
    });
  });

  // Three additional Heirloom/Midnight variants complete the 45-item collection.
  ["Penguin", "Star", "Christmas Tree"].forEach((theme) => {
    catalog.push({
      id: `${theme}-Midnight-Standard`.toLowerCase().replaceAll(" ", "-"),
      name: theme,
      theme,
      outline: THEME_DETAILS[theme].outline,
      edition: "Midnight",
      finish: THEME_DETAILS[theme].finish,
      version: "Standard",
      price: formatPrice(theme, "Midnight", "Standard"),
      image: null,
      alt: `Midnight ${theme} snow globe`
    });
  });

  return catalog;
}

const products = createCatalog();

function globeShell(inner, premium = false) {
  return `
    <svg viewBox="0 0 420 460" role="img" aria-label="Snow globe illustration" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glass" cx="38%" cy="28%" r="72%">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity=".88"/>
          <stop offset=".55" stop-color="#DDF0FB" stop-opacity=".46"/>
          <stop offset="1" stop-color="#AFCFE5" stop-opacity=".28"/>
        </radialGradient>
        <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#DDEEF9"/>
        </linearGradient>
        <clipPath id="sphereClip"><circle cx="210" cy="206" r="146"/></clipPath>
      </defs>
      <ellipse cx="210" cy="410" rx="116" ry="18" fill="#76A6C5" opacity=".12"/>
      <circle cx="210" cy="206" r="148" fill="url(#glass)" stroke="#AFCFE4" stroke-width="5"/>
      <circle cx="210" cy="206" r="138" fill="none" stroke="#FFFFFF" stroke-opacity=".9" stroke-width="2"/>
      <g clip-path="url(#sphereClip)">
        <circle cx="158" cy="112" r="14" fill="#FFFFFF" opacity=".9"/>
        ${inner}
        ${premium ? `
          <g transform="translate(52 8) scale(.55)">
            <rect x="210" y="300" width="24" height="38" fill="#9C7455"/>
            <path d="M222 70l-82 150h164z" fill="#557F71"/>
            <path d="M222 128l-98 135h196z" fill="#668F7F"/>
            <circle cx="180" cy="170" r="8" fill="#D9B85F"/>
            <circle cx="255" cy="210" r="8" fill="#C62828"/>
          </g>` : ""}
        <g fill="#FFFFFF" opacity=".82">
          <circle cx="118" cy="188" r="4"/><circle cx="278" cy="145" r="3"/>
          <circle cx="302" cy="224" r="5"/><circle cx="145" cy="238" r="3"/>
        </g>
      </g>
      <path d="M96 346h228l22 48H74z" fill="url(#base)" stroke="#AFCFE4" stroke-width="4"/>
      <path d="M74 394h272v18c0 10-8 18-18 18H92c-10 0-18-8-18-18z" fill="#F8FCFF" stroke="#AFCFE4" stroke-width="4"/>
      <path d="M186 346c0-20 48-20 48 0" fill="none" stroke="#9A7022" stroke-width="10" stroke-linecap="round"/>
      <circle cx="210" cy="344" r="7" fill="#B8842F"/>
    </svg>`;
}

function penguinSvg(premium) {
  return globeShell(`
    <ellipse cx="210" cy="311" rx="80" ry="18" fill="#B8D5E7" opacity=".62"/>
    <ellipse cx="210" cy="230" rx="58" ry="88" fill="#F7FAFC"/>
    <ellipse cx="210" cy="245" rx="42" ry="62" fill="#FFFFFF"/>
    <circle cx="210" cy="164" r="55" fill="#F7FAFC"/>
    <circle cx="210" cy="170" r="39" fill="#FFFFFF"/>
    <circle cx="193" cy="158" r="5" fill="#3F4D58"/><circle cx="227" cy="158" r="5" fill="#3F4D58"/>
    <path d="M198 176l12 9 12-9-12 20z" fill="#D9B85F"/>
  `, premium);
}

function santaSvg(premium) {
  return globeShell(`
    <ellipse cx="210" cy="312" rx="82" ry="17" fill="#B8D5E7" opacity=".62"/>
    <circle cx="210" cy="250" r="74" fill="#A33A34"/>
    <circle cx="210" cy="165" r="58" fill="#F7E2CF"/>
    <path d="M153 155c0-58 114-58 114 0z" fill="#FFFFFF"/>
    <path d="M151 145c15-65 104-65 118 0z" fill="#A33A34"/>
    <circle cx="210" cy="88" r="19" fill="#FFFFFF"/>
    <circle cx="188" cy="165" r="5" fill="#3F4D58"/><circle cx="232" cy="165" r="5" fill="#3F4D58"/>
    <path d="M172 190c20 28 56 28 76 0-5 45-71 45-76 0z" fill="#FFFFFF"/>
  `, premium);
}

function starSvg(premium) {
  return globeShell(`
    <ellipse cx="210" cy="312" rx="82" ry="17" fill="#B8D5E7" opacity=".62"/>
    <path d="M210 104l24 49 54 8-39 38 9 54-48-25-48 25 9-54-39-38 54-8z" fill="#D9B85F" stroke="#9A7022" stroke-width="4"/>
    <circle cx="210" cy="205" r="72" fill="none" stroke="#FFFFFF" stroke-width="8" opacity=".7"/>
  `, premium);
}

function reindeerSvg(premium) {
  return globeShell(`
    <ellipse cx="210" cy="312" rx="88" ry="17" fill="#B8D5E7" opacity=".62"/>
    <ellipse cx="210" cy="248" rx="72" ry="66" fill="#A97961"/>
    <ellipse cx="210" cy="166" rx="48" ry="56" fill="#B88770"/>
    <ellipse cx="210" cy="238" rx="31" ry="38" fill="#D5B39E"/>
    <circle cx="194" cy="158" r="5" fill="#3F4D58"/><circle cx="226" cy="158" r="5" fill="#3F4D58"/>
    <ellipse cx="210" cy="184" rx="11" ry="9" fill="#3F4D58"/>
    <path d="M174 130l-20-32M246 130l20-32M155 98l-16-12M265 98l16-12" stroke="#7F604F" stroke-width="6" stroke-linecap="round"/>
  `, premium);
}

function elfSvg(premium) {
  return globeShell(`
    <ellipse cx="210" cy="312" rx="82" ry="17" fill="#B8D5E7" opacity=".62"/>
    <ellipse cx="210" cy="258" rx="72" ry="68" fill="#668F7F"/>
    <circle cx="210" cy="166" r="55" fill="#F2CDB1"/>
    <path d="M155 144c15-67 95-67 110 0z" fill="#668F7F"/>
    <path d="M210 82l18-38 8 42z" fill="#A33A34"/>
    <circle cx="188" cy="164" r="5" fill="#3F4D58"/><circle cx="232" cy="164" r="5" fill="#3F4D58"/>
    <path d="M195 188c10 10 20 10 30 0" fill="none" stroke="#8A6420" stroke-width="5" stroke-linecap="round"/>
  `, premium);
}

function snowmanSvg(premium) {
  return globeShell(`
    <ellipse cx="210" cy="314" rx="84" ry="16" fill="#B8D5E7" opacity=".62"/>
    <circle cx="210" cy="275" r="67" fill="#FFFFFF"/>
    <circle cx="210" cy="190" r="52" fill="#FFFFFF"/>
    <circle cx="210" cy="126" r="43" fill="#FFFFFF"/>
    <path d="M166 126h88" stroke="#6F95B1" stroke-width="8" stroke-linecap="round"/>
    <path d="M179 89h62v38h-62z" fill="#EEF6FB" stroke="#A4C5DC" stroke-width="3"/>
    <circle cx="194" cy="121" r="4" fill="#3F4D58"/><circle cx="226" cy="121" r="4" fill="#3F4D58"/>
  `, premium);
}

function christmasTreeSvg(premium) {
  return globeShell(`
    <ellipse cx="210" cy="314" rx="88" ry="17" fill="#B8D5E7" opacity=".62"/>
    <rect x="198" y="286" width="24" height="38" rx="3" fill="#9C7455"/>
    <path d="M210 96l-72 136h144z" fill="#557F71"/>
    <path d="M210 138l-88 120h176z" fill="#668F7F"/>
    <circle cx="178" cy="205" r="7" fill="#D9B85F"/>
    <circle cx="238" cy="229" r="7" fill="#9A7022"/>
    <path d="M210 96l8 14h-16z" fill="#D9B85F"/>
  `, premium);
}
