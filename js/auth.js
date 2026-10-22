/* =====================================================================
   VAAMA FASHION — js/auth.js
   Customer Registration, Login, Forgot Password & Account Dashboard.
   Vanilla JS only, localStorage backed.
   ===================================================================== */
(function () {
  "use strict";
  var VF = window.VF;

  VF.onReady(function () {
    var esc = VF.util.escapeHtml;
    var auth = VF.auth;
    var storage = VF.storage;

    /* ---------- DOM elements ---------- */
    var authSection      = document.getElementById("auth-card-section");
    var dashSection      = document.getElementById("dashboard-card-section");
    var tabLoginBtn      = document.getElementById("tab-btn-login");
    var tabRegisterBtn   = document.getElementById("tab-btn-register");
    var loginPane        = document.getElementById("auth-pane-login");
    var registerPane     = document.getElementById("auth-pane-register");
    var forgotPane       = document.getElementById("auth-pane-forgot");

    /* Forms */
    var loginForm        = document.getElementById("customer-login-form");
    var registerForm     = document.getElementById("customer-register-form");
    var forgotForm       = document.getElementById("customer-forgot-form");
    var profileEditForm  = document.getElementById("profile-edit-form");
    var passwordChangeForm = document.getElementById("password-change-form");

    /* Alerts */
    var loginAlert       = document.getElementById("login-alert");
    var registerAlert    = document.getElementById("register-alert");
    var forgotAlert      = document.getElementById("forgot-alert");
    var profileAlert     = document.getElementById("profile-alert");
    var securityAlert    = document.getElementById("security-alert");

    /* Quick Fill */
    var btnFillDemo      = document.getElementById("btn-fill-demo");

    /* Dashboard items */
    var userInitialsEl   = document.getElementById("dash-user-initials");
    var userNameEl       = document.getElementById("dash-user-name");
    var userEmailEl      = document.getElementById("dash-user-email");
    var logoutBtn        = document.getElementById("btn-logout");

    if (!authSection || !dashSection) return;

    /* ---------- state & navigation ---------- */
    var redirectTarget = VF.util.getParam("redirect") || "";

    function showAlert(el, msg, type) {
      if (!el) return;
      el.className = "auth-alert is-visible auth-alert--" + (type || "error");
      el.textContent = msg;
    }
    function hideAlert(el) {
      if (!el) return;
      el.className = "auth-alert";
      el.textContent = "";
    }

    function switchAuthTab(tab) {
      hideAlert(loginAlert);
      hideAlert(registerAlert);
      hideAlert(forgotAlert);

      if (tab === "register") {
        if (tabLoginBtn) tabLoginBtn.classList.remove("is-active");
        if (tabRegisterBtn) tabRegisterBtn.classList.add("is-active");
        if (loginPane) loginPane.hidden = true;
        if (forgotPane) forgotPane.hidden = true;
        if (registerPane) registerPane.hidden = false;
        document.title = "Create Account – VAAMA FASHION";
      } else if (tab === "forgot") {
        if (tabLoginBtn) tabLoginBtn.classList.remove("is-active");
        if (tabRegisterBtn) tabRegisterBtn.classList.remove("is-active");
        if (loginPane) loginPane.hidden = true;
        if (registerPane) registerPane.hidden = true;
        if (forgotPane) forgotPane.hidden = false;
        document.title = "Forgot Password – VAAMA FASHION";
      } else {
        // default: login
        if (tabLoginBtn) tabLoginBtn.classList.add("is-active");
        if (tabRegisterBtn) tabRegisterBtn.classList.remove("is-active");
        if (registerPane) registerPane.hidden = true;
        if (forgotPane) forgotPane.hidden = true;
        if (loginPane) loginPane.hidden = false;
        document.title = "Sign In – VAAMA FASHION";
      }
    }

    /* ---------- password toggle ---------- */
    function setupPasswordToggles() {
      var buttons = document.querySelectorAll("[data-pwd-toggle]");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var targetId = btn.getAttribute("data-pwd-toggle");
          var input = document.getElementById(targetId);
          if (!input) return;
          var isPassword = input.type === "password";
          input.type = isPassword ? "text" : "password";
          btn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
          btn.innerHTML = isPassword
            ? '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
            : '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
        });
      });
    }

    /* ---------- password strength calculation ---------- */
    function calcPasswordStrength(pwd) {
      if (!pwd) return { score: 0, label: "Enter a password" };
      var score = 0;
      if (pwd.length >= 6) score++;
      if (pwd.length >= 8) score++;
      if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

      var labels = ["Very weak (min 6 characters)", "Weak", "Fair", "Good", "Strong"];
      return { score: score, label: labels[score] };
    }

    function setupPasswordMeter() {
      var pwdInput = document.getElementById("reg-pass");
      var segs = [
        document.getElementById("pwd-seg-1"),
        document.getElementById("pwd-seg-2"),
        document.getElementById("pwd-seg-3"),
        document.getElementById("pwd-seg-4")
      ];
      var labelEl = document.getElementById("pwd-meter-text");
      if (!pwdInput || !labelEl) return;

      pwdInput.addEventListener("input", function () {
        var res = calcPasswordStrength(pwdInput.value);
        labelEl.textContent = res.label;
        segs.forEach(function (seg, idx) {
          if (!seg) return;
          seg.className = "pwd-meter-segment" + (idx < res.score ? " lvl-" + res.score : "");
        });
      });
    }

    /* ---------- preference chips toggle ---------- */
    function setupPreferenceChips() {
      var chips = document.querySelectorAll(".pref-chip");
      chips.forEach(function (chip) {
        var chk = chip.querySelector("input[type='checkbox']");
        if (!chk) return;
        chip.addEventListener("click", function (e) {
          if (e.target !== chk) {
            chk.checked = !chk.checked;
          }
          chip.classList.toggle("is-checked", chk.checked);
        });
      });
    }

    function getSelectedPreferences(containerId) {
      var container = document.getElementById(containerId);
      if (!container) return [];
      var checked = container.querySelectorAll("input[type='checkbox']:checked");
      var out = [];
      checked.forEach(function (c) { out.push(c.value); });
      return out;
    }

    /* ---------- Quick Demo Credentials Button ---------- */
    if (btnFillDemo) {
      btnFillDemo.addEventListener("click", function () {
        var userField = document.getElementById("login-user");
        var passField = document.getElementById("login-pass");
        if (userField && passField) {
          userField.value = "customer@vaamafashion.com";
          passField.value = "Password123!";
          hideAlert(loginAlert);
          VF.ui.toast("Demo credentials filled! Click 'Sign In' to proceed.", "info");
        }
      });
    }

    /* ---------- Sign In Form Submission ---------- */
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        hideAlert(loginAlert);

        var identifier = (document.getElementById("login-user").value || "").trim();
        var password = document.getElementById("login-pass").value || "";
        var remember = document.getElementById("login-remember").checked;

        if (!identifier) {
          showAlert(loginAlert, "Please enter your registered email address or mobile number.");
          return;
        }
        if (!password) {
          showAlert(loginAlert, "Please enter your account password.");
          return;
        }

        var result = auth.login(identifier, password);
        if (!result.ok) {
          showAlert(loginAlert, result.error);
          return;
        }

        // Save session
        auth.setCurrentUser(result.user, remember);
        VF.ui.toast("Welcome back, " + result.user.name + "!", "success");

        if (redirectTarget) {
          window.location.href = redirectTarget;
          return;
        }
        renderView();
      });
    }

    /* ---------- Register Form Submission ---------- */
    if (registerForm) {
      registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        hideAlert(registerAlert);

        var name = (document.getElementById("reg-name").value || "").trim();
        var email = (document.getElementById("reg-email").value || "").trim();
        var phone = (document.getElementById("reg-phone").value || "").trim();
        var city = (document.getElementById("reg-city").value || "").trim();
        var password = document.getElementById("reg-pass").value || "";
        var confirmPass = document.getElementById("reg-pass-confirm").value || "";
        var terms = document.getElementById("reg-terms").checked;

        if (!name || name.length < 2) {
          showAlert(registerAlert, "Please enter your full name (at least 2 letters).");
          return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showAlert(registerAlert, "Please enter a valid email address.");
          return;
        }
        var cleanPhone = phone.replace(/[\s+\-()]/g, "");
        if (cleanPhone.length > 10 && cleanPhone.indexOf("91") === 0) cleanPhone = cleanPhone.slice(2);
        if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
          showAlert(registerAlert, "Please enter a valid 10-digit Indian mobile number (e.g. 98765 43210).");
          return;
        }
        if (!password || password.length < 6) {
          showAlert(registerAlert, "Password must be at least 6 characters long.");
          return;
        }
        if (password !== confirmPass) {
          showAlert(registerAlert, "Passwords do not match. Please re-enter identical passwords.");
          return;
        }
        if (!terms) {
          showAlert(registerAlert, "Please agree to the Store Policies and Terms to register.");
          return;
        }

        var prefs = getSelectedPreferences("reg-pref-chips");

        var result = auth.register({
          name: name,
          email: email,
          phone: cleanPhone,
          city: city || "Surat",
          password: password,
          preferences: prefs
        });

        if (!result.ok) {
          var msg = (result.errors && result.errors.length) ? result.errors.join(" ") : "Registration could not be completed.";
          showAlert(registerAlert, msg);
          return;
        }

        VF.ui.toast("Account created successfully! Welcome to Vaama Fashion.", "success");
        if (redirectTarget) {
          window.location.href = redirectTarget;
          return;
        }
        renderView();
      });
    }

    /* ---------- Forgot Password Form Submission ---------- */
    var forgotStep = 1;
    var forgotEmailHolder = "";

    if (forgotForm) {
      forgotForm.addEventListener("submit", function (e) {
        e.preventDefault();
        hideAlert(forgotAlert);

        if (forgotStep === 1) {
          var email = (document.getElementById("forgot-email").value || "").trim().toLowerCase();
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAlert(forgotAlert, "Please enter your registered email address.");
            return;
          }
          var user = storage.findUserByEmail(email);
          if (!user) {
            showAlert(forgotAlert, "No registered account found with this email. Please check spelling or create an account.");
            return;
          }
          forgotEmailHolder = email;
          forgotStep = 2;
          document.getElementById("forgot-step-1").hidden = true;
          document.getElementById("forgot-step-2").hidden = false;
          showAlert(forgotAlert, "Demo verification code generated: 123456. Enter it below with your new password.", "info");
        } else if (forgotStep === 2) {
          var code = (document.getElementById("forgot-code").value || "").trim();
          var newPass = document.getElementById("forgot-new-pass").value || "";
          var newPassConfirm = document.getElementById("forgot-new-pass-confirm").value || "";

          if (code !== "123456") {
            showAlert(forgotAlert, "Invalid verification code. For this demonstration, enter 123456.");
            return;
          }
          if (!newPass || newPass.length < 6) {
            showAlert(forgotAlert, "New password must be at least 6 characters.");
            return;
          }
          if (newPass !== newPassConfirm) {
            showAlert(forgotAlert, "New passwords do not match.");
            return;
          }

          var r = auth.resetPassword(forgotEmailHolder, newPass);
          if (!r.ok) {
            showAlert(forgotAlert, r.error);
            return;
          }

          VF.ui.toast("Password reset successfully! Please sign in with your new password.", "success");
          forgotStep = 1;
          document.getElementById("forgot-step-1").hidden = false;
          document.getElementById("forgot-step-2").hidden = true;
          document.getElementById("login-user").value = forgotEmailHolder;
          document.getElementById("login-pass").value = "";
          switchAuthTab("login");
        }
      });
    }

    /* Switch links */
    var linkGoRegister = document.getElementById("link-go-register");
    if (linkGoRegister) linkGoRegister.addEventListener("click", function (e) { e.preventDefault(); switchAuthTab("register"); });

    var linkGoLogin = document.getElementById("link-go-login");
    if (linkGoLogin) linkGoLogin.addEventListener("click", function (e) { e.preventDefault(); switchAuthTab("login"); });

    var linkGoForgot = document.getElementById("link-go-forgot");
    if (linkGoForgot) linkGoForgot.addEventListener("click", function (e) { e.preventDefault(); switchAuthTab("forgot"); });

    var linkBackLogin = document.getElementById("link-back-login");
    if (linkBackLogin) linkBackLogin.addEventListener("click", function (e) { e.preventDefault(); switchAuthTab("login"); });

    if (tabLoginBtn) tabLoginBtn.addEventListener("click", function () { switchAuthTab("login"); });
    if (tabRegisterBtn) tabRegisterBtn.addEventListener("click", function () { switchAuthTab("register"); });

    /* ---------- Dashboard panel switching ---------- */
    var dashNavBtns = document.querySelectorAll("[data-dash-panel]");
    var dashPanels = document.querySelectorAll(".dash-panel");

    function switchDashPanel(panelName) {
      dashNavBtns.forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-dash-panel") === panelName);
      });
      dashPanels.forEach(function (p) {
        p.classList.toggle("is-active", p.id === "dash-panel-" + panelName);
      });
    }

    dashNavBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchDashPanel(btn.getAttribute("data-dash-panel"));
      });
    });

    /* ---------- Render Dashboard Data ---------- */
    function renderDashboard(user) {
      if (!user) return;

      // Header initials & name
      var initials = (user.name || "U").split(" ").map(function (n) { return n[0]; }).join("").toUpperCase().slice(0, 2);
      if (userInitialsEl) userInitialsEl.textContent = initials;
      if (userNameEl) userNameEl.textContent = user.name;
      if (userEmailEl) userEmailEl.textContent = user.email;

      // Profile Info Table
      var fill = function (id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val || "—";
      };

      fill("prof-view-name", user.name);
      fill("prof-view-email", user.email);
      fill("prof-view-phone", user.phone ? "+91 " + user.phone : "Not provided");
      fill("prof-view-city", user.city || "Adajan, Surat");
      fill("prof-view-prefs", (user.preferences && user.preferences.length) ? user.preferences.join(", ") : "All Collections");

      var dateStr = "Recently";
      if (user.createdAt) {
        try {
          var d = new Date(user.createdAt);
          dateStr = d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
        } catch (e) {}
      }
      fill("prof-view-since", dateStr);

      // Pre-fill Edit Profile Form
      var editName = document.getElementById("edit-name");
      var editPhone = document.getElementById("edit-phone");
      var editCity = document.getElementById("edit-city");
      if (editName) editName.value = user.name || "";
      if (editPhone) editPhone.value = user.phone || "";
      if (editCity) editCity.value = user.city || "Surat";

      // Preferences in edit form
      var editChips = document.querySelectorAll("#edit-pref-chips .pref-chip");
      editChips.forEach(function (chip) {
        var chk = chip.querySelector("input[type='checkbox']");
        if (chk) {
          var isPref = user.preferences && user.preferences.indexOf(chk.value) !== -1;
          chk.checked = isPref;
          chip.classList.toggle("is-checked", isPref);
        }
      });

      // Render Active Cart / Enquiries Summary
      renderDashboardCart();
    }

    function renderDashboardCart() {
      var cartWrap = document.getElementById("dash-cart-summary-wrap");
      if (!cartWrap) return;

      var details = VF.cart.details();
      if (details.count === 0) {
        cartWrap.innerHTML =
          '<div class="empty-state" style="padding:2rem 1rem">' +
          '<h3>Your cart is currently empty</h3>' +
          '<p style="color:var(--ink-soft);font-size:.9rem">Browse our collections and add your favourite styles.</p>' +
          '<a class="btn btn--primary btn--small" href="shop.html" style="margin-top:.75rem">Explore Shop</a>' +
          '</div>';
        return;
      }

      var itemsList = details.lines.map(function (it) {
        return '<li style="display:flex;justify-content:space-between;padding:.4rem 0;border-bottom:1px solid var(--line);font-size:.9rem">' +
          '<span>' + esc(it.product.name) + (it.size ? ' (' + esc(it.size) + ')' : '') + ' × ' + it.quantity + '</span>' +
          '<strong>' + VF.util.formatPrice(it.lineTotal) + '</strong>' +
          '</li>';
      }).join("");

      cartWrap.innerHTML =
        '<div class="saved-cart-summary">' +
        '<div class="saved-cart-head">' +
        '<h3>Current Cart Items</h3>' +
        '<span class="saved-cart-badge">' + details.count + (details.count === 1 ? ' item' : ' items') + '</span>' +
        '</div>' +
        '<ul style="list-style:none;margin-bottom:1rem">' + itemsList + '</ul>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem">' +
        '<span>Subtotal:</span><strong style="font-size:1.15rem;color:var(--rose)">' + VF.util.formatPrice(details.subtotal) + '</strong>' +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:.75rem">' +
        '<a class="btn btn--primary btn--small" href="cart.html">View & Send Cart Enquiry</a>' +
        '<a class="btn btn--dark btn--small" href="checkout.html">Direct Checkout</a> <a class="btn btn--outline btn--small" href="shop.html">Continue Shopping</a>' +
        '</div>' +
        '</div>';
    }

    /* ---------- Edit Profile Form Submission ---------- */
    var toggleEditBtn = document.getElementById("btn-toggle-edit-profile");
    var cancelEditBtn = document.getElementById("btn-cancel-profile-edit");
    var profileViewPane = document.getElementById("profile-view-pane");
    var profileEditPane = document.getElementById("profile-edit-pane");

    function setProfileEditMode(isEditing) {
      if (profileViewPane) profileViewPane.hidden = isEditing;
      if (profileEditPane) profileEditPane.hidden = !isEditing;
      hideAlert(profileAlert);
    }

    if (toggleEditBtn) toggleEditBtn.addEventListener("click", function () { setProfileEditMode(true); });
    if (cancelEditBtn) cancelEditBtn.addEventListener("click", function () { setProfileEditMode(false); });

    if (profileEditForm) {
      profileEditForm.addEventListener("submit", function (e) {
        e.preventDefault();
        hideAlert(profileAlert);

        var curUser = auth.getCurrentUser();
        if (!curUser) return;

        var newName = (document.getElementById("edit-name").value || "").trim();
        var newPhone = (document.getElementById("edit-phone").value || "").trim();
        var newCity = (document.getElementById("edit-city").value || "").trim();
        var newPrefs = getSelectedPreferences("edit-pref-chips");

        if (!newName || newName.length < 2) {
          showAlert(profileAlert, "Name must be at least 2 characters.");
          return;
        }

        var r = auth.updateProfile(curUser.id, {
          name: newName,
          phone: newPhone,
          city: newCity,
          preferences: newPrefs
        });

        if (!r.ok) {
          showAlert(profileAlert, r.error || "Profile could not be updated.");
          return;
        }

        VF.ui.toast("Profile updated successfully!", "success");
        setProfileEditMode(false);
        renderDashboard(r.user);
      });
    }

    /* ---------- Password Change Form Submission ---------- */
    if (passwordChangeForm) {
      passwordChangeForm.addEventListener("submit", function (e) {
        e.preventDefault();
        hideAlert(securityAlert);

        var curUser = auth.getCurrentUser();
        if (!curUser) return;

        var curPass = document.getElementById("sec-current-pass").value || "";
        var newPass = document.getElementById("sec-new-pass").value || "";
        var confirmNewPass = document.getElementById("sec-confirm-pass").value || "";

        if (!curPass) {
          showAlert(securityAlert, "Please enter your current password.");
          return;
        }
        if (!newPass || newPass.length < 6) {
          showAlert(securityAlert, "New password must be at least 6 characters.");
          return;
        }
        if (newPass !== confirmNewPass) {
          showAlert(securityAlert, "New passwords do not match.");
          return;
        }

        var r = auth.changePassword(curUser.id, curPass, newPass);
        if (!r.ok) {
          showAlert(securityAlert, r.error);
          return;
        }

        showAlert(securityAlert, "Your password has been changed successfully.", "success");
        passwordChangeForm.reset();
        VF.ui.toast("Password updated successfully!", "success");
      });
    }

    /* ---------- Logout ---------- */
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        auth.logout();
        VF.ui.toast("You have been logged out.", "info");
        renderView();
      });
    }

    /* ---------- Main View Controller ---------- */
    function renderView() {
      var currentUser = auth.getCurrentUser();
      var modeParam = VF.util.getParam("mode");

      if (currentUser) {
        // Show Customer Dashboard
        authSection.hidden = true;
        dashSection.hidden = false;
        document.title = "My Account (" + currentUser.name + ") – VAAMA FASHION";
        renderDashboard(currentUser);
      } else {
        // Show Auth Forms
        dashSection.hidden = true;
        authSection.hidden = false;

        if (modeParam === "register") {
          switchAuthTab("register");
        } else if (modeParam === "forgot") {
          switchAuthTab("forgot");
        } else {
          switchAuthTab("login");
        }
      }
    }

    /* ---------- Init ---------- */
    setupPasswordToggles();
    setupPasswordMeter();
    setupPreferenceChips();
    renderView();
  });
})();
