# Print materials

- `triptico.html`: tri-fold brochure, two A4 landscape pages (outside, inside). Open in Chrome and print to PDF with
  "Background graphics" on, margins none, scale 86 %.
- `afiche.html`: A3 portrait poster (printed size 297 × 420 mm). Print to PDF with background graphics and no margins.

Both are static HTML (no build step). The QR code is the same component as the website's (`src/components/QrCode.jsx`),
level H with the brand mark in the center, and points to the public address in `src/config/site.js`.
Figures (indices, critical angles, speeds) use the same values as the website: water n = 1.333, crown glass n = 1.52,
c = 300 000 km/s. Keep them in sync if the website changes.
