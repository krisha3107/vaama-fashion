/* =====================================================================
   VAAMA FASHION — js/config.js
   Business configuration. Edit this file to update contact details.
   ===================================================================== */
window.VF = window.VF || {};

VF.CONFIG = {
  business: {
    name: "VAAMA FASHION",
    shortDescription: "Clothing and fashion store in Adajan, Surat.",
    address: "12 No., Western City, opposite CNG Pump, LP Savani Road, Adajan, Surat, Gujarat, India",
    addressNeedsVerification: false,

    phone: "+91 76005 24729",
    openingHours: "9:00 AM onwards",
    email: "vaamafashion28@gmail.com",

    social: {
      instagram: "https://www.instagram.com/_vaama_fashion_/",
      facebook: ""
    },

    // Digits only, country code first. 91 = India code, then 10-digit number.
    whatsappNumber: "917600524729"
  },

  policies: {
    approvedByClient: false,
    deliveryPickup: "Delivery and pickup arrangements are subject to confirmation with the shop. Please contact us on WhatsApp for details.",
    returns: "Return and exchange terms are subject to confirmation with the shop. Please contact us before purchase."
  },

  // Demo admin only — not real security.
  admin: {
    username: "admin",
    password: "demo1234"
  },

  shop: {
    currencySymbol: "₹",
    currencyLocale: "en-IN",
    maxQuantityPerItem: 10
  },

  storage: {
    keyPrefix: "vaama.v1."
  }
};