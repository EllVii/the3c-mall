# 3C Mall

3C Mall is a household grocery-comparison, meal-planning, and food-budget decision-support software platform developed by [Ell Vii’s Automations LLC](https://ellviisautomations.com/).

- Public website: [the3cmall.com](https://the3cmall.com/)
- Secure application: [the3cmall.app/app](https://the3cmall.app/app)

The platform helps households organize meal ideas, build grocery lists, compare estimated retailer and unit-cost information, and review planning progress. It is designed to reduce fragmentation across grocery planning tasks while keeping the user in control of final decisions.

## Product boundaries

3C Mall is not a grocery retailer, delivery company, payment processor, medical provider, dietitian replacement, financial advisor, official retailer representative, or guaranteed-savings service. Retailers control final price, availability, eligibility labels, checkout, payment, substitutions, pickup, delivery, refunds, and fulfillment.

Displayed prices, availability, savings, and benefit-related subtotals are estimates unless expressly confirmed by the retailer. The platform does not collect an EBT card number or PIN, determine SNAP eligibility, or process SNAP benefits.

## Current production architecture

- React + Vite frontend
- Cloudflare Pages hosting
- Cloudflare Pages/Workers Functions for `/api/*`
- Cloudflare D1 as the primary relational database
- Cloudflare R2 for approved receipt or image objects when needed
- Resend or another approved transactional email provider from server-side code
- PWA installation on the secure `.app` host

The application has three responsive navigation modes:

1. **Desktop / expanded** — full application sidebar.
2. **Tablet, foldable, and compact desktop** — compact navigation rail.
3. **Phone / compact** — mobile header plus bottom navigation with safe-area support.

The installed PWA reuses the same routes, backend, and authentication system. It does not create a second account store.

## Source-of-truth documentation

Before changing routing, authentication, storage, or deployment, read:

- [`docs/PRODUCTION_BLUEPRINT.md`](./docs/PRODUCTION_BLUEPRINT.md) — current domains, routes, data plumbing, auth boundary, PWA lifecycle, risks, and validation gates.
- [`docs/MOBILE_APP_READINESS.md`](./docs/MOBILE_APP_READINESS.md) — Google Play / Apple packaging path and auth freeze requirements.
- [`docs/CMA_GROWTH_BLUEPRINT.md`](./docs/CMA_GROWTH_BLUEPRINT.md) — customer experience, marketability, PR, SEO, AEO, GEO, and content opportunities.

Older root-level Supabase, Render, localhost, and early simulation documents are historical implementation records. They are not the production configuration authority. The current production path is Cloudflare + D1 + same-origin `/api/*` unless the production blueprint is intentionally revised.

## Environment configuration

Copy `.env.example` only when local client configuration is needed.

Do not commit `.env` files. `VITE_*` values are public browser-build values and must never contain server secrets or private access-control credentials. Production bindings and secrets belong in Cloudflare configuration.

## Current Phase I focus

The grant-focused Phase I work is organized around four measurable areas:

1. **Grocery & Cost** — estimated price, package-size, unit-cost, and basket comparisons.
2. **Meal Planning & Nutrition Support** — general household meal-planning organization across varied preferences.
3. **My Progress & Outcomes** — planning time, confidence, stress, completion, and receipt-supported comparison measures.
4. **Community Support — Beta** — quiet, moderated, opt-in support where included in the approved pilot.

The 3C Concierge routes users among these areas and helps explain choices without replacing professional judgment.

## Phase I grant package

The working grant package is in [`GRANT_PHASE_I_PACKAGE.md`](./GRANT_PHASE_I_PACKAGE.md).

Participant and stakeholder materials are in:

- [`grant/phase-i/STAKEHOLDER_TOOLKIT.md`](./grant/phase-i/STAKEHOLDER_TOOLKIT.md)
- [`grant/phase-i/PILOT_FORMS.md`](./grant/phase-i/PILOT_FORMS.md)

The working project period is 12 months and includes a five-family pilot. Eligible participant reimbursement is capped at $500 per family and $2,500 total, subject to receipt review and the approved grant budget.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

For production infrastructure, create/bind the required Cloudflare D1 and R2 resources, apply the SQL migration in `migrations/`, configure the bindings described in `wrangler.example.jsonc`, and set the required server-side secrets before pilot use.

## Required production secrets

- `ADMIN_API_TOKEN`
- `RESEND_API_KEY` or another approved email-delivery integration
- any authorized retailer or data-provider credentials

Secrets must be stored in Cloudflare configuration, not committed to the repository.

## Validation

Current production changes should pass the production build, SEO route generation, current-stack lint, frontend tests, route/configuration audit, deployment preview, and live route/API smoke tests. Optional infrastructure status such as the R2 receipt binding is reported separately so it stays visible without being confused with a code regression.

## Status

3C Mall is a functioning beta application with an actively hardened production architecture. Phase I work is intended to validate technical feasibility, household value, data quality, security controls, and market potential. Prepared documents and code do not substitute for actual pilot evidence, signed letters, external review, or an active grant award.
