/* =====================================================================
   VAAMA FASHION — js/product.js  (Product detail page)
   Reads ?id= from the URL, displays the product, handles size/colour
   selection, quantity, Add to Cart, and WhatsApp product enquiry.
   ===================================================================== */
(function () {
  "use strict";
  var VF = window.VF;

  VF.onReady(function () {
    var esc = VF.util.escapeHtml;
    var fmt = VF.util.formatPrice;
    var B = VF.CONFIG.business;

    /* ----- get product ----- */
    var id = VF.util.getParam("id");
    var product = id ? VF.storage.getProductById(id) : null;
    var cat = product ? VF.getCategory(product.category) : null;

    /* ----- helpers ----- */
    function el(sel) { return document.getElementById(sel) || document.querySelector(sel); }
    function setText(selector, text) { var e = el(selector); if (e) e.textContent = text; }
    function setHtml(selector, html) { var e = el(selector); if (e) e.innerHTML = html; }

    /* ----- not found / missing id ----- */
    if (!product) {
      document.title = "Product not found – VAAMA FASHION";
      setHtml("#product-body",
        '<div class="empty-state container" style="margin:3rem auto">' +
        "<h1>Product not found</h1>" +
        (id ? "<p>No product with the ID <strong>" + esc(id) + "</strong> exists in the catalogue.</p>" : "<p>No product ID was provided in the web address.</p>") +
        '<p><a class="btn btn--dark" href="shop.html">Back to shop</a></p></div>');
      return;
    }

    /* ----- page title and meta ----- */
    document.title = esc(product.name) + " – VAAMA FASHION";

    /* ----- breadcrumb ----- */
    setHtml("#breadcrumb",
      '<a href="index.html">Home</a><span aria-hidden="true">›</span>' +
      '<a href="shop.html">Shop</a><span aria-hidden="true">›</span>' +
      (cat ? '<a href="shop.html?category=' + encodeURIComponent(cat.id) + '">' + esc(cat.name) + '</a><span aria-hidden="true">›</span>' : "") +
      '<span aria-current="page">' + esc(product.name) + "</span>");

    /* ----- badges ----- */
    setHtml("#product-badges", VF.ui.badgesHtml(product));

    /* ----- image ----- */
    setHtml("#product-image", VF.ui.productImageHtml(product));

    /* ----- category ----- */
    setHtml("#product-cat",
      cat ? '<a href="shop.html?category=' + encodeURIComponent(cat.id) + '">' + esc(cat.name) + "</a>" : "");

    /* ----- name and pricing ----- */
    setText("#product-name", product.name);
    var d = VF.ui.discountPercent(product);
    var priceHtml = '<span class="product-price">' + fmt(product.price) + "</span>";
    if (d > 0) {
      priceHtml += ' <s class="product-price-orig"><span class="sr-only">Original price </span>' + fmt(product.originalPrice) + "</s>" +
        ' <span class="product-discount">' + d + "% off</span>";
    }
    setHtml("#product-price", priceHtml);

    /* ----- description ----- */
    setText("#product-desc", product.description);
    if (product.isSample) {
      var note = document.getElementById("sample-note");
      if (note) note.hidden = false;
    }

    /* ----- unavailable state ----- */
    if (!product.available) {
      var strip = document.getElementById("unavail-strip");
      if (strip) strip.hidden = false;
      var addBar = document.getElementById("add-bar");
      if (addBar) addBar.hidden = true;
    }

    /* ----- size / colour option buttons ----- */
    var selectedSize = "";
    var selectedColour = "";

    function buildOptions(containerId, errorId, list, current, onPick) {
      var container = document.getElementById(containerId);
      var errorEl = document.getElementById(errorId);
      if (!container) return;
      if (!list || !list.length) { container.closest(".option-section") && (container.closest(".option-section").hidden = true); return; }
      container.innerHTML = list.map(function (v) {
        return '<button type="button" class="option-btn" data-val="' + esc(v) + '">' + esc(v) + "</button>";
      }).join("");
      container.addEventListener("click", function (e) {
        var btn = e.target.closest(".option-btn");
        if (!btn) return;
        Array.prototype.forEach.call(container.querySelectorAll(".option-btn"), function (b) { b.classList.remove("is-selected"); });
        btn.classList.add("is-selected");
        current = btn.getAttribute("data-val");
        onPick(current);
        if (errorEl) errorEl.textContent = "";
      });
      return function () { return current; };
    }

    buildOptions("size-options", "size-error", product.sizes, selectedSize, function (v) { selectedSize = v; });
    buildOptions("colour-options", "colour-error", product.colours, selectedColour, function (v) { selectedColour = v; });

    /* ----- quantity ----- */
    var qty = 1;
    var MAX = VF.cart.maxQuantity;
    function setQty(n) {
      qty = Math.max(1, Math.min(MAX, n));
      var qd = document.getElementById("qty-display");
      var qm = document.getElementById("qty-minus");
      var qp = document.getElementById("qty-plus");
      if (qd) qd.textContent = qty;
      if (qm) qm.disabled = qty <= 1;
      if (qp) qp.disabled = qty >= MAX;
    }
    var qmBtn = document.getElementById("qty-minus");
    var qpBtn = document.getElementById("qty-plus");
    if (qmBtn) qmBtn.addEventListener("click", function () { setQty(qty - 1); });
    if (qpBtn) qpBtn.addEventListener("click", function () { setQty(qty + 1); });
    setQty(1);

    /* ----- Add to cart ----- */
    var addBtn = document.getElementById("add-to-cart");
    var addError = document.getElementById("add-error");
    if (addBtn && product.available) {
      addBtn.addEventListener("click", function () {
        if (addError) addError.textContent = "";
        var sErr = document.getElementById("size-error");
        var cErr = document.getElementById("colour-error");
        // Clear previous option errors.
        if (sErr) sErr.textContent = "";
        if (cErr) cErr.textContent = "";

        // Read which options are currently selected.
        var sBtn = document.querySelector("#size-options .is-selected");
        var cBtn = document.querySelector("#colour-options .is-selected");
        var size = sBtn ? sBtn.getAttribute("data-val") : "";
        var colour = cBtn ? cBtn.getAttribute("data-val") : "";

        var result = VF.cart.add(product.id, size, colour, qty);
        if (!result.ok) {
          // Show inline errors on the right option row if we can.
          if (/size/i.test(result.error) && sErr) sErr.textContent = result.error;
          else if (/colour/i.test(result.error) && cErr) cErr.textContent = result.error;
          else if (addError) addError.textContent = result.error;
          return;
        }
        VF.ui.toast(product.name + " added to cart." + (result.note ? " " + result.note : ""), "success");
      });
    }

    /* ----- WhatsApp product enquiry ----- */
    var waWrap = document.getElementById("product-whatsapp");
    if (waWrap) {
      var msg = "Hello VAAMA FASHION,\nI am interested in the following product and would like to enquire:\n\n" +
        "Product: " + product.name + "\nCategory: " + (cat ? cat.name : product.category) + "\nPrice: " + fmt(product.price) + "\n\n" +
        "Could you please confirm availability, sizes and any other details?\nThank you.";
      waWrap.innerHTML = VF.whatsapp.buttonHtml(msg, "Enquire on WhatsApp", "btn--outline");
    }

    /* ----- policies ----- */
    var pol = VF.CONFIG.policies;
    if (!pol.approvedByClient) {
      setText("#policy-delivery", pol.deliveryPickup);
      setText("#policy-returns", pol.returns);
      var pd = document.getElementById("policy-section");
      if (pd) pd.hidden = false;
    }
  });
})();