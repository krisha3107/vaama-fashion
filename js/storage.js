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
    session:       PREFIX + "adminSession",
    users:         PREFIX + "users",
    userSession:   PREFIX + "userSession",
    orders:        PREFIX + "orders"
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

  /* ---------- user accounts & customer authentication ---------- */
  var DEFAULT_USERS = [
    {
      id: "usr_001",
      name: "Krisha Patel",
      email: "customer@vaamafashion.com",
      phone: "7600524729",
      city: "Adajan, Surat",
      password: "Password123!",
      createdAt: "2026-10-01T10:00:00.000Z",
      preferences: ["One-Piece", "Korean Pants"]
    }
  ];

  function loadUsers() {
    var raw = rawGet(KEYS.users);
    if (raw === null) {
      saveUsers(DEFAULT_USERS);
      return clone(DEFAULT_USERS);
    }
    var parsed = safeJSON(raw);
    if (!parsed.ok || !Array.isArray(parsed.value)) {
      saveUsers(DEFAULT_USERS);
      return clone(DEFAULT_USERS);
    }
    return parsed.value;
  }

  function saveUsers(users) {
    rawSet(KEYS.users, JSON.stringify(users));
    return true;
  }

  function getUsers() {
    return loadUsers().map(function (u) {
      var copy = clone(u);
      delete copy.password;
      return copy;
    });
  }

  function findUserByEmail(email) {
    if (!email || typeof email !== "string") return null;
    var norm = email.trim().toLowerCase();
    var users = loadUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email && users[i].email.trim().toLowerCase() === norm) {
        return users[i];
      }
    }
    return null;
  }

  function findUserByPhone(phone) {
    if (!phone || typeof phone !== "string") return null;
    var digits = String(phone).replace(/[\s+\-()]/g, "");
    if (digits.length > 10 && digits.indexOf("91") === 0) digits = digits.slice(2);
    var users = loadUsers();
    for (var i = 0; i < users.length; i++) {
      var uDigits = String(users[i].phone || "").replace(/[\s+\-()]/g, "");
      if (uDigits.length > 10 && uDigits.indexOf("91") === 0) uDigits = uDigits.slice(2);
      if (uDigits && uDigits === digits) return users[i];
    }
    return null;
  }

  function registerUser(userData) {
    var errs = [];
    if (!userData || typeof userData !== "object") {
      return { ok: false, errors: ["Missing user registration data."] };
    }

    var name = typeof userData.name === "string" ? userData.name.trim() : "";
    var email = typeof userData.email === "string" ? userData.email.trim().toLowerCase() : "";
    var phone = typeof userData.phone === "string" ? userData.phone.trim() : "";
    var city = typeof userData.city === "string" ? userData.city.trim() : "Surat";
    var password = typeof userData.password === "string" ? userData.password : "";
    var preferences = Array.isArray(userData.preferences) ? userData.preferences : [];

    if (!name || name.length < 2) {
      errs.push("Full name must be at least 2 characters.");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.push("Please enter a valid email address.");
    } else if (findUserByEmail(email)) {
      errs.push("An account with this email address already exists. Please sign in instead.");
    }

    var phoneDigits = phone.replace(/[\s+\-()]/g, "");
    if (phoneDigits.length > 10 && phoneDigits.indexOf("91") === 0) phoneDigits = phoneDigits.slice(2);
    if (!phoneDigits || !/^[6-9]\d{9}$/.test(phoneDigits)) {
      errs.push("Please enter a valid 10-digit Indian mobile number (e.g. 98765 43210).");
    }

    if (!password || password.length < 6) {
      errs.push("Password must be at least 6 characters long.");
    }

    if (errs.length > 0) return { ok: false, errors: errs };

    var newUser = {
      id: "usr_" + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36),
      name: name,
      email: email,
      phone: phoneDigits,
      city: city || "Surat",
      password: password,
      preferences: preferences,
      createdAt: new Date().toISOString()
    };

    var users = loadUsers();
    users.push(newUser);
    saveUsers(users);

    // Auto-login upon registration
    var safeUser = clone(newUser);
    delete safeUser.password;
    setCurrentUser(safeUser, true);

    return { ok: true, user: safeUser };
  }

  function authenticateUser(identifier, password) {
    if (!identifier || !password) {
      return { ok: false, error: "Please enter both identifier (email or phone) and password." };
    }
    var cleanId = identifier.trim();
    var user = null;
    if (cleanId.indexOf("@") !== -1) {
      user = findUserByEmail(cleanId);
    } else {
      user = findUserByPhone(cleanId) || findUserByEmail(cleanId);
    }

    if (!user) {
      return { ok: false, error: "No account found matching those details. Please check your spelling or create an account." };
    }
    if (user.password !== password) {
      return { ok: false, error: "Incorrect password. Please try again or use Forgot Password." };
    }

    var safeUser = clone(user);
    delete safeUser.password;
    return { ok: true, user: safeUser };
  }

  function getCurrentUser() {
    var raw = null;
    try {
      raw = window.sessionStorage.getItem(KEYS.userSession);
    } catch (e) {}
    if (!raw && persistent) {
      try {
        raw = window.localStorage.getItem(KEYS.userSession);
      } catch (e) {}
    }
    if (!raw && sessionMem.userSession) {
      raw = sessionMem.userSession;
    }
    if (!raw) return null;
    var parsed = safeJSON(raw);
    return parsed.ok ? parsed.value : null;
  }

  function setCurrentUser(user, remember) {
    if (!user) return clearCurrentUser();
    var safeUser = clone(user);
    delete safeUser.password;
    var str = JSON.stringify(safeUser);
    try {
      window.sessionStorage.setItem(KEYS.userSession, str);
    } catch (e) {
      sessionMem.userSession = str;
    }
    if (persistent && remember) {
      try {
        window.localStorage.setItem(KEYS.userSession, str);
      } catch (e) {}
    } else if (persistent && !remember) {
      try {
        window.localStorage.removeItem(KEYS.userSession);
      } catch (e) {}
    }
    if (VF.ui && typeof VF.ui.updateAuthHeader === "function") {
      VF.ui.updateAuthHeader();
    }
    return safeUser;
  }

  function clearCurrentUser() {
    try { window.sessionStorage.removeItem(KEYS.userSession); } catch (e) {}
    if (persistent) {
      try { window.localStorage.removeItem(KEYS.userSession); } catch (e) {}
    }
    delete sessionMem.userSession;
    if (VF.ui && typeof VF.ui.updateAuthHeader === "function") {
      VF.ui.updateAuthHeader();
    }
  }

  function updateUserProfile(userId, updates) {
    var users = loadUsers();
    var target = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === userId) {
        target = users[i];
        break;
      }
    }
    if (!target) return { ok: false, error: "User not found." };

    if (updates.name && typeof updates.name === "string" && updates.name.trim().length >= 2) {
      target.name = updates.name.trim();
    }
    if (updates.phone && typeof updates.phone === "string") {
      var d = updates.phone.replace(/[\s+\-()]/g, "");
      if (d.length > 10 && d.indexOf("91") === 0) d = d.slice(2);
      if (/^[6-9]\d{9}$/.test(d)) target.phone = d;
    }
    if (typeof updates.city === "string") {
      target.city = updates.city.trim();
    }
    if (Array.isArray(updates.preferences)) {
      target.preferences = updates.preferences;
    }

    saveUsers(users);

    var cur = getCurrentUser();
    if (cur && cur.id === userId) {
      var safe = clone(target);
      delete safe.password;
      setCurrentUser(safe, true);
      return { ok: true, user: safe };
    }
    var safeTarget = clone(target);
    delete safeTarget.password;
    return { ok: true, user: safeTarget };
  }

  function changePassword(userId, currentPassword, newPassword) {
    var users = loadUsers();
    var target = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === userId) {
        target = users[i];
        break;
      }
    }
    if (!target) return { ok: false, error: "User not found." };
    if (target.password !== currentPassword) return { ok: false, error: "Current password does not match." };
    if (!newPassword || newPassword.length < 6) return { ok: false, error: "New password must be at least 6 characters." };

    target.password = newPassword;
    saveUsers(users);
    return { ok: true };
  }

  function resetPasswordByEmail(email, newPassword) {
    if (!email || !newPassword || newPassword.length < 6) {
      return { ok: false, error: "New password must be at least 6 characters." };
    }
    var users = loadUsers();
    var norm = email.trim().toLowerCase();
    var target = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email && users[i].email.trim().toLowerCase() === norm) {
        target = users[i];
        break;
      }
    }
    if (!target) return { ok: false, error: "No account found with this email address." };
    target.password = newPassword;
    saveUsers(users);
    return { ok: true };
  }

  /* ---------- orders & direct checkout ---------- */
  function loadOrders() {
    var raw = rawGet(KEYS.orders);
    if (raw === null) return [];
    var parsed = safeJSON(raw);
    return (parsed.ok && Array.isArray(parsed.value)) ? parsed.value : [];
  }

  function saveOrders(orders) {
    rawSet(KEYS.orders, JSON.stringify(orders));
    return true;
  }

  function getOrders() {
    return clone(loadOrders());
  }

  function getOrderById(orderId) {
    if (!orderId) return null;
    var list = loadOrders();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === orderId) return clone(list[i]);
    }
    return null;
  }

  function getOrdersByUserId(userId) {
    if (!userId) return [];
    return loadOrders().filter(function (o) { return o.userId === userId; });
  }

  function createOrder(orderData) {
    if (!orderData || typeof orderData !== "object") {
      return { ok: false, error: "Missing order information." };
    }

    var customerName = (orderData.customerName || "").trim();
    var customerPhone = (orderData.customerPhone || "").trim();
    var customerEmail = (orderData.customerEmail || "").trim();
    var deliveryMethod = orderData.deliveryMethod === "pickup" ? "pickup" : "shipping";
    var address = (orderData.address || "").trim();
    var city = (orderData.city || "").trim();
    var pincode = (orderData.pincode || "").trim();
    var paymentMethod = (orderData.paymentMethod || "cod").trim();
    var notes = (orderData.notes || "").trim();

    if (!customerName || customerName.length < 2) {
      return { ok: false, error: "Please enter a valid full name (minimum 2 characters)." };
    }

    var phoneDigits = customerPhone.replace(/[\s+\-()]/g, "");
    if (phoneDigits.length > 10 && phoneDigits.indexOf("91") === 0) phoneDigits = phoneDigits.slice(2);
    if (!phoneDigits || !/^[6-9]\d{9}$/.test(phoneDigits)) {
      return { ok: false, error: "Please enter a valid 10-digit Indian mobile number." };
    }

    if (deliveryMethod === "shipping") {
      if (!address || address.length < 5) {
        return { ok: false, error: "Please enter a complete delivery street address." };
      }
      if (!city) {
        return { ok: false, error: "Please enter your city." };
      }
    }

    var cartDetails = cart.details();
    if (!cartDetails.lines.length) {
      return { ok: false, error: "Your cart is currently empty." };
    }

    var validLines = cartDetails.lines.filter(function (l) { return !l.problem; });
    if (!validLines.length) {
      return { ok: false, error: "All items in your cart are currently unavailable." };
    }

    var orderNumber = "VF-ORD-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900);
    var currentUser = getCurrentUser();

    var order = {
      id: orderNumber,
      orderNumber: orderNumber,
      userId: currentUser ? currentUser.id : null,
      customerName: customerName,
      customerPhone: phoneDigits,
      customerEmail: customerEmail || (currentUser ? currentUser.email : ""),
      deliveryMethod: deliveryMethod,
      shippingAddress: {
        address: deliveryMethod === "shipping" ? address : "In-store pickup: 12 No., Western City, Adajan, Surat",
        city: deliveryMethod === "shipping" ? (city || "Surat") : "Surat",
        pincode: pincode || ""
      },
      paymentMethod: paymentMethod, // 'cod', 'upi', 'card'
      paymentStatus: paymentMethod === "cod" ? "Pending on Delivery" : "Paid (Demo)",
      orderStatus: "Confirmed",
      items: validLines.map(function (it) {
        return {
          productId: it.product.id,
          name: it.product.name,
          size: it.size,
          colour: it.colour,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          lineTotal: it.lineTotal,
          image: it.product.image || ""
        };
      }),
      subtotal: cartDetails.subtotal,
      shippingFee: deliveryMethod === "pickup" ? 0 : (cartDetails.subtotal >= 1999 ? 0 : 99),
      total: cartDetails.subtotal + (deliveryMethod === "pickup" ? 0 : (cartDetails.subtotal >= 1999 ? 0 : 99)),
      notes: notes,
      createdAt: new Date().toISOString()
    };

    var allOrders = loadOrders();
    allOrders.unshift(order);
    saveOrders(allOrders);

    // Clear cart after checkout
    cart.clear();

    return { ok: true, order: clone(order) };
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
    setAdminLoggedIn: setAdminLoggedIn,
    getUsers: getUsers,
    findUserByEmail: findUserByEmail,
    findUserByPhone: findUserByPhone,
    registerUser: registerUser,
    authenticateUser: authenticateUser,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    clearCurrentUser: clearCurrentUser,
    updateUserProfile: updateUserProfile,
    changePassword: changePassword,
    resetPasswordByEmail: resetPasswordByEmail,
    getOrders: getOrders,
    getOrderById: getOrderById,
    getOrdersByUserId: getOrdersByUserId,
    createOrder: createOrder
  };
  VF.auth = {
    getUsers: getUsers,
    getCurrentUser: getCurrentUser,
    register: registerUser,
    login: authenticateUser,
    setCurrentUser: setCurrentUser,
    logout: clearCurrentUser,
    updateProfile: updateUserProfile,
    changePassword: changePassword,
    resetPassword: resetPasswordByEmail
  };
  VF.cart = cart;
})();