// Product content and artwork for the featured snow globe collection.
const products = [
  {
    name: "Penguin",
    outline: "PENGUIN",
    variant: "Frosted White",
    price: "$5",
    image: null,
    alt: "Handmade penguin snow globe"
  },
  {
    name: "Snowman",
    outline: "SNOWMAN",
    variant: "Classic Snow",
    price: "$5",
    image: null,
    alt: "Handmade snowman snow globe"
  },
  {
    name: "Reindeer",
    outline: "REINDEER",
    variant: "Woodland White",
    price: "$6",
    image: null,
    alt: "Handmade reindeer snow globe"
  },
  {
    name: "Christmas Tree",
    outline: "TREE",
    variant: "Pine & Pearl",
    price: "$6",
    image: null,
    alt: "Handmade Christmas tree snow globe"
  }
];

function globeShell(inner) {
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
        <ellipse cx="132" cy="145" rx="30" ry="12" fill="#FFFFFF" opacity=".42" transform="rotate(-42 132 145)"/>
        ${inner}
        <g fill="#FFFFFF" opacity=".82">
          <circle cx="118" cy="188" r="4"/><circle cx="278" cy="145" r="3"/>
          <circle cx="302" cy="224" r="5"/><circle cx="145" cy="238" r="3"/>
          <circle cx="238" cy="104" r="3.5"/><circle cx="176" cy="155" r="2.5"/>
        </g>
      </g>
      <path d="M96 346h228l22 48H74z" fill="url(#base)" stroke="#AFCFE4" stroke-width="4"/>
      <path d="M74 394h272v18c0 10-8 18-18 18H92c-10 0-18-8-18-18z" fill="#F8FCFF" stroke="#AFCFE4" stroke-width="4"/>
      <path d="M186 346c0-20 48-20 48 0" fill="none" stroke="#8A6420" stroke-width="10" stroke-linecap="round"/>
      <circle cx="210" cy="344" r="7" fill="#B8842F"/>
    </svg>`;
}

function penguinSvg() {
  return globeShell(`
    <ellipse cx="210" cy="311" rx="80" ry="18" fill="#B8D5E7" opacity=".62"/>
    <ellipse cx="210" cy="230" rx="58" ry="88" fill="#F7FAFC"/>
    <ellipse cx="210" cy="245" rx="42" ry="62" fill="#FFFFFF"/>
    <circle cx="210" cy="164" r="55" fill="#F7FAFC"/>
    <circle cx="210" cy="170" r="39" fill="#FFFFFF"/>
    <circle cx="193" cy="158" r="5" fill="#3F4D58"/>
    <circle cx="227" cy="158" r="5" fill="#3F4D58"/>
    <path d="M198 176l12 9 12-9-12 20z" fill="#D9B85F"/>
    <path d="M161 252l-22 38M259 252l22 38" stroke="#F7FAFC" stroke-width="18" stroke-linecap="round"/>
    <path d="M177 304l-18 15M243 304l18 15" stroke="#D9B85F" stroke-width="9" stroke-linecap="round"/>
  `);
}

function snowmanSvg() {
  return globeShell(`
    <ellipse cx="210" cy="314" rx="84" ry="16" fill="#B8D5E7" opacity=".62"/>
    <circle cx="210" cy="275" r="67" fill="#FFFFFF"/>
    <circle cx="210" cy="190" r="52" fill="#FFFFFF"/>
    <circle cx="210" cy="126" r="43" fill="#FFFFFF"/>
    <path d="M166 126h88" stroke="#6F95B1" stroke-width="8" stroke-linecap="round"/>
    <path d="M179 89h62v38h-62z" fill="#EEF6FB" stroke="#A4C5DC" stroke-width="3"/>
    <circle cx="194" cy="121" r="4" fill="#3F4D58"/>
    <circle cx="226" cy="121" r="4" fill="#3F4D58"/>
    <path d="M210 130l24 8-24 7z" fill="#D9B85F"/>
    <circle cx="210" cy="183" r="5" fill="#2F6A9C"/>
    <circle cx="210" cy="210" r="5" fill="#2F6A9C"/>
    <path d="M145 245l-30-18M275 245l30-18" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round"/>
  `);
}

function reindeerSvg() {
  return globeShell(`
    <ellipse cx="210" cy="312" rx="88" ry="17" fill="#B8D5E7" opacity=".62"/>
    <ellipse cx="210" cy="248" rx="72" ry="66" fill="#A97961"/>
    <ellipse cx="210" cy="166" rx="48" ry="56" fill="#B88770"/>
    <ellipse cx="210" cy="238" rx="31" ry="38" fill="#D5B39E"/>
    <circle cx="194" cy="158" r="5" fill="#3F4D58"/>
    <circle cx="226" cy="158" r="5" fill="#3F4D58"/>
    <ellipse cx="210" cy="184" rx="11" ry="9" fill="#3F4D58"/>
    <path d="M174 130l-20-32M246 130l20-32" stroke="#7F604F" stroke-width="7" stroke-linecap="round"/>
    <path d="M155 98l-16-12M265 98l16-12M155 98l-6-18M265 98l6-18" stroke="#7F604F" stroke-width="6" stroke-linecap="round"/>
    <circle cx="210" cy="219" r="9" fill="#B8842F"/>
  `);
}

function treeSvg() {
  return globeShell(`
    <ellipse cx="210" cy="314" rx="88" ry="17" fill="#B8D5E7" opacity=".62"/>
    <rect x="198" y="286" width="24" height="38" rx="3" fill="#9C7455"/>
    <path d="M210 96l-72 136h144z" fill="#557F71"/>
    <path d="M210 138l-88 120h176z" fill="#668F7F"/>
    <path d="M210 178l-78 108h156z" fill="#739B8B"/>
    <circle cx="178" cy="205" r="7" fill="#D9B85F"/>
    <circle cx="238" cy="229" r="7" fill="#8A6420"/>
    <circle cx="210" cy="274" r="7" fill="#D9B85F"/>
    <circle cx="165" cy="273" r="6" fill="#8A6420"/>
    <circle cx="255" cy="274" r="6" fill="#D9B85F"/>
    <path d="M210 96l8 14h-16z" fill="#D9B85F"/>
  `);
}
