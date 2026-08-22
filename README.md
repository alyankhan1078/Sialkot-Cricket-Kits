# Sialkot Cricket Kits

Production storefront for Sialkot Cricket Kits, with the approved 2026 catalogue, product photographs, PKR pricing, stock filters, favourites, cart and WhatsApp ordering.

## Open in Visual Studio Code

1. Open Visual Studio Code.
2. Choose **File → Open Folder** and select this project folder.
3. Open **Terminal → New Terminal**.
4. Run:

```powershell
npm install
npm run dev
```

Open the local address printed in the terminal (normally `http://localhost:5173`).

## Production build

```powershell
npm run build
```

The build output is ready for the configured hosting workflow. Node.js 22.13 or newer is recommended.

## Main project areas

- `app/` — website pages, metadata, sitemap and robots rules
- `src/components/` — reusable storefront, cart, forms and navigation
- `src/data/products.ts` — approved product, price and stock data
- `public/assets/brand/` — official brand logo
- `public/assets/products/` — optimized catalogue photography
- `public/catalogue/` — downloadable approved catalogue PDF

## Updating the catalogue

Edit product records only in `src/data/products.ts`. Keep every price in PKR and verify stock against the approved catalogue before publishing. Product images should be optimized and placed in `public/assets/products/`.

## Ordering flow

The first version does not require a backend. Product enquiries, custom-bat specifications and cart checkout generate formatted messages for the official WhatsApp number. Shipping charges are confirmed separately.
