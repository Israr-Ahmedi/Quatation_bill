# Ahmedi Plaster of Paris – Quotation Generator

A browser-only quotation generator (HTML, CSS, vanilla JavaScript, Bootstrap 5, jsPDF + AutoTable). No backend, no build step.

## Features
- Customer details, editable quotation number and date
- Dynamic item table: Amount = SQF × Rate, instant totals in Indian format (e.g. 1,20,700)
- Live preview, validation (no negative values, no NaN)
- Downloads a US Letter PDF that copies the layout of the original Excel quotation (outer box, blank ruled rows, TOTAL AMOUNT at the bottom) named `Quotation_CustomerName_YYYY-MM-DD.pdf`
- The PDF shows plain numbers (no currency symbol), like the Excel sheet. The website uses ₹.

## Files
```
quotation-generator/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run locally
1. Keep all four files in one folder.
2. Double-click `index.html` (internet is needed once for the CDN libraries).
3. Optional: `python -m http.server 8000`, then open http://localhost:8000.

## Deploy to GitHub Pages
1. Sign in at github.com → **New repository** → name it (e.g. `quotation-generator`) → **Public** → **Create repository**.
2. Upload files: **Add file → Upload files**, drag in `index.html`, `style.css`, `script.js`, `README.md` (keep them at the repository root) → **Commit changes**.
   Or with git:
   ```
   git init
   git add .
   git commit -m "Quotation generator"
   git branch -M main
   git remote add origin https://github.com/<your-username>/quotation-generator.git
   git push -u origin main
   ```
3. Open the repository **Settings**.
4. Click **Pages** in the left sidebar.
5. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch to `main`, Folder to `/ (root)`, then **Save**.
6. Wait 1–2 minutes, then open `https://<your-username>.github.io/quotation-generator/`.

## PDF verification checklist
- [ ] File name is `Quotation_<Customer>_<date>.pdf`
- [ ] Business name, address and mobile are at the top; title reads QUOTATION
- [ ] Quotation number, date, customer name/address/mobile match the form
- [ ] Every item row appears with the right description, SQF and rate
- [ ] Each amount equals SQF × Rate
- [ ] With the sample data, the total is 1,20,700
- [ ] Total equals the sum of all amounts after editing, adding and removing rows
- [ ] Signature lines for customer and authorized signatory are present
- [ ] No buttons, clipped text or blank pages; more than 21 rows continue on page 2 with a page number