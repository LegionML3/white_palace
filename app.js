import { CATALOG_ITEMS, PRICING_CONFIG, getItemPrice } from "./data.js";
import { renderGlobe } from "./globe-art.js";

// Showcase and catalog interactions.
const products = CATALOG_ITEMS.map((item) => ({
  ...item,
  version: item.edition === "premium-tree" || item.hasTree ? "Premium" : "Standard",
  price: getItemPrice(item)
}));
const THEMES = [...new Set(CATALOG_ITEMS.map((item) => item.theme))];
const themeOutlines = {
  Penguin: "PENGUIN",
  Santa: "SANTA",
  Star: "STAR",
  Reindeer: "REINDEER",
  Elf: "ELF",
  Snowman: "SNOWMAN",
  "Christmas Tree": "TREE"
};
const globeArt = document.getElementById("globeArt");
const outlineWord = document.getElementById("outlineWord");
const productName = document.getElementById("productName");
const variantName = document.getElementById("variantName");
const price = document.getElementById("price");
const counterCurrent = document.getElementById("counterCurrent");
const counterTotal = document.getElementById("counterTotal");
const heroTabs = document.getElementById("heroTabs");
const productGrid = document.getElementById("productGrid");
const catalogCount = document.getElementById("catalogCount");
const hero = document.getElementById("hero");
const themeFilters = [...document.querySelectorAll(".nav-box")];
const versionButtons = [...document.querySelectorAll(".version-button")];
const searchButton = document.querySelector(".search");
const searchPanel = document.getElementById("searchPanel");
const globeSearch = document.getElementById("globeSearch");

let currentTheme = "Penguin";
let currentIndex = 0;
let themeFilter = "All";
let versionFilter = "All";
let visibleLimit = 9;
let paused = false;
let autoTimer = null;

counterTotal.textContent = String(products.length).padStart(2, "0");

function formatMoney(value) {
  return `${PRICING_CONFIG.currencySymbol}${value.toFixed(2)}`;
}

function renderHeroProduct(product) {
  if (!product) return;
  globeArt.classList.add("changing");
  outlineWord.classList.add("changing");

  window.setTimeout(() => {
    variantName.textContent = `${product.finish} · ${product.version}${product.hasTree ? " (+ Tree)" : ""}`;
    productName.textContent = product.name;
    outlineWord.textContent = themeOutlines[product.theme];
    price.textContent = formatMoney(product.price);
    counterCurrent.textContent = String(currentIndex + 1).padStart(2, "0");
    globeArt.innerHTML = renderGlobe(product);
    globeArt.classList.remove("changing");
    outlineWord.classList.remove("changing");
  }, 220);
}

