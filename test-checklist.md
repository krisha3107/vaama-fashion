# VAAMA FASHION — Manual Test Checklist
Version 1.0 | Fill in Actual Result and circle Pass / Fail for each test.

## How to test
1. Open each page in Chrome or Edge by double-clicking the HTML file.
2. Press F12, open the Console tab. Red errors must be investigated.
3. Also test at a narrow window width (drag the browser window to roughly phone width).
4. Fill in the Actual Result column as you go. Sign and date at the bottom when done.

---

## Section 1: Navigation

| # | Test | Actions | Expected result | Actual result | P / F |
|---|------|---------|-----------------|---------------|-------|
| N-1 | All pages open | Double-click each of the 7 HTML files | Each page loads without a blank screen or red console error | | |
| N-2 | Header nav links | From index.html click Home, Shop, About, Contact | Each link opens the correct page | | |
| N-3 | Active nav state | On each page, check the header nav | The current page link has a visible underline | | |
| N-4 | Cart link | Click the cart icon in the header from any page | Opens cart.html | | |
| N-5 | Footer nav | From any page, click links in the footer | Home, Shop, About, Contact, Cart all work | | |
| N-6 | Footer categories | Click a category link in the footer | Opens shop.html filtered to that category | | |
| N-7 | Mobile menu | Narrow the browser to ~375 px | Hamburger button appears; clicking it opens and closes the menu | | |
| N-8 | Skip link | Press Tab on any page (first press) | "Skip to main content" link becomes visible; pressing Enter jumps past the header | | |
| N-9 | Demo bar | Check every page | The amber "Demo prototype" bar appears at the very top | | |
| N-10 | Admin link in footer | Click "Admin (demo)" in the footer | Opens admin.html login screen | | |

---

## Section 2: Home page

| # | Test | Actions | Expected result | Actual result | P / F |
|---|------|---------|-----------------|---------------|-------|
| H-1 | Hero loads | Open index.html | Hero text, Shop Now button, outline button, and three coloured tiles are visible | | |
| H-2 | Collection counts | Check collection tiles | Festive & Seasonal: 3 styles · New Arrivals: 7 styles · Sale Highlights: 6 styles | | |
| H-3 | Collection tile link | Click Festive & Seasonal tile | Opens shop.html?category=seasonal, shows 3 products | | |
| H-4 | Categories grid | Check index.html | 8 category tiles visible, each with a name, note, and style count | | |
| H-5 | Category tile link | Click any category tile | Opens shop.html filtered to that category | | |
| H-6 | Featured row | Check index.html | 4 featured product cards visible | | |
| H-7 | New arrivals row | Check index.html | 4 new arrival cards visible | | |
| H-8 | Sale row | Check index.html | Cards show % off badge and strikethrough original price | | |
| H-9 | Store intro address | Check intro section | Address "12 No., Western City…" shows with "to be verified" tag | | |
| H-10 | Placeholder tags | Check phone and hours in intro | Dashed placeholder tags appear (not invented values) | | |
| H-11 | WhatsApp button | Check CTA section | Button is grey/disabled with yellow help note (no number configured) | | |
| H-12 | Shop Now button | Click Shop Now | Opens shop.html showing all 24 products | | |

---

## Section 3: Shop page

| # | Test | Actions | Expected result | Actual result | P / F |
|---|------|---------|-----------------|---------------|-------|
| S-1 | All products shown | Open shop.html | "Showing 24 of 24 products" | | |
| S-2 | All categories | Check category filter | 9 radio buttons: All categories + 8 named categories | | |
| S-3 | Search works | Type "denim" | Shows 2 products (Straight Fit Blue Denim, Wide-Leg Denim) | | |
| S-4 | Search is live | Type "shirt" | Shows 6 products (3 Shirts + 3 T-Shirts) | | |
| S-5 | No results state | Type "zzzzz" | "No products found" message + Clear all button appear | | |
| S-6 | Clear from empty | Click Clear all in no-results message | All 24 products return, search cleared | | |
| S-7 | Category filter | Select Korean Pants | Shows 3 products | | |
| S-8 | Availability filter | Tick "Show available items only" with All categories | Shows 22 products (VF-006 and VF-012 hidden) | | |
| S-9 | Unavailable visible | Untick availability, check grid | VF-006 and VF-012 visible, labelled "Currently unavailable" and dimmed | | |
| S-10 | New arrivals filter | Select Highlights: New arrivals | Shows 7 products | | |
| S-11 | On sale filter | Select Highlights: On sale | Shows 6 products, all with % off badge | | |
| S-12 | Featured filter | Select Highlights: Featured | Shows 8 products | | |
| S-13 | Sort price low–high | Sort "Price: low to high" | First card: Basic Round-Neck T-Shirt ₹399 | | |
| S-14 | Sort price high–low | Sort "Price: high to low" | First card: Embroidered Ghaghra Choli ₹4,999 | | |
| S-15 | Sort name A–Z | Sort "Name: A to Z" | First card: A-Line Cotton One-Piece | | |
| S-16 | Clear all button | Set any filter, click Clear all | All filters and sort reset; 24 products shown | | |
| S-17 | Product card link | Click any card | Opens product.html?id=VF-... for that product | | |
| S-18 | Mobile filters | Narrow to ~375 px | Filters button appears; panel opens and closes; filter count shown | | |

