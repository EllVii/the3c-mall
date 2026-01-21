# Grocery Routing: Developer's Legal Quick Ref

**Last Updated:** January 21, 2026  
**For:** Frontend & Backend Developers  
**Purpose:** Ensure all new features maintain legal compliance

---

## Golden Rule

> **3C Mall is a DECISION-SUPPORT platform, not a RETAILER.**
>
> - ✅ We show estimates
> - ✅ We suggest options
> - ✅ We provide information
> - ❌ We do NOT guarantee prices
> - ❌ We do NOT auto-route users
> - ❌ We do NOT process transactions

---

## DO's and DON'Ts Checklist

### When Writing UI Copy

| Avoid (❌) | Use Instead (✅) |
|---|---|
| "Best price" | "Lowest estimated total" |
| "Cheapest store" | "Lowest estimate among your selected stores" |
| "Guaranteed" | "Estimated" |
| "We sell" | "We help you compare" |
| "Buy now" | "Continue to [retailer]" |
| "Let 3C route for you" | "Based on your selections, here's what we found" |
| "Saves you $X" | "Shows a difference of $X compared to..." |
| "Best deals" | "Estimated options based on today's data" |
| "Our lowest price" | "Lowest estimated total in your list" |

### When Writing Code

```javascript
// ❌ DON'T: Hard-code "best" or "cheapest"
const label = "Best Store";
const copy = "Shop at the cheapest store";

// ✅ DO: Import from SAFE_LANGUAGE constants
import { SAFE_LANGUAGE } from "../utils/legalRoutingHelper";
const label = "Lowest Estimate";
const copy = SAFE_LANGUAGE.ROUTING_DISCLAIMER;
```

### When Displaying Prices

```javascript
// ❌ DON'T: Display prices without context
<span>${total}</span>

// ✅ DO: Include disclaimer and timestamp
<div>
  <span>{SAFE_LANGUAGE.PRICE_LABEL}: ${total}</span>
  <small>{SAFE_LANGUAGE.PRICING_DISCLAIMER}</small>
  <small>as of {timestamp}</small>
</div>
```

### When Routing Users to Retailers

```javascript
// ❌ DON'T: Auto-add items to cart or auto-checkout
const redirectUrl = `https://retailer.com/checkout?items=${cartItems}`;

// ✅ DO: Create deep link; user adds items manually
const redirectUrl = `https://retailer.com/search?q=${itemNames}`;
// User will manually add items to cart
```

---

## Required Implementation Pattern

### Every Routing Feature Must Include:

#### 1. Import Compliance Helpers
```javascript
import { SAFE_LANGUAGE, validateRoutingCompliance } from "../utils/legalRoutingHelper";
```

#### 2. Validate Compliance
```javascript
const routing = { /* your routing logic */ };
const compliance = validateRoutingCompliance(routing);
if (!compliance.isCompliant) {
  console.warn("Compliance warnings:", compliance.warnings);
}
```

#### 3. Format Output Compliantly
```javascript
// Add disclaimer, timestamp, variability warning
const compliantDisplay = formatCompliantPricingDisplay(summary);
```

#### 4. Preserve User Agency
```javascript
// User builds → selects → completes
// Never auto-select, auto-route, or auto-checkout
const userChoice = selectStore(options); // User selects
const deepLink = generateDeepLink(userChoice); // We provide link
// User completes purchase on retailer site
```

---

## Affiliate Disclosure Pattern

### Free Tier (Anonymized Stores)
```javascript
// User sees: "Option A", "Option B", "Option C"
// Rationale: No affiliate can be favored (identity hidden)
// Legal: Compliant (no steering possible)
const storeDisplay = anonymizedOptions; // ["Option A", "Option B", "Option C"]
```

### Paid Tier (Named Stores with Disclosure)
```javascript
// User sees: "Kroger", "Walmart", "Costco"
// BEFORE user clicks, show:
const disclosure = generateAffiliateDisclosure("Kroger");
// "AFFILIATE DISCLOSURE: 3C Mall may earn a commission... 
//  This does not affect your price."
// Legal: Compliant (disclosure before click, user choice maintained)
```

---

## Data Sourcing Requirements

### Legal Sources (Use These)
- ✅ Kroger API (OAuth2)
- ✅ Walmart Integration API (partnership)
- ✅ Public pricing feeds
- ✅ Published retailer information

### Prohibited Sources (Never Use)
- ❌ Web scraping retailer sites
- ❌ Bot/automation for cart access
- ❌ Headless browser automation
- ❌ Credential-based access
- ❌ Terms-of-Service violations

---

## Common Scenarios

### Scenario 1: Adding a New Store
```javascript
// New store to include in comparisons

