/* =====================================================================
   VAAMA FASHION — js/catalog.js
   Shared product rules: "on sale", filtering, sorting.
   Load after common.js.
   ===================================================================== */
(function () {
  "use strict";
  var VF = window.VF;

  // A product is "on sale" if it has a higher original price OR its label contains the word "sale".
  function isOnSale(p) {
    return VF.ui.discountPercent(p) > 0 || /sale/i.test(p.label || "");
  }

  // f = { q: text, category: id|"all", avail: true/false, tag: "all"|"new"|"sale"|"featured" }
  function filterProducts(list, f) {
    var terms = String(f.q || "").toLowerCase().split(/\s+/).filter(Boolean);
    return list.filter(function (p) {
      if (f.category && f.category !== "all" && p.category !== f.category) return false;
      if (f.avail && !p.available) return false;
      if (f.tag === "new" && !p.newArrival) return false;
      if (f.tag === "sale" && !isOnSale(p)) return false;
      if (f.tag === "featured" && !p.featured) return false;
      var name = p.name.toLowerCase();
      for (var i = 0; i < terms.length; i++) {
        if (name.indexOf(terms[i]) === -1) return false;   // every typed word must appear in the name
      }
      return true;
    });
  }

  // sort = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc"
  function sortProducts(list, sort) {
    var arr = list.map(function (p, i) { return { p: p, i: i }; });
    var compare = {
      "price-asc": function (a, b) { return a.p.price - b.p.price; },
      "price-desc": function (a, b) { return b.p.price - a.p.price; },
      "name-asc": function (a, b) { return a.p.name.localeCompare(b.p.name, undefined, { sensitivity: "base" }); },
      "name-desc": function (a, b) { return b.p.name.localeCompare(a.p.name, undefined, { sensitivity: "base" }); }
    }[sort];
    if (compare) arr.sort(function (a, b) { return compare(a, b) || a.i - b.i; });
    return arr.map(function (x) { return x.p; });
  }

  VF.catalog = { isOnSale: isOnSale, filterProducts: filterProducts, sortProducts: sortProducts };
})();