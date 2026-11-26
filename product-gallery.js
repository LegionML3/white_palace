import { getProductImages, getProductPlaceholderImage } from "./data.js";

const gallery = document.getElementById("productGallery");
const lightbox = document.createElement("dialog");
lightbox.className = "image-lightbox";
lightbox.setAttribute("aria-label", "Enlarged product photo");
lightbox.innerHTML = `
  <button class="lightbox-close" type="button" aria-label="Close enlarged photo">×</button>
  <img class="lightbox-image" alt="">
`;
document.body.appendChild(lightbox);

function createImage(product, imageUrl, className, altText) {
  const image = document.createElement("img");
  image.className = className;
  image.alt = altText;
  setImageSource(image, imageUrl, product);
  return image;
}

function setImageSource(image, imageUrl, product) {
  image.onerror = () => {
    image.onerror = null;
    image.src = getProductPlaceholderImage({ ...product, id: "", images: [] });
    image.classList.add("is-placeholder");
  };
  image.src = imageUrl;
}

function openLightbox(imageUrl, altText) {
  const lightboxImage = lightbox.querySelector(".lightbox-image");
  lightboxImage.onerror = () => {
    lightboxImage.onerror = null;
    lightboxImage.src = getProductPlaceholderImage({ ...currentProduct, id: "", images: [] });
  };
  lightboxImage.src = imageUrl;
  lightboxImage.alt = altText;
  lightbox.showModal();
}

let currentProduct;

export function updateProductGallery(product) {
  currentProduct = product;
  const images = getProductImages(product);

  gallery.replaceChildren();
  const stage = document.createElement("div");
  stage.className = "gallery-stage";
  const mainImage = createImage(product, images[0], "gallery-main-image", product.name);
  const zoomButton = document.createElement("button");
  zoomButton.className = "gallery-zoom-button";
  zoomButton.type = "button";
  zoomButton.setAttribute("aria-label", "Enlarge product photo");
  zoomButton.textContent = "⤢";
  stage.append(mainImage, zoomButton);

  const thumbnails = document.createElement("div");
  thumbnails.className = "gallery-thumbnails";
  thumbnails.setAttribute("role", "group");
  thumbnails.setAttribute("aria-label", "Choose a product photo");

  function showImage(index) {
    mainImage.classList.add("is-changing");
    window.setTimeout(() => {
      mainImage.alt = `${product.name}, view ${index + 1}`;
      setImageSource(mainImage, images[index], product);
      mainImage.classList.remove("is-changing");
    }, 100);
    thumbnails.querySelectorAll(".gallery-thumb").forEach((button, buttonIndex) => {
      button.classList.toggle("active", buttonIndex === index);
      button.setAttribute("aria-pressed", String(buttonIndex === index));
    });
  }

  images.forEach((imageUrl, index) => {
    const button = document.createElement("button");
    button.className = `gallery-thumb${index === 0 ? " active" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `View ${product.name}, photo ${index + 1}`);
    button.setAttribute("aria-pressed", String(index === 0));
    button.appendChild(createImage(product, imageUrl, "gallery-thumb-image", ""));
    button.addEventListener("click", () => showImage(index));
    thumbnails.appendChild(button);
  });

  zoomButton.addEventListener("click", () => openLightbox(mainImage.src, product.name));
  mainImage.addEventListener("click", () => openLightbox(mainImage.src, product.name));
  gallery.append(stage, thumbnails);
}

lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
