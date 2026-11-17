# Recipe catalog pilot implementation

The recipe browser was updated for an image-first, mobile-friendly shopping experience. Existing onboarding tutorials were not changed.

## Phase 1 functionality
- Six original starter recipes with ingredient quantities, steps, photos, category tags and meal times.
- Existing user-created recipes remain available; favorites are persisted without deleting existing recipes.
- Search works across title, description, tags and ingredients.
- Serving adjustments from 1 to 24 display proportional amounts; grocery-list handoff uses selected serving count.
- Existing grocery lists are merged rather than replaced.
- The existing 60-item meal idea dataset in `src/utils/recipes.js` remains unchanged. Those ideas do **not** contain complete ingredient quantities and must not be presented as fully actionable recipes until verified.
- No changes to authentication, D1 migrations, existing walkthroughs, pricing or retailer credentials.

## Technical limitations
- Recipe selections and edits use browser storage, not account-synchronized D1 records.
- Image assets currently use external Unsplash URLs. Review licenses, reliability, visual match, mobile performance and fallbacks before production.
- Recipe quantities are illustrative cooking guidance; no guaranteed nutrition totals or retailer prices.
- A recipe ingredient's unit stays unchanged during proportional serving scaling. Units such as cans may yield fractional amounts; future shopping conversion should round *purchase package quantities* separately from the recipe amount.
- Grocery Lab's existing UI may display legacy item shapes and needs a live end-to-end check.

## Required validation
1. Run `npm run verify:production` and `npm test -- --runInBand`.
2. Verify six recipes display with images at 320px, 375px, tablet and desktop widths, with readable type and no inaccessible controls.
3. Verify search, category filters, favorites, create/edit, details, steps, and +/− servings.
4. Verify 2/4/6/8 serving amounts and grocery handoff, including existing lists and duplicate ingredients.
5. Verify recipe images load, have appropriate rights, and visually match dishes; provide an intentional fallback.
6. Verify existing tutorials, login, other protected routes, Grocery Lab and Meal Planner are unchanged.
7. Check Cloudflare preview for this branch. Do not merge until GitHub Actions runners execute and review gates pass.
