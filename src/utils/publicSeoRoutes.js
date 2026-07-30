export const MARKETING_ORIGIN = "https://the3cmall.com";
export const APP_ORIGIN = "https://the3cmall.app";
export const DEVELOPER_ORIGIN = "https://ellviisautomations.com";
export const SOCIAL_IMAGE = `${MARKETING_ORIGIN}/brand/3c-mall-entrance.jpg`;

export const INDEX_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
export const PRIVATE_ROBOTS = "noindex, nofollow, noarchive";

const publishedDate = "2026-07-29";

export const SEO_ROUTES = {
  "/": {
    output: "index.html",
    title: "3C Mall | Budget Meal Planning & Grocery Cost Comparison",
    description:
      "Plan meals around your household budget, compare grocery unit prices and store estimates, and build one connected shopping list with 3C Mall.",
    canonical: `${MARKETING_ORIGIN}/`,
    robots: INDEX_ROBOTS,
    schemaType: "home",
    breadcrumbs: [{ name: "Home", url: `${MARKETING_ORIGIN}/` }],
  },
  "/features": {
    output: "features/index.html",
    title: "Meal Planning & Grocery Comparison Features | 3C Mall",
    description:
      "Explore 3C Mall tools for budget meal planning, grocery unit-price comparison, connected shopping lists, household organization, and guided support.",
    canonical: `${MARKETING_ORIGIN}/features`,
    robots: INDEX_ROBOTS,
    schemaType: "webpage",
    breadcrumbs: [
      { name: "Home", url: `${MARKETING_ORIGIN}/` },
      { name: "Features", url: `${MARKETING_ORIGIN}/features` },
    ],
  },
  "/pricing": {
    output: "pricing/index.html",
    title: "3C Mall Pricing | Meal Planning and Grocery Tools",
    description:
      "Compare 3C Mall plans for budget meal planning, grocery cost estimates, household profiles, pickup tools, and optional delivery support.",
    canonical: `${MARKETING_ORIGIN}/pricing`,
    robots: INDEX_ROBOTS,
    schemaType: "pricing",
    breadcrumbs: [
      { name: "Home", url: `${MARKETING_ORIGIN}/` },
      { name: "Pricing", url: `${MARKETING_ORIGIN}/pricing` },
    ],
  },
  "/resources": {
    output: "resources/index.html",
    title: "Grocery Budget & Meal Planning Guides | 3C Mall",
    description:
      "Use practical 3C Mall guides for budget meal planning, grocery unit-price comparison, package-size decisions, and comparing store totals.",
    canonical: `${MARKETING_ORIGIN}/resources`,
    robots: INDEX_ROBOTS,
    schemaType: "collection",
    breadcrumbs: [
      { name: "Home", url: `${MARKETING_ORIGIN}/` },
      { name: "Guides", url: `${MARKETING_ORIGIN}/resources` },
    ],
    hasPart: [
      `${MARKETING_ORIGIN}/resources/budget-meal-planning`,
      `${MARKETING_ORIGIN}/resources/grocery-unit-price-calculator`,
      `${MARKETING_ORIGIN}/resources/compare-grocery-prices`,
    ],
  },
  "/resources/budget-meal-planning": {
    output: "resources/budget-meal-planning/index.html",
    title: "Budget Meal Planning: Build a Weekly Grocery Plan | 3C Mall",
    description:
      "Learn a practical weekly budget meal-planning process that connects household needs, pantry items, meal choices, and one organized grocery list.",
    canonical: `${MARKETING_ORIGIN}/resources/budget-meal-planning`,
    robots: INDEX_ROBOTS,
    schemaType: "article",
    headline: "Budget Meal Planning: Build a Weekly Grocery Plan",
    datePublished: publishedDate,
    dateModified: publishedDate,
    keywords: [
      "budget meal planning",
      "weekly grocery budget",
      "meal plan grocery list",
      "household meal planning",
    ],
    breadcrumbs: [
      { name: "Home", url: `${MARKETING_ORIGIN}/` },
      { name: "Guides", url: `${MARKETING_ORIGIN}/resources` },
      {
        name: "Budget Meal Planning",
        url: `${MARKETING_ORIGIN}/resources/budget-meal-planning`,
      },
    ],
  },
  "/resources/grocery-unit-price-calculator": {
    output: "resources/grocery-unit-price-calculator/index.html",
    title: "Grocery Unit Price Calculator & Package Comparison | 3C Mall",
    description:
      "Compare two grocery package prices by ounce, pound, gram, or item count with a free unit-price calculator and practical buying guidance.",
    canonical: `${MARKETING_ORIGIN}/resources/grocery-unit-price-calculator`,
    robots: INDEX_ROBOTS,
    schemaType: "article",
    headline: "Grocery Unit Price Calculator and Package Comparison Guide",
    datePublished: publishedDate,
    dateModified: publishedDate,
    keywords: [
      "grocery unit price calculator",
      "price per ounce calculator",
      "compare package sizes",
      "grocery price comparison",
    ],
    breadcrumbs: [
      { name: "Home", url: `${MARKETING_ORIGIN}/` },
      { name: "Guides", url: `${MARKETING_ORIGIN}/resources` },
      {
        name: "Unit Price Calculator",
        url: `${MARKETING_ORIGIN}/resources/grocery-unit-price-calculator`,
      },
    ],
  },
  "/resources/compare-grocery-prices": {
    output: "resources/compare-grocery-prices/index.html",
    title: "How to Compare Grocery Prices Across Stores | 3C Mall",
    description:
      "Compare grocery-store totals more accurately by considering unit prices, package sizes, substitutions, travel, pickup, and delivery costs.",
    canonical: `${MARKETING_ORIGIN}/resources/compare-grocery-prices`,
    robots: INDEX_ROBOTS,
    schemaType: "article",
    headline: "How to Compare Grocery Prices Across Stores",
    datePublished: publishedDate,
    dateModified: publishedDate,
    keywords: [
      "compare grocery prices",
      "grocery store price comparison",
      "compare grocery basket totals",
      "grocery shopping costs",
    ],
    breadcrumbs: [
      { name: "Home", url: `${MARKETING_ORIGIN}/` },
      { name: "Guides", url: `${MARKETING_ORIGIN}/resources` },
      {
        name: "Compare Grocery Prices",
        url: `${MARKETING_ORIGIN}/resources/compare-grocery-prices`,
      },
    ],
  },
  "/terms": {
    output: "terms/index.html",
    title: "Terms of Service | 3C Mall",
    description:
      "Review the terms that govern access to and use of the 3C Mall website and lifestyle planning application.",
    canonical: `${MARKETING_ORIGIN}/terms`,
    robots: INDEX_ROBOTS,
    schemaType: "webpage",
    breadcrumbs: [
      { name: "Home", url: `${MARKETING_ORIGIN}/` },
      { name: "Terms of Service", url: `${MARKETING_ORIGIN}/terms` },
    ],
  },
  "/privacy": {
    output: "privacy/index.html",
    title: "Privacy Policy | 3C Mall",
    description:
      "Learn how 3C Mall handles account, household, grocery planning, and application data.",
    canonical: `${MARKETING_ORIGIN}/privacy`,
    robots: INDEX_ROBOTS,
    schemaType: "webpage",
    breadcrumbs: [
      { name: "Home", url: `${MARKETING_ORIGIN}/` },
      { name: "Privacy Policy", url: `${MARKETING_ORIGIN}/privacy` },
    ],
  },
  "/login": {
    output: "login/index.html",
    title: "Sign In | 3C Mall",
    description: "Secure sign-in for the 3C Mall application.",
    canonical: `${APP_ORIGIN}/login`,
    robots: PRIVATE_ROBOTS,
    schemaType: null,
  },
  "/app": {
    output: "app/index.html",
    title: "3C Mall App",
    description:
      "Secure access to the 3C Mall meal planning and grocery organization application.",
    canonical: `${APP_ORIGIN}/app`,
    robots: PRIVATE_ROBOTS,
    schemaType: null,
  },
};

export const INDEXABLE_ROUTES = Object.fromEntries(
  Object.entries(SEO_ROUTES).filter(([, metadata]) => metadata.robots === INDEX_ROBOTS),
);

export const INDEXABLE_ROUTE_PATHS = Object.keys(INDEXABLE_ROUTES);
export const SEO_ROUTE_ENTRIES = Object.entries(SEO_ROUTES);
