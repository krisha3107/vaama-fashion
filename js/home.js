/* VAAMA FASHION — js/home.js */
(function () {
  "use strict";
  var VF = window.VF;

  VF.onReady(function () {
    var esc = VF.util.escapeHtml;
    var B   = VF.CONFIG.business;
    var products = VF.storage.getProducts();

    function count(fn) { return products.filter(fn).length; }
    function styles(n) { return n + (n === 1 ? " style" : " styles"); }
    function setHtml(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }

    /* collections */
    var collections = [
      { cls: "collection-tile--dark", eyebrow: "Seasonal", title: "Festive & Seasonal",
        text: "Ghaghra Choli and other seasonal picks.", href: "shop.html?category=seasonal",
        n: count(function (p) { return p.category === "seasonal"; }) },
      { cls: "collection-tile--sage", eyebrow: "Just in", title: "New Arrivals",
        text: "The newest styles in the collection.", href: "shop.html?tag=new",
        n: count(function (p) { return p.newArrival; }) },
      { cls: "collection-tile--rose", eyebrow: "Offers", title: "Sale Highlights",
        text: "Styles with a reduced price.", href: "shop.html?tag=sale",
        n: count(VF.catalog.isOnSale) }
    ];
    setHtml("collection-grid", collections.map(function (c) {
      return '<a class="collection-tile ' + c.cls + '" href="' + c.href + '">' +
        '<span class="collection-tile__eyebrow">' + esc(c.eyebrow) + "</span>" +
        "<h3>" + esc(c.title) + "</h3>" +
        "<p>" + esc(c.text) + " (" + styles(c.n) + ")</p>" +
        '<span class="collection-tile__cta">Explore</span></a>';
    }).join(""));

    /* categories */
    setHtml("category-grid", VF.CATEGORIES.map(function (c, i) {
      var n = count(function (p) { return p.category === c.id; });
      return '<a class="category-tile ph-' + (i % 8) + '" href="shop.html?category=' + encodeURIComponent(c.id) + '">' +
        '<span class="category-tile__name">' + esc(c.name) + "</span>" +
        '<span class="category-tile__note">' + esc(c.note) + "</span>" +
        '<span class="category-tile__count">' + styles(n) + " &rarr;</span></a>";
    }).join(""));

    /* product rows */
    function fillRow(sectionId, gridId, list) {
      var sec  = document.getElementById(sectionId);
      var grid = document.getElementById(gridId);
      if (!sec || !grid) return;
      if (!list.length) { sec.hidden = true; return; }
      grid.innerHTML = list.slice(0, 4).map(VF.ui.productCardHtml).join("");
    }
    fillRow("featured-section", "featured-grid", products.filter(function (p) { return p.featured; }));
    fillRow("new-section",      "new-grid",      products.filter(function (p) { return p.newArrival; }));
    var onSale = products.filter(VF.catalog.isOnSale).sort(function (a, b) {
      return VF.ui.discountPercent(b) - VF.ui.discountPercent(a);
    });
    fillRow("sale-section", "sale-grid", onSale);

    /* visit card */
    var addr  = esc(B.address);
    var phone = VF.util.isFilled(B.phone)        ? esc(B.phone)        : VF.util.placeholderTag("Phone number");
    var hours = VF.util.isFilled(B.openingHours) ? esc(B.openingHours) : VF.util.placeholderTag("Opening hours");
    setHtml("visit-card",
      "<h3>Visit the store</h3>" +
      "<p><span class=\"label\">Address:</span><br>" + addr + "</p>" +
      "<p><span class=\"label\">Phone:</span> " + phone + "</p>" +
      "<p><span class=\"label\">Opening hours:</span> " + hours + "</p>" +
      '<a class="text-link" href="contact.html">Full contact details</a>');

    /* WhatsApp CTA */
    setHtml("home-whatsapp",
      VF.whatsapp.buttonHtml(
        "Hello VAAMA FASHION, I would like to ask about your clothing collection.",
        "Chat on WhatsApp"
      ));
  });
})();