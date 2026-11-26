import { CATALOG_ITEMS, PRICING_CONFIG, getItemPrice, getProductImages, getProductPlaceholderImage } from "./data.js";

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
const catalog = document.getElementById("catalog");
const themeFilters = [...document.querySelectorAll(".nav-box")];
const themeIndicator = document.querySelector(".theme-indicator");
const versionButtons = [...document.querySelectorAll(".version-button")];
const searchForm = document.getElementById("catalogSearchForm");
const globeSearch = document.getElementById("globeSearch");
const clearSearchButton = document.getElementById("clearSearch");
const searchSuggestions = document.getElementById("searchSuggestions");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealObserver = !prefersReducedMotion && "IntersectionObserver" in window
  ? new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 })
  : null;

let currentTheme = "Penguin";
let currentIndex = 0;
let themeFilter = "All";
let versionFilter = "All";
let searchQuery = "";
let visibleLimit = 9;
let paused = false;
let autoTimer = null;

counterTotal.textContent = String(products.length).padStart(2, "0");

function formatMoney(value) {
  return `${PRICING_CONFIG.currencySymbol}${value.toFixed(2)}`;
}

function createProductImage(product, imageUrl, className) {
  const image = document.createElement("img");
  image.className = className;
  image.src = imageUrl;
  image.alt = product.name;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    image.src = getProductPlaceholderImage({ ...product, id: "", images: [] });
  }, { once: true });
  return image;
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
    const imageUrl = getProductImages(product)[0];
    globeArt.classList.toggle("is-photo", !imageUrl.startsWith("data:image/svg+xml"));
    globeArt.replaceChildren(createProductImage(product, imageUrl, "product-art-image"));
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

function updateThemeControls() {
  const activeButton = themeFilters.find((button) => button.dataset.theme === themeFilter);
  themeFilters.forEach((button) => {
    const active = button === activeButton;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (activeButton && themeIndicator) {
    themeIndicator.style.left = `${activeButton.offsetLeft}px`;
    themeIndicator.style.width = `${activeButton.offsetWidth}px`;
  }
}

function updateVersionControls() {
  versionButtons.forEach((button) => {
    const active = button.dataset.version === versionFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
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

function matchesSearch(product, query) {
  if (!query) return true;
  const edition = product.hasTree ? "Premium + Tree" : "Standard";
  return `${product.name} ${product.theme} ${product.finish} ${edition}`
    .toLowerCase()
    .includes(query.toLowerCase());
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = `product-card catalog-reveal${searchQuery ? " search-match" : ""}`;
  card.innerHTML = `
    <a class="card-art" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${product.name}, ${product.finish}, ${product.version}">
    </a>
    <div class="card-body">
      <span class="card-theme">${product.theme}</span>
      <h3 class="card-name">${product.name}</h3>
      <div class="card-footer">
        <span class="card-edition">${product.finish} · ${product.version}${product.hasTree ? " · with tree" : ""}</span>
        <span class="card-price">${formatMoney(product.price)}</span>
      </div>
      <button class="card-preorder" type="button" data-preorder-product="${product.id}">Reserve</button>
    </div>`;
  card.querySelector(".card-art").appendChild(
    createProductImage(product, getProductImages(product)[0], "product-art-image")
  );
  if (revealObserver) revealObserver.observe(card);
  else card.classList.add("is-visible");
  return card;
}

function renderCatalog() {
  const filtered = products.filter((product) =>
    (themeFilter === "All" || product.theme === themeFilter) &&
    (versionFilter === "All" || product.version === versionFilter) &&
    matchesSearch(product, searchQuery)
  );

  catalogCount.textContent = searchQuery
    ? `${filtered.length} ${filtered.length === 1 ? "match" : "matches"} for “${searchQuery}”`
    : `${filtered.length} ${filtered.length === 1 ? "design" : "designs"}`;
  productGrid.querySelectorAll(".catalog-reveal").forEach((card) => {
    if (revealObserver) revealObserver.unobserve(card);
  });
  productGrid.replaceChildren();
  const loadMore = document.getElementById("loadMore");

  if (!filtered.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = searchQuery
      ? `No globes match “${searchQuery}”. Try another theme or finish.`
      : "No snow globes match these filters.";
    productGrid.appendChild(emptyState);
    loadMore.classList.add("hidden");
    return;
  }

  filtered.slice(0, visibleLimit).forEach((product) => productGrid.appendChild(createProductCard(product)));
  loadMore.classList.toggle("hidden", visibleLimit >= filtered.length);
  loadMore.textContent = `Show more · ${Math.max(0, filtered.length - visibleLimit)} remaining`;
}

themeFilters.forEach((button) => {
  button.addEventListener("click", () => {
    themeFilter = button.dataset.theme;
    visibleLimit = 9;
    searchQuery = "";
    globeSearch.value = "";
    hideSearchSuggestions();
    clearSearchButton.hidden = true;
    updateThemeControls();
    updateBrowseUrl();
    if (themeFilter !== "All") selectTheme(themeFilter);
    renderCatalog();
    scrollToCatalog();
  });
});

versionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    versionFilter = button.dataset.version;
    visibleLimit = 9;
    updateVersionControls();
    updateBrowseUrl();
    renderCatalog();
  });
});

function startAutoAdvance() {
  window.clearInterval(autoTimer);
  autoTimer = window.setInterval(() => {
    if (!paused && !prefersReducedMotion) {
      const themeIndex = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
      selectTheme(THEMES[themeIndex]);
    }
  }, 7000);
}

hero.addEventListener("mouseenter", () => { paused = true; });
hero.addEventListener("mouseleave", () => { paused = false; });
hero.addEventListener("focusin", () => { paused = true; });
hero.addEventListener("focusout", () => { paused = false; });

function scrollToCatalog() {
  catalog.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start"
  });
}

