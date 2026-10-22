/* =====================================================================
   VAAMA FASHION — js/cart.js  (Cart page)
   Displays cart items, quantity adjusters, remove buttons, subtotal,
   empty state, and the WhatsApp order summary button.
   ===================================================================== */
(function () {
  "use strict";
  var VF = window.VF;

  VF.onReady(function () {
    var esc = VF.util.escapeHtml;
    var fmt = VF.util.formatPrice;
    var MAX = VF.cart.maxQuantity;

    var itemsEl = document.getElementById("cart-items");
    var summaryEl = document.getElementById("cart-summary");
    var emptyEl = document.getElementById("cart-empty");
    var countEl = document.getElementById("cart-count-label");
    if (!itemsEl) return;

    /* ----- build WhatsApp order summary text ----- */
    function buildOrderMessage(details) {
      var lines = ["*Order Enquiry – VAAMA FASHION*", ""];
      var user = (VF.storage && typeof VF.storage.getCurrentUser === "function") ? VF.storage.getCurrentUser() : null;
      if (user) {
        lines.push("*Customer:* " + user.name);
        if (user.phone) lines.push("*Mobile:* +91 " + user.phone);
        if (user.city) lines.push("*Area / City:* " + user.city);
        lines.push("");
      }
      details.lines.forEach(function (it) {
        if (it.problem) return;     // skip unavailable/invalid lines from the message
        lines.push("• " + it.product.name);
        if (it.size) lines.push("  Size: " + it.size);
        if (it.colour) lines.push("  Colour: " + it.colour);
        lines.push("  Qty: " + it.quantity + "  ×  " + fmt(it.unitPrice) + "  =  " + fmt(it.lineTotal));
      });
      lines.push("");
      lines.push("Subtotal: " + fmt(details.subtotal));
      lines.push("");
      lines.push("*Note:* This is an enquiry only. Delivery, pickup arrangements and final availability have not been confirmed. Please reply to confirm the order.");
      return lines.join("\n");
    }

    /* ----- render everything ----- */
    function render() {
      var details = VF.cart.details();

      // Update page title count.
      document.title = details.count > 0
        ? "Cart (" + details.count + ") – VAAMA FASHION"
        : "Cart – VAAMA FASHION";

      if (countEl) countEl.textContent = "(" + details.count + (details.count === 1 ? " item" : " items") + ")";

      /* empty state */
      if (details.lines.length === 0) {
        itemsEl.hidden = true;
        summaryEl.hidden = true;
        emptyEl.hidden = false;
        return;
      }
      emptyEl.hidden = true;
      itemsEl.hidden = false;
      summaryEl.hidden = false;

      /* item rows */
      itemsEl.innerHTML = details.lines.map(function (it) {
        var p = it.product;
        var cat = VF.getCategory(p.category);
        var imgHtml = p.image
          ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" data-vf-img data-name="' + esc(p.name) + '" data-cat="' + esc(cat ? cat.name : "") + '" data-idx="' + VF.categoryIndex(p.category) + '">'
          : VF.ui.placeholderHtml(p.name, cat ? cat.name : "", VF.categoryIndex(p.category));

        var metaParts = [];
        if (it.size) metaParts.push("Size: " + it.size);
        if (it.colour) metaParts.push("Colour: " + it.colour);
        if (p.isSample) metaParts.push("Sample item");

        var problemHtml = "";
        if (it.problem === "unavailable") {
          problemHtml = '<p class="cart-item__problem">This item is currently unavailable and will not be included in the order summary.</p>';
        } else if (it.problem === "options") {
          problemHtml = '<p class="cart-item__problem">Size/colour is no longer available. Please remove and re-add this item.</p>';
        }

        return '<div class="cart-item" data-key="' + esc(it.key) + '">' +
          '<a class="cart-item__img" href="product.html?id=' + encodeURIComponent(p.id) + '" tabindex="-1" aria-hidden="true">' + imgHtml + "</a>" +
          '<div class="cart-item__body">' +
          '<a class="cart-item__name" href="product.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.name) + "</a>" +
          (metaParts.length ? '<p class="cart-item__meta">' + esc(metaParts.join(" · ")) + "</p>" : "") +
          problemHtml +
          '<div class="cart-item__qty">' +
          '<button class="qty-btn" type="button" data-qty-action="minus" aria-label="Decrease quantity"' + (it.quantity <= 1 ? " disabled" : "") + '>−</button>' +
          '<span class="qty-display" aria-live="polite">' + it.quantity + "</span>" +
          '<button class="qty-btn" type="button" data-qty-action="plus" aria-label="Increase quantity"' + (it.quantity >= MAX ? " disabled" : "") + '>+</button>' +
          "</div>" +
          '<button class="cart-item__remove" type="button" data-remove aria-label="Remove ' + esc(p.name) + ' from cart">Remove</button>' +
          "</div>" +
          '<p class="cart-item__total">' + fmt(it.lineTotal) + "</p>" +
          "</div>";
      }).join("");

      /* summary panel */
      var waOk = details.lines.some(function (it) { return !it.problem; });
      var msg = waOk ? buildOrderMessage(details) : "";
      var waBtnHtml = waOk
        ? VF.whatsapp.buttonHtml(msg, "Send order on WhatsApp")
        : '<button class="btn btn--whatsapp" type="button" disabled>Send order on WhatsApp</button>' +
          '<p class="summary-problem-note">All items in your cart are currently unavailable or have an issue. Remove or update them before ordering.</p>';

      var user = (VF.storage && typeof VF.storage.getCurrentUser === "function") ? VF.storage.getCurrentUser() : null;
      var authNoteHtml = user
        ? '<p class="summary-note" style="color:var(--sage)">✓ Signed in as <strong>' + esc(user.name) + '</strong>. Your details will be included in the WhatsApp enquiry.</p>'
        : '<p class="summary-note" style="color:var(--ink-soft)"><a href="login.html?redirect=cart.html">Sign in or register</a> to automatically include your name and mobile in this enquiry.</p>';

      summaryEl.innerHTML =
        "<h2>Order summary</h2>" +
        details.lines.map(function (it) {
          return '<div class="summary-row"><span>' + esc(it.product.name) +
            (it.size ? " – " + esc(it.size) : "") + (it.colour ? " / " + esc(it.colour) : "") +
            " × " + it.quantity + (it.problem ? ' <em>(excluded)</em>' : "") +
            "</span><span>" + (it.problem ? "–" : fmt(it.lineTotal)) + "</span></div>";
        }).join("") +
        '<div class="summary-total"><span>Subtotal</span><span>' + fmt(details.subtotal) + "</span></div>" +
        (details.problemCount > 0
          ? '<p class="summary-problem-note">One or more items above are excluded from the subtotal. Remove them and re-check before ordering.</p>' : "") +
        authNoteHtml +
        '<p class="summary-note">Opening WhatsApp starts a chat. Delivery and final availability must be confirmed by the shop. This is not a payment or a confirmed order.</p>' +
        '<div class="cart-actions">' + waBtnHtml + "</div>" +
        '<div class="cart-link-row">' +
        '<a class="text-link" href="shop.html">Continue shopping</a>' +
        '<button type="button" id="clear-cart">Clear cart</button></div>';

      // Bind clear inside summary (re-bound each render).
      var cc = document.getElementById("clear-cart");
      if (cc) cc.addEventListener("click", function () {
        if (window.confirm("Clear the entire cart?")) {
          VF.cart.clear();
          render();
        }
      });
    }

    /* ----- delegate events on item rows ----- */
    itemsEl.addEventListener("click", function (e) {
      var item = e.target.closest("[data-key]");
      if (!item) return;
      var key = item.getAttribute("data-key");

      if (e.target.closest("[data-remove]")) {
        var result = VF.cart.remove(key);
        if (!result.ok) VF.ui.toast(result.error, "error");
        render();
        return;
      }
      var action = e.target.getAttribute("data-qty-action");
      if (!action) return;
      var qty = parseInt(item.querySelector(".qty-display").textContent, 10);
      var newQty = action === "plus" ? qty + 1 : qty - 1;
      if (newQty < 1 || newQty > MAX) return;
      var r = VF.cart.setQuantity(key, newQty);
      if (!r.ok) { VF.ui.toast(r.error, "error"); return; }
      render();
    });

    render();
  });
})();