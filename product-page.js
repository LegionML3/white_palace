import { CATALOG_ITEMS, PRICING_CONFIG, THEMES, getItemPrice } from "./data.js";
import { updateProductGallery } from "./product-gallery.js";

const products = CATALOG_ITEMS.map((item) => ({
  ...item,
  version: item.edition === "premium-tree" || item.hasTree ? "Premium" : "Standard"
}));

let currentProduct;

function formatMoney(value) {
  return `${PRICING_CONFIG.currencySymbol}${value.toFixed(2)}`;
}

function resolveProduct() {
  const requestedId = new URLSearchParams(window.location.search).get("id");
  const product = products.find((item) => item.id === requestedId);
  if (!requestedId) return products[0];
  if (!product) {
    const notice = document.getElementById("productNotice");
    notice.hidden = false;
    notice.textContent = "That snow globe link is no longer available. Showing a featured design instead.";
    return products[0];
  }
  return product;
}

function updateProduct(product, updateUrl = true) {
  currentProduct = product;
  document.title = `${product.name} | White Palace`;
  document.getElementById("productTitle").textContent = product.name;
  document.getElementById("themeBadge").textContent = product.theme;
  document.getElementById("breadcrumbTheme").textContent = product.theme;
  document.getElementById("editionSelect").value = product.finish;

  document.querySelectorAll("[data-version]").forEach((button) => {
    const active = button.dataset.version === product.version;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const price = getItemPrice(product);
  document.getElementById("mainPrice").textContent = formatMoney(price);
  document.getElementById("orderPrice").textContent = formatMoney(price);
  document.getElementById("quantity").value = "1";
  document.getElementById("reservationStatus").textContent = "";
  updateProductGallery(product);

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("id", product.id);
    window.history.replaceState({}, "", url);
  }
}

function findMatchingProduct(theme, finish, version) {
  return products.find((product) =>
    product.theme === theme &&
    product.finish === finish &&
    product.version === version
  );
}

function updateOptions() {
  const editionSelect = document.getElementById("editionSelect");
  const finishes = [...new Set(products
    .filter((product) => product.theme === currentProduct.theme)
    .map((product) => product.finish))];
  editionSelect.innerHTML = finishes.map((finish) => {
    const available = Boolean(findMatchingProduct(currentProduct.theme, finish, currentProduct.version));
    return `<option value="${finish}"${available ? "" : " disabled"}>${finish}${available ? "" : " · unavailable for this edition"}</option>`;
  }).join("");
  editionSelect.value = currentProduct.finish;

  document.querySelectorAll("[data-version]").forEach((button) => {
    button.disabled = !findMatchingProduct(currentProduct.theme, currentProduct.finish, button.dataset.version);
  });
}

function populateSwitcher() {
  const switcher = document.getElementById("productSwitcher");
  switcher.innerHTML = THEMES.map((theme) => `
    <optgroup label="${theme}">
      ${products.filter((product) => product.theme === theme).map((product) =>
        `<option value="${product.id}">${product.finish} · ${product.version}${product.hasTree ? " + Tree" : ""}</option>`
      ).join("")}
    </optgroup>`).join("");
  switcher.value = currentProduct.id;
}

document.querySelectorAll("[data-version]").forEach((button) => {
  button.addEventListener("click", () => {
    const match = findMatchingProduct(currentProduct.theme, currentProduct.finish, button.dataset.version);
    if (match) {
      updateProduct(match);
      updateOptions();
      populateSwitcher();
    }
  });
});

document.getElementById("editionSelect").addEventListener("change", (event) => {
  const match = findMatchingProduct(currentProduct.theme, event.target.value, currentProduct.version);
  if (match) {
    updateProduct(match);
    updateOptions();
    populateSwitcher();
  } else {
    event.target.value = currentProduct.finish;
  }
});

document.getElementById("productSwitcher").addEventListener("change", (event) => {
  const match = products.find((product) => product.id === event.target.value);
  if (match) {
    updateProduct(match);
    updateOptions();
    populateSwitcher();
  }
});

document.getElementById("reserveButton").addEventListener("click", () => {
  const quantity = document.getElementById("quantity").value;
  document.dispatchEvent(new CustomEvent("whitepalace:preorder", {
    detail: { productId: currentProduct.id, quantity: Number(quantity) }
  }));
});

currentProduct = resolveProduct();
updateOptions();
populateSwitcher();
updateProduct(currentProduct, false);
