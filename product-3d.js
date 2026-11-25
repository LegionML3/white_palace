import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CATALOG_ITEMS, PRICING_CONFIG, THEMES, getItemPrice } from "./data.js";

const products = CATALOG_ITEMS.map((item) => ({
  ...item,
  version: item.edition === "premium-tree" || item.hasTree ? "Premium" : "Standard"
}));

const canvas = document.getElementById("globeCanvas");
const viewer = document.getElementById("viewer");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
let scene;
let camera;
let controls;
let globeGroup;
let treeGroup;
let currentProduct;
let activeView = "full";
let domeMesh;
let domeHighlight;
let characterGroup;
let baseGroup;
let snowMesh;
let winterGroup;

try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 2.2, 9);

  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 5.8;
  controls.maxDistance = 12;
  controls.target.set(0, 1.1, 0);
  controls.update();

  scene.add(new THREE.HemisphereLight(0xffffff, 0xa4bdd1, 2.4));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3);
  keyLight.position.set(4, 8, 6);
  keyLight.castShadow = true;
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xbadcf3, 2);
  rimLight.position.set(-5, 3, -4);
  scene.add(rimLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 64),
    new THREE.MeshStandardMaterial({ color: 0xeef6fc, transparent: true, opacity: 0.72 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.05;
  floor.receiveShadow = true;
  scene.add(floor);
} catch (error) {
  canvas.hidden = true;
  viewer.insertAdjacentHTML("beforeend", '<div class="no-webgl">The 3D preview is unavailable in this browser.<br>Product options and ordering details are still available.</div>');
  document.querySelectorAll(".viewer-tools button").forEach((button) => { button.disabled = true; });
}

function material(color, roughness = 0.6, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function mesh(geometry, meshMaterial) {
  const object = new THREE.Mesh(geometry, meshMaterial);
  object.castShadow = true;
  object.receiveShadow = true;
  return object;
}

function addSphere(parent, radius, position, color, roughness = 0.6) {
  const object = mesh(new THREE.SphereGeometry(radius, 32, 24), material(color, roughness));
  object.position.set(...position);
  parent.add(object);
  return object;
}

// Future .glb support: set modelType or placeholderConfig in this catalog hook.
const modelHooks = {
  modelType: "procedural",
  placeholderConfig: {
    domeRadius: 2.15,
    baseHeight: 0.72,
    premiumTree: true
  }
};

function clearGroup() {
  if (globeGroup) {
    scene.remove(globeGroup);
    globeGroup.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((item) => item.dispose());
      }
    });
  }
  if (winterGroup) {
    scene.remove(winterGroup);
    winterGroup.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) object.material.dispose();
    });
  }
  globeGroup = new THREE.Group();
  scene.add(globeGroup);
  treeGroup = null;
  domeMesh = null;
  domeHighlight = null;
  characterGroup = null;
  baseGroup = null;
  snowMesh = null;
  winterGroup = null;
}

function buildDome() {
  domeMesh = mesh(
    new THREE.SphereGeometry(2.15, 48, 36),
    new THREE.MeshPhysicalMaterial({
      color: 0xdaf1ff,
      transparent: true,
      opacity: 0.16,
      transmission: 0.82,
      thickness: 0.25,
      roughness: 0.08,
      clearcoat: 1
    })
  );
  domeMesh.position.y = 0.55;
  globeGroup.add(domeMesh);

  domeHighlight = mesh(
    new THREE.SphereGeometry(0.16, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
  );
  domeHighlight.scale.set(0.65, 1.8, 0.25);
  domeHighlight.position.set(-1.2, 1.55, 1.55);
  globeGroup.add(domeHighlight);

  baseGroup = new THREE.Group();
  const baseTop = mesh(new THREE.CylinderGeometry(2.05, 2.18, 0.24, 48), material(0xeaf4fa, 0.35));
  baseTop.position.y = -1.43;
  baseGroup.add(baseTop);
  const baseBody = mesh(new THREE.CylinderGeometry(1.82, 1.98, 0.72, 48), material(0xfafcff, 0.4));
  baseBody.position.y = -1.86;
  baseGroup.add(baseBody);
  const goldBand = mesh(new THREE.TorusGeometry(1.88, 0.055, 12, 48), material(0xb8842f, 0.25, 0.35));
  goldBand.rotation.x = Math.PI / 2;
  goldBand.position.y = -1.52;
  baseGroup.add(goldBand);
  globeGroup.add(baseGroup);

  snowMesh = new THREE.Mesh(
    new THREE.CircleGeometry(1.62, 48),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
  );
  snowMesh.rotation.x = -Math.PI / 2;
  snowMesh.position.y = -1.28;
  globeGroup.add(snowMesh);
}

function buildWinterScene() {
  winterGroup = new THREE.Group();
  [-3.4, 3.2].forEach((x, index) => {
    const trunk = mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.8, 12), material(0x9c7455));
    trunk.position.set(x, -1.42, -1.2 - index * 0.4);
    winterGroup.add(trunk);
    [0.8, 0.35, -0.1].forEach((y, tier) => {
      const fir = mesh(new THREE.ConeGeometry(0.85 - tier * 0.12, 1.05, 18), material(tier === 1 ? 0x668f7f : 0x557f71));
      fir.position.set(x, y, -1.2 - index * 0.4);
      winterGroup.add(fir);
    });
  });

  for (let index = 0; index < 24; index++) {
    const flake = mesh(
      new THREE.SphereGeometry(0.045 + (index % 3) * 0.018, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    const angle = index * 2.4;
    flake.position.set(Math.cos(angle) * (2.5 + (index % 4) * 0.35), -0.8 + (index % 6) * 0.55, Math.sin(angle) * 2.2);
    winterGroup.add(flake);
  }
  scene.add(winterGroup);
}

function buildPenguin() {
  const group = new THREE.Group();
  const body = addSphere(group, 0.76, [0, -0.15, 0.1], 0xf2f6f8);
  body.scale.set(0.86, 1.18, 0.86);
  addSphere(group, 0.58, [0, 0.72, 0.12], 0xf7fafc);
  addSphere(group, 0.42, [0, 0.05, 0.72], 0xffffff).scale.set(0.72, 1.0, 0.18);
  addSphere(group, 0.07, [-0.18, 0.78, 0.62], 0x31485a);
  addSphere(group, 0.07, [0.18, 0.78, 0.62], 0x31485a);
  const beak = mesh(new THREE.ConeGeometry(0.13, 0.3, 16), material(0xd9b85f, 0.45));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.63, 0.68);
  group.add(beak);
  globeGroup.add(group);
}

