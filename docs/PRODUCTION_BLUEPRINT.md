# 3C Mall Production Blueprint

Last reviewed: 2026-09-15

This document is the current production map for 3C Mall. It exists to prevent a change in one layer from silently damaging routing, authentication, storage, indexing, deployment, or the customer journey in another layer.

## 1. Product surfaces

| Surface | Canonical host | Purpose | Search posture |
| --- | --- | --- | --- |
| Public website | `https://the3cmall.com` | Product explanation, features, pricing, About, guides, waitlist | Indexable public content |
| Secure web app | `https://the3cmall.app/app` | Authenticated household planning application | Noindex |
| Sign in | `https://the3cmall.app/login` | Authentication entry | Noindex |
| API | Same origin under `/api/*` on the app deployment | Cloudflare Pages Functions / Workers runtime | Not a public content surface |

The `.com` and `.app` split is intentional. Public discovery belongs on `.com`; account and app workflows belong on `.app`.

## 2. Deployment ownership

**Cloudflare Pages is the authoritative application deployment model for this repository.**

The repository contains:
- a Vite frontend;
- a `dist` build output;
- Cloudflare Pages Functions under `functions/`;
- `wrangler.example.jsonc` as a binding/configuration reference rather than a second standalone Worker deployment target.

A separate Cloudflare Workers Git integration has been observed attempting to deploy the same repository and failing while Cloudflare Pages previews succeed. That is a deployment-ownership conflict, not evidence that the Pages application is broken.

### Deployment rule

There should be one production owner for the web application build. If a Cloudflare Workers Git integration remains attached to this repository, either:
1. disconnect the stale standalone Worker integration in Cloudflare; or
2. point it at an intentionally separate Worker project with its own explicit entry point and lifecycle.

Do not modify healthy Pages code merely to satisfy a second deployment integration that is not part of the architecture.

## 3. Frontend architecture

- React 18 + Vite.
- React Router handles the route tree.
- `src/App.jsx` owns host-aware routing and the protected app boundary.
- `SiteLayout` owns the public navigation/footer.
- `AppLayout` owns authenticated desktop/mobile navigation.
- `SeoManager` owns route-aware client metadata.
- `scripts/postbuild-seo.mjs` generates crawlable static HTML for public routes and noindex HTML for app/login routes.

### Responsive modes

**Desktop, 1101px and wider**
- Full application sidebar.
- Main work area uses the remaining viewport.

**Tablet / foldable / compact desktop, 821px to 1100px**
- Compact icon navigation rail.
- Accessible labels remain available to assistive technology and pointer tooltips.
- Main work area gains horizontal space without switching prematurely to phone navigation.

**Phone, 820px and below**
- Mobile top bar.
- Five-item bottom navigation.
- Safe-area padding for modern phones.
- Coarse-pointer targets remain at least 48px where the adaptive layer applies.

**Installed PWA**
- Starts at `/app` in standalone display mode.
- Uses the same route tree and same HTTPS API as the browser app.
- Meal Planning and Grocery Lab are exposed as installable app shortcuts.
- Service-worker updates are user-controlled so an active form or planning session is not force-reloaded.

## 4. Data and API plumbing

Current production path:

`React UI` → `same-origin /api/*` → `Cloudflare Pages Functions` → `D1 / R2 / email / approved retailer integrations`

### D1

Primary relational store for account/session/profile/pilot/waitlist data. The baseline schema is in `migrations/0001_phase_i_core.sql`.

### R2

`RECEIPTS` is the expected binding for approved pilot receipt/image objects. The code correctly returns a controlled `503 storage_not_configured` when the binding is missing.

**Current infrastructure risk:** the production health endpoint has reported `receiptStorageConfigured: false`. This is a Cloudflare environment binding issue, not a frontend routing problem. CI keeps it visible in a separate non-blocking infrastructure job.

The production-maturity definition is therefore:
- code path is safe when the binding is absent;
- the feature must not be marketed as available until the production binding is actually connected;
- R2 health stays visible until provisioned.

### Email

Transactional email is server-side. Client code must never receive an email provider secret.

### Retailer/store integration

Store integrations must remain server-side where credentials are required. Browser clients should call deployed `/api/*` routes and must never fall back to localhost or an obsolete backend host in production.

No retailer partnership, authorization, or live-data status should be represented as confirmed unless the relevant production right/credential is documented.

## 5. Authentication boundary

Authentication is a protected subsystem and is intentionally outside the scope of presentation-only changes.

Current boundary:
- `AuthContext` uses `src/lib/apiClient.js`.
- Session cookies are issued server-side.
- `/app` is wrapped by `ProtectedRoute`.
- `.com/login` and `.com/app*` hand off to the `.app` host.
- Public app/login SEO remains noindex.

### Change-control rule

Do not change signup, login, verification, password reset, session restoration, user status, cookie policy, or account approval behavior in a UX/design patch. Auth changes require a separate migration plan, controlled test accounts, rollback steps, and explicit verification of existing-user access.

