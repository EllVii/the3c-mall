/**
 * Alpha-safe Recipe object (local-first, portable to DB later)
 */
export const exampleRecipe = {
  schemaVersion: 1,

  // Identity
  id: "rcp_01HXYZ...",            // safeId() generated
  title: "Grandma's Lasagna",
  description: "Family classic. Comfort meal.",
  createdAt: "2025-12-16T12:34:56.000Z",
  updatedAt: "2025-12-16T12:34:56.000Z",

  // Ownership + scope (Alpha: optional, Beta: link to user)
  owner: {
    userId: null,                 // later: auth user id
    deviceId: null                // optional: local device id
  },
  visibility: "private",          // private | shared | public (later)

  // Source (Alpha: manual only; Beta: imported)
  source: {
    type: "manual",               // manual | url | youtube | tiktok | instagram | partner
    url: null,                    // original link if imported
    provider: null,               // youtube|tiktok|etc
    externalId: null              // provider-specific id
  },

  // Serving + timing (kept simple)
  servings: {
    defaultServings: 6,
    unit: "serving"
  },
  time: {
    prepMinutes: 25,
    cookMinutes: 45
  },

  // Ingredients (normalized enough for grocery)
  ingredients: [
    {
      id: "ing_001",
      name: "ground beef",
      amount: 2,
      unit: "lb",
      form: "90/10",              // optional detail
      category: "Meat",           // Meat|Produce|Pantry|Dairy|Frozen|Other
      tags: ["protein"],
      optional: false,

      // Grocery mapping (Alpha: manual; Beta: search results)
      grocery: {
        canonicalName: "ground beef",
        storeSku: null,
        brand: null
      },

      // Substitutions for “Make it Healthier”
      substitutions: [
        {
          id: "sub_001",
          ruleId: "LOWER_CARB_SWAP",
          name: "zucchini noodles",
          amount: 3,
          unit: "medium",
          reason: "Lower carbs"
        }
      ]
    }
  ],

  // Steps (kept plain text for speed)
  steps: [
    { n: 1, text: "Brown beef and season." },
    { n: 2, text: "Layer sauce, noodles, cheese." },
    { n: 3, text: "Bake until bubbly." }
  ],

  // Nutrition (Alpha: optional; Beta: computed)
  nutrition: {
    perServing: {
      calories: null,
      proteinG: null,
      carbsG: null,
      fatG: null
    }
  },

  // Lifestyle compatibility flags (Alpha: user-set; Beta: inferred)
  lifestyle: {
    tags: ["family", "comfort"],
    compatible: {
      carnivore: false,
      keto: false,
      paleo: false,
      balanced: true
    }
  },

  // “Make it Healthier” transformation metadata
  transform: {
    lastAppliedPreset: null,      // "keto" | "paleo" | "lower_calorie" etc
    delta: {
      removed: [],
      added: [],
      swapped: []
    }
  },

  // UX helpers
  notes: "",
  favorites: false
};