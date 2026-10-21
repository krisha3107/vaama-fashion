# VAAMA FASHION — Production readiness plan

## What this prototype is
A local demonstration built in HTML, CSS and Vanilla JavaScript,
using browser localStorage for data. It is suitable for a college
demonstration and a preliminary client review only.

## What must change before real customers use it

### 1. Hosting
- Rent a web hosting plan or use a cloud service (e.g. Hostinger, GoDaddy, or any shared host).
- Register a domain name (e.g. vaama-fashion.in or vaama.store).
- Enable HTTPS (most hosts provide a free SSL certificate).

### 2. Replace browser storage with a real database
- localStorage is per-browser, can be cleared by the user, and is
  not shared between devices.
- A production site needs a server-side database (e.g. MySQL with PHP,
  or a managed service like Firebase or Supabase).
- Products, orders and enquiries must be stored server-side.

### 3. Secure admin authentication
- The current admin password is visible in the JavaScript source code.
  Anyone who presses F12 can read it.
- A production admin needs server-side login with hashed passwords,
  session tokens, and HTTPS.
- The admin panel itself must not be publicly accessible by URL.

### 4. Server-side validation
- All form inputs must also be validated on the server, not only in
  the browser, to prevent malicious submissions.

### 5. Order recording
- Currently, opening WhatsApp only starts a chat. No order is stored.
- A production system should record enquiries or orders in a database
  so the shop can track them reliably.

### 6. Verified business information
Before publication, the client must confirm and approve:
- Official WhatsApp number
- Official phone number
- Opening hours
- Email address
- Business address (verify against official records)
- Social media links
- Logo and branding assets
- About page copy
- Delivery and pickup policy
- Return and exchange policy

### 7. Real product catalogue
- All current products are sample data.
- The client must supply real product names, prices, descriptions,
  sizes, colours, availability status, and photographs.
- Product photographs must be taken, edited, and placed in the
  assets/images/products/ folder (or uploaded to a server).

### 8. Payments (only if required)
- This version has no payment system by design.
- If online payments are ever required, integrate a licensed payment
  gateway compliant with Indian regulations (e.g. Razorpay, PayU).
- This requires additional legal, banking, and compliance steps.

### 9. Privacy and legal
- Add a Privacy Policy page explaining what data the site collects.
- Add Terms and Conditions if the site takes orders.
- Comply with applicable Indian IT and consumer protection laws.

### 10. Testing before launch
- Test the production site on multiple real devices and browsers.
- Test all links, forms, WhatsApp flows, and admin functions.
- Test page load speed and image sizes.
- Check colour contrast and keyboard navigation.

### 11. Backup and recovery
- Set up automated database backups.
- Keep a copy of all product data and images in a separate location.

## Estimated effort summary
The items above require a developer with server-side experience,
or a suitable website platform (e.g. Shopify, WooCommerce). The
current prototype provides the visual design, category structure,
and shopping flow as a starting reference.