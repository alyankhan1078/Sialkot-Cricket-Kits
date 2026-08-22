# Sialkot Cricket Kits website — start here

This folder contains the complete website source code.

## Open the website in Visual Studio Code

1. Extract the ZIP file to a normal folder, such as `Documents\\Sialkot Cricket Kits Website`.
2. Open Visual Studio Code.
3. Choose **File → Open Folder** and select the extracted folder.
4. In VS Code, choose **Terminal → New Terminal**.
5. Run:

   ```powershell
   npm install
   npm run dev
   ```

6. Open the local website address shown in the terminal (usually `http://localhost:5173`).
7. To stop it, click the terminal and press `Ctrl + C`.

## Important files

- `app/page.tsx` — all products, prices, wording and page sections.
- `app/globals.css` — colours, layout, mobile design and print styling.
- `app/layout.tsx` — browser title and search/social description.
- `public/images/` — logo, product and customer-review images.

## Test the final production build

Run:

```powershell
npm run build
```

If the command finishes successfully, the project is ready for hosting.

## Updating a price

Open `app/page.tsx`, find the product name, change only its `price` value, save the file, and refresh your browser. Keep customer-facing prices formatted like `8,499` or `8,999`.

## Domain name

The recommended spelling is **sialkotcricketkits.com**. Purchase only the domain first; hosting and domain connection can be completed after the site is approved.