// ✅ DO:
const newStore = {
  id: "newStore",
  name: "New Store",
  dataSource: "Official API", // Document legal sourcing
  affiliateProgram: true,
  disclosureRequired: true
};

// Verify pricing is estimated, not guaranteed
const prices = newStore.prices; // Marked as "estimated"
```

### Scenario 2: Changing Routing Algorithm
```javascript
// Before deployment, verify:

// ✅ All prices marked as "estimated"
console.assert(summary.label.includes("Estimated"));

// ✅ User choice not removed
console.assert(userCanSelectAnyStore === true);

// ✅ No auto-routing
console.assert(userMustClickToRoute === true);

// ✅ Affiliate disclosure visible before redirect
console.assert(affiliateDisclosureVisible === true);
```

### Scenario 3: Displaying "Winner" / Recommended Store
```javascript
// Show recommended option without steering

// ✅ DO:
<div>
  <label>{SAFE_LANGUAGE.LOWEST_ESTIMATE}</label>
  <span>{recommendedStore.name}</span>
  <p>{SAFE_LANGUAGE.ROUTING_DISCLAIMER}</p>
  <button onClick={handleUserSelectsStore}> {/* User action */}
    Continue to {recommendedStore.name}
  </button>
</div>

// Note: User can still select other options
```

---

## Testing Before Deployment

### Code Review Checklist
- [ ] No forbidden language in UI copy
- [ ] All prices marked as "estimated"
- [ ] Pricing includes disclaimers and timestamps
- [ ] User can select any store (not just recommended)
- [ ] Affiliate disclosure visible before redirect (paid tier)
- [ ] Deep link, not auto-checkout

### Manual QA Checklist
- [ ] Free tier shows anonymized options
- [ ] Paid tier shows store names
- [ ] Affiliate disclosure visible before redirect (paid)
- [ ] Deep link opens retailer in new tab
- [ ] User can view all options without selecting
- [ ] Pricing shown as "estimated", not "guaranteed"
- [ ] Back button works (user can change store selection)

### Legal Verification Checklist
- [ ] No price guarantees made
- [ ] User makes final store selection
- [ ] User completes purchase off-platform
- [ ] 3C receives no payment
- [ ] 3C processes no transaction
- [ ] Data sourced legally (API, not scraping)
- [ ] Affiliate disclosed (paid tier)

---

## When You Need Help

### Question: "Can I add language like 'best price' to this feature?"
**Answer:** No. Use `SAFE_LANGUAGE` constants instead. See DO's/DON'Ts table above.

### Question: "Can I auto-select the cheapest store?"
**Answer:** No. User must explicitly select store. Platform role is informational only.

### Question: "Can I add a 'checkout' button?"
**Answer:** No. Only deep links to retailer. User manually adds items and checks out on retailer site.

### Question: "What if a retailer asks us to hide their name?"
**Answer:** Keep them anonymous in free tier. In paid tier, their name is visible (but only to paid users who expect transparency).

### Question: "Can we scrape prices instead of using APIs?"
**Answer:** No. Scraping violates terms of service and is legally risky. Use official APIs, partnerships, or public feeds only.

### Reference: See `GROCERY_ROUTING_LEGAL_COMPLIANCE.md` for full legal analysis and attorney-reviewed positioning.

---

## Quick Links

- **Legal Analysis:** [`GROCERY_ROUTING_LEGAL_COMPLIANCE.md`](./GROCERY_ROUTING_LEGAL_COMPLIANCE.md)
- **Compliance Helpers:** [`src/utils/legalRoutingHelper.js`](./src/utils/legalRoutingHelper.js)
- **Main UI:** [`src/pages/GroceryLabPage.jsx`](./src/pages/GroceryLabPage.jsx)
- **Pricing Logic:** [`src/utils/groceryPricingTest.js`](./src/utils/groceryPricingTest.js)
- **Onboarding:** [`src/assets/components/OnboardingTour.jsx`](./src/assets/components/OnboardingTour.jsx)
- **Pricing Page:** [`src/pages/Pricing.jsx`](./src/pages/Pricing.jsx)

---

## Version History

| Date | Version | Changes |
|---|---|---|
| Jan 21, 2026 | 1.0 | Initial implementation: compliance helpers, UI updates, documentation |
| | | - Created legalRoutingHelper.js with SAFE_LANGUAGE constants |
| | | - Updated GroceryLabPage, OnboardingTour, Pricing page |
| | | - Added GROCERY_ROUTING_LEGAL_COMPLIANCE.md |

---

**Last Updated:** January 21, 2026  
**Status:** ✅ PRODUCTION READY  
**Maintained By:** Development Team
