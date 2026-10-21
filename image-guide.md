# VAAMA FASHION — Image replacement guide

## Where to place a real product photograph
Put the image file in this folder:

## How to name the image
Use the product's ID as the filename, for example:
- `VF-001.jpg`
- `VF-014.png`
- `VF-022.jpg`

Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`
Keep the filename in lowercase. Avoid spaces or special characters.

## Which field references the image
Open `js/products.js` and find the product entry.
Look for the `image` field:
Change it to the relative path from the VAAMA-FASHION folder:

## Recommended image size
- Aspect ratio: **3 wide : 4 tall** (portrait). Example: 600 × 800 pixels.
- Keep file size under 300 KB for faster loading.
- Use a photo editing tool (e.g. Paint.NET, free download) to resize if needed.

## How to check that the image loads
1. Save `products.js` with the updated path.
2. Open or refresh the shop page in Chrome.
3. If the image shows: done.
4. If a coloured placeholder tile still shows:
   - Press F12 → Console. Look for a red 404 error mentioning your filename.
   - Check the exact filename and folder path match what you typed.
   - Check the file extension matches (`.jpg` vs `.jpeg`, upper vs lower case).

## How to avoid broken-image links
- The image path in `products.js` is **relative to the HTML file**, not to `js/`.
  Write `assets/images/products/VF-001.jpg`, not `../assets/images/products/VF-001.jpg`.
- If you open the site through a local server (e.g. VS Code Live Server), paths work the same way.
- The site automatically shows a coloured placeholder tile if the image file is missing or fails to load. No broken-image icon will appear.

## Adding an image for a new product created in the admin
1. Place the photo in `assets/images/products/`.
2. In the admin panel, click Edit on the product.
3. In the Image path field, type: `assets/images/products/FILENAME.jpg`
4. Click Save changes.
5. Open the product page to confirm the image appears.

## Replacing the logo
Currently the wordmark is CSS text. To replace it with an image:
1. Place the logo file in `assets/images/`, e.g. `assets/images/logo.png`.
2. Open `js/common.js`.
3. Find the two lines containing `wordmark__main` and `wordmark__sub`.
4. Replace both with an `<img>` tag pointing to your logo.
5. Adjust the CSS in `style.css` under `.wordmark` as needed.