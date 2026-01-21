/**
 * legalRoutingHelper.js
 * 
 * Legal Positioning for 3C Mall Grocery Routing
 * Enforces language and behavior that maintains defensible "decision-support platform" posture
 * 
 * Key Principles (DO NOT violate):
 * 1. 3C Mall is NOT a retailer - we route to retailers, never process transactions
 * 2. Prices are ESTIMATED - never guaranteed, subject to retailer variation
 * 3. User always retains choice - routing is informational, not mandatory
 * 4. Data sourced legally - public APIs, official partnerships, published information
 * 5. Affiliate disclosures visible before click-through
 * 6. No steering - user explicitly chooses final destination
 */

// ============================================
// LANGUAGE COMPLIANCE HELPERS
// ============================================

/**
 * Safe language for routing recommendations
 * Replaces strong claims with qualified language
 */
export const SAFE_LANGUAGE = {
  // ❌ DO NOT USE: "cheapest", "best price", "guaranteed", "lowest"
  // ✅ USE INSTEAD:
  
  PRICING_DISCLAIMER: "Estimated pricing based on most recent data. Actual prices may vary by location and availability.",
  
  ROUTING_INTRO: "Based on your selections, here's what we found today:",
  
  // For pricing display
  PRICE_LABEL: "Estimated Total",
  STORE_OPTION: "Shopping Option",
  
  // For ranking/sorting
  LOWEST_ESTIMATE: "lowest estimated total", // NOT "cheapest"
  HIGHEST_ESTIMATE: "highest estimated total", // NOT "most expensive"
  
  // For recommendations
  ROUTER_RECOMMENDATION: "This option shows the lowest estimated total for your current list.",
  ROUTING_DISCLAIMER: "3C Mall estimates outcomes to help you make informed choices. You control the final decision.",
  
  // For affiliates
  AFFILIATE_DISCLOSURE: "Affiliate information disclosed",
  AFFILIATE_BENEFIT: "3C Mall may earn commission when you shop through our links.",
  
  // For data tiering
  TIER_FEATURE: "Store names visible in paid tier",
  TIER_BENEFIT: "Paid subscribers see full store details before selecting",
  
  // For user agency
  USER_ACTION: "You will complete your purchase directly on the retailer's website",
  USER_CHOICE: "Your final store selection",
  
  // For legal positioning
  LEGAL_POSITION: "3C Mall is an independent decision-support and routing platform. We do not sell products, process payments, or control retailer pricing.",
};

// ============================================
// ROUTING BEHAVIOR COMPLIANCE
// ============================================

/**
 * Validates routing metadata for legal compliance
 * Returns object with compliance status and warnings
 */
