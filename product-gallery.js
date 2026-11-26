import { CATALOG_ITEMS, PRICING_CONFIG, THEMES, getItemPrice } from "./data.js";
import { renderGlobe } from "./globe-art.js";

const products = CATALOG_ITEMS.map((item) => ({
  ...item,
  version: item.edition === "premium-tree" || item.hasTree ? "Premium" : "Standard"
}));
const views = [
  { key: "main", label: "Main Globe View", viewBox: "0 0 420 460" },
  { key: "inside", label: "Inside Globe", viewBox: "72 72 276 276" },
  { key: "base", label: "Base & Frost Detail", viewBox: "36 320 348 120" },
  { key: "winter", label: "Winter Display View", viewBox: "0 0 420 460" }
];
const stage = document.getElementById("galleryOpen");
const stageImage = document.getElementById("galleryImage");
const strip = document.getElementById("mediaStrip");
const lightbox = document.getElementById("galleryLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
let currentProduct;
let galleryImages = [];
let activeImageIndex = 0;

function formatMoney(value) {
  return `${PRICING_CONFIG.currencySymbol}${value.toFixed(2)}`;
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;"
  })[character]);
}

function artworkSlide(product, view, artwork) {
  const contents = artwork.trim().replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const isWinter = view.key === "winter";
  const isDetail = view.key === "base";
  const winterScene = isWinter ? `
    <g opacity=".28" fill="#789bb5">
      <path d="M92 150l-44 78h88zM92 182l-54 74h108zM328 142l-48 84h96zM328 177l-60 82h120z"/>
      <path d="M87 244h10v45H87zM323 245h10v45h-10z"/>
    </g>
    <g fill="#fff" opacity=".8"><circle cx="58" cy="106" r="4"/><circle cx="354" cy="115" r="5"/><circle cx="68" cy="300" r="3"/><circle cx="353" cy="312" r="4"/></g>` : "";
  const detailTitle = isDetail
    ? `<text x="400" y="115" text-anchor="middle" fill="#35536a" font-family="Arial,sans-serif" font-size="24" font-weight="700">A closer look at the frosted base</text>`
    : "";
  const imagePosition = isDetail ? { x: 70, y: 295, width: 660, height: 228 } : view.key === "inside"
    ? { x: 130, y: 92, width: 540, height: 540 }
    : { x: 62, y: 75, width: 676, height: 740 };
  const backdrop = isWinter
    ? `<rect width="800" height="960" fill="url(#sky)"/><path d="M0 690Q180 620 400 690t400 0v270H0z" fill="#fff" opacity=".8"/>${winterScene}`
    : `<rect width="800" height="960" fill="url(#sky)"/><ellipse cx="400" cy="832" rx="245" ry="36" fill="#9dc3df" opacity=".17"/>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 960" role="img">
      <defs>
        <radialGradient id="sky" cx="50%" cy="34%" r="70%">
          <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e4f2fc"/>
        </radialGradient>
      </defs>
      ${backdrop}
      ${detailTitle}
      <svg x="${imagePosition.x}" y="${imagePosition.y}" width="${imagePosition.width}" height="${imagePosition.height}" viewBox="${view.viewBox}" preserveAspectRatio="xMidYMid meet">${contents}</svg>
      <text x="400" y="900" text-anchor="middle" fill="#35536a" font-family="Arial,sans-serif" font-size="20" font-weight="700">${escapeXml(product.theme)} · ${product.hasTree ? "Premium + Tree" : "Standard"}</text>
      <text x="400" y="932" text-anchor="middle" fill="#6b8aa3" font-family="Arial,sans-serif" font-size="13">${escapeXml(view.label)}</text>
    </svg>
  `)}`;
}

function normalizeRealImage(image, index) {
  const item = typeof image === "string" ? { src: image } : image;
  if (!item || typeof item !== "object") return null;
  const src = item.src || item.url || item.imageUrl;
  if (typeof src !== "string" || !src.trim()) return null;
  return {
    src: src.trim(),
    label: typeof item.label === "string" ? item.label : views[index].label,
    alt: typeof item.alt === "string" ? item.alt : ""
  };
}

function buildImages(product) {
  const artwork = renderGlobe(product);
  const images = views.map((view) => ({
    src: artworkSlide(product, view, artwork),
    label: view.label,
    alt: `${product.name} — ${view.label}`
  }));
  const supplied = product.images;

  if (Array.isArray(supplied)) {
    supplied.slice(0, views.length).forEach((image, index) => {
      const realImage = normalizeRealImage(image, index);
      if (realImage) images[index] = {
        ...realImage,
        alt: realImage.alt || `${product.name} — ${realImage.label}`
      };
    });
  } else if (supplied && typeof supplied === "object") {
    views.forEach((view, index) => {
      const realImage = normalizeRealImage(supplied[view.key] || supplied[view.label], index);
      if (realImage) images[index] = {
        ...realImage,
        alt: realImage.alt || `${product.name} — ${realImage.label}`
      };
    });
  }

  if (typeof product.imageUrl === "string" && product.imageUrl.trim()) {
    images[0] = {
      src: product.imageUrl.trim(),
      label: views[0].label,
      alt: `${product.name} — ${views[0].label}`
    };
  }
  return images;
}

function selectImage(index) {
  activeImageIndex = (index + galleryImages.length) % galleryImages.length;
  const selected = galleryImages[activeImageIndex];
  stageImage.src = selected.src;
  stageImage.alt = selected.alt;
  document.getElementById("viewerCaption").textContent = selected.label;
  stage.setAttribute("aria-label", `Open ${selected.alt} in full screen`);

  [...strip.querySelectorAll(".thumb")].forEach((button, buttonIndex) => {
    const active = buttonIndex === activeImageIndex;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (lightbox.open) showLightboxImage();
}

function showLightboxImage() {
  const selected = galleryImages[activeImageIndex];
  lightboxImage.src = selected.src;
  lightboxImage.alt = selected.alt;
  lightboxCaption.textContent = `${currentProduct.name} · ${selected.label}`;
}

function renderGallery(product) {
  currentProduct = product;
  galleryImages = buildImages(product);
  strip.replaceChildren();

  galleryImages.forEach((image, index) => {
    const button = document.createElement("button");
    const thumbnail = document.createElement("img");
    const label = document.createElement("span");
    button.type = "button";
    button.className = "thumb";
    button.setAttribute("aria-label", image.label);
    button.setAttribute("aria-pressed", "false");
    thumbnail.className = "thumb-image";
    thumbnail.src = image.src;
    thumbnail.alt = "";
    label.className = "thumb-label";
    label.textContent = image.label;
    button.append(thumbnail, label);
    button.addEventListener("click", () => selectImage(index));
    strip.appendChild(button);
  });

  selectImage(0);
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
  renderGallery(product);

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

function openLightbox() {
  showLightboxImage();
  lightbox.showModal();
  document.getElementById("lightboxClose").focus();
}

stage.addEventListener("click", openLightbox);
document.getElementById("lightboxClose").addEventListener("click", () => lightbox.close());
document.getElementById("lightboxPrevious").addEventListener("click", () => selectImage(activeImageIndex - 1));
document.getElementById("lightboxNext").addEventListener("click", () => selectImage(activeImageIndex + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox.addEventListener("close", () => stage.focus());
lightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    selectImage(activeImageIndex - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    selectImage(activeImageIndex + 1);
  } else if (event.key === "Escape") {
    event.preventDefault();
    lightbox.close();
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
