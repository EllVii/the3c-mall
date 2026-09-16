# 3C Mall Growth-Lens Scorecard

Audit date: 2026-09-16

This scorecard is an internal product/marketing audit, not a Google, Bing, app-store, or AI-platform ranking. Scores measure how complete and synchronized the current 3C Mall public experience is against the stated product architecture and customer journey.

## Ranked growth lenses

| Rank | Lens | Score | Current reason |
| ---: | --- | ---: | --- |
| 1 | UX | 9.6/10 | Clear household → meals → list → comparison journey; responsive desktop/tablet/phone/PWA architecture; protected app remains separate from public discovery. |
| 2 | SEO | 9.5/10 | Crawlable static public routes, canonicals, sitemap, structured data, resource hub, calculator, About entity page, private noindex boundaries, and CI validation. |
| 3 | Design | 9.5/10 | Consistent premium black/navy, gold, teal, and cream visual language with responsive layouts and accessible interaction states. |
| 4 | SXO | 9.4/10 | Search pages answer the intent before beta conversion, resources provide value without an account, and CTAs stay secondary to the requested information. |
| 5 | AEO | 9.4/10 | Direct visible answers, descriptive headings, comparison tables, product boundaries, and question-oriented resource content. |
| 6 | CI | 9.4/10 | 3C Mall naming, Concierge · Cost · Community language, product boundaries, developer identity, and visual system are consistent across marketing and app surfaces. |
| 7 | AIO | 9.3/10 | Stable entity language, crawlable explanatory text, dated articles, evidence links, structured data matching visible content, and measurable Bing AI citation strategy. |
| 8 | PR | 9.2/10 | Claims are conservative, retailer-controlled facts are separated from estimates, beta pricing is described as planned, and current market commentary is source-backed. |
| 9 | GEO | 9.2/10 | Strong retrieval/citation foundation with original guides, calculator, entity consistency, references, and structured pages; independent authority remains the primary growth gap. |
| 10 | CMA | 9.1/10 | Competitive category differences and a current switching opportunity are now explicit; broader awareness, proof, and third-party authority remain the biggest upside. |

## One synchronized product truth

Every public lens should reinforce the same core statement:

> 3C Mall is a connected household grocery-planning and decision-support platform that carries household and budget context through meals, one shopping list, unit/package-value checks, available store estimates, and a user-controlled final shopping decision.

Operational trust pattern:

- **3C Mall organizes** — household context, plans, ingredients, lists, and comparison inputs.
- **3C Mall estimates** — package/store comparisons when source data supports them.
- **Retailer confirms** — final price, availability, substitutions, checkout, pickup/delivery, and fulfillment.

## Synchronization matrix

| Lens | Must reinforce | Must not contradict |
| --- | --- | --- |
| CI | one brand, one product definition, one visual language | alternate product identities or unrelated slogans |
| CS | clear next step, limitations, and recovery path | internal infrastructure jargon in customer flows |
| CX | household-first journey and confidence | surprise fees, hidden assumptions, or false success states |
| UX | progressive task flow and responsive navigation | feature dumping or competing primary actions |
| UI | premium but readable responsive presentation | decorative complexity that hides the next action |
| TW | plain English, estimate/retailer boundary, current architecture | retired Supabase/Render language as production truth |
| PR | evidence-backed claims and current beta status | guaranteed savings, retailer affiliation, or active-paid claims without proof |
| AIO | stable entity descriptions, evidence, dates, tables, sources | hidden AI-only copy or unsupported authority claims |
| SXO | query → useful answer → trust → next action | ranking-focused pages with weak customer value |
| AEO | concise answers to real questions | thin FAQ farms or duplicated question pages |
| GEO | original useful pages that can be cited | invented citations, statistics, or partnerships |
| SEO | crawlability, intent, internal linking, technical consistency | indexable private app/account pages or metadata drift |
| CMA | explain the connected workflow versus category alternatives | declaring a universal competitor winner or copying competitor positioning |

## Changes in this pass and cause/effect

### 1. Planned pricing removed from active Offer schema

**Cause:** The public Pricing page states that membership prices are planned and closed-beta access does not start billing, while JSON-LD represented Basic, Pro, and Family prices as active `Offer` objects.

**Effect:** Search/AI systems could interpret unreleased pricing as a current commercial offer, creating PR, TW, SEO, and customer-expectation drift.

**Change:** Keep the application/service entity and household audience, but do not emit active price offers until paid enrollment is actually available.

### 2. New app-selection resource

**Cause:** 3C Mall explained features well but visitors still had to infer how it differs from meal-planning apps, shared-list apps, and price-comparison tools.

**Effect:** A customer could understand individual features without understanding why the connected workflow matters.

**Change:** Add a source-backed guide that compares workflow criteria: household/budget context, meal-to-list handoff, unit value, store/fulfillment context, sharing, and data portability.

### 3. Current market opportunity made useful

**Cause:** Mealime currently states that it will shut down on October 21, 2026.

**Effect:** People evaluating where to move their planning workflow have a time-sensitive information need.

**Change:** Address switching and portability as a practical customer problem rather than using competitor shutdown news as an aggressive sales claim.

### 4. Article date drift removed

**Cause:** Resource articles displayed a hard-coded July 29, 2026 publication date even when route metadata could contain a different publication date.

**Effect:** Visible TW could disagree with Article structured data and freshness signals.

**Change:** Render visible publication/update dates from the same `SEO_ROUTES` metadata source used for schema and static SEO generation.

### 5. Four-card resource layout balanced

**Cause:** Adding a fourth guide to a three-column desktop grid would leave a visually orphaned final card.

**Effect:** The expanded content hub would look less intentional even though the content was stronger.

**Change:** Use a 2×2 desktop grid and retain one-column mobile behavior.

## Highest-value opportunities still available

1. **First-party evidence:** publish anonymized pilot findings only after real data, consent, and methodology exist. This is the strongest combined SEO/AEO/GEO/PR opportunity.
2. **Independent authority:** pursue legitimate citations from community organizations, researchers, food/nutrition professionals, entrepreneurship programs, local media, and relevant directories.
3. **Visual product proof:** add curated screenshots or a short task walkthrough showing household setup → meal → list → comparison. This strengthens Design, UX, CX, PR, and conversion without adding product complexity.
4. **Search/AI measurement:** connect reporting from Google Search Console and Bing Webmaster Tools AI Performance so citations, grounding queries, indexed pages, clicks, and resource-to-beta conversion can be reviewed together.
5. **Migration utility:** consider a future recipe/list import or structured onboarding path for users leaving another planning service. Do not promise direct migration until an actual import path exists.
6. **Price-value proof:** planned Pro/Family pricing needs evidence that the connected budget/comparison/concierge workflow delivers value beyond low-cost list/recipe apps. Use beta evidence rather than lowering price reflexively.
7. **Portable household data:** define export/download expectations before broad launch. Data portability is both a trust feature and a competitive differentiator.
8. **Methodology page:** when retailer-data coverage becomes mature enough, publish a dedicated page explaining source freshness, matching rules, substitutions, unit normalization, and estimate limitations.

## Production rule

Do not improve one lens by damaging another. Every material public change should be checked against the full chain:

`CI → CS → CX → UX → UI → TW → PR → AIO → SXO → AEO → GEO → SEO → CMA`

The chain is intentionally customer-first. Search and marketability should amplify the product truth, not rewrite it.
