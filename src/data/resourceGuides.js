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
];
