// Showcase interactions and search behavior.
const globeArt = document.getElementById("globeArt");
const outlineWord = document.getElementById("outlineWord");
const productName = document.getElementById("productName");
const variantName = document.getElementById("variantName");
const price = document.getElementById("price");
const counterCurrent = document.getElementById("counterCurrent");
const counterTotal = document.getElementById("counterTotal");
const tabs = [...document.querySelectorAll(".tab")];
const navButtons = [...document.querySelectorAll(".nav-box")];
const hero = document.getElementById("hero");
const searchButton = document.querySelector(".search");
const searchPanel = document.getElementById("searchPanel");
const globeSearch = document.getElementById("globeSearch");

const globeRenderers = [penguinSvg, snowmanSvg, reindeerSvg, treeSvg];
let currentIndex = 0;
let autoTimer = null;
let paused = false;

counterTotal.textContent = String(products.length).padStart(2, "0");

function renderProduct(index) {
  const product = products[index];
  if (!product) return;

  globeArt.classList.add("changing");
  outlineWord.classList.add("changing");

  window.setTimeout(() => {
    productName.textContent = product.name;
    outlineWord.textContent = product.outline;
    variantName.textContent = product.variant;
    price.textContent = product.price;
    counterCurrent.textContent = String(index + 1).padStart(2, "0");

    globeArt.innerHTML = product.image
      ? `<img src="${product.image}" alt="${product.alt}">`
      : globeRenderers[index]();

    globeArt.classList.remove("changing");
    outlineWord.classList.remove("changing");
  }, 220);

  tabs.forEach((tab, tabIndex) => {
    const active = tabIndex === index;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  navButtons.forEach((button) => {
    const isAll = button.textContent.trim() === "All globes";
    button.classList.toggle("active",
      isAll ? index === 0 : button.dataset.index === String(index)
    );
  });

  currentIndex = index;
}

function startAutoAdvance() {
  window.clearInterval(autoTimer);
  autoTimer = window.setInterval(() => {
    if (!paused && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      renderProduct((currentIndex + 1) % products.length);
    }
  }, 6000);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    renderProduct(Number(tab.dataset.index));
    startAutoAdvance();
  });
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    renderProduct(Number(button.dataset.index));
    startAutoAdvance();
  });
});

hero.addEventListener("mouseenter", () => { paused = true; });
hero.addEventListener("mouseleave", () => { paused = false; });
hero.addEventListener("focusin", () => { paused = true; });
hero.addEventListener("focusout", () => { paused = false; });

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    renderProduct((currentIndex + 1) % products.length);
    startAutoAdvance();
  } else if (event.key === "ArrowLeft") {
    renderProduct((currentIndex - 1 + products.length) % products.length);
    startAutoAdvance();
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
  if (!query) return;
  const matchIndex = products.findIndex((product) =>
    `${product.name} ${product.variant}`.toLowerCase().includes(query)
  );
  if (matchIndex >= 0) renderProduct(matchIndex);
});

document.getElementById("contact").addEventListener("click", () => {
  document.querySelector(".utility-links a:last-child").focus();
});

globeArt.innerHTML = penguinSvg();
startAutoAdvance();
