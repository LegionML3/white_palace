import { getProductImages, getProductPlaceholderImage } from "./data.js";
import { renderGlobe } from "./globe-art.js";

const views = [
  { key: "main", label: "Main Globe View", viewBox: "0 0 420 460" },
  { key: "inside", label: "Inside Globe", viewBox: "72 72 276 276" },
  { key: "base", label: "Base & Frost Detail", viewBox: "36 320 348 120" },
  { key: "winter", label: "Winter Display View", viewBox: "0 0 420 460" }
];
const stage = document.getElementById("galleryOpen");
const stageImage = document.getElementById("galleryImage");
const stageCaption = document.getElementById("galleryCaption");
const strip = document.getElementById("mediaStrip");
const lightbox = document.getElementById("galleryLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
let currentProduct;
let galleryImages = [];
let activeImageIndex = 0;

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
  const winterScene = view.key === "winter" ? `
    <g opacity=".28" fill="#789bb5">
      <path d="M92 150l-44 78h88zM92 182l-54 74h108zM328 142l-48 84h96zM328 177l-60 82h120z"/>
      <path d="M87 244h10v45H87zM323 245h10v45h-10z"/>
    </g>
    <g fill="#fff" opacity=".8"><circle cx="58" cy="106" r="4"/><circle cx="354" cy="115" r="5"/><circle cx="68" cy="300" r="3"/><circle cx="353" cy="312" r="4"/></g>` : "";
  const isBaseDetail = view.key === "base";
  const detailTitle = isBaseDetail
    ? `<text x="400" y="115" text-anchor="middle" fill="#35536a" font-family="Arial,sans-serif" font-size="24" font-weight="700">A closer look at the frosted base</text>`
    : "";
  const imagePosition = isBaseDetail ? { x: 70, y: 295, width: 660, height: 228 } : view.key === "inside"
    ? { x: 130, y: 92, width: 540, height: 540 }
    : { x: 62, y: 75, width: 676, height: 740 };
  const backdrop = view.key === "winter"
    ? `<rect width="800" height="960" fill="url(#sky)"/><path d="M0 690Q180 620 400 690t400 0v270H0z" fill="#fff" opacity=".8"/>${winterScene}`
    : `<rect width="800" height="960" fill="url(#sky)"/><ellipse cx="400" cy="832" rx="245" ry="36" fill="#9dc3df" opacity=".17"/>`;

  const svg = `
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
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function normalizeRealImage(image, index) {
  const item = typeof image === "string" ? { src: image } : image;
  if (!item || typeof item !== "object") return null;
  const src = item.src || item.url || item.imageUrl;
  if (typeof src !== "string" || !src.trim()) return null;
  const label = typeof item.label === "string" ? item.label : `Photo ${index + 1}`;
  return {
    src: src.trim(),
    label,
    alt: typeof item.alt === "string" && item.alt.trim()
      ? item.alt
      : `${currentProduct.name} — ${label}`
  };
}

function normalizeProductImages(images) {
  if (Array.isArray(images)) {
    return images.map((image, index) => normalizeRealImage(image, index)).filter(Boolean);
  }
  if (images && typeof images === "object") {
    return views
      .map((view, index) => normalizeRealImage(images[view.key] || images[view.label], index))
      .filter(Boolean);
  }
  if (typeof images === "string") {
    return [normalizeRealImage(images, 0)].filter(Boolean);
  }
  return [];
}

function buildImages(product) {
  const supplied = normalizeProductImages(product.images);
  if (supplied.length) return supplied;

  if (typeof product.imageUrl === "string" && product.imageUrl.trim()) {
    return [normalizeRealImage(product.imageUrl, 0)];
  }

  const assignedImages = getProductImages(product);
  if (assignedImages.some((image) => !image.startsWith("data:image/svg+xml"))) {
    return assignedImages.map((image, index) => normalizeRealImage(image, index)).filter(Boolean);
  }

  const artwork = renderGlobe(product);
  return views.map((view) => ({
    src: artworkSlide(product, view, artwork),
    label: view.label,
    alt: `${product.name} — ${view.label}`
  }));
}

function setImageSource(image, item) {
  image.onerror = () => {
    image.onerror = null;
    image.src = getProductPlaceholderImage({ ...currentProduct, id: "", images: [] });
  };
  image.src = item.src;
  image.alt = item.alt;
}

function selectImage(index) {
  activeImageIndex = (index + galleryImages.length) % galleryImages.length;
  const selected = galleryImages[activeImageIndex];
  setImageSource(stageImage, selected);
  stageCaption.textContent = selected.label;
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
  setImageSource(lightboxImage, selected);
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
    thumbnail.alt = "";
    setImageSource(thumbnail, image);
    label.className = "thumb-label";
    label.textContent = image.label;
    button.append(thumbnail, label);
    button.addEventListener("click", () => selectImage(index));
    strip.appendChild(button);
  });

  selectImage(0);
}

function openLightbox() {
  showLightboxImage();
  lightbox.showModal();
  document.getElementById("lightboxClose").focus();
}

export function updateProductGallery(product) {
  renderGallery(product);
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
