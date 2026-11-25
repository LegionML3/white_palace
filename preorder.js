import { CATALOG_ITEMS, PRICING_CONFIG, getItemPrice } from "./data.js";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const PREORDER_ACCESS_KEY = "YOUR_ACCESS_KEY_HERE";

const products = CATALOG_ITEMS.map((item) => ({
  ...item,
  version: item.edition === "premium-tree" || item.hasTree ? "Premium + Tree" : "Standard",
  price: getItemPrice(item)
}));
const dialog = document.getElementById("preorderDialog");

if (dialog) {
  const form = document.getElementById("preorderForm");
  const productSelect = document.getElementById("preorderProduct");
  const quantitySelect = document.getElementById("preorderQuantity");
  const nameInput = document.getElementById("preorderName");
  const contactInput = document.getElementById("preorderContact");
  const notesInput = document.getElementById("preorderNotes");
  const message = document.getElementById("preorderMessage");
  const success = document.getElementById("preorderSuccess");
  const submitButton = form.querySelector(".preorder-submit");
  const submitLabel = form.querySelector("[data-submit-label]");
  const currency = PRICING_CONFIG.currencySymbol;
  let returnFocus = null;
  let submitting = false;

  productSelect.innerHTML = products.map((product) =>
    `<option value="${product.id}">${product.theme} · ${product.finish} · ${product.version} — ${product.name}</option>`
  ).join("");

  function formatMoney(value) {
    return `${currency}${value.toFixed(2)}`;
  }

  function selectedProduct() {
    return products.find((product) => product.id === productSelect.value) || products[0];
  }

  function orderDetails() {
    const product = selectedProduct();
    const quantity = Number(quantitySelect.value);
    const total = product.price * quantity;
    const edition = product.version;
    const summary = [
      `Product: ${product.name}`,
      `Theme: ${product.theme}`,
      `Finish: ${product.finish}`,
      `Edition: ${edition}`,
      `Quantity: ${quantity}`,
      `Total: ${formatMoney(total)}`,
      `Customer: ${nameInput.value.trim() || "(not provided)"}`,
      `Contact: ${contactInput.value.trim() || "(not provided)"}`,
      `Pickup / special request: ${notesInput.value.trim() || "None"}`
    ].join("\n");

    return { product, quantity, total, edition, summary };
  }

  function updateSummary() {
    const order = orderDetails();
    document.getElementById("preorderSummaryProduct").textContent = order.product.name;
    document.getElementById("preorderSummaryTheme").textContent = order.product.theme;
    document.getElementById("preorderSummaryEdition").textContent = `${order.product.finish} · ${order.edition}`;
    document.getElementById("preorderSummaryQuantity").textContent = String(order.quantity);
    document.getElementById("preorderSummaryTotal").textContent = formatMoney(order.total);
    form.elements.namedItem("product_name").value = order.product.name;
    form.elements.namedItem("theme").value = order.product.theme;
    form.elements.namedItem("edition").value = order.edition;
    form.elements.namedItem("quantity").value = String(order.quantity);
    form.elements.namedItem("total_price").value = formatMoney(order.total);
    form.elements.namedItem("order_summary").value = order.summary;
  }

  function openPreorder(productId, quantity = 1, trigger = document.activeElement) {
    const product = products.find((item) => item.id === productId) || products[0];
    returnFocus = trigger instanceof HTMLElement ? trigger : null;
    productSelect.value = product.id;
    quantitySelect.value = String(Math.min(6, Math.max(1, Number(quantity) || 1)));
    message.textContent = "";
    form.hidden = false;
    success.hidden = true;
    dialog.setAttribute("aria-labelledby", "preorderTitle");
    updateSummary();
    if (!dialog.open) dialog.showModal();
    nameInput.focus();
  }

  function validate() {
    if (!nameInput.value.trim()) {
      message.textContent = "Please enter your full name.";
      nameInput.focus();
      return false;
    }
    if (!contactInput.value.trim()) {
      message.textContent = "Please enter an email address or contact handle.";
      contactInput.focus();
      return false;
    }
    return true;
  }

  function setSubmitting(value) {
    submitting = value;
    submitButton.disabled = value;
    submitButton.classList.toggle("is-submitting", value);
    submitLabel.textContent = value ? "Sending request…" : "Send request";
  }

  document.addEventListener("whitepalace:preorder", (event) => {
    const detail = event.detail || {};
    openPreorder(detail.productId, detail.quantity, document.activeElement);
  });

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-preorder-product]");
    if (trigger) openPreorder(trigger.dataset.preorderProduct, 1, trigger);
  });

  productSelect.addEventListener("change", updateSummary);
  quantitySelect.addEventListener("change", updateSummary);
  [nameInput, contactInput, notesInput].forEach((input) => input.addEventListener("input", updateSummary));

  dialog.querySelectorAll("[data-preorder-close]").forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting || !validate()) return;

    const accessKey = PREORDER_ACCESS_KEY.trim();
    if (!accessKey || accessKey === "YOUR_ACCESS_KEY_HERE") {
      message.textContent = "The request form isn’t connected yet. Site owner: add the Web3Forms access key in preorder.js.";
      return;
    }

    setSubmitting(true);
    message.textContent = "";
    updateSummary();
    const order = orderDetails();
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.subject = `White Palace Preorder - ${nameInput.value.trim()}`;
    payload.from_name = nameInput.value.trim();
    payload.message = order.summary;
    payload.access_key = accessKey;
    payload.botcheck = payload.botcheck || "";

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || result.success === false || result.errors) {
        throw new Error(Array.isArray(result.errors) ? result.errors.map((error) => error.message).join(" ") : "The request could not be sent. Please check the form details and try again.");
      }

      const reference = `WP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      document.getElementById("preorderReference").textContent = reference;
      document.getElementById("preorderSuccessSummary").textContent = order.summary;
      form.hidden = true;
      success.hidden = false;
      dialog.setAttribute("aria-labelledby", "preorderSuccessTitle");
      success.querySelector("[data-preorder-close]").focus();
    } catch (error) {
      message.textContent = error instanceof Error ? error.message : "The request could not be sent. Please try again.";
    } finally {
      setSubmitting(false);
    }
  });

  updateSummary();
}
