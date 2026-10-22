/* =====================================================================
   VAAMA FASHION — js/checkout.js
   Direct Order Checkout processing & order confirmation.
   ===================================================================== */
(function () {
  "use strict";
  var VF = window.VF;

  VF.onReady(function () {
    var esc = VF.util.escapeHtml;
    var fmt = VF.util.formatPrice;

    var container = document.getElementById("checkout-form-container");
    var emptyEl   = document.getElementById("checkout-empty");
    var successEl = document.getElementById("checkout-success");
    var form      = document.getElementById("checkout-form");
    var errorEl   = document.getElementById("checkout-error");

    var itemsListEl   = document.getElementById("co-items-list");
    var subtotalEl    = document.getElementById("co-subtotal");
    var shippingFeeEl = document.getElementById("co-shipping-fee");
    var totalEl       = document.getElementById("co-total");

    var shipRadio   = document.querySelector('input[name="deliveryMethod"][value="shipping"]');
    var pickupRadio = document.querySelector('input[name="deliveryMethod"][value="pickup"]');
    var addressWrap = document.getElementById("shipping-address-wrap");
    var userHintEl  = document.getElementById("checkout-user-hint");

    if (!container || !form) return;

    var cartDetails = VF.cart.details();
    var validLines = cartDetails.lines.filter(function (l) { return !l.problem; });

    if (!validLines.length) {
      container.hidden = true;
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    // Pre-fill logged in user
    var currentUser = (VF.storage && typeof VF.storage.getCurrentUser === "function") ? VF.storage.getCurrentUser() : null;
    if (currentUser) {
      if (document.getElementById("co-name")) document.getElementById("co-name").value = currentUser.name || "";
      if (document.getElementById("co-phone")) document.getElementById("co-phone").value = currentUser.phone || "";
      if (document.getElementById("co-email")) document.getElementById("co-email").value = currentUser.email || "";
      if (document.getElementById("co-city") && currentUser.city) document.getElementById("co-city").value = currentUser.city;
      if (userHintEl) {
        userHintEl.innerHTML = '<span style="color:var(--sage)">✓ Pre-filled from your profile (' + esc(currentUser.name) + ')</span>';
      }
    }

    // Render items summary
    itemsListEl.innerHTML = validLines.map(function (it) {
      var p = it.product;
      var img = p.image
        ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '">'
        : '<div class="img-placeholder" style="width:50px;height:65px"><span>' + esc(p.name.slice(0, 8)) + '</span></div>';
      return '<li class="checkout-summary-item">' +
        img +
        '<div>' +
        '<strong>' + esc(p.name) + '</strong><br>' +
        '<span style="font-size:.82rem;color:var(--ink-soft)">' +
        (it.size ? 'Size: ' + esc(it.size) + ' · ' : '') +
        (it.colour ? 'Colour: ' + esc(it.colour) + ' · ' : '') +
        'Qty: ' + it.quantity + '</span>' +
        '</div>' +
        '<span>' + fmt(it.lineTotal) + '</span>' +
        '</li>';
    }).join("");

    function updateTotals() {
      var isPickup = pickupRadio && pickupRadio.checked;
      var fee = isPickup ? 0 : (cartDetails.subtotal >= 1999 ? 0 : 99);
      var total = cartDetails.subtotal + fee;

      subtotalEl.textContent = fmt(cartDetails.subtotal);
      shippingFeeEl.textContent = fee === 0 ? "Free" : fmt(fee);
      totalEl.textContent = fmt(total);

      if (addressWrap) addressWrap.hidden = isPickup;
    }

    // Toggle choice boxes styling
    document.querySelectorAll(".choice-box").forEach(function (box) {
      box.addEventListener("click", function () {
        var groupName = box.querySelector('input[type="radio"]')?.name;
        if (!groupName) return;
        document.querySelectorAll('input[name="' + groupName + '"]').forEach(function (r) {
          r.closest(".choice-box").classList.toggle("is-selected", r.checked);
        });
        updateTotals();
      });
    });

    updateTotals();

    // Submit handler
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errorEl) errorEl.textContent = "";

      var name = (document.getElementById("co-name").value || "").trim();
      var phone = (document.getElementById("co-phone").value || "").trim();
      var email = (document.getElementById("co-email").value || "").trim();
      var deliveryMethod = (document.querySelector('input[name="deliveryMethod"]:checked')?.value) || "shipping";
      var address = (document.getElementById("co-address").value || "").trim();
      var city = (document.getElementById("co-city").value || "").trim();
      var pincode = (document.getElementById("co-pincode").value || "").trim();
      var paymentMethod = (document.querySelector('input[name="paymentMethod"]:checked')?.value) || "cod";
      var notes = (document.getElementById("co-notes").value || "").trim();

      var result = VF.storage.createOrder({
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        deliveryMethod: deliveryMethod,
        address: address,
        city: city,
        pincode: pincode,
        paymentMethod: paymentMethod,
        notes: notes
      });

      if (!result.ok) {
        if (errorEl) errorEl.textContent = result.error;
        return;
      }

      // Show success
      container.hidden = true;
      successEl.hidden = false;

      var o = result.order;
      document.getElementById("success-order-number").textContent = o.orderNumber;
      document.getElementById("success-customer-name").textContent = o.customerName + " (" + o.customerPhone + ")";
      document.getElementById("success-delivery-method").textContent = o.deliveryMethod === "pickup" ? "In-Store Pickup (Adajan, Surat)" : o.shippingAddress.address + ", " + o.shippingAddress.city;
      document.getElementById("success-order-total").textContent = fmt(o.total);

      var payNote = o.paymentMethod === "cod"
        ? "Payment method: Cash on Delivery / Pay on Pickup. Please keep the exact amount ready."
        : "Payment method: " + o.paymentMethod.toUpperCase() + " (Demo processed successfully).";
      document.getElementById("success-payment-note").textContent = payNote;

      VF.ui.toast("Order placed successfully! Order ID: " + o.orderNumber, "success");
    });
  });
})();
