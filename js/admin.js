/* =====================================================================
   VAAMA FASHION — js/admin.js
   ===================================================================== */
(function () {
  "use strict";
  var VF  = window.VF;
  var esc = VF.util.escapeHtml;
  var fmt = VF.util.formatPrice;

  /* ---- closest() polyfill for old Edge on file:// ---- */
  function closest(el, selector) {
    if (!el) return null;
    if (el.closest) return el.closest(selector);
    // Manual walk
    var current = el;
    while (current && current !== document) {
      if (current.matches && current.matches(selector)) return current;
      if (current.msMatchesSelector && current.msMatchesSelector(selector)) return current;
      current = current.parentElement;
    }
    return null;
  }

  /* ---- router ---- */
  function showPanel(id) {
    var panels = document.querySelectorAll(".admin-panel");
    for (var i = 0; i < panels.length; i++) panels[i].classList.remove("is-active");
    var navLinks = document.querySelectorAll(".sidebar-nav a");
    for (var j = 0; j < navLinks.length; j++) {
      navLinks[j].classList.toggle("is-active", navLinks[j].getAttribute("data-panel") === id);
    }
    var panel = document.getElementById("panel-" + id);
    if (panel) panel.classList.add("is-active");
    var titles = { dashboard: "Dashboard", products: "Products", add: "Add product", data: "Data tools" };
    var h1 = document.getElementById("admin-title");
    if (h1) h1.textContent = titles[id] || id;
  }

  /* ---- login ---- */
  function initLogin() {
    var form  = document.getElementById("login-form");
    var errEl = document.getElementById("login-error");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var u = (document.getElementById("login-user").value || "").trim();
      var p = document.getElementById("login-pass").value || "";
      if (u === VF.CONFIG.admin.username && p === VF.CONFIG.admin.password) {
        VF.storage.setAdminLoggedIn(true);
        document.getElementById("login-screen").hidden = true;
        document.getElementById("admin-screen").hidden = false;
        initAdminApp();
      } else {
        if (errEl) errEl.textContent = "Incorrect username or password.";
        document.getElementById("login-pass").value = "";
      }
    });
  }

  /* ---- modal ---- */
  function confirmModal(title, body, onYes) {
    var old = document.getElementById("admin-modal");
    if (old) old.remove();
    var m = document.createElement("div");
    m.id = "admin-modal";
    m.className = "modal-backdrop";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.innerHTML =
      '<div class="modal"><h2>' + esc(title) + "</h2><p>" + esc(body) + "</p>" +
      '<div class="modal-actions">' +
      '<button class="btn btn--danger" id="modal-yes" type="button">Confirm</button>' +
      '<button class="btn btn--outline" id="modal-no" type="button">Cancel</button>' +
      "</div></div>";
    document.body.appendChild(m);
    function close() { if (m.parentNode) m.parentNode.removeChild(m); }
    document.getElementById("modal-yes").addEventListener("click", function () { close(); onYes(); });
    document.getElementById("modal-no").addEventListener("click", close);
    m.addEventListener("click", function (e) { if (e.target === m) close(); });
    document.getElementById("modal-yes").focus();
  }

  /* ---- dashboard ---- */
  function renderDashboard() {
    var products = VF.storage.getProducts();
    var avail    = products.filter(function (p) { return p.available; }).length;
    var featured = products.filter(function (p) { return p.featured; }).length;
    var sale     = products.filter(VF.catalog.isOnSale).length;
    var newArr   = products.filter(function (p) { return p.newArrival; }).length;

    var grid = document.getElementById("stat-grid");
    if (grid) {
      function sc(n, label) {
        return '<div class="stat-card"><div class="stat-card__num">' + n +
          '</div><div class="stat-card__label">' + label + "</div></div>";
      }
      grid.innerHTML =
        sc(products.length,              "Total products") +
        sc(avail,                        "Available") +
        sc(products.length - avail,      "Unavailable") +
        sc(featured,                     "Featured") +
        sc(sale,                         "On sale") +
        sc(newArr,                       "New arrivals") +
        sc(VF.CATEGORIES.length,         "Categories");
    }

    var waOk = document.getElementById("dash-wa-ok");
    var waNo = document.getElementById("dash-wa-no");
    if (waOk) waOk.hidden = !VF.whatsapp.isConfigured();
    if (waNo) waNo.hidden =  VF.whatsapp.isConfigured();

    var storageEl = document.getElementById("dash-storage");
    if (storageEl) {
      storageEl.textContent = VF.storage.status.persistent
        ? "localStorage available — changes are saved in this browser"
        : "localStorage UNAVAILABLE — changes will not persist between pages";
    }
  }

  /* ---- products table ---- */
  var tableFilterText = "";

  function renderTable() {
    // Force a fresh read from storage every time the table is rendered.
    var products = VF.storage.getProducts();
    var q = tableFilterText.toLowerCase().trim();
    var list = q ? products.filter(function (p) {
      return p.name.toLowerCase().indexOf(q) !== -1 ||
             p.id.toLowerCase().indexOf(q)   !== -1 ||
             p.category.toLowerCase().indexOf(q) !== -1;
    }) : products;

    var countEl = document.getElementById("table-count");
    if (countEl) countEl.textContent = list.length + " of " + products.length + " products";

    var tbody = document.getElementById("product-tbody");
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" style="text-align:center;padding:1.5rem;color:var(--ink-soft)">' +
        (q ? "No products match your search."
           : "No products yet. Click <strong>Add product</strong> to get started.") +
        "</td></tr>";
      return;
    }

    var rows = [];
    for (var i = 0; i < list.length; i++) {
      var p   = list[i];
      var cat = VF.getCategory(p.category);
      var flags = [];
      if (p.featured)           flags.push("Featured");
      if (p.newArrival)         flags.push("New");
      if (VF.catalog.isOnSale(p)) flags.push("Sale");

      rows.push(
        "<tr>" +
        '<td class="td-id">'    + esc(p.id)   + "</td>" +
        "<td>"                  + esc(p.name)  + "</td>" +
        "<td>"                  + esc(cat ? cat.name : p.category) + "</td>" +
        '<td class="td-price">' + fmt(p.price) + "</td>" +
        "<td>" + (p.available
          ? '<span class="badge-avail">Available</span>'
          : '<span class="badge-unavail">Unavailable</span>') + "</td>" +
        "<td>" + (flags.length ? flags.join(", ") : "—") + "</td>" +
        '<td style="max-width:160px;word-break:break-all;font-size:.8rem;color:var(--ink-soft)">' +
          esc(p.image || "—") + "</td>" +
        '<td class="td-actions">' +
          '<button type="button" class="btn btn--outline btn--small" ' +
            'data-action="edit" data-id="' + esc(p.id) + '">Edit</button> ' +
          '<button type="button" class="btn btn--danger btn--small" ' +
            'data-action="delete" data-id="' + esc(p.id) + '">Delete</button>' +
        "</td></tr>"
      );
    }
    tbody.innerHTML = rows.join("");
  }

  /* ---- product form ---- */
  function buildForm(panel, product, onSave, onCancel) {
    var isEdit = !!product;
    var p = product || {
      id: VF.storage.nextProductId(),
      name: "", category: VF.CATEGORIES[0].id,
      price: "", originalPrice: null, description: "",
      image: "", available: true, sizes: [], colours: [],
      featured: false, newArrival: false, label: "", isSample: false
    };

    var catOptions = VF.CATEGORIES.map(function (c) {
      return '<option value="' + esc(c.id) + '"' +
        (p.category === c.id ? " selected" : "") + ">" + esc(c.name) + "</option>";
    }).join("");

    var stdSizes = ["XS","S","M","L","XL","XXL","28","30","32","34","36","38"];
    var sizeChecks = stdSizes.map(function (v) {
      return '<label class="check-row"><input type="checkbox" name="sz" value="' + esc(v) + '"' +
        (p.sizes.indexOf(v) !== -1 ? " checked" : "") + "> " + esc(v) + "</label>";
    }).join("");
    var extraSizes = p.sizes.filter(function (s) { return stdSizes.indexOf(s) === -1; }).join(", ");

    panel.innerHTML =
      '<div class="product-form">' +
      '<h2>' + (isEdit ? "Edit: " + esc(p.name) : "Add new product") + "</h2>" +
      '<div id="form-errors" class="form-errors" hidden></div>' +

      '<div class="form-grid-2">' +
      '<div class="field"><label for="f-id">Product ID' +
        (isEdit ? " (cannot be changed)" : " (auto-generated)") + '</label>' +
        '<input type="text" id="f-id" value="' + esc(p.id) + '"' +
        (isEdit ? " readonly" : "") + ' maxlength="40"></div>' +
      '<div class="field"><label for="f-name">Name *</label>' +
        '<input type="text" id="f-name" value="' + esc(p.name) + '" maxlength="120"></div>' +
      "</div>" +

      '<div class="field"><label for="f-cat">Category *</label>' +
        '<select id="f-cat">' + catOptions + "</select></div>" +

      '<div class="form-grid-2">' +
      '<div class="field"><label for="f-price">Price (₹) *</label>' +
        '<input type="number" id="f-price" value="' + (p.price || "") + '" min="1" step="1"></div>' +
      '<div class="field"><label for="f-orig">Original / compare-at price (₹)<br>' +
        '<small style="font-weight:400;color:var(--ink-soft)">Leave blank if no discount</small></label>' +
        '<input type="number" id="f-orig" value="' +
        (p.originalPrice != null ? p.originalPrice : "") + '" min="0" step="1"></div>' +
      "</div>" +

      '<div class="field"><label for="f-desc">Description *</label>' +
        '<textarea id="f-desc" maxlength="1000">' + esc(p.description) + "</textarea></div>" +

      '<div class="field">' +
        '<label for="f-image">Image path' +
        '<small style="display:block;font-weight:400;color:var(--ink-soft);margin-top:.2rem">' +
        'Path relative to website folder, e.g. <code>assets/images/products/VF-001.jpg</code><br>' +
        'Place the photo file there first. Leave blank for a colour placeholder.</small></label>' +
        '<input type="text" id="f-image" value="' + esc(p.image || "") + '" maxlength="300" ' +
        'placeholder="assets/images/products/' + esc(p.id) + '.jpg">' +
        (p.image ? '<p style="margin-top:.35rem;font-size:.84rem;color:var(--sage)">Current: <code>' +
          esc(p.image) + "</code></p>" : "") +
      "</div>" +

      '<div class="field"><label for="f-label">Badge label ' +
        '<small style="font-weight:400;color:var(--ink-soft)">(e.g. Sale, Festive — max 30 chars)</small></label>' +
        '<input type="text" id="f-label" value="' + esc(p.label || "") + '" maxlength="30"></div>' +

      '<p class="form-section-head">Sizes</p>' +
      '<div class="checks-inline">' + sizeChecks + "</div>" +
      '<div class="field" style="margin-top:.75rem">' +
        '<label for="f-sizes-extra">Additional sizes (comma-separated, e.g. Free Size, 40)</label>' +
        '<input type="text" id="f-sizes-extra" value="' + esc(extraSizes) + '" maxlength="200"></div>' +

      '<p class="form-section-head">Colours</p>' +
      '<div class="field"><label for="f-colours">Colours (comma-separated)</label>' +
        '<input type="text" id="f-colours" value="' + esc(p.colours.join(", ")) + '" maxlength="300"></div>' +

      '<p class="form-section-head">Status &amp; flags</p>' +
      '<div class="checks-inline">' +
        '<label class="check-row"><input type="checkbox" id="f-avail"' +
          (p.available  ? " checked" : "") + "> Available for purchase</label>" +
        '<label class="check-row"><input type="checkbox" id="f-feat"' +
          (p.featured   ? " checked" : "") + "> Featured on home page</label>" +
        '<label class="check-row"><input type="checkbox" id="f-new"' +
          (p.newArrival ? " checked" : "") + "> New arrival</label>" +
      "</div>" +

      '<div class="form-actions">' +
        '<button type="button" class="btn btn--primary" id="f-save">' +
          (isEdit ? "Save changes" : "Add product") + "</button>" +
        '<button type="button" class="btn btn--outline" id="f-cancel">Cancel</button>' +
      "</div></div>";

    /* read + validate + save */
    function csv(v) { return v.split(",").map(function (x) { return x.trim(); }).filter(Boolean); }

    function readForm() {
      var szBoxes = panel.querySelectorAll('input[name="sz"]:checked');
      var checked = [];
      for (var i = 0; i < szBoxes.length; i++) checked.push(szBoxes[i].value);
      var extra   = csv(document.getElementById("f-sizes-extra").value);
      var allSz   = checked.concat(extra.filter(function (s) { return checked.indexOf(s) === -1; }));
      var origVal = (document.getElementById("f-orig").value || "").trim();
      return {
        id:            (document.getElementById("f-id").value    || "").trim(),
        name:          (document.getElementById("f-name").value  || "").trim(),
        category:       document.getElementById("f-cat").value,
        price:          parseFloat(document.getElementById("f-price").value) || 0,
        originalPrice:  origVal === "" ? null : (parseFloat(origVal) || null),
        description:   (document.getElementById("f-desc").value  || "").trim(),
        image:         (document.getElementById("f-image").value || "").trim(),
        label:         (document.getElementById("f-label").value || "").trim(),
        sizes:          allSz,
        colours:        csv(document.getElementById("f-colours").value),
        available:      document.getElementById("f-avail").checked,
        featured:       document.getElementById("f-feat").checked,
        newArrival:     document.getElementById("f-new").checked,
        isSample:       false
      };
    }

    function showErrors(errs) {
      var el = document.getElementById("form-errors");
      if (!el) return;
      if (!errs || !errs.length) { el.hidden = true; el.innerHTML = ""; return; }
      el.hidden = false;
      el.innerHTML = "<strong>Please fix the following:</strong><ul>" +
        errs.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul>";
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    document.getElementById("f-save").addEventListener("click", function () {
      var data       = readForm();
      var normalized = VF.storage.normalizeProduct(data);
      var errors     = VF.storage.validateProduct(normalized);
      if (errors.length) { showErrors(errors); return; }

      if (!isEdit) {
        var all = VF.storage.getProducts();
        for (var k = 0; k < all.length; k++) {
          if (all[k].id === normalized.id) {
            showErrors(["Product ID " + normalized.id + " already exists. Use a different ID."]);
            return;
          }
        }
      }

      var result = isEdit
        ? VF.storage.updateProduct(p.id, normalized)
        : VF.storage.addProduct(normalized);

      if (!result.ok) { showErrors(result.errors); return; }
      VF.ui.toast((isEdit ? "Saved: " : "Added: ") + normalized.name, "success");
      onSave();
    });

    document.getElementById("f-cancel").addEventListener("click", onCancel);
  }

  /* ---- data tools ---- */
  function renderDataTools() {
    var el = document.getElementById("export-output");
    if (el) el.value = VF.storage.exportProductsJSON();
  }

  /* ---- main admin app (runs after login) ---- */
  function initAdminApp() {

    function goProducts() {
      showPanel("products");
      tableFilterText = "";
      var ts = document.getElementById("table-search");
      if (ts) ts.value = "";
      renderTable();
    }

    function goAdd() {
      showPanel("add");
      buildForm(
        document.getElementById("panel-add"),
        null,
        function () { goProducts(); renderDashboard(); },
        function () { goProducts(); }
      );
    }

    /* sidebar nav */
    var navLinks = document.querySelectorAll(".sidebar-nav a[data-panel]");
    for (var i = 0; i < navLinks.length; i++) {
      (function (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          var id = link.getAttribute("data-panel");
          if (id === "dashboard") { showPanel("dashboard"); renderDashboard(); }
          else if (id === "products") { goProducts(); }
          else if (id === "add")      { goAdd(); }
          else if (id === "data")     { showPanel("data"); renderDataTools(); }
        });
      })(navLinks[i]);
    }

    /* logout */
    var logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", function () {
      VF.storage.setAdminLoggedIn(false);
      document.getElementById("admin-screen").hidden = true;
      document.getElementById("login-screen").hidden = false;
      document.getElementById("login-pass").value = "";
    });

    /* table search */
    var tableSearch = document.getElementById("table-search");
    if (tableSearch) {
      tableSearch.addEventListener("input", function () {
        tableFilterText = tableSearch.value;
        renderTable();
      });
    }

    /* table row actions — manual parent-walk instead of closest() */
    var tbody = document.getElementById("product-tbody");
    if (tbody) {
      tbody.addEventListener("click", function (e) {
        /* Walk up from click target to find a button with data-action */
        var btn = null;
        var node = e.target;
        while (node && node !== tbody) {
          if (node.tagName === "BUTTON" && node.getAttribute("data-action")) { btn = node; break; }
          node = node.parentElement;
        }
        if (!btn) return;

        var action = btn.getAttribute("data-action");
        var id     = btn.getAttribute("data-id");
        if (!id) return;

        if (action === "edit") {
          var product = VF.storage.getProductById(id);
          if (!product) { VF.ui.toast("Product not found.", "error"); return; }
          showPanel("add");
          buildForm(
            document.getElementById("panel-add"),
            product,
            function () { goProducts(); renderDashboard(); },
            function () { goProducts(); }
          );
        }

        if (action === "delete") {
          var dp = VF.storage.getProductById(id);
          if (!dp) { VF.ui.toast("Product not found.", "error"); return; }
          confirmModal(
            "Delete product",
            'Delete "' + dp.name + '" (' + dp.id + ')? This cannot be undone.',
            function () {
              var r = VF.storage.deleteProduct(id);
              if (r.ok) { VF.ui.toast("Deleted: " + dp.name, "success"); goProducts(); renderDashboard(); }
              else VF.ui.toast(r.errors.join("; "), "error");
            }
          );
        }
      });
    }

    /* dashboard quick-action buttons */
    var addBtn = document.getElementById("add-product-btn");
    if (addBtn) addBtn.addEventListener("click", goAdd);

    /* data tools */
    var refreshBtn = document.getElementById("refresh-export");
    if (refreshBtn) refreshBtn.addEventListener("click", function () {
      var el = document.getElementById("export-output");
      if (el) { el.value = VF.storage.exportProductsJSON(); VF.ui.toast("Export refreshed.", "success"); }
    });

    var copyBtn = document.getElementById("copy-export");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var el = document.getElementById("export-output");
      if (!el) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(el.value)
          .then(function () { VF.ui.toast("Copied to clipboard.", "success"); })
          .catch(function ()  { fallbackCopy(el); });
      } else { fallbackCopy(el); }
      function fallbackCopy(textarea) {
        textarea.select();
        try { document.execCommand("copy"); VF.ui.toast("Copied.", "success"); }
        catch (err) { VF.ui.toast("Copy failed — select the text and copy manually.", "error"); }
      }
    });

    var importBtn = document.getElementById("import-btn");
    if (importBtn) importBtn.addEventListener("click", function () {
      var inputEl = document.getElementById("import-input");
      var text = inputEl ? (inputEl.value || "").trim() : "";
      if (!text) { VF.ui.toast("Paste JSON into the import box first.", "error"); return; }
      confirmModal(
        "Import products",
        "This will REPLACE all current products with the imported data. Are you sure?",
        function () {
          var r = VF.storage.importProductsJSON(text);
          if (r.ok) {
            VF.ui.toast("Import successful — " + VF.storage.getProducts().length + " products loaded.", "success");
            goProducts(); renderDashboard();
          } else {
            VF.ui.toast("Import failed: " + r.errors.join("; "), "error");
          }
        }
      );
    });

    var resetBtn = document.getElementById("reset-btn");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      confirmModal(
        "Reset to sample products",
        "This will delete all your changes and restore the original 24 sample products. Are you sure?",
        function () {
          VF.storage.resetProducts();
          VF.ui.toast("Reset complete — 24 sample products restored.", "success");
          goProducts(); renderDashboard();
          var exportEl = document.getElementById("export-output");
          if (exportEl) exportEl.value = VF.storage.exportProductsJSON();
        }
      );
    });

    /* Start on dashboard, then immediately show products if that panel is default */
    showPanel("dashboard");
    renderDashboard();
  }

  /* ---- entry point ---- */
  VF.onReady(function () {
    initLogin();
    if (VF.storage.isAdminLoggedIn()) {
      var ls = document.getElementById("login-screen");
      var as = document.getElementById("admin-screen");
      if (ls) ls.hidden = true;
      if (as) as.hidden = false;
      initAdminApp();
    }
  });
})();