function buildSanta() {
  const group = new THREE.Group();
  addSphere(group, 0.78, [0, -0.32, 0.1], 0xa33a34);
  addSphere(group, 0.58, [0, 0.66, 0.12], 0xf2cdb1);
  const hat = mesh(new THREE.ConeGeometry(0.62, 1.05, 24), material(0xa33a34));
  hat.position.set(0, 1.38, 0.05);
  hat.rotation.z = -0.12;
  group.add(hat);
  addSphere(group, 0.18, [0.18, 1.82, 0.05], 0xffffff);
  const beard = mesh(new THREE.SphereGeometry(0.48, 24, 18), material(0xffffff));
  beard.scale.set(1, 0.72, 0.35);
  beard.position.set(0, 0.45, 0.63);
  group.add(beard);
  globeGroup.add(group);
}

function buildStar() {
  const shape = new THREE.Shape();
  const points = 5;
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? 0.95 : 0.42;
    const angle = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
  }
  shape.closePath();
  const star = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08 }), material(0xd9b85f, 0.3, 0.2));
  star.position.set(0, 0.48, 0);
  star.rotation.y = 0.18;
  globeGroup.add(star);
}

function buildReindeer() {
  const group = new THREE.Group();
  addSphere(group, 0.78, [0, -0.38, 0], 0xb88770);
  addSphere(group, 0.48, [0, 0.64, 0.12], 0xb88770);
  addSphere(group, 0.12, [0, 0.55, 0.58], 0x3f4d58);
  [-1, 1].forEach((side) => {
    const horn = mesh(new THREE.TorusGeometry(0.38, 0.055, 8, 18, Math.PI * 1.2), material(0x7f604f));
    horn.position.set(side * 0.38, 1.12, 0);
    horn.rotation.z = side * 0.55;
    group.add(horn);
  });
  globeGroup.add(group);
}

function buildElf() {
  const group = new THREE.Group();
  addSphere(group, 0.78, [0, -0.35, 0], 0x668f7f);
  addSphere(group, 0.5, [0, 0.62, 0.12], 0xf2cdb1);
  const hat = mesh(new THREE.ConeGeometry(0.58, 1.2, 24), material(0x668f7f));
  hat.position.set(0, 1.42, 0);
  hat.rotation.z = -0.18;
  group.add(hat);
  const hatTip = mesh(new THREE.SphereGeometry(0.14, 16, 12), material(0xa33a34));
  hatTip.position.set(-0.18, 1.96, 0);
  group.add(hatTip);
  globeGroup.add(group);
}

function buildSnowman() {
  const group = new THREE.Group();
  addSphere(group, 0.82, [0, -0.48, 0], 0xffffff);
  addSphere(group, 0.58, [0, 0.35, 0], 0xffffff);
  addSphere(group, 0.43, [0, 1.05, 0], 0xffffff);
  const hat = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.5, 24), material(0x35536a));
  hat.position.set(0, 1.58, 0);
  group.add(hat);
  globeGroup.add(group);
}

