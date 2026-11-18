# Documentation and release-truth audit

Reviewed 2026-11-18 against the GitHub development branch, current Cloudflare Pages project configuration and public desktop browser checks.

## Authoritative sources

- README.md: product boundary, current architecture, release caveats.
- docs/PRODUCTION_BLUEPRINT.md: deployment, domains, routing, auth and infrastructure.
- docs/MOBILE_APP_READINESS.md: responsive/PWA and native packaging gates.
- docs/RECIPE_CATALOG_SOFT_LAUNCH.md: recipe-specific limitations and QA.
- docs/GROCERY_PHOTO_COVERAGE.md: grocery-photo limitations and QA.
- migrations/0001_phase_i_core.sql and functions/api/[[path]].js: actual current Cloudflare D1 schema and API routing.

## Verified on 2026-11-18

- Cloudflare Pages projects the3c-mall and 3c-mall both connect to EllVii/the3c-mall, production branch main, and the same D1 database binding DB. Preview deployments are not data-isolated.
- GitHub full-stack routing and SEO workflows passed on the heads of draft PR #22 (recipe servings) and stacked draft PR #23 (grocery photos).
- A browser inspection of the public preview homepage and /features reported visible desktop navigation, content and loaded CSS/images. It did not establish mobile behavior or authenticated app flows.
- Replit and AppDeploy connected inventories contained no 3C Mall app. They are not production owners.
- The current catch-all Cloudflare API router has auth, profile, pilot, waitlist, admin summary and health routes. It does not prove that older Express-only compliance endpoints remain available.
- Photo uploads for grocery items are browser-local IndexedDB, not R2; no verified complete licensed image catalog or barcode recognition exists.
- Account approval is separately proposed in draft PR #12, not verified enforced in main.

## Legacy documentation that must not govern production

The following root-level documents are historical and may contain Express, Supabase, SQLite, beta-code, SMTP, obsolete hosting instructions, or unverified compliance/deployment claims:

- PROJECT_STATUS.md and DEPLOYMENT_READY.md (now carry explicit warning banners).
- SUPABASE_CONNECTION_TEST.md, SUPABASE_INTEGRATION_COMPLETE.md, SUPABASE_QUICK_START.md, SUPABASE_SETUP_GUIDE.md, SUPABASE_WIRING_SUMMARY.md.
- DEPLOYMENT_GUIDE.md, SERVER_QUICK_REF.md, QUICK_DEPLOY_EMAIL_FIX.md, COMPLIANCE_IMPLEMENTATION.md, COMPLIANCE_STATUS.md and related compliance summaries.
- Older first-time-customer, simulation, routing and status reports may describe superseded UI and endpoints.

Do not delete these documents solely because they are historical. Before applying any instructions, compare the claim with the current Cloudflare Functions router, production bindings, D1 schema, source tree and live tests. Never cite a historical “100% compliance” or “production ready” claim as current proof.

## Release gates, in priority order

1. **Security and access:** finish and verify approval-required signup separately; test existing-account login, session, verification, reset and denied signup states.
2. **Data isolation:** give preview/staging a separate D1 database before mutation tests, or keep tests read-only and use disposable fixtures only with approval.
3. **Core journey:** test recipe search, servings 1–24, ingredient quantities, grocery handoff, custom items, deduplication, list retention, and accessibility.
4. **Images and privacy:** check rights and visual accuracy of recipe photos; ensure product placeholders are honest; add local-photo deletion and replacement, image-failure fallbacks and camera QA.
5. **Responsive design:** inspect 320px, 375px, 820px, tablet, desktop, keyboard and screen-reader paths. No additional onboarding tour is needed unless research identifies a gap.
6. **Infrastructure:** verify required R2 RECEIPTS binding, email and retailer credentials server-side. Do not imply unavailable integrations are active.
7. **Merge order:** review PR #22 before stacked PR #23; rebase #23 onto the merged main, resolve conflicts, re-run CI, inspect Pages preview and verify production after deployment.

## Architecture and provider roles

- **GitHub:** canonical source, PR review, tests, release tags.
- **Cloudflare:** Pages, Functions, D1, optional R2, secrets, monitoring.
- **TinyFish:** read-only visual/browser QA until write actions are explicitly needed.
- **Product Design:** UX critique and prototype review; no second production codebase.
- **Replit and AppDeploy:** isolated prototypes only when a concrete experiment justifies them.
- **OpenAI Platform:** optional server-side assistance for constrained recipe/item interpretation after cost, privacy, safety, data rights and key storage review; no unreviewed image identification or invented retailer prices.

## Operational caution

Passing CI does not establish production release, actual mobile usability, correct retailer pricing, guaranteed savings, licensed image usage, or grant readiness. Track each separately with dated evidence.