---

## Section 4: Product page

| # | Test | Actions | Expected result | Actual result | P / F |
|---|------|---------|-----------------|---------------|-------|
| P-1 | Product loads | Click any card from shop.html | Product name, category, price, description, image placeholder visible | | |
| P-2 | Breadcrumb | Check top of product page | Home › Shop › Category › Product Name | | |
| P-3 | Category link | Click category in breadcrumb | Returns to shop.html filtered to that category | | |
| P-4 | Sale product | Open VF-001 (Floral Wrap One-Piece) | Shows ₹1,499 and strikethrough ₹1,899 and "21% off" | | |
| P-5 | Size buttons | Click S, then M on a product with sizes | Selected button turns dark; only one can be selected at a time | | |
| P-6 | Colour buttons | Click a colour option | Selected button turns dark | | |
| P-7 | Add without size | Click Add to Cart with no size selected | Error "Please select a size." appears inline | | |
| P-8 | Add without colour | Select size but no colour, click Add to Cart | Error "Please select a colour." appears inline | | |
| P-9 | Add to cart | Select M + Rose on VF-001, click Add to Cart | Green toast "Floral Wrap One-Piece added to cart"; badge shows 1 | | |
| P-10 | Add again | Add same product again | Badge shows 2; toast confirms | | |
| P-11 | Quantity control | Use − and + buttons | Quantity changes; − disabled at 1; + disabled at 10 | | |
| P-12 | Add with quantity | Set quantity to 3, add product | Cart badge increases by 3 | | |
| P-13 | Unavailable product | Open VF-006 | "Currently unavailable" strip shows; Add to Cart section is hidden | | |
| P-14 | WhatsApp enquiry | Check product page (no number configured) | "Enquire on WhatsApp" button is grey/disabled | | |
| P-15 | Not found | Visit product.html?id=FAKE | "Product not found" message with Back to shop button | | |
| P-16 | No ID | Visit product.html (no ?id=) | "No product ID was provided" message | | |
| P-17 | Sample note | Check any sample product | Small "Sample item" note visible below description | | |
| P-18 | Policy note | Check any product page | Delivery and returns draft notes visible at bottom | | |

---

## Section 5: Cart page

| # | Test | Actions | Expected result | Actual result | P / F |
|---|------|---------|-----------------|---------------|-------|
| C-1 | Items appear | Add 2–3 products, open cart.html | All added items show with name, size, colour, quantity, line total | | |
| C-2 | Subtotal correct | Check order summary panel | Subtotal equals sum of all line totals | | |
| C-3 | Increase quantity | Click + on a cart item | Quantity rises, line total and subtotal update immediately | | |
| C-4 | Decrease quantity | Click − on a cart item | Quantity falls; − disabled at 1 | | |
| C-5 | Remove item | Click Remove on one item | Item disappears, subtotal updates | | |
| C-6 | Empty state | Remove all items or clear cart | "Your cart is empty" message + Browse products button | | |
| C-7 | Cart persists | Add items, refresh cart.html | Items still present (localStorage) | | |
| C-8 | Clear cart | Click Clear cart, confirm | All items removed, empty state shown | | |
| C-9 | WhatsApp disabled | Check summary panel (no number) | "Send order on WhatsApp" button is grey/disabled with help note | | |
| C-10 | Page title | Add 3 items, check browser tab | Tab title shows "Cart (3) – VAAMA FASHION" | | |
| C-11 | Continue shopping | Click Continue shopping link | Returns to shop.html | | |
| C-12 | Item image link | Click a cart item's thumbnail or name | Opens product.html for that product | | |

---

## Section 6: About page

