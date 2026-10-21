/* =====================================================================
   VAAMA FASHION — js/products.js
   Categories + SAMPLE products. All products here are DEMONSTRATION DATA,
   not real Vaama Fashion stock or prices (isSample: true).

   Fields: id (unique), name, category (id from list below), price (₹, >0),
   originalPrice (number or null), description, image ("" = placeholder, or a
   path like "assets/images/products/VF-001.jpg"), available (true/false),
   sizes [], colours [], featured, newArrival, label (e.g. "Sale", "Festive"),
   isSample.
   ===================================================================== */
(function () {
  "use strict";
  var VF = window.VF = window.VF || {};

  VF.CATEGORIES = [
    { id: "one-piece",    name: "One-Piece",            note: "One-piece dresses and outfits" },
    { id: "two-piece",    name: "Two-Piece",            note: "Matching two-piece sets" },
    { id: "denims",       name: "Denims",               note: "Jeans and denim styles" },
    { id: "korean-pants", name: "Korean Pants",         note: "Korean-style pants and trousers" },
    { id: "shirts",       name: "Shirts",               note: "Casual and classic shirts" },
    { id: "t-shirts",     name: "T-Shirts",             note: "Everyday T-shirts" },
    { id: "frocks",       name: "Frocks",               note: "Frocks for every day" },
    { id: "seasonal",     name: "Seasonal Collections", note: "Including Ghaghra Choli" }
  ];

  VF.categoryIndex = function (id) {
    for (var i = 0; i < VF.CATEGORIES.length; i++) {
      if (VF.CATEGORIES[i].id === id) return i;
    }
    return -1;
  };
  VF.getCategory = function (id) {
    var i = VF.categoryIndex(id);
    return i === -1 ? null : VF.CATEGORIES[i];
  };

  var CLOTHING = ["S", "M", "L", "XL"];
  var WAIST = ["28", "30", "32", "34"];

  VF.SAMPLE_PRODUCTS = [
    // ---------- One-Piece ----------
    { id: "VF-001", name: "Floral Wrap One-Piece", category: "one-piece", price: 1499, originalPrice: 1899,
      description: "A relaxed wrap-style one-piece with a soft floral print and tie waist.",
      image: "assets/images/products/VF-001.jpg", available: true, sizes: CLOTHING, colours: ["Rose", "Navy"], featured: true, newArrival: false, label: "Sale", isSample: true },
    { id: "VF-002", name: "Pleated Midi One-Piece", category: "one-piece", price: 1799, originalPrice: null,
      description: "A flowing pleated midi length with a fitted waist, suited to day and evening.",
      image: "assets/images/products/VF-002.jpg", available: true, sizes: CLOTHING, colours: ["Sage", "Black"], featured: false, newArrival: true, label: "", isSample: true },
    { id: "VF-003", name: "A-Line Cotton One-Piece", category: "one-piece", price: 1299, originalPrice: null,
      description: "A simple A-line one-piece with short sleeves for everyday wear.",
      image: "assets/images/products/VF-003.jpg", available: true, sizes: CLOTHING, colours: ["Mustard", "Teal"], featured: false, newArrival: false, label: "", isSample: true },

    // ---------- Two-Piece ----------
    { id: "VF-004", name: "Printed Co-ord Set", category: "two-piece", price: 1999, originalPrice: null,
      description: "A matching printed top and trouser set styled for a coordinated look.",
      image: "assets/images/products/VF-004.jpg", available: true, sizes: CLOTHING, colours: ["Beige", "Olive"], featured: true, newArrival: false, label: "", isSample: true },
    { id: "VF-005", name: "Kurta and Palazzo Set", category: "two-piece", price: 1899, originalPrice: 2299,
      description: "A straight kurta paired with wide palazzo pants.",
      image: "assets/images/products/VF-005.jpg", available: true, sizes: CLOTHING, colours: ["Maroon", "Indigo"], featured: false, newArrival: false, label: "Sale", isSample: true },
    { id: "VF-006", name: "Crop Top and Skirt Set", category: "two-piece", price: 1599, originalPrice: null,
      description: "A cropped top with a matching flared skirt.",
      image: "assets/images/products/VF-006.jpg", available: false, sizes: CLOTHING, colours: ["Pink", "White"], featured: false, newArrival: true, label: "", isSample: true },

    // ---------- Denims ----------
    { id: "VF-007", name: "Straight Fit Blue Denim", category: "denims", price: 1299, originalPrice: null,
      description: "Classic straight-fit jeans in a versatile blue wash.",
      image: "assets/images/products/VF-007.jpg", available: true, sizes: WAIST, colours: ["Light Blue", "Dark Blue"], featured: true, newArrival: false, label: "", isSample: true },
    { id: "VF-008", name: "High-Rise Mom Jeans", category: "denims", price: 1499, originalPrice: 1799,
      description: "High-rise jeans with a relaxed leg and tapered ankle.",
      image: "assets/images/products/VF-008.jpg", available: true, sizes: WAIST, colours: ["Mid Blue", "Black"], featured: false, newArrival: false, label: "Sale", isSample: true },
    { id: "VF-009", name: "Wide-Leg Denim", category: "denims", price: 1599, originalPrice: null,
      description: "Full-length wide-leg jeans with a comfortable rise.",
      image: "assets/images/products/VF-009.jpg", available: true, sizes: WAIST, colours: ["Washed Blue"], featured: false, newArrival: true, label: "", isSample: true },

    // ---------- Korean Pants ----------
    { id: "VF-010", name: "Korean Straight Pants", category: "korean-pants", price: 999, originalPrice: null,
      description: "Clean straight-cut pants in the Korean style with an elasticated back waist.",
      image: "assets/images/products/VF-010.jpg", available: true, sizes: CLOTHING, colours: ["Beige", "Black", "Grey"], featured: true, newArrival: false, label: "", isSample: true },
    { id: "VF-011", name: "Korean Wide-Leg Trousers", category: "korean-pants", price: 1199, originalPrice: null,
      description: "Wide-leg trousers with a high waist and a relaxed drape.",
      image: "assets/images/products/VF-011.jpg", available: true, sizes: CLOTHING, colours: ["Cream", "Charcoal"], featured: false, newArrival: true, label: "", isSample: true },
    { id: "VF-012", name: "Korean Cargo Pants", category: "korean-pants", price: 1299, originalPrice: null,
      description: "Utility-style cargo pants with side pockets.",
      image: "assets/images/products/VF-012.jpg", available: false, sizes: CLOTHING, colours: ["Olive", "Khaki"], featured: false, newArrival: false, label: "", isSample: true },

    // ---------- Shirts ----------
    { id: "VF-013", name: "Classic Cotton Shirt", category: "shirts", price: 799, originalPrice: null,
      description: "A tailored everyday shirt with a button front and collar.",
      image: "assets/images/products/VF-013.jpg", available: true, sizes: CLOTHING, colours: ["White", "Sky Blue"], featured: false, newArrival: false, label: "", isSample: true },
    { id: "VF-014", name: "Oversized Relaxed Shirt", category: "shirts", price: 999, originalPrice: null,
      description: "An oversized shirt with a dropped shoulder, easy to layer.",
      image: "assets/images/products/VF-014.jpg", available: true, sizes: CLOTHING, colours: ["Ivory", "Sand", "Black"], featured: true, newArrival: false, label: "", isSample: true },
    { id: "VF-015", name: "Striped Casual Shirt", category: "shirts", price: 849, originalPrice: 999,
      description: "A casual striped shirt with a regular fit.",
      image: "assets/images/products/VF-015.jpg", available: true, sizes: CLOTHING, colours: ["Blue Stripe", "Green Stripe"], featured: false, newArrival: false, label: "Sale", isSample: true },

    // ---------- T-Shirts ----------
    { id: "VF-016", name: "Graphic T-Shirt", category: "t-shirts", price: 499, originalPrice: null,
      description: "A cotton-style crew-neck T-shirt with a printed graphic.",
      image: "assets/images/products/VF-016.jpg", available: true, sizes: CLOTHING, colours: ["Black", "White"], featured: false, newArrival: false, label: "", isSample: true },
    { id: "VF-017", name: "Oversized Drop-Shoulder T-Shirt", category: "t-shirts", price: 649, originalPrice: null,
      description: "A roomy drop-shoulder T-shirt for a relaxed street look.",
      image: "assets/images/products/VF-017.jpg", available: true, sizes: CLOTHING, colours: ["Grey", "Lilac", "Black"], featured: true, newArrival: true, label: "", isSample: true },
    { id: "VF-018", name: "Basic Round-Neck T-Shirt", category: "t-shirts", price: 399, originalPrice: null,
      description: "A simple everyday round-neck T-shirt.",
      image: "assets/images/products/VF-018.jpg", available: true, sizes: CLOTHING, colours: ["White", "Navy", "Maroon", "Mustard"], featured: false, newArrival: false, label: "", isSample: true },

    // ---------- Frocks ----------
    { id: "VF-019", name: "Summer Cotton Frock", category: "frocks", price: 1099, originalPrice: null,
      description: "A light, easy frock with a gathered skirt.",
      image: "assets/images/products/VF-019.jpg", available: true, sizes: CLOTHING, colours: ["Yellow", "Powder Blue"], featured: true, newArrival: false, label: "", isSample: true },
    { id: "VF-020", name: "Tiered Ruffle Frock", category: "frocks", price: 1399, originalPrice: null,
      description: "A tiered frock with soft ruffle detail.",
      image: "assets/images/products/VF-020.jpg", available: true, sizes: CLOTHING, colours: ["Peach", "White"], featured: false, newArrival: true, label: "", isSample: true },
    { id: "VF-021", name: "Printed Skater Frock", category: "frocks", price: 999, originalPrice: 1299,
      description: "A fitted-waist skater frock with an all-over print.",
      image: "assets/images/products/VF-021.jpg", available: true, sizes: CLOTHING, colours: ["Navy Print", "Red Print"], featured: false, newArrival: false, label: "Sale", isSample: true },

    // ---------- Seasonal Collections ----------
    { id: "VF-022", name: "Festive Ghaghra Choli", category: "seasonal", price: 3999, originalPrice: null,
      description: "A festive ghaghra choli set with a flared skirt and matching blouse.",
      image: "assets/images/products/VF-022.jpg", available: true, sizes: CLOTHING, colours: ["Maroon", "Royal Blue"], featured: true, newArrival: false, label: "Festive", isSample: true },
    { id: "VF-023", name: "Embroidered Ghaghra Choli", category: "seasonal", price: 4999, originalPrice: 5999,
      description: "A ghaghra choli with embroidered detailing, styled for celebrations.",
      image: "assets/images/products/VF-023.jpg", available: true, sizes: CLOTHING, colours: ["Pink", "Emerald"], featured: false, newArrival: false, label: "Seasonal Sale", isSample: true },
    { id: "VF-024", name: "Winter Knit Cardigan", category: "seasonal", price: 1699, originalPrice: null,
      description: "A soft knit cardigan for cooler months.",
      image: "assets/images/products/VF-024.jpg", available: true, sizes: CLOTHING, colours: ["Oatmeal", "Charcoal"], featured: false, newArrival: true, label: "Winter", isSample: true }
  ];
})();