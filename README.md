# 3C Mall

3C Mall is a family-centered software platform for grocery comparison, meal planning, and household food decision support.

The project is operated under Ell Vii's Automations LLC. 3C Mall is designed to help users compare estimated grocery options, organize meal plans, and make more informed household food decisions in one guided place.

## Safe Product Positioning

3C Mall is a decision-support platform. It is not a grocery retailer, delivery company, payment processor, medical provider, dietitian replacement, or financial advisor.

The platform may help users:

- compare grocery options and estimated totals,
- plan meals and grocery lists,
- organize household food decisions,
- review options across stores or providers,
- receive general grocery and meal-planning guidance,
- participate in controlled pilot testing and feedback.

Final shopping, checkout, delivery, medical, nutrition, and financial decisions remain with the user and any applicable third-party retailer, provider, or professional.

## Current Technical Direction

3C Mall is built as a React/Vite application. The current project direction is to use Cloudflare infrastructure where practical, including Cloudflare Workers/Pages Functions, Cloudflare D1 for relational data, and Cloudflare R2 for file or image storage when needed.

Any third-party grocery, recipe, mapping, nutrition, or AI data source should be used only through approved APIs, permitted data sources, or documented provider terms.

## Legal Review Lens

When writing code, documentation, marketing copy, or user-facing content for 3C Mall, keep the project inside this lane:

**We help families compare, plan, organize, and decide. We do not act as the store, doctor, dietitian, payment handler, or delivery provider.**

Use these safer phrases:

- estimated grocery comparison,
- meal planning support,
- household food planning,
- user-guided decision support,
- retailer/provider checkout,
- receipt-based pilot reimbursement,
- general wellness and lifestyle information,
- privacy-conscious family testing.

Avoid these risky phrases unless reviewed and approved:

- guaranteed lowest price,
- cheapest,
- medical advice,
- diagnosis,
- prescribed diet,
- we order for you,
- we deliver your groceries,
- breach-proof security,
- guaranteed savings,
- official partner unless a written partnership exists.

## Pilot Use

The early pilot is expected to focus on:

- platform development,
- grocery comparison workflows,
- meal planning workflows,
- pilot family testing,
- receipt-based reimbursement records,
- privacy and consent materials,
- secure development tools,
- documented project logs,
- final pilot findings.

## Development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Documentation Rule

README, Markdown files, internal notes, and public pages should all stay consistent with the safe positioning above. If a document describes 3C Mall as a retailer, delivery company, medical provider, payment processor, or guaranteed savings engine, rewrite it before using it in public or user-facing material.