| # | Test | Actions | Expected result | Actual result | P / F |
|---|------|---------|-----------------|---------------|-------|
| A-1 | Draft warning | Open about.html | Amber "Draft content – pending client approval" box at top of article | | |
| A-2 | Address in article | Check article body | Address appears with "to be verified" tag | | |
| A-3 | Address in aside | Check aside card | Same address with "to be verified" tag | | |
| A-4 | Placeholders | Check phone, hours, email in aside | Dashed placeholder tags (no invented values) | | |
| A-5 | Categories list | Check aside | All 8 categories listed as links | | |
| A-6 | Category link | Click a category in the aside | Opens shop.html filtered to that category | | |
| A-7 | WhatsApp button | Check aside card | Grey/disabled with help note (no number configured) | | |
| A-8 | Browse button | Click Browse the collection | Opens shop.html | | |
| A-9 | Contact button | Click Contact us | Opens contact.html | | |

---

## Section 7: Contact page

| # | Test | Actions | Expected result | Actual result | P / F |
|---|------|---------|-----------------|---------------|-------|
| CT-1 | Address shown | Open contact.html | Address in table with "to be verified" tag | | |
| CT-2 | Placeholders | Check phone, WhatsApp, hours, email cells | Dashed placeholder tags (no invented numbers) | | |
| CT-3 | Social placeholders | Check Follow us card | Placeholder text for Instagram and Facebook | | |
| CT-4 | WhatsApp button | Check details column | Grey/disabled with help note | | |
| CT-5 | Enquiry form topic | Open dropdown, choose "Product availability" | Topic selected | | |
| CT-6 | Preview appears | Choose topic and type a message | Preview box appears and updates live | | |
| CT-7 | Char counter | Type in message field | Character count updates (e.g. "45 / 600") | | |
| CT-8 | Button disabled empty | Check before choosing topic or typing message | "Open WhatsApp" button is disabled | | |
| CT-9 | Button enabled | Choose topic + type message (no number configured) | Button still shows disabled but with WhatsApp help note (number missing) | | |
| CT-10 | Amber notice | Check below store info table | Warning about placeholder fields and publication reminder visible | | |

---

## Section 8: Admin dashboard

| # | Test | Actions | Expected result | Actual result | P / F |
|---|------|---------|-----------------|---------------|-------|
| AD-1 | Login screen | Open admin.html | Login form with security warning visible | | |
| AD-2 | Wrong password | Enter wrong password | Error message; password field clears | | |
| AD-3 | Correct login | Enter admin / demo1234 | Admin app appears | | |
| AD-4 | Session persists | Log in, refresh page | Still logged in | | |
| AD-5 | Dashboard stats | Check stat cards | 24 total, 22 available, 2 unavailable, 8 featured, 6 sale, 7 new, 8 categories | | |
| AD-6 | WhatsApp status | Check dashboard | ✘ "Number not configured" shown in red | | |
| AD-7 | Storage status | Check dashboard | "localStorage available" | | |
| AD-8 | Products table | Click Products | 24 rows; VF-006 and VF-012 show Unavailable badge | | |
| AD-9 | Table search | Type "ghaghra" | 2 rows shown | | |
| AD-10 | Add product | Fill all required fields, click Add product | Toast confirms; product appears in table | | |
| AD-11 | Add validation | Submit with blank name | Error list appears; no product saved | | |
| AD-12 | Edit product | Click Edit on any row | Form pre-filled with product data | | |
| AD-13 | Edit save | Change price, click Save changes | Toast confirms; table shows new price | | |
| AD-14 | Edit validation | Remove name, click Save | Error list appears; no save | | |
| AD-15 | Delete cancel | Click Delete, then Cancel in modal | Product still in table | | |
| AD-16 | Delete confirm | Click Delete, then Confirm | Product removed; count decreases | | |
| AD-17 | Persists after refresh | Add a product, refresh, log in | New product still present | | |
| AD-18 | Export | Click Data tools → Refresh | Full JSON of products in textarea | | |
| AD-19 | Copy export | Click Copy to clipboard | Text copied (paste into Notepad to verify) | | |
| AD-20 | Reset | Click Reset to sample data → Confirm | 24 sample products restored; any additions gone | | |
| AD-21 | Logout | Click Log out | Login screen returns | | |
| AD-22 | View store link | Click View store ↗ | Opens shop.html in a new tab | | |

---

## Section 9: WhatsApp flow (when number is configured)

Run this section only after temporarily adding a test number to `js/config.js → whatsappNumber`.
Format: country code + number, digits only. Example: `"919876543210"`.
Remove the test number afterwards.

