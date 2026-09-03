/**
 * legalRoutingHelper.js
 *
 * Product-positioning helpers for 3C Mall grocery routing.
 * These helpers support a decision-support posture; they are not legal advice
 * and must not be used to represent an integration, partnership, or compliance
 * status that has not been independently verified.
 *
 * Core rules:
 * 1. 3C Mall is not the retailer and does not control retailer checkout.
 * 2. Prices are estimates unless the retailer confirms them.
 * 3. The user retains the final store and purchase choice.
 * 4. Data sources must be authorized for the intended production use.
 * 5. Affiliate relationships must be disclosed clearly before the relevant action.
 */

export const SAFE_LANGUAGE = {
  PRICING_DISCLAIMER:
    "Estimated pricing based on available data. Actual prices may vary by location, time, promotion, availability, substitution, and retailer checkout.",
  ROUTING_INTRO: "Based on the information available, here are the options in this comparison:",
  PRICE_LABEL: "Estimated Total",
  STORE_OPTION: "Shopping Option",
  LOWEST_ESTIMATE: "lowest estimated total",
  HIGHEST_ESTIMATE: "highest estimated total",
  ROUTER_RECOMMENDATION:
    "This option shows the lowest estimated total in the current comparison.",
  ROUTING_DISCLAIMER:
    "3C Mall provides decision-support estimates. Review the retailer's final information before purchasing.",
  AFFILIATE_DISCLOSURE: "Affiliate relationship disclosed",
  AFFILIATE_BENEFIT:
    "3C Mall may earn a commission from an eligible link. Retailer terms and checkout determine your final price.",
  TIER_FEATURE: "Store details available for this plan",
  TIER_BENEFIT: "Available store details are shown before the user makes a selection",
  USER_ACTION: "You complete the final purchase through the retailer or fulfillment provider",
  USER_CHOICE: "Your final store selection",
  LEGAL_POSITION:
    "3C Mall is an independent decision-support platform. It does not sell grocery products, process retailer checkout, or control retailer pricing.",
};

export function validateRoutingCompliance(routing) {
  const warnings = [];
  const description = routing?.description?.toLowerCase() || "";

  if (description.includes("auto-checkout")) {
    warnings.push("Routing should not imply retailer checkout automation unless that capability is specifically authorized and implemented.");
  }

  if (description.includes("guarantee") || description.includes("guaranteed")) {
    warnings.push("Routing must not guarantee retailer prices; use estimated or retailer-confirmed language.");
  }

  if (description.includes("must shop") || description.includes("should only")) {
    warnings.push("Routing should preserve the user's final store and purchase choice.");
  }

  if (routing?.affiliateRelationship && !routing?.affiliateDisclosure) {
    warnings.push("An affiliate relationship requires a clear disclosure before the relevant click or decision.");
  }

  return {
    isCompliant: warnings.length === 0,
    warnings,
    timestamp: new Date().toISOString(),
  };
}

export function formatCompliantPricingDisplay(summary) {
  return {
    ...summary,
    displayLabel: SAFE_LANGUAGE.PRICE_LABEL,
    disclaimer: SAFE_LANGUAGE.PRICING_DISCLAIMER,
    timestamp: `as of ${summary.at}`,
    variabilityWarning:
      "Prices and availability may differ by location, store, promotion, substitution, and time.",
  };
}

export function generateStoreComparisonText(storeA, totalsA, storeB, totalsB) {
  const difference = Math.abs(Number(totalsA) - Number(totalsB));
  const lower = Number(totalsA) < Number(totalsB) ? storeA : storeB;

  return {
    comparison: `${lower} shows the lowest estimated total in this comparison.`,
    estimatedDifference: Number.isFinite(difference) ? difference : null,
    userChoice: "You can still choose any option that works best for your household.",
    disclaimer: SAFE_LANGUAGE.ROUTING_DISCLAIMER,
  };
}

export function generateAffiliateDisclosure(retailer, commission = null) {
  const disclosureText = `
AFFILIATE DISCLOSURE:
3C Mall may earn a commission from an eligible purchase made through this link.
Retailer: ${retailer}
${commission ? `Commission information: ${commission}` : ""}
Retailer terms, offers, and checkout determine your final price.
  `.trim();

  return {
    disclosure: disclosureText,
    visible: true,
    timing: "before_click",
    reviewRequired: true,
  };
}

export function ensureUserAgency(routingContext) {
  return {
    platformRecommendation: routingContext.recommendation,
    userFinalChoice: null,
    platformRole: "decision_support",
    userRole: "decision_maker",
    checkpoints: [
      "User builds or reviews the list",
      "User views available estimates",
      "User selects the store or fulfillment option",
      "Retailer or provider confirms final purchase information",
    ],
  };
}

export function generateDeepLinkRedirect(retailer, items = []) {
  return {
    redirectType: "deep_link",
    target: retailer,
    purpose: "Open an authorized retailer destination for user review",
    items: items.map((item) => ({
      name: item.name,
      qty: item.qty,
      note: "Retailer controls cart availability and checkout behavior",
    })),
    userAction: "required",
  };
}

/**
 * Data-source registry.
 * `authorizationVerified` must only be changed to true when the production
 * right/credential/partner authorization for that source has been documented.
 */
export const DATA_SOURCING_COMPLIANCE = {
  kroger: {
    method: "Kroger API when production credentials and permitted use are configured",
    authorizationVerified: false,
    disclosure: "Use only under the current Kroger API terms and approved production credentials.",
  },
  walmart: {
    method: "Authorized Walmart or approved provider integration when available",
    authorizationVerified: false,
    disclosure: "Do not describe a Walmart partnership or live integration until authorization is documented.",
  },
  public: {
    method: "Publicly accessible information",
    authorizationVerified: false,
    disclosure: "Public accessibility alone does not grant unrestricted reuse; review source terms and applicable rights.",
  },
  scraping: {
    method: "Automated website extraction",
    authorizationVerified: false,
    disclosure: "Do not use in production without documented permission, terms review, and security/privacy review.",
  },
  checkoutAutomation: {
    method: "Automated retailer checkout",
    authorizationVerified: false,
    disclosure: "Not part of the current 3C Mall production posture unless separately authorized and implemented.",
  },
};

export const FREE_TIER_COMPLIANCE = {
  stores: ["Option A", "Option B", "Option C"],
  rationale: "Generic option labels can reduce premature store steering when store identity is intentionally withheld.",
  affiliate: "Any affiliate relationship must still be disclosed before the relevant commercial action.",
  reviewRequired: true,
};

export const PAID_TIER_COMPLIANCE = {
  stores: ["Named store options when data rights allow"],
  affiliateDisclosure: "visible before the relevant click or selection",
  rationale: "Plan level does not remove disclosure or data-authorization requirements.",
  reviewRequired: true,
};

export function createCompliantRoutingOption(store, total, tier = "free") {
  const base = {
    storeName: tier === "free" ? null : store.name,
    storeId: store.id,
    estimatedTotal: total,
    displayTotal: `$${Number(total).toFixed(2)}`,
    label: tier === "free" ? "Shopping option" : store.name,
    disclaimer: SAFE_LANGUAGE.PRICING_DISCLAIMER,
    timestamp: `as of ${new Date().toISOString()}`,
  };

  if (tier === "paid" && store.affiliateRelationship) {
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