function updateBrowseUrl() {
  const url = new URL(window.location.href);
  if (searchQuery) url.searchParams.set("q", searchQuery);
  else url.searchParams.delete("q");
  if (themeFilter !== "All") url.searchParams.set("theme", themeFilter);
  else url.searchParams.delete("theme");
  if (versionFilter !== "All") url.searchParams.set("edition", versionFilter);
  else url.searchParams.delete("edition");
  window.history.replaceState({}, "", url.toString());
}

function hideSearchSuggestions() {
  searchSuggestions.hidden = true;
  globeSearch.setAttribute("aria-expanded", "false");
}

function updateSearchSuggestions() {
  const query = globeSearch.value.trim();
  clearSearchButton.hidden = !query;
  searchSuggestions.replaceChildren();
  if (!query) {
    hideSearchSuggestions();
    return;
  }

  const matches = products.filter((product) => matchesSearch(product, query)).slice(0, 6);
  matches.forEach((product) => {
    const suggestion = document.createElement("button");
    suggestion.type = "button";
    suggestion.className = "search-suggestion";
    suggestion.setAttribute("role", "option");
    suggestion.dataset.searchSuggestion = product.name;
    suggestion.textContent = `${product.name} · ${product.finish} · ${product.hasTree ? "Premium + Tree" : "Standard"}`;
    searchSuggestions.appendChild(suggestion);
  });
  searchSuggestions.hidden = matches.length === 0;
  globeSearch.setAttribute("aria-expanded", String(matches.length > 0));
}

function updateSearchFilter() {
  searchQuery = globeSearch.value.trim();
  themeFilter = "All";
  versionFilter = "All";
  visibleLimit = 9;
  updateThemeControls();
  updateVersionControls();
  updateSearchSuggestions();
  renderCatalog();
  updateBrowseUrl();
}

function applySearch(query) {
  globeSearch.value = query.trim();
  updateSearchFilter();
  hideSearchSuggestions();
  updateBrowseUrl();
  scrollToCatalog();
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applySearch(globeSearch.value);
});

globeSearch.addEventListener("input", updateSearchFilter);
globeSearch.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" && !searchSuggestions.hidden) {
    event.preventDefault();
    searchSuggestions.querySelector(".search-suggestion")?.focus();
  } else if (event.key === "Escape") {
    hideSearchSuggestions();
  }
});

searchSuggestions.addEventListener("click", (event) => {
  const suggestion = event.target.closest(".search-suggestion");
  if (suggestion) applySearch(suggestion.dataset.searchSuggestion);
});

searchSuggestions.addEventListener("keydown", (event) => {
  const suggestions = [...searchSuggestions.querySelectorAll(".search-suggestion")];
  const currentIndex = suggestions.indexOf(document.activeElement);
  if (event.key === "ArrowDown" && currentIndex < suggestions.length - 1) {
    event.preventDefault();
    suggestions[currentIndex + 1].focus();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (currentIndex > 0) suggestions[currentIndex - 1].focus();
    else globeSearch.focus();
  } else if (event.key === "Escape") {
    hideSearchSuggestions();
    globeSearch.focus();
  }
});

clearSearchButton.addEventListener("click", () => {
  globeSearch.value = "";
  updateSearchFilter();
  hideSearchSuggestions();
  scrollToCatalog();
  globeSearch.focus();
});

document.addEventListener("click", (event) => {
  if (!searchForm.contains(event.target)) hideSearchSuggestions();
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const editing = target instanceof HTMLElement &&
    (target.isContentEditable || target.matches("input, textarea, select"));
  const interactive = target instanceof HTMLElement && target.closest("button, a, [role='option']");

  if (event.key === "/" && !editing && !document.querySelector("dialog[open]")) {
    event.preventDefault();
    globeSearch.focus();
  } else if (!editing && !interactive && event.key === "ArrowRight") {
    selectTheme(THEMES[(THEMES.indexOf(currentTheme) + 1) % THEMES.length]);
  } else if (!editing && !interactive && event.key === "ArrowLeft") {
    selectTheme(THEMES[(THEMES.indexOf(currentTheme) - 1 + THEMES.length) % THEMES.length]);
  }
});

window.addEventListener("resize", updateThemeControls);

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

const initialParams = new URLSearchParams(window.location.search);
const initialTheme = initialParams.get("theme");
const initialEdition = initialParams.get("edition");
searchQuery = initialParams.get("q")?.trim() || "";
themeFilter = THEMES.includes(initialTheme) ? initialTheme : "All";
versionFilter = ["Standard", "Premium"].includes(initialEdition) ? initialEdition : "All";
if (searchQuery) {
  themeFilter = "All";
  versionFilter = "All";
}
globeSearch.value = searchQuery;
clearSearchButton.hidden = !searchQuery;
updateThemeControls();
updateVersionControls();
selectTheme(themeFilter === "All" ? "Penguin" : themeFilter);
renderCatalog();
if (searchQuery || themeFilter !== "All" || versionFilter !== "All") {
  window.requestAnimationFrame(scrollToCatalog);
}
startAutoAdvance();