| # | Test | Actions | Expected result | Actual result | P / F |
|---|------|---------|-----------------|---------------|-------|
| W-1 | Button turns green | Add number, refresh any page | WhatsApp buttons are green and clickable | | |
| W-2 | Product enquiry | Open any product page, click Enquire on WhatsApp | WhatsApp opens with product name, category, price in message | | |
| W-3 | Cart order summary | Add 2+ items, open cart, click Send order on WhatsApp | WhatsApp opens with product names, sizes, quantities, prices, subtotal | | |
| W-4 | Disclaimer in message | Check the WhatsApp message text | "This is an enquiry only" disclaimer present | | |
| W-5 | No false confirmation | Check the cart page after opening WhatsApp | Page does NOT say "Order placed" or "Order confirmed" | | |
| W-6 | Home CTA | Click Chat on WhatsApp on home page | WhatsApp opens with a general greeting | | |
| W-7 | Contact form | Fill enquiry form, click Open WhatsApp | WhatsApp opens with the composed message | | |
| W-8 | Remove number | Set whatsappNumber back to "", refresh | All buttons return to grey/disabled | | |

---

## Section 10: Storage and data integrity

| # | Test | Actions | Expected result | Actual result | P / F |
|---|------|---------|-----------------|---------------|-------|
| ST-1 | First-use seed | Open site in a new browser profile | 24 sample products load automatically | | |
| ST-2 | Cart persists | Add item, close and reopen browser, open cart.html | Item still in cart | | |
| ST-3 | Admin edits persist | Edit a product price in admin, open shop.html | New price shown in shop | | |
| ST-4 | No invented data | Check all pages with empty config fields | Only dashed placeholders; no invented phone numbers, hours or links | | |
| ST-5 | Sample labelled | Check any product card or detail page | "Sample item" label or note visible | | |

---

## Section 11: Customer Registration, Login & Account Dashboard

| # | Test | Actions | Expected result | Actual result | P / F |
|---|------|---------|-----------------|---------------|-------|
| AU-1 | Login page loads | Open login.html | Sign In card with tabs (Sign In / Create Account) and demo box visible | | |
| AU-2 | Header account link | Check site header from any page | Shows User icon and "Sign In" text | | |
| AU-3 | Fill demo credentials | Click "⚡ Fill Demo Credentials" | Pre-fills customer@vaamafashion.com and Password123! | | |
| AU-4 | Password visibility toggle | Click eye icon in password field | Password toggles between masked dots and readable text | | |
| AU-5 | Login error handling | Enter wrong password, click Sign In | Red alert message appears ("Incorrect password") | | |
| AU-6 | Successful customer login | Enter valid demo credentials, click Sign In | Green toast appears; page switches to Customer Dashboard | | |
| AU-7 | Header updates on login | Check header after logging in | Account link now shows "Hi, Krisha" (or first name) | | |
| AU-8 | Create Account tab | Click "Create Account" tab | Registration form appears with Name, Email, Mobile, City, Password | | |
| AU-9 | Password strength meter | Type password in Create Account form | 4-bar meter updates dynamically (Weak, Fair, Good, Strong) | | |
| AU-10 | Registration validation | Submit blank form or mismatched passwords | Explicit inline error message prevents registration | | |
| AU-11 | Duplicate email check | Try to register with already existing email | Alert states account with email already exists | | |
| AU-12 | New customer register | Fill valid new customer details and submit | Account created, success toast shown, logged in to Dashboard | | |
| AU-13 | Customer dashboard | View dashboard panels | Displays avatar monogram, contact info, and status pill | | |
| AU-14 | Edit customer profile | Click "Edit Profile", change city/phone, save | Toast confirms; profile details update immediately | | |
| AU-15 | Cart & activity panel | Add products to cart, open Dashboard Cart tab | Cart items, count, and subtotal displayed with enquiry link | | |
| AU-16 | Security / Change password | Enter current and new password, save | Password updated; success notification shown | | |
| AU-17 | Forgot password flow | Click "Forgot password?", enter email, demo code 123456 | Password resets; allows immediate login with new password | | |
| AU-18 | Cart auto-integration | Add items, open cart.html while logged in | Customer name and mobile auto-attached to WhatsApp order text | | |
| AU-19 | Customer logout | Click "Log Out" in dashboard | Session cleared, toast confirms, header returns to "Sign In" | | |

---

## Sign-off

| Field | Value |
|---|---|
| Tester name | |
| Date tested | |
| Browser and version | |
| Overall result | Pass / Fail / Partial |
| Outstanding issues | |
| Signed | |