function buildChristmasTree() {
  const group = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.7, 16), material(0x9c7455));
  trunk.position.y = -0.78;
  group.add(trunk);
  [1.15, 0.82, 0.48].forEach((size, index) => {
    const cone = mesh(new THREE.ConeGeometry(size, 0.95, 24), material(index === 1 ? 0x668f7f : 0x557f71));
    cone.position.y = -0.58 + index * 0.65;
    group.add(cone);
  });
  const star = mesh(new THREE.OctahedronGeometry(0.18), material(0xd9b85f, 0.25, 0.25));
  star.position.y = 1.72;
  group.add(star);
  globeGroup.add(group);
}

function buildPremiumTree() {
  treeGroup = new THREE.Group();
  const trunk = mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.5, 12), material(0x9c7455));
  trunk.position.set(0.95, -0.95, -0.2);
  treeGroup.add(trunk);
  [-0.62, -0.18, 0.18].forEach((y, index) => {
    const cone = mesh(new THREE.ConeGeometry(0.48 - index * 0.08, 0.75, 18), material(0x557f71));
    cone.position.set(0.95, y, -0.2);
    treeGroup.add(cone);
  });
  globeGroup.add(treeGroup);
}

const themeBuilders = {
  Penguin: buildPenguin,
  Santa: buildSanta,
  Star: buildStar,
  Reindeer: buildReindeer,
  Elf: buildElf,
  Snowman: buildSnowman,
  "Christmas Tree": buildChristmasTree
};

function rebuildScene() {
  if (!scene) return;
  clearGroup();
  buildDome();
  const firstCharacterChild = globeGroup.children.length;
  themeBuilders[currentProduct.theme]?.();
  characterGroup = new THREE.Group();
  globeGroup.children.slice(firstCharacterChild).forEach((child) => characterGroup.add(child));
  globeGroup.add(characterGroup);
  if (currentProduct.hasTree || currentProduct.edition === "premium-tree") buildPremiumTree();
  buildWinterScene();
  applyView(activeView);
}

function applyView(view) {
  activeView = view;
  const positions = {
    full: [0, 2.2, 9, 0, 1.1, 0],
    inside: [0, 1.05, 5.9, 0, 0.25, 0],
    base: [4.6, -0.2, 7.2, 0, -1.45, 0],
    winter: [-5.2, 2.8, 8.1, 0, 0.3, 0]
  };
  const p = positions[view];
  if (camera) {
    camera.position.set(p[0], p[1], p[2]);
    if (controls) {
      controls.target.set(p[3], p[4], p[5]);
      controls.update();
    }
  }

  if (domeMesh) {
    domeMesh.visible = view !== "base";
    domeMesh.material.opacity = view === "inside" ? 0.07 : 0.16;
  }
  if (domeHighlight) domeHighlight.visible = view !== "base";
  if (characterGroup) characterGroup.visible = view !== "base";
  if (treeGroup) treeGroup.visible = view !== "base";
  if (snowMesh) snowMesh.visible = view !== "base";
  if (winterGroup) winterGroup.visible = view === "winter";

  const captions = { full: "3D View", inside: "Inside Globe", base: "Base & Detail", winter: "Winter Scene" };
  document.getElementById("viewerCaption").textContent = captions[view];
  document.querySelectorAll(".thumb").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
}

function formatMoney(value) {
  return `${PRICING_CONFIG.currencySymbol}${value.toFixed(2)}`;
}

function resolveProduct() {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
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
  const title = product.name;
  document.title = `${title} | White Palace`;
  document.getElementById("productTitle").textContent = title;
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
  rebuildScene();

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

document.querySelectorAll(".thumb").forEach((button) => {
  button.addEventListener("click", () => applyView(button.dataset.view));
});

document.getElementById("resetCamera").addEventListener("click", () => applyView("full"));
document.getElementById("zoomIn").addEventListener("click", () => {
  if (camera && controls) {
    camera.position.multiplyScalar(0.86);
    controls.update();
  }
});
document.getElementById("zoomOut").addEventListener("click", () => {
  if (camera && controls) {
    camera.position.multiplyScalar(1.16);
    controls.update();
  }
});

document.getElementById("reserveButton").addEventListener("click", () => {
  const quantity = document.getElementById("quantity").value;
  document.dispatchEvent(new CustomEvent("whitepalace:preorder", {
    detail: { productId: currentProduct.id, quantity: Number(quantity) }
  }));
});

function resizeRenderer() {
  if (!renderer) return;
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

function animate() {
  if (!renderer) return;
  requestAnimationFrame(animate);
  if (globeGroup && !prefersReducedMotion) {
    globeGroup.rotation.y = Math.sin(Date.now() * 0.00035) * 0.08;
  }
  if (controls) controls.update();
  if (scene && camera) renderer.render(scene, camera);
}

window.addEventListener("resize", resizeRenderer);
currentProduct = resolveProduct();
updateOptions();
populateSwitcher();
updateProduct(currentProduct, false);
resizeRenderer();
animate();
