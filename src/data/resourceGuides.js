export const RESOURCE_GUIDES = {
  "budget-meal-planning": {
    slug: "budget-meal-planning",
    eyebrow: "Household planning guide",
    title: "Budget meal planning: build a weekly grocery plan",
    summary:
      "A useful meal plan starts with the money, time, food, and people you are actually working with—not a perfect menu that falls apart by Wednesday.",
    readingTime: "7-minute read",
    sections: [
      {
        heading: "Start with one weekly number",
        paragraphs: [
          "Choose the amount available for groceries before selecting recipes. A weekly number is usually easier to manage than one large monthly total because it gives you a clear limit for the next shopping trip.",
          "Separate items that must come from the grocery budget from costs handled elsewhere. That keeps household supplies, delivery fees, and special-event purchases from quietly consuming the money intended for meals.",
        ],
        bullets: [
          "Set a realistic weekly grocery amount.",
          "Reserve a small buffer for price changes or an unexpected replacement.",
          "Decide whether household supplies are included in the same number.",
        ],
      },
      {
        heading: "Check your household before choosing meals",
        paragraphs: [
          "List how many people will eat at home, which days are busy, and whether anyone needs a different portion, texture, or ingredient. This prevents buying food for meals that no one has time to prepare.",
          "A practical plan may include two cooked dinners, one leftovers night, one quick meal, and flexible breakfasts or lunches. The best schedule is the one your household can follow.",
        ],
      },
      {
        heading: "Use what you already have",
        paragraphs: [
          "Check the refrigerator, freezer, and pantry before adding ingredients. Start with food that should be used soon, then choose meals that share ingredients. A bag of onions, a package of tortillas, or cooked chicken can support more than one meal when the plan is connected.",
        ],
        bullets: [
          "Mark ingredients already available.",
          "Prioritize food that may expire first.",
          "Reuse ingredients across two or more meals.",
          "Keep one low-effort backup meal available.",
        ],
      },
      {
        heading: "Build one list, then check the total",
        paragraphs: [
          "Combine meal ingredients and everyday household grocery needs into one list. Review package sizes and unit prices before deciding that the lowest shelf price is the best value.",
          "When the estimated total is above budget, adjust the plan instead of hoping the checkout total works out. Remove low-priority extras, select a smaller package, swap one meal, or move a nonurgent purchase to the following week.",
        ],
      },
      {
        heading: "A simple example",
        paragraphs: [
          "Suppose a household has a $150 weekly grocery budget. It may reserve $15 as a buffer, plan meals against the remaining $135, and review the list before shopping. If the estimate reaches $142 before the buffer, the household can replace one higher-cost meal or delay a nonessential item.",
          "The goal is not to make every week identical. The goal is to make the tradeoffs visible early enough to choose deliberately.",
        ],
      },
    ],
    related: ["grocery-unit-price-calculator", "compare-grocery-prices"],
  },
  "grocery-unit-price-calculator": {
    slug: "grocery-unit-price-calculator",
    eyebrow: "Free grocery calculator",
    title: "Grocery unit price calculator and package comparison",
    summary:
      "Compare packages using the price per ounce, pound, gram, or item instead of relying only on the shelf price.",
    readingTime: "5-minute read",
    calculator: true,
    sections: [
      {
        heading: "What unit price tells you",
        paragraphs: [
          "Unit price converts packages of different sizes into the same measurement. Divide the package price by the number of ounces, pounds, grams, or items in the package. The lower result costs less for each unit.",
          "For example, a $6.00 package containing 24 ounces costs $0.25 per ounce. A $4.50 package containing 15 ounces costs $0.30 per ounce. The larger package has the higher shelf price but the lower unit price.",
        ],
      },
      {
        heading: "When the lower unit price is not the better purchase",
        paragraphs: [
          "Unit price measures value, but it does not decide whether the package fits your household. A larger package can waste money when food expires, storage is limited, or the purchase pushes the weekly total above budget.",
        ],
        bullets: [
          "Choose the quantity your household is likely to use.",
          "Check whether the product can be frozen or stored safely.",
          "Consider whether a promotion requires buying more than you need.",
          "Keep the total basket cost within the available budget.",
        ],
      },
      {
        heading: "Compare matching measurements",
        paragraphs: [
          "Both packages must use the same measurement. Convert pounds to ounces before comparing a 2-pound package with a 24-ounce package. One pound equals 16 ounces, so 2 pounds equals 32 ounces.",
          "Item-count comparisons work well for products such as trash bags, diapers, snack packs, or paper products when the individual items are reasonably similar.",
        ],
      },
      {
        heading: "Use unit price as one decision signal",
        paragraphs: [
          "The strongest shopping decision combines unit price, package suitability, product preference, available promotions, and the total cost of the shopping plan. 3C Mall is designed around that broader decision instead of treating one number as the complete answer.",
        ],
      },
    ],
    related: ["budget-meal-planning", "compare-grocery-prices"],
  },
  "compare-grocery-prices": {
    slug: "compare-grocery-prices",
    eyebrow: "Grocery comparison guide",
    title: "How to compare grocery prices across stores",
    summary:
      "The cheapest individual item does not always create the lowest-cost shopping trip. Compare the full basket and the effort required to complete it.",
    readingTime: "6-minute read",
    sections: [
      {
        heading: "Compare the same product details",
        paragraphs: [
          "Match the brand or quality level, package size, quantity, and unit of measurement. A store may appear cheaper because the displayed package is smaller or contains fewer items.",
          "When exact matches are unavailable, label the comparison as an estimate and identify the substitution. That keeps a lower total from hiding a meaningful product difference.",
        ],
      },
      {
        heading: "Calculate the basket total",
        paragraphs: [
          "Add the products your household actually needs at each store. A store with the lowest price on several visible items may still have a higher total for the complete list.",
          "Separate confirmed prices from estimates, and note whether a price requires a membership, digital coupon, minimum purchase, or specific pickup method.",
        ],
        bullets: [
          "Use the same shopping list for every store.",
          "Include required quantities, not only one unit of each item.",
          "Apply promotions only when the household qualifies.",
          "Review unavailable items and substitutions before selecting a winner.",
        ],
      },
      {
        heading: "Account for the trip itself",
        paragraphs: [
          "A second store may reduce the basket price but add fuel, travel time, delivery fees, tips, or another minimum order. Compare the expected savings with the additional effort and cost.",
          "Sometimes one recommended store with reasonable substitutions is the better household decision. A multi-store route is most useful when the expected savings or product requirements clearly justify the additional trip.",
        ],
      },
      {
        heading: "Treat online prices as estimates until checkout",
        paragraphs: [
          "Retail prices, availability, taxes, fees, and promotions can change. Confirm the final product, quantity, price, and fulfillment method in the retailer's cart before ordering or traveling.",
          "A comparison tool should help you narrow the choices and understand tradeoffs. The retailer remains the source of the final transaction price.",
        ],
      },
      {
        heading: "Choose the option that fits the household",
        paragraphs: [
          "The best result may be the lowest basket total, the fewest substitutions, the shortest trip, or the best balance of all three. Make that priority explicit before comparing stores so the recommendation reflects what matters to your household.",
        ],
      },
    ],
    related: ["budget-meal-planning", "grocery-unit-price-calculator"],
  },
  "meal-planning-app-with-grocery-list": {
    slug: "meal-planning-app-with-grocery-list",
    eyebrow: "App selection guide",
    title: "Meal planning app with a grocery list: what to compare before switching",
    summary:
      "A long feature list does not guarantee a simpler grocery week. Compare how an app carries your household context from meal planning into the shopping list, budget, value checks, and final store decision.",
    readingTime: "8-minute read",
    sections: [
      {
        heading: "Start with the workflow you actually need",
        paragraphs: [
          "Meal-planning apps can solve very different problems. Some are strongest at recipe storage, some at shared lists, some at nutrition planning, and some at store-price comparison. Before switching, write down the steps you use every week and identify where information currently gets copied, lost, or rebuilt.",
          "For a household trying to control grocery spending, the important question is not only whether an app can make a meal plan. It is whether the plan can move into a usable grocery list while keeping budget, package value, and shopping decisions visible.",
        ],
      },
      {
        heading: "Compare the parts that affect the whole trip",
        paragraphs: [
          "Use the same criteria for every app you evaluate. That makes it easier to separate a polished feature page from the workflow your household will actually use.",
        ],
        table: {
          headers: ["Capability", "Why it matters", "What to verify"],
          rows: [
            [
              "Household and budget context",
              "Meals and purchases need to fit the people and amount you are planning for.",
              "Can the app keep household preferences and a grocery target visible while planning?",
            ],
            [
              "Meal-to-list handoff",
              "Rebuilding ingredients manually creates duplicate work and forgotten items.",
              "Can selected meals move into one editable shopping list?",
            ],
            [
              "Unit and package comparison",
              "The lowest shelf price can hide a smaller package or higher unit cost.",
              "Can you compare like-for-like quantities instead of price tags alone?",
            ],
            [
              "Store and fulfillment context",
              "A lower basket estimate can be offset by substitutions, travel, pickup, or delivery costs.",
              "Does the app explain what is estimated and what the retailer confirms?",
            ],
            [
              "Household sharing",
              "A plan breaks down when only one person can see or update it.",
              "Can the people who shop or cook stay synchronized?",
            ],
            [
              "Data portability",
              "Service changes, device changes, or shutdowns should not trap your planning history.",
              "Can you export or otherwise preserve recipes, lists, and account information you rely on?",
            ],
          ],
        },
      },
      {
        heading: "Plan for service changes before they become urgent",
        paragraphs: [
          "Mealime currently states that it will shut down on October 21, 2026. That does not make every other meal-planning app a direct replacement; it does make portability and workflow fit more important for people deciding where to move their planning next.",
          "If a service you use is changing or closing, first preserve the information you can export, list the features you actually use, and separate must-have functions from nice-to-have extras. Then test the replacement with one real week of meals and groceries before rebuilding everything around it.",
        ],
        bullets: [
          "Preserve recipes, lists, notes, and account information where export tools are available.",
          "Write down the three to five steps you use every week.",
          "Test one complete planning-to-shopping cycle before committing to a new workflow.",
          "Check price, platform support, household sharing, and cancellation terms separately.",
        ],
      },
      {
        heading: "Current products emphasize different strengths",
        paragraphs: [
          "Current products illustrate why the category is not one-size-fits-all. AnyList emphasizes shared lists, recipes, and meal planning; Samsung Food combines recipes, meal planning, shopping lists, and optional AI-focused premium tools; Paprika centers recipe management, pantry organization, grocery lists, and meal planning.",
          "Those are useful capabilities, but they do not automatically answer the same question. Compare the whole household workflow you need rather than choosing only by the number of features on a pricing page.",
        ],
      },
      {
        heading: "Where 3C Mall is designed to be different",
        paragraphs: [
          "3C Mall is being built around a connected sequence: household and budget, meals, one shopping list, unit and package-value clarity, available store estimates, and a user-controlled shopping decision. The goal is to reduce the number of times the same household context has to be recreated across separate tools.",
          "3C Mall is still in closed beta, and store information can remain estimated until a retailer confirms the final cart. That boundary matters: a planning tool should make tradeoffs clearer without pretending it controls retailer inventory, price, or fulfillment.",
        ],
      },
    ],
    sources: [
      {
        label: "Mealime — shutdown notice and product overview",
        url: "https://www.mealime.com/",
      },
      {
        label: "AnyList — current feature comparison",
        url: "https://www.anylist.com/features",
      },
      {
        label: "Samsung Food — meal planning and Food+ features",
        url: "https://samsungfood.com/food-plus/",
      },
      {
        label: "Paprika Recipe Manager 3 — App Store feature listing",
        url: "https://apps.apple.com/us/app/paprika-recipe-manager-3/id1303222868",
      },
    ],
    related: [
      "budget-meal-planning",
      "grocery-unit-price-calculator",
      "compare-grocery-prices",
    ],
  },
};

export const RESOURCE_CARDS = [
  {
    slug: "budget-meal-planning",
    label: "Budget planning",
    title: "Build a weekly meal and grocery plan",
    description:
      "Connect the household schedule, pantry, meal choices, shopping list, and weekly grocery amount.",
  },
  {
    slug: "grocery-unit-price-calculator",
    label: "Free calculator",
    title: "Compare grocery package unit prices",
    description:
      "Calculate price per ounce, pound, gram, or item and compare two package sizes side by side.",
  },
  {
    slug: "compare-grocery-prices",
    label: "Store comparison",
    title: "Compare the full cost of shopping options",
    description:
      "Consider basket totals, package sizes, substitutions, promotions, travel, pickup, and delivery.",
  },
  {
    slug: "meal-planning-app-with-grocery-list",
    label: "App comparison",
    title: "Choose a meal-planning app around the full grocery workflow",
    description:
      "Compare meal-to-list handoff, budget context, unit value, store estimates, sharing, and data portability before switching.",
  },
];
