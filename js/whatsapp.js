/* =====================================================================
   VAAMA FASHION — js/whatsapp.js
   Builds WhatsApp links. The number comes ONLY from js/config.js.
   Opening WhatsApp just starts a chat: it does NOT place an order.
   Load after common.js.
   ===================================================================== */
(function () {
  "use strict";
  var VF = window.VF;
  var esc = VF.util.escapeHtml;

  var ICON = '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.6-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>';

  function isConfigured() { return VF.util.whatsappNumber() !== null; }

  // Returns a wa.me link with the message safely URL-encoded, or null if no number is set.
  function buildUrl(text) {
    var n = VF.util.whatsappNumber();
    return n ? "https://wa.me/" + n + "?text=" + encodeURIComponent(text) : null;
  }

  function helpHtml() {
    return '<p class="wa-help"><strong>WhatsApp is not set up yet.</strong> The shop\'s verified WhatsApp number has not been added. ' +
      '<span>(Site owner: enter it in <code>js/config.js</code> under <code>whatsappNumber</code>.)</span></p>';
  }

  // Returns a green WhatsApp button (a link when configured; a disabled button + help text when not).
  function buttonHtml(message, label, extraClass) {
    var cls = "btn btn--whatsapp" + (extraClass ? " " + extraClass : "");
    var url = buildUrl(message);
    if (url) {
      return '<a class="' + cls + '" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' +
        ICON + esc(label) + '<span class="sr-only"> (opens WhatsApp in a new tab)</span></a>';
    }
    return '<button type="button" class="' + cls + '" disabled>' + ICON + esc(label) + "</button>" + helpHtml();
  }

  VF.whatsapp = {
    isConfigured: isConfigured,
    buildUrl: buildUrl,
    helpHtml: helpHtml,
    buttonHtml: buttonHtml
  };
})();