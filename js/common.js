/* =====================================================================
   VAAMA FASHION — js/common.js
   Shared header, footer, product cards, image fallback, messages.
   ===================================================================== */
(function () {
  "use strict";
  var VF = window.VF = window.VF || {};
  var CFG = VF.CONFIG;
  var B = CFG.business;

  /* ---------- utilities ---------- */
  var util = {
    escapeHtml: function (v) {
      return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    },
    formatPrice: function (n) {
      var num = Number(n);
      if (!isFinite(num)) return "";
      var whole = Math.floor(num) === num;
      return CFG.shop.currencySymbol + num.toLocaleString(CFG.shop.currencyLocale, {
        minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2
      });
    },
    getParam: function (name) {
      try {
        var search = window.location.search;
        var pairs = search.replace(/^\?/, "").split("&");
        for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i].split("=");
          if (decodeURIComponent(pair[0]) === name) {
            return pair.length > 1 ? decodeURIComponent(pair[1].replace(/\+/g, " ")) : "";
          }
        }
        return null;
      } catch (e) { return null; }
    },
    isFilled: function (v) { return typeof v === "string" && v.trim() !== ""; },
    whatsappNumber: function () {
      var raw = B.whatsappNumber;
      if (typeof raw !== "string") return null;
      var digits = raw.replace(/[\s+\-()]/g, "");
      return /^\d{11,15}$/.test(digits) ? digits : null;
    },
    placeholderTag: function (label) {
      return '<span class="placeholder-tag">' + util.escapeHtml(label) + " – to be confirmed</span>";
    }
  };
  var esc = util.escapeHtml;

  /* ---------- product visuals ---------- */
  function discountPercent(p) {
    if (typeof p.originalPrice === "number" && p.originalPrice > p.price) {
      return Math.round((1 - p.price / p.originalPrice) * 100);
    }
    return 0;
  }

  function badgesFor(p) {
    var list = [];
    if (!p.available) list.push({ cls: "badge--soldout", text: "Unavailable" });
    var d = discountPercent(p);
    if (d > 0) list.push({ cls: "badge--sale", text: d + "% off" });
    if (p.label) list.push({ cls: "badge--label", text: p.label });
    if (p.newArrival) list.push({ cls: "badge--new", text: "New" });
    return list.slice(0, 3);
  }

  function badgesHtml(p) {
    var b = badgesFor(p);
    if (!b.length) return "";
    return '<div class="badge-row">' + b.map(function (x) {
      return '<span class="badge ' + x.cls + '">' + esc(x.text) + "</span>";
    }).join("") + "</div>";
  }

  function placeholderHtml(name, catName, catIndex) {
    var idx = catIndex >= 0 ? catIndex % 8 : 0;
    return '<div class="img-placeholder ph-' + idx + '" role="img" aria-label="' + esc(name) + '">' +
      '<span class="img-placeholder__cat">' + esc(catName) + "</span></div>";
  }

  function productImageHtml(p) {
    var cat = VF.getCategory(p.category);
    var catName = cat ? cat.name : "";
    var idx = VF.categoryIndex(p.category);
    if (!p.image) return placeholderHtml(p.name, catName, idx);
    return '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" data-vf-img ' +
      'data-name="' + esc(p.name) + '" data-cat="' + esc(catName) + '" data-idx="' + idx + '">';
  }

  document.addEventListener("error", function (e) {
    var el = e.target;
    if (el && el.tagName === "IMG" && el.hasAttribute("data-vf-img")) {
      el.outerHTML = placeholderHtml(
        el.getAttribute("data-name") || "product",
        el.getAttribute("data-cat") || "",
        parseInt(el.getAttribute("data-idx"), 10)
      );
    }
  }, true);

  function productCardHtml(p) {
    var cat = VF.getCategory(p.category);
    var d = discountPercent(p);
    return '<article class="product-card' + (p.available ? "" : " is-unavailable") + '">' +
      '<a class="product-card__link" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
      '<div class="product-card__media">' + productImageHtml(p) + badgesHtml(p) + "</div>" +
      '<div class="product-card__body">' +
      '<p class="product-card__cat">' + esc(cat ? cat.name : "") + "</p>" +
      '<h3 class="product-card__name">' + esc(p.name) + "</h3>" +
      '<p class="product-card__price"><span class="price-now">' + util.formatPrice(p.price) + "</span>" +
      (d > 0 ? ' <s class="price-old"><span class="sr-only">Original price </span>' + util.formatPrice(p.originalPrice) + "</s>" : "") +
      "</p></div></a></article>";
  }

  /* ---------- header ---------- */
  var NAV = [
    { page: "home",    href: "index.html",   label: "Home" },
    { page: "shop",    href: "shop.html",     label: "Shop" },
    { page: "about",   href: "about.html",    label: "About" },
    { page: "contact", href: "contact.html",  label: "Contact" }
  ];
  var BAG_ICON = '<svg class="icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
  var USER_ICON = '<svg class="icon" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

  function currentPage() {
    var p = document.body.getAttribute("data-page") || "";
    if (p === "product") return "shop";
    if (p === "account") return "login";
    return p;
  }

  function renderHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    var active = currentPage();
    var user = (VF.storage && typeof VF.storage.getCurrentUser === "function") ? VF.storage.getCurrentUser() : null;
    var isAccountPage = (active === "login" || active === "account");

    var links = NAV.map(function (n) {
      return '<li><a href="' + n.href + '"' + (n.page === active ? ' aria-current="page"' : "") + ">" + n.label + "</a></li>";
    }).join("");

    // Add mobile account link
    var mobileAccountText = user ? ("My Account (" + esc(user.name.split(" ")[0]) + ")") : "Sign In / Register";
    var mobileAccountLi = '<li class="mobile-only-nav"><a href="login.html"' + (isAccountPage ? ' aria-current="page"' : "") + ">" + mobileAccountText + "</a></li>";

    var alerts = "";
    if (!VF.storage.status.persistent) {
      alerts += '<div class="site-alert" role="alert"><div class="container">' +
        "<strong>Browser storage is unavailable.</strong> Your cart and login will not be saved between pages. " +
        "Try Chrome or Edge, and avoid private/incognito mode.</div></div>";
    }

    var accountLabel = user ? ("Hi, " + esc(user.name.split(" ")[0])) : "Sign In";
    var accountTitle = user ? ("Account: " + esc(user.name)) : "Sign In / Register";
    var accountHtml =
      '<a class="account-link' + (user ? " is-logged-in" : "") + '" href="login.html" data-account-link ' +
      'title="' + accountTitle + '"' + (isAccountPage ? ' aria-current="page"' : "") + ">" +
      USER_ICON + '<span class="account-link__text">' + accountLabel + "</span></a>";

    host.innerHTML =
      '<a class="skip-link" href="#main">Skip to main content</a>' +
      '<header class="site-header"><div class="container header-inner">' +
      '<a class="wordmark" href="index.html" aria-label="VAAMA FASHION – home">' +
      '<span class="wordmark__main">VAAMA</span><span class="wordmark__sub">FASHION</span></a>' +
      '<nav id="primary-nav" class="primary-nav" aria-label="Primary"><ul>' + links + mobileAccountLi + "</ul></nav>" +
      '<div class="header-actions">' +
      accountHtml +
      '<a class="cart-link" href="cart.html" data-cart-link' + (active === "cart" ? ' aria-current="page"' : "") + ">" +
      BAG_ICON + '<span class="cart-link__text">Cart</span>' +
      '<span class="cart-badge" data-cart-count hidden>0</span></a>' +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">' +
      '<span class="nav-toggle__bars" aria-hidden="true"></span><span class="sr-only">Menu</span></button>' +
      "</div></div></header>" + alerts;

    var toggle = host.querySelector(".nav-toggle");
    var nav    = host.querySelector(".primary-nav");
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") setOpen(false); });
  }

  function updateAuthHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    var link = host.querySelector("[data-account-link]");
    if (!link) { renderHeader(); return; }
    var user = (VF.storage && typeof VF.storage.getCurrentUser === "function") ? VF.storage.getCurrentUser() : null;
    var accountLabel = user ? ("Hi, " + esc(user.name.split(" ")[0])) : "Sign In";
    var accountTitle = user ? ("Account: " + esc(user.name)) : "Sign In / Register";
    link.title = accountTitle;
    link.classList.toggle("is-logged-in", !!user);
    var textEl = link.querySelector(".account-link__text");
    if (textEl) textEl.textContent = accountLabel;
  }

  function contactLine(label, value, asLink) {
    if (!util.isFilled(value)) {
      return "<li><span class=\"footer-label\">" + label + ":</span> " + util.placeholderTag(label) + "</li>";
    }
    var shown = esc(value);
    if (asLink === "tel")  shown = '<a href="tel:' + esc(value.replace(/[^\d+]/g, "")) + '">' + shown + "</a>";
    if (asLink === "mail") shown = '<a href="mailto:' + esc(value) + '">' + shown + "</a>";
    return "<li><span class=\"footer-label\">" + label + ":</span> " + shown + "</li>";
  }

  function renderFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    var cats = VF.CATEGORIES.map(function (c) {
      return '<li><a href="shop.html?category=' + encodeURIComponent(c.id) + '">' + esc(c.name) + "</a></li>";
    }).join("");

    host.innerHTML =
      '<footer class="site-footer"><div class="container">' +
      '<div class="footer-grid">' +
      '<div><a class="wordmark wordmark--light" href="index.html" aria-label="VAAMA FASHION – home">' +
      '<span class="wordmark__main">VAAMA</span><span class="wordmark__sub">FASHION</span></a>' +
      '<p class="footer-blurb">' + esc(B.shortDescription) + "</p></div>" +
      '<div><h2 class="footer-heading">Explore</h2><ul class="footer-list">' +
      '<li><a href="index.html">Home</a></li><li><a href="shop.html">Shop</a></li>' +
      '<li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li>' +
      '<li><a href="cart.html">Cart</a></li><li><a href="login.html">My Account</a></li></ul></div>' +
      '<div><h2 class="footer-heading">Collections</h2><ul class="footer-list">' + cats + "</ul></div>" +
      '<div><h2 class="footer-heading">Visit us</h2><ul class="footer-list">' +
      "<li>" + esc(B.address) + "</li>" +
      contactLine("Phone", B.phone, "tel") +
      contactLine("Hours", B.openingHours) +
      contactLine("Email", B.email, "mail") +
      "</ul></div></div>" +
      '<div class="footer-bottom"><p>© ' + new Date().getFullYear() + " VAAMA FASHION. All rights reserved.</p>" +
      '<p><a href="admin.html">Admin</a></p></div>' +
      "</div></footer>";
  }

  /* ---------- cart badge ---------- */
  function updateCartBadge() {
    var n = VF.cart.count();
    var badges = document.querySelectorAll("[data-cart-count]");
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = n;
      badges[i].hidden = n === 0;
    }
    var links = document.querySelectorAll("[data-cart-link]");
    for (var j = 0; j < links.length; j++) {
      links[j].setAttribute("aria-label", "Cart, " + n + (n === 1 ? " item" : " items"));
    }
  }

  /* ---------- toast ---------- */
  var toastRegion = null;
  function toast(message, type) {
    if (!toastRegion) {
      toastRegion = document.createElement("div");
      toastRegion.className = "toast-region";
      toastRegion.setAttribute("aria-live", "polite");
      toastRegion.setAttribute("aria-atomic", "false");
      document.body.appendChild(toastRegion);
    }
    var t = document.createElement("div");
    t.className = "toast toast--" + (type || "info");
    t.textContent = message;
    toastRegion.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, type === "error" ? 6000 : 4000);
  }

  /* ---------- ready queue ---------- */
  var ready = false;
  var queue = [];
  VF.onReady = function (fn) {
    if (ready) fn(); else queue.push(fn);
  };

  function init() {
    VF.storage.getProducts();
    renderHeader();
    renderFooter();
    updateCartBadge();
    ready = true;
    queue.splice(0).forEach(function (fn) {
      try { fn(); } catch (err) { console.error("VF onReady error:", err); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  VF.util = util;
  VF.ui = {
    discountPercent: discountPercent,
    badgesHtml: badgesHtml,
    productImageHtml: productImageHtml,
    placeholderHtml: placeholderHtml,
    productCardHtml: productCardHtml,
    updateCartBadge: updateCartBadge,
    updateAuthHeader: updateAuthHeader,
    toast: toast
  };
})();