export function validateRoutingCompliance(routing) {
  const warnings = [];
  
  // Check: No auto-checkout language
  if (routing.description?.toLowerCase().includes("auto-checkout")) {
    warnings.push("Routing should never mention auto-checkout or cart automation");
  }
  
  // Check: No price guarantees
  if (routing.description?.toLowerCase().includes("guarantee") || 
      routing.description?.toLowerCase().includes("guaranteed")) {
    warnings.push("Routing must not guarantee prices - use 'estimated' language");
  }
  
  // Check: No aggressive steering
  if (routing.description?.toLowerCase().includes("must shop") || 
      routing.description?.toLowerCase().includes("should only")) {
    warnings.push("Routing must not force/steer user - user choice must remain paramount");
  }
  
  // Check: Affiliate disclosure required for tiered features
  if (routing.tier === "paid" && !routing.affiliateDisclosure) {
    warnings.push("Paid tier routing must include affiliate disclosure");
  }
  
  return {
    isCompliant: warnings.length === 0,
    warnings,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// PRICING DISPLAY COMPLIANCE
// ============================================

/**
 * Format pricing display with required disclaimers
 * Ensures "estimated" language is always visible
 */
export function formatCompliantPricingDisplay(summary) {
  return {
    ...summary,
    displayLabel: SAFE_LANGUAGE.PRICE_LABEL,
    disclaimer: SAFE_LANGUAGE.PRICING_DISCLAIMER,
    timestamp: `as of ${summary.at}`,
    variabilityWarning: "Prices may differ by location, store, and time.",
  };
}

/**
 * Generate store comparison language
 * Avoids definitive claims, emphasizes user choice
 */
export function generateStoreComparisonText(storeA, totalsA, storeB, totalsB) {
  const diff = Math.abs(Number(totalsA) - Number(totalsB));
  const lower = Number(totalsA) < Number(totalsB) ? storeA : storeB;
  
  return {
    comparison: `${lower} shows the lowest estimated total in today's comparison.`,
    userChoice: `You may still choose any option that works best for you.`,
    disclaimer: SAFE_LANGUAGE.ROUTING_DISCLAIMER,
  };
}

// ============================================
// AFFILIATE DISCLOSURE COMPLIANCE
// ============================================

/**
 * Generates FTC-compliant affiliate disclosure
 * Must be visible BEFORE user clicks through to store
 */
export function generateAffiliateDisclosure(retailer, commission = null) {
  const disclosureText = `
AFFILIATE DISCLOSURE:
3C Mall may earn a commission when you shop through this link. This does not affect your price.
Retailer: ${retailer}
${commission ? `Commission: ${commission}` : ""}
  `.trim();
  
  return {
    disclosure: disclosureText,
    visible: true, // MUST be visible before redirect
    timing: "before_click",
    ftcCompliant: true,
  };
}

// ============================================
// ROUTING DECISION COMPLIANCE
// ============================================

/**
 * Ensure routing respects user agency
 * User makes final choice, not platform
 */
export function ensureUserAgency(routingContext) {
  return {
    platformRecommendation: routingContext.recommendation, // What 3C suggests
    userFinalChoice: null, // User will select
    platformRole: "informational_only",
    userRole: "decision_maker",
    checkpoints: [
      "✓ User builds list",
      "✓ User views estimated options", 
      "✓ User explicitly selects store",
      "✓ User leaves 3C to complete purchase",
    ],
  };
}

/**
 * Generate routing redirect (deep link, not auto-add to cart)
 * User will manually add items to cart on retailer site
 */
export function generateDeepLinkRedirect(retailer, items = []) {
  return {
    redirectType: "deep_link", // NOT auto_checkout
    target: retailer,
    purpose: "User will manually add items and complete checkout",
    items: items.map(i => ({
      name: i.name,
      qty: i.qty,
      note: "User manually adds to cart on retailer site"
    })),
    userAction: "required",
  };
}

// ============================================
// DATA SOURCING COMPLIANCE
// ============================================

/**
 * Documents how data is obtained (defensible positioning)
 * Never: Aggressive scraping, IFTTT bots, credential automation
 * Always: Public APIs, published feeds, official partnerships
 */
export const DATA_SOURCING_COMPLIANCE = {
  kroger: {
    method: "Official Kroger Products API (OAuth2)",
    legal: true,
    disclosure: "Data from Kroger's official public API",
  },
  walmart: {
    method: "Walmart Order Integration API (partnership-based)",
    legal: true,
    disclosure: "Data from Walmart's authorized integration",
  },
  public: {
    method: "Publicly available information (websites, feeds)",
    legal: true,
    disclosure: "Data from public sources",
  },
  scraping: {
    method: "Web scraping", // ⚠️ USE WITH EXTREME CAUTION
    legal: false, // Unless explicitly permitted by ToS
    disclosure: "⚠️ Scraping violates most retailer ToS - avoid",
  },
  automation: {
    method: "Bot/automation for checkout",
    legal: false, // Violates ToS + potentially computer fraud laws
    disclosure: "⚠️ Automated checkout violates retailer ToS - forbidden",
  },
};

// ============================================
// TIER FEATURE COMPLIANCE (Free vs Paid)
// ============================================

/**
 * Free Tier: Anonymous routing
 * Legal justification: No store steering possible with anonymous options
 */
export const FREE_TIER_COMPLIANCE = {
  stores: ["Option A", "Option B", "Option C"], // Anonymous
  rationale: "Anonymity prevents steering and reinforces neutrality",
  affiliate: "Affiliate relationship only revealed at redirect (post-choice)",
  legal: "Fully compliant - user cannot be steered to preferred affiliate",
};

/**
 * Paid Tier: Named stores
 * Legal justification: User pays for transparency; affiliate disclosed upfront
 */
export const PAID_TIER_COMPLIANCE = {
  stores: ["Kroger", "Walmart", "Costco"], // Named
  affiliateDisclosure: "visible before user selects",
  rationale: "Paid users expect full transparency; affiliates disclosed",
  legal: "Compliant if disclosures shown before click",
};

// ============================================
// ROUTING METADATA GENERATOR
// ============================================

/**
 * Create compliant routing metadata for each store option
 */
export function createCompliantRoutingOption(store, total, tier = "free") {
  const base = {
    storeName: tier === "free" ? null : store.name, // Null for free tier
    storeId: store.id,
    estimatedTotal: total,
    displayTotal: `$${Number(total).toFixed(2)}`,
    label: tier === "free" ? "Option " + String.fromCharCode(65 + Math.random() * 3) : store.name,
    disclaimer: SAFE_LANGUAGE.PRICING_DISCLAIMER,
    timestamp: `as of ${new Date().toISOString()}`,
  };
  
  if (tier === "paid") {
    base.affiliateDisclosure = generateAffiliateDisclosure(store.name);
  }
  
  return base;
}

export default {
  SAFE_LANGUAGE,
  validateRoutingCompliance,
  formatCompliantPricingDisplay,
  generateStoreComparisonText,
  generateAffiliateDisclosure,
  ensureUserAgency,
  generateDeepLinkRedirect,
  DATA_SOURCING_COMPLIANCE,
  FREE_TIER_COMPLIANCE,
  PAID_TIER_COMPLIANCE,
  createCompliantRoutingOption,
};