function selectTheme(theme) {
  currentTheme = theme;
  const product = products.find((item) => item.theme === theme && item.version === "Standard");
  currentIndex = products.indexOf(product);
  renderHeroProduct(product);

  [...heroTabs.querySelectorAll(".tab")].forEach((tab) => {
    const active = tab.dataset.theme === theme;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

THEMES.forEach((theme) => {
  const tab = document.createElement("button");
  tab.type = "button";
  tab.className = "tab";
  tab.dataset.theme = theme;
  tab.setAttribute("aria-label", `Show ${theme} globes`);
  tab.innerHTML = `<span>${theme === "Christmas Tree" ? "Tree" : theme}</span>`;
  tab.addEventListener("click", () => selectTheme(theme));
  heroTabs.appendChild(tab);
});

function renderCatalog() {
  const filtered = products.filter((product) =>
    (themeFilter === "All" || product.theme === themeFilter) &&
    (versionFilter === "All" || product.version === versionFilter)
  );

  catalogCount.textContent = `${filtered.length} ${filtered.length === 1 ? "design" : "designs"}`;
  productGrid.innerHTML = "";

  if (!filtered.length) {
    productGrid.innerHTML = `<p class="empty-state">No snow globes match these filters.</p>`;
    return;
  }

  filtered.slice(0, visibleLimit).forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <a class="card-art" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${product.name}, ${product.finish}, ${product.version}">
        ${renderGlobe(product)}
      </a>
      <div class="card-body">
        <span class="card-theme">${product.theme}</span>
        <h3 class="card-name">${product.name}</h3>
        <div class="card-footer">
          <span class="card-edition">${product.finish} · ${product.version}${product.hasTree ? " · with tree" : ""}</span>
          <span class="card-price">${formatMoney(product.price)}</span>
        </div>
        <button class="card-preorder" type="button" data-preorder-product="${product.id}">Preorder</button>
      </div>`;

    productGrid.appendChild(card);
  });

  const loadMore = document.getElementById("loadMore");
  loadMore.classList.toggle("hidden", visibleLimit >= filtered.length);
  loadMore.textContent = `Show more · ${Math.max(0, filtered.length - visibleLimit)} remaining`;
}

themeFilters.forEach((button) => {
  button.addEventListener("click", () => {
    themeFilter = button.dataset.theme;
    visibleLimit = 9;
    themeFilters.forEach((item) => item.classList.toggle("active", item === button));
    if (themeFilter !== "All") selectTheme(themeFilter);
    renderCatalog();
  });
});

versionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    versionFilter = button.dataset.version;
    visibleLimit = 9;
    versionButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderCatalog();
  });
});

function startAutoAdvance() {
  window.clearInterval(autoTimer);
  autoTimer = window.setInterval(() => {
    if (!paused && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const themeIndex = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
      selectTheme(THEMES[themeIndex]);
    }
  }, 7000);
}

hero.addEventListener("mouseenter", () => { paused = true; });
hero.addEventListener("mouseleave", () => { paused = false; });
hero.addEventListener("focusin", () => { paused = true; });
hero.addEventListener("focusout", () => { paused = false; });

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    selectTheme(THEMES[(THEMES.indexOf(currentTheme) + 1) % THEMES.length]);
  } else if (event.key === "ArrowLeft") {
    selectTheme(THEMES[(THEMES.indexOf(currentTheme) - 1 + THEMES.length) % THEMES.length]);
  } else if (event.key === "Escape" && searchPanel.classList.contains("open")) {
    closeSearch();
  }
});

function closeSearch() {
  searchPanel.classList.remove("open");
  searchPanel.setAttribute("aria-hidden", "true");
  searchButton.setAttribute("aria-expanded", "false");
}

searchButton.addEventListener("click", () => {
  const opening = !searchPanel.classList.contains("open");
  searchPanel.classList.toggle("open", opening);
  searchPanel.setAttribute("aria-hidden", String(!opening));
  searchButton.setAttribute("aria-expanded", String(opening));
  if (opening) globeSearch.focus();
});

globeSearch.addEventListener("input", () => {
  const query = globeSearch.value.trim().toLowerCase();
  themeFilter = "All";
  versionFilter = "All";
  visibleLimit = 9;
  versionButtons.forEach((button, index) => {
    const active = index === 0;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  themeFilters.forEach((button) => button.classList.toggle("active", button.dataset.theme === "All"));

  if (!query) {
    renderCatalog();
    return;
  }

  const filtered = products.filter((product) =>
    `${product.name} ${product.theme} ${product.finish} ${product.version}`.toLowerCase().includes(query)
  );
  catalogCount.textContent = `${filtered.length} ${filtered.length === 1 ? "design" : "designs"}`;
  productGrid.innerHTML = filtered.length
    ? ""
    : `<p class="empty-state">No snow globes match "${globeSearch.value}".</p>`;

  filtered.slice(0, visibleLimit).forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <a class="card-art" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${product.name}, ${product.finish}, ${product.version}">
        ${renderGlobe(product)}
      </a>
      <div class="card-body">
        <span class="card-theme">${product.theme}</span>
        <h3 class="card-name">${product.name}</h3>
        <div class="card-footer">
          <span class="card-edition">${product.finish} · ${product.version}${product.hasTree ? " · with tree" : ""}</span>
          <span class="card-price">${formatMoney(product.price)}</span>
        </div>
        <button class="card-preorder" type="button" data-preorder-product="${product.id}">Preorder</button>
      </div>`;
    productGrid.appendChild(card);
  });

  document.getElementById("loadMore").classList.toggle("hidden", !filtered.length || visibleLimit >= filtered.length);
  document.getElementById("loadMore").textContent = `Show more · ${Math.max(0, filtered.length - visibleLimit)} remaining`;
});

document.getElementById("contact").addEventListener("click", () => {
  document.querySelector(".utility-links a:last-child").focus();
});

document.getElementById("previousProduct").addEventListener("click", () => {
  selectTheme(THEMES[(THEMES.indexOf(currentTheme) - 1 + THEMES.length) % THEMES.length]);
});

document.getElementById("nextProduct").addEventListener("click", () => {
  selectTheme(THEMES[(THEMES.indexOf(currentTheme) + 1) % THEMES.length]);
});

document.getElementById("loadMore").addEventListener("click", () => {
  visibleLimit += 9;
  renderCatalog();
});

document.getElementById("heroPreorder").addEventListener("click", () => {
  document.dispatchEvent(new CustomEvent("whitepalace:preorder", {
    detail: { productId: products[currentIndex].id, quantity: 1 }
  }));
});

selectTheme("Penguin");
renderCatalog();
startAutoAdvance();
