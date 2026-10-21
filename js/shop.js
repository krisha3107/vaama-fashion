/* =====================================================================
   VAAMA FASHION — js/shop.js
   ===================================================================== */
(function () {
  "use strict";
  var VF = window.VF;

  var TAGS  = ["all", "new", "sale", "featured"];
  var SORTS = ["default", "price-asc", "price-desc", "name-asc", "name-desc"];
  var TAG_LABELS = { "new": "New arrivals", sale: "On sale", featured: "Featured" };

  VF.onReady(function () {
    var esc = VF.util.escapeHtml;
    var all = VF.storage.getProducts();

    var els = {
      main:    document.getElementById("main"),
      search:  document.getElementById("search-input"),
      cats:    document.getElementById("category-options"),
      avail:   document.getElementById("avail-only"),
      sort:    document.getElementById("sort-select"),
      grid:    document.getElementById("product-grid"),
      empty:   document.getElementById("empty-state"),
      count:   document.getElementById("result-count"),
      summary: document.getElementById("filter-summary"),
      clear:   document.getElementById("clear-filters"),
      toggle:  document.getElementById("filter-toggle"),
      panel:   document.getElementById("filter-panel")
    };
    if (!els.grid || !els.search) return;

    /* Build category radios */
    var catOptions = [{ id: "all", name: "All categories" }].concat(VF.CATEGORIES);
    els.cats.innerHTML = catOptions.map(function (c) {
      return '<label class="check"><input type="radio" name="category" value="' +
        esc(c.id) + '" data-filter> <span>' + esc(c.name) + "</span></label>";
    }).join("");

    /* Read URL params safely */
    function readParams() {
      var cat  = VF.util.getParam("category");
      var tag  = VF.util.getParam("tag");
      var sort = VF.util.getParam("sort");
      var q    = VF.util.getParam("q");
      return {
        q:        q ? String(q).slice(0, 100) : "",
        category: (cat && VF.getCategory(cat)) ? cat : "all",
        tag:      (TAGS.indexOf(tag) !== -1) ? tag : "all",
        avail:    VF.util.getParam("avail") === "1",
        sort:     (SORTS.indexOf(sort) !== -1) ? sort : "default"
      };
    }

    var state = readParams();

    function defaults() {
      return { q: "", category: "all", tag: "all", avail: false, sort: "default" };
    }

    function readControls() {
      state.q   = els.search.value;
      state.avail = els.avail.checked;
      state.sort  = els.sort.value;
      var catEl = document.querySelector('input[name="category"]:checked');
      state.category = catEl ? catEl.value : "all";
      var tagEl = document.querySelector('input[name="tag"]:checked');
      state.tag = tagEl ? tagEl.value : "all";
    }

    function writeControls() {
      els.search.value  = state.q;
      els.avail.checked = state.avail;
      els.sort.value    = state.sort;

      /* set category radio */
      var catRadios = document.querySelectorAll('input[name="category"]');
      for (var i = 0; i < catRadios.length; i++) {
        catRadios[i].checked = (catRadios[i].value === state.category);
      }
      /* set tag radio */
      var tagRadios = document.querySelectorAll('input[name="tag"]');
      for (var j = 0; j < tagRadios.length; j++) {
        tagRadios[j].checked = (tagRadios[j].value === state.tag);
      }
    }

    function activeParts() {
      var parts = [];
      if (state.q.trim()) parts.push('Search: "' + state.q.trim() + '"');
      if (state.category !== "all") {
        var c = VF.getCategory(state.category);
        if (c) parts.push(c.name);
      }
      if (state.tag !== "all") parts.push(TAG_LABELS[state.tag] || state.tag);
      if (state.avail) parts.push("Available only");
      return parts;
    }

    function updateUrl() {
      var p = [];
      if (state.q.trim())           p.push("q=" + encodeURIComponent(state.q.trim()));
      if (state.category !== "all") p.push("category=" + encodeURIComponent(state.category));
      if (state.tag !== "all")      p.push("tag=" + state.tag);
      if (state.avail)              p.push("avail=1");
      if (state.sort !== "default") p.push("sort=" + state.sort);
      try {
        window.history.replaceState(null, "",
          window.location.pathname + (p.length ? "?" + p.join("&") : ""));
      } catch (e) { /* ignore on file:// */ }
    }

    function render() {
      var list   = VF.catalog.sortProducts(VF.catalog.filterProducts(all, state), state.sort);
      var parts  = activeParts();
      var isDefault = (parts.length === 0 && state.sort === "default");

      els.count.textContent = "Showing " + list.length + " of " + all.length +
        (all.length === 1 ? " product" : " products");
      els.summary.textContent = parts.length ? "Filters: " + parts.join(" · ") : "";
      els.clear.disabled = isDefault;
      els.toggle.textContent = "Filters" + (parts.length ? " (" + parts.length + ")" : "");

      if (list.length === 0) {
        els.grid.hidden  = true;
        els.grid.innerHTML = "";
        els.empty.hidden = false;
        els.empty.innerHTML = all.length === 0
          ? "<h2>No products yet</h2><p>Products can be added from the admin panel.</p>"
          : '<h2>No products found</h2><p>Try a different search term or clear the filters.</p>' +
            '<button type="button" class="btn btn--dark" style="margin-top:.75rem" ' +
            'data-action="clear-filters">Clear all filters</button>';
      } else {
        els.empty.hidden = true;
        els.empty.innerHTML = "";
        els.grid.hidden  = false;
        els.grid.innerHTML = list.map(VF.ui.productCardHtml).join("");
      }
      updateUrl();
    }

    /* events */
    els.main.addEventListener("input", function (e) {
      if (e.target && e.target.hasAttribute("data-filter")) { readControls(); render(); }
    });
    els.main.addEventListener("change", function (e) {
      if (e.target && e.target.hasAttribute("data-filter")) { readControls(); render(); }
    });
    els.main.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-action='clear-filters']") : null;
      if (!btn) return;
      state = defaults();
      writeControls();
      render();
      els.search.focus();
    });

    if (els.toggle) {
      els.toggle.addEventListener("click", function () {
        var open = !els.panel.classList.contains("is-open");
        els.panel.classList.toggle("is-open", open);
        els.toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    els.search.addEventListener("keydown", function (e) { if (e.key === "Enter") e.preventDefault(); });

    /* initialise controls from URL then render */
    writeControls();
    render();
  });
})();