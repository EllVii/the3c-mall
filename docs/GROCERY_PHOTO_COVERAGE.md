# Grocery catalog and photo coverage

## Implemented in this branch
- Browsable grocery discovery vocabulary spanning produce, bakery, deli, meat, seafood, dairy and eggs, frozen, pantry and common household sections.
- Produce groups include fruit, leafy greens, roots and tubers (including yams), vegetables, herbs and aromatics, mushrooms and specialty produce.
- Search and section filter, add-to-list, and manual new-item entry.
- Optional user photo capture/selection using the browser camera/file chooser.
- User photos are resized and stored privately in IndexedDB on the current device. Nothing is uploaded to Cloudflare R2 and no shared community catalog is created.
- Existing Grocery Lab rows show a photo thumbnail where a device photo exists, otherwise a clearly labeled camera placeholder.
- Existing recipe-to-grocery amount values are read correctly by Grocery Lab's normalizer.

## Not yet done
- The catalog has item names but **does not have verified licensed stock photography for every entry**. Do not claim complete picture coverage. The camera placeholder is intentional, not a product image.
- Real product photographs require an authorized image source, item-level matching, licensing, CDN/R2 delivery, and human review for ambiguous varieties.
- Barcode/OCR/photo-based product identification, package size and retailer SKU matching are future features; no image AI recognition is claimed.
- Device-local photos are not synced between devices. Clearing browser storage deletes them.
- This is a broad common-US-grocery taxonomy, **not an exhaustive worldwide produce inventory**. Seasonal, regional, cultural and specialty products should be added as users discover them.
- The old aisle classifier is heuristic; future normalized catalog category IDs should replace keyword-based guessing.

## Production release gates
- Verify preview build and CI; check JSX, imports and CSS.
- Test mobile camera permissions, image orientation, file-size validation, IndexedDB failure behavior and repeated photo replacement.
- Test all catalog filters and new-item names, duplicate item handling, recipe grocery handoff, and protected routes.
- Ensure privacy notice, photo deletion/replacement controls, accessible fallback images, rights clearance and user consent before cloud synchronization.
- Do not deploy to production without verified photos and accessibility checks.