### Known policy mismatch to resolve separately

Public marketing describes controlled beta access, while the current backend account-creation path can still support direct email-verified signup. That is an access-policy decision, not a styling bug. Resolve it in a dedicated authentication workstream so existing tester access is not accidentally broken.

## 6. Configuration rules

The repository must not contain a tracked root `.env`.

`VITE_*` values are client-visible by design. Therefore:
- never place server secrets in `VITE_*`;
- never use private beta/access codes as a browser security boundary;
- never make retired Supabase or Render configuration the production source of truth;
- never hard-code localhost as a production fallback;
- use `.env.example` only for documented non-secret local options;
- use Cloudflare environment variables, bindings, and secrets for production infrastructure.

## 7. Search and content architecture

Public indexable routes are declared in `src/utils/publicSeoRoutes.js` and generated into route-specific HTML during `npm run build`.

Current public search surfaces include:
- Home
- Features
- About 3C Mall
- Pricing
- Grocery / meal-planning resource hub
- Budget meal-planning guide
- Unit-price calculator and guide
- Grocery-store comparison guide
- Privacy
- Terms

Private app/login pages remain noindex.

The About page serves a specific entity and answer purpose: it explains what 3C Mall is, who it serves, how its comparisons work, what it does not claim, and who develops it. This supports customer trust, public relations, traditional search, SXO, AIO, AEO, and generative discovery without using hidden keyword pages.

## 8. PWA and cache lifecycle

The PWA precaches versioned static assets but not HTML navigation responses. This preserves current Cloudflare response headers on page loads.

Update sequence:
1. new service worker is detected;
2. the UI displays an update-ready notice;
3. user can continue working or choose Update now;
4. the new worker activates only when requested.

This avoids an automatic reload while a user is planning meals, editing a profile, or working through a shopping flow.

PWA registration belongs to the secure `.app` host. Public `.com` pages should remain crawl-first marketing surfaces rather than becoming a second install origin.

## 9. Security boundary

Current production principles:
- authenticated app and public content are separated by host and route;
- private routes are noindex;
- API credentials stay server-side;
- D1 and R2 are accessed through server functions, not exposed browser credentials;
- account management stays behind authentication;
- error conditions should fail closed or show a clear unavailable state rather than fabricate success;
- public code must not hard-code unverified partnership, compliance, or authorization claims.

Do not add a broad Content-Security-Policy without first inventorying map, image, form, and third-party resource requirements. A security header that blocks required functionality is not a maturity improvement.

## 10. Validation gates

A normal production PR should pass:
- frontend production build;
- SEO static generation checks;
- current-stack critical lint;
- frontend tests;
- route/configuration contract audit;
- deployment preview;
- public and app route smoke tests.

Informational/non-current debt is tracked separately:
- legacy Express/Supabase server tests;
- broad UI lint cleanup that is not on the critical runtime path;
- optional production R2 binding status;
- stale external deployment integrations that do not own the Pages application.

A green critical path plus a visible non-blocking infrastructure warning is more truthful than making every unrelated legacy artifact a production blocker.

## 11. Search/AI measurement gates

Search and AI visibility work should use measurable signals rather than subjective “100%” scores.

Review:
- Google Search Console page/query performance;
- Bing Search Performance;
- Bing AI Performance citation activity, cited pages, grounding queries, topics, intents, and trends where available;
- first-party landing, calculator, waitlist, and conversion events;
- crawl/index coverage for new public routes.

AIO/GEO changes should never introduce hidden copy, invented statistics, duplicate thin pages, or structured data that says more than the visible page.

## 12. Change impact checklist

Before changing a route, data flow, layout, integration, or marketing promise, verify:

| Change area | Check before change | Check after change |
| --- | --- | --- |
| Public route | canonical, redirect, sitemap, navigation | generated HTML, 200 response, metadata |
| App route | auth boundary, aliases, mobile nav | protected access, route audit, noindex |
| API | caller, schema, auth requirement, error shape | tests, unauthorized behavior, live contract |
| D1 | migration compatibility | current + legacy schema safety, rollback |
| R2 | binding and object lifecycle | missing-binding behavior + live health |
| PWA | service worker/cache behavior | update path, installability, active-session safety |
| Responsive UI | desktop/tablet/mobile ownership | overflow, safe areas, touch targets, navigation |
| SEO/SXO | intent, visible answer, CTA | crawlability, snippet match, conversion path |
| AIO/AEO/GEO | entity truth, evidence, freshness | retrieval clarity, citations/grounding, no overclaim |
| PR/CMA | source and capability proof | customer-support readiness, consistent public language |
| Deployment | authoritative owner and bindings | one intended production path, no duplicate deploy confusion |

The goal is not to eliminate every historical file in one sweep. The goal is to make the production path unambiguous, testable, reversible, measurable, and difficult to break accidentally.
