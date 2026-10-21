/* =====================================================================
   VAAMA FASHION — js/storage.js
   The ONLY file that reads/writes browser storage.
   ===================================================================== */
(function () {
  "use strict";
  var VF  = window.VF;
  var CFG = VF.CONFIG;
  var PREFIX = CFG.storage.keyPrefix;
  var MAX_QTY = CFG.shop.maxQuantityPerItem;
  var KEYS = {
    products:      PREFIX + "products",
    corruptBackup: PREFIX + "products.corrupt-backup",
    cart:          PREFIX + "cart",
    session:       PREFIX + "adminSession"
  };

  /* ---------- low-level storage with in-memory fallback ---------- */
  var memStore = {};
  var sessionMem = {};

  var persistent = (function () {
    try {
      var k = "__vf_test__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  var status = { persistent: persistent, productsRecovered: false };

  function rawGet(key) {
    if (persistent) {
      try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }
    return Object.prototype.hasOwnProperty.call(memStore, key) ? memStore[key] : null;
  }
  function rawSet(key, value) {
    if (persistent) {
      try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
    }
    memStore[key] = value;
    return true;
  }
  function rawRemove(key) {
    if (persistent) { try { window.localStorage.removeItem(key); } catch (e) {} }
    delete memStore[key];
  }

  function safeJSON(raw) {
    try { return { ok: true, value: JSON.parse(raw) }; }
    catch (e) { return { ok: false, value: null }; }
  }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function isInt(n) { return typeof n === "number" && isFinite(n) && Math.floor(n) === n; }
  function round2(n) { return Math.round(n * 100) / 100; }

  /* ---------- normalise ---------- */
  function toStringArray(v) {
    var out = [];
    if (!Array.isArray(v)) return out;
    v.forEach(function (x) {
      if (typeof x === "string") { var t = x.trim(); if (t && out.indexOf(t) === -1) out.push(t); }
    });
    return out;
  }
  function toOptNum(v) {
    if (v === null || v === undefined || v === "") return null;
    var n = Number(v);
    return isFinite(n) ? n : null;
  }

  function normalizeProduct(p) {
    p = (p && typeof p === "object") ? p : {};
    return {
      id:            typeof p.id === "string"   ? p.id.trim()   : String(p.id || ""),
      name:          typeof p.name === "string" ? p.name.trim() : String(p.name || ""),
      category:      p.category || "",
      price:         typeof p.price === "string" ? Number(p.price) : (p.price || 0),
      originalPrice: toOptNum(p.originalPrice),
      description:   typeof p.description === "string" ? p.description.trim() : "",
      image:         typeof p.image === "string" ? p.image.trim() : "",
      available:     p.available !== false,
      sizes:         toStringArray(p.sizes),
      colours:       toStringArray(p.colours),
      featured:      p.featured === true,
      newArrival:    p.newArrival === true,
      label:         typeof p.label === "string" ? p.label.trim() : "",
      isSample:      p.isSample === true
    };
  }

  /* ---------- validate ---------- */
  function validateProduct(p) {
    var e = [];
    if (!p || typeof p !== "object") return ["Product data is missing."];
    if (typeof p.id !== "string" || !/^[A-Za-z0-9_-]{1,40}$/.test(p.id))
      e.push("Product ID must be 1–40 characters: letters, numbers, hyphens or underscores.");
    if (typeof p.name !== "string" || !p.name)
      e.push("Product name is required.");
    else if (p.name.length > 120)
      e.push("Product name must be 120 characters or fewer.");
    if (!VF.getCategory(p.category))
      e.push("Please choose a valid category.");
    if (typeof p.price !== "number" || !isFinite(p.price) || p.price <= 0)
      e.push("Price must be a number greater than 0.");
    if (p.originalPrice !== null) {
      if (typeof p.originalPrice !== "number" || !isFinite(p.originalPrice))
        e.push("Original price must be a number, or left empty.");
      else if (typeof p.price === "number" && p.originalPrice <= p.price)
        e.push("Original price must be higher than the current price.");
    }
    if (typeof p.description !== "string" || !p.description)
      e.push("Description is required.");
    else if (p.description.length > 1000)
      e.push("Description must be 1000 characters or fewer.");
    if (typeof p.image !== "string" || p.image.length > 300)
      e.push("Image path must be text of 300 characters or fewer.");
    if (typeof p.label !== "string" || p.label.length > 30)
      e.push("Label must be 30 characters or fewer.");
    ["available", "featured", "newArrival"].forEach(function (f) {
      if (typeof p[f] !== "boolean") e.push("'" + f + "' must be true or false.");
    });
    return e;
  }

  function validateList(list) {
    if (!Array.isArray(list)) return ["Product list must be an array."];
    var errors = [];
    var seen = {};
    list.forEach(function (p, i) {
      var tag = (p && p.id) ? p.id : "#" + (i + 1);
      validateProduct(p).forEach(function (m) { errors.push("Product " + tag + ": " + m); });
      if (p && p.id) {
        if (seen[p.id]) errors.push("Duplicate product ID: " + p.id);
        seen[p.id] = true;
      }
    });
    return errors;
  }

  /* ---------- products: load / save ---------- */
  // In-memory cache. Null means "not loaded yet".
  var _cache = null;

  function seedFromSamples() {
    var list = VF.SAMPLE_PRODUCTS.map(normalizeProduct);
    rawSet(KEYS.products, JSON.stringify(list));
    _cache = list;
    return list;
  }

  function loadProducts() {
    // Return cache if we already loaded this session.
    if (_cache !== null) return _cache;

    var raw = rawGet(KEYS.products);

    // First ever visit (or storage was cleared).
    if (raw === null) {
      return seedFromSamples();
    }

    var parsed = safeJSON(raw);
    if (parsed.ok && Array.isArray(parsed.value) && parsed.value.length > 0) {
      var list = parsed.value.map(normalizeProduct);
      // Light check: if every item has an id we trust it.
      var allHaveId = list.every(function (p) { return typeof p.id === "string" && p.id; });
      if (allHaveId) {
        _cache = list;
        return _cache;
      }
    }

    // Data is corrupt or empty array — keep a backup and reseed.
    rawSet(KEYS.corruptBackup, raw);
    status.productsRecovered = true;
    return seedFromSamples();
  }

  function getProducts()       { return clone(loadProducts()); }
  function getProductById(id)  {
    var list = loadProducts();
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return clone(list[i]); }
    return null;
  }

  function saveProducts(list) {
    if (!Array.isArray(list)) return { ok: false, errors: ["Product list must be an array."] };
    var normalized = list.map(normalizeProduct);
    var errors = validateList(normalized);
    if (errors.length) return { ok: false, errors: errors };
    if (!rawSet(KEYS.products, JSON.stringify(normalized)))
      return { ok: false, errors: ["Could not save. Browser storage may be full or blocked."] };
    _cache = normalized;
    return { ok: true, errors: [] };
  }

  function addProduct(p) {
    var list = getProducts();
    list.push(p);
    return saveProducts(list);
  }
  function updateProduct(id, p) {
    var list = getProducts();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        var u = clone(p);
        u.id = id;
        list[i] = u;
        return saveProducts(list);
      }
    }
    return { ok: false, errors: ["Product not found: " + id] };
  }
  function deleteProduct(id) {
    var list = getProducts();
    var next = list.filter(function (p) { return p.id !== id; });
    if (next.length === list.length) return { ok: false, errors: ["Product not found: " + id] };
    return saveProducts(next);
  }
  function resetProducts() { _cache = null; return seedFromSamples(), { ok: true, errors: [] }; }

  function nextProductId() {
    var max = 0;
    loadProducts().forEach(function (p) {
      var m = /^VF-(\d+)$/.exec(p.id);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    var n = String(max + 1);
    while (n.length < 3) n = "0" + n;
    return "VF-" + n;
  }

  function exportProductsJSON() { return JSON.stringify(loadProducts(), null, 2); }
  function importProductsJSON(text) {
    var parsed = safeJSON(text);
    if (!parsed.ok) return { ok: false, errors: ["That text is not valid JSON."] };
    _cache = null;          // force re-read after save
    return saveProducts(parsed.value);
  }

  /* ---------- admin session ---------- */
  function isAdminLoggedIn() {
    try { return window.sessionStorage.getItem(KEYS.session) === "1"; }
    catch (e) { return sessionMem.admin === "1"; }
  }
  function setAdminLoggedIn(on) {
    try {
      if (on) window.sessionStorage.setItem(KEYS.session, "1");
      else    window.sessionStorage.removeItem(KEYS.session);
    } catch (e) { sessionMem.admin = on ? "1" : "0"; }
  }

  /* ---------- cart ---------- */
  function notifyBadge() {
    if (VF.ui && typeof VF.ui.updateCartBadge === "function") VF.ui.updateCartBadge();
  }
  function lineKey(productId, size, colour) {
    return [productId, size || "", colour || ""].join("|");
  }

  function loadCart() {
    var raw = rawGet(KEYS.cart);
    if (raw === null) return [];
    var parsed = safeJSON(raw);
    if (!parsed.ok || !Array.isArray(parsed.value)) { rawRemove(KEYS.cart); return []; }
    var out = [];
    parsed.value.forEach(function (it) {
      if (!it || typeof it.productId !== "string") return;
      var q = Number(it.quantity);
      if (!isInt(q) || q < 1) return;
      out.push({
        productId: it.productId,
        size:      typeof it.size   === "string" ? it.size   : "",
        colour:    typeof it.colour === "string" ? it.colour : "",
        quantity:  Math.min(q, MAX_QTY)
      });
    });
    return out;
  }

  function saveCart(items) {
    rawSet(KEYS.cart, JSON.stringify(items));
    notifyBadge();
    return true;
  }

  var cart = {
    maxQuantity: MAX_QTY,
    lineKey: lineKey,

    add: function (productId, size, colour, quantity) {
      var product = getProductById(productId);
      if (!product)          return { ok: false, error: "This product no longer exists." };
      if (!product.available) return { ok: false, error: "This product is currently unavailable." };

      var qty = Number(quantity);
      if (!isInt(qty) || qty < 1 || qty > MAX_QTY)
        return { ok: false, error: "Quantity must be a whole number from 1 to " + MAX_QTY + "." };

      size   = size   || "";
      colour = colour || "";

      if (product.sizes.length   && product.sizes.indexOf(size)     === -1)
        return { ok: false, error: "Please select a size." };
      if (product.colours.length && product.colours.indexOf(colour) === -1)
        return { ok: false, error: "Please select a colour." };

      var items = loadCart();
      var key   = lineKey(productId, size, colour);
      var note  = "";
      var found = null;
      items.forEach(function (it) {
        if (lineKey(it.productId, it.size, it.colour) === key) found = it;
      });
      if (found) {
        var total = found.quantity + qty;
        if (total > MAX_QTY) { found.quantity = MAX_QTY; note = "Maximum " + MAX_QTY + " per item."; }
        else found.quantity = total;
      } else {
        items.push({ productId: productId, size: size, colour: colour, quantity: qty });
      }
      saveCart(items);
      return { ok: true, note: note };
    },

    setQuantity: function (key, quantity) {
      var qty = Number(quantity);
      if (!isInt(qty) || qty < 1 || qty > MAX_QTY)
        return { ok: false, error: "Quantity must be a whole number from 1 to " + MAX_QTY + "." };
      var items   = loadCart();
      var changed = false;
      items.forEach(function (it) {
        if (lineKey(it.productId, it.size, it.colour) === key) { it.quantity = qty; changed = true; }
      });
      if (!changed) return { ok: false, error: "That item is not in your cart." };
      saveCart(items);
      return { ok: true };
    },

    remove: function (key) {
      var items = loadCart().filter(function (it) {
        return lineKey(it.productId, it.size, it.colour) !== key;
      });
      saveCart(items);
      return { ok: true };
    },

    clear: function () { rawRemove(KEYS.cart); notifyBadge(); return { ok: true }; },

    count: function () {
      return loadCart().reduce(function (s, it) { return s + it.quantity; }, 0);
    },

    details: function () {
      var items = loadCart();
      var byId  = {};
      loadProducts().forEach(function (p) { byId[p.id] = p; });
      var lines = [], kept = [], subtotal = 0, count = 0, removedCount = 0, problemCount = 0;

      items.forEach(function (it) {
        var p = byId[it.productId];
        if (!p) { removedCount++; return; }
        kept.push(it);
        var problem = "";
        if (!p.available) problem = "unavailable";
        else if (
          (p.sizes.length   && p.sizes.indexOf(it.size)     === -1) ||
          (p.colours.length && p.colours.indexOf(it.colour) === -1)
        ) problem = "options";
        var lineTotal = round2(p.price * it.quantity);
        if (problem) problemCount++; else subtotal += lineTotal;
        count += it.quantity;
        lines.push({
          key: lineKey(it.productId, it.size, it.colour),
          product: clone(p), size: it.size, colour: it.colour,
          quantity: it.quantity, unitPrice: p.price,
          lineTotal: lineTotal, problem: problem
        });
      });

      if (removedCount) saveCart(kept);
      return { lines: lines, subtotal: round2(subtotal), count: count,
               removedCount: removedCount, problemCount: problemCount };
    }
  };

  /* ---------- reset all ---------- */
  function resetAll() {
    _cache = null;
    seedFromSamples();
    rawRemove(KEYS.cart);
    notifyBadge();
    return { ok: true, errors: [] };
  }

  window.addEventListener("storage", function (e) {
    if (e.key === KEYS.products) _cache = null;
    notifyBadge();
  });

  VF.storage = {
    KEYS: KEYS, status: status,
    normalizeProduct: normalizeProduct,
    validateProduct: validateProduct,
    validateList: validateList,
    getProducts: getProducts,
    getProductById: getProductById,
    saveProducts: saveProducts,
    addProduct: addProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct,
    resetProducts: resetProducts,
    resetAll: resetAll,
    nextProductId: nextProductId,
    exportProductsJSON: exportProductsJSON,
    importProductsJSON: importProductsJSON,
    isAdminLoggedIn: isAdminLoggedIn,
    setAdminLoggedIn: setAdminLoggedIn
  };
  VF.cart = cart;
})();