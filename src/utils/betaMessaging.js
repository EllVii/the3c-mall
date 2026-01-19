/**
 * Beta Messaging Constants
 * Single source of truth for all beta-related copy across the app
 * Updated: January 17, 2026
 */

export const betaMessaging = {
  // 1 App badge / small UI label (top bar, pricing panel, or footer)
  appBadge: {
    label: 'Beta · Limited Data Mode',
    tooltip: 'Some pricing and store integrations are expanding as partner APIs come online.',
  },

  // 2 First-time onboarding screen
  onboarding: {
    title: 'Welcome to 3C Mall (Beta)',
    description: `You're testing the core experience while additional grocery store integrations — including Kroger — are being finalized.`,
    highlights: [
      'Everything you see reflects real decision logic.',
      'Pricing coverage and store availability will continue expanding as partner APIs go live.',
      'Your feedback helps shape what launches next.',
    ],
  },

  // 3 Concierge intro copy
  concierge: {
    greeting: "Hi — I'm your 3C Concierge.",
    intro: 'I help reduce decision fatigue by guiding grocery choices, costs, and routines — all in one place.',
    betaFocus: 'During beta, I\'ll focus on:',
    betaFeatures: [
      'Smart comparisons',
      'Clear trade-offs',
      'Time and cost awareness',
    ],
    growth: "As more stores connect, I'll get even better.",
  },

  // 4 Grocery Lab pricing disclaimer
  groceryLab: {
    title: 'Beta Preview',
    description: `Prices shown reflect current logic and test datasets.
Live retailer pricing will expand as integrations are approved.

Comparisons, routing, and recommendations reflect real behavior.`,
  },

  // 5 Beta tester invite / waitlist confirmation
  betaTesterConfirm: {
    headline: "You're in 🎉",
    subheading: 'This beta focuses on flow, clarity, and confidence — not full retailer coverage yet.',
    mission: 'You\'re helping shape how 3C Mall:',
    missionPoints: [
      'Compares grocery costs',
      'Reduces shopping friction',
      'Connects food, planning, and lifestyle',
    ],
    closing: 'Thanks for building this with us.',
  },

  // 6 Website footer or FAQ
  website: {
    footer: '3C Mall is currently in beta. Some retailer integrations are pending approval. Features and data coverage will continue expanding.',
  },

  // 7 Kroger-safe wording (internal / application use)
  kroger: {
    internal: 'We are currently running a closed beta using internal test datasets and placeholder pricing. Our production architecture is fully prepared to integrate Kroger\'s live APIs upon approval.',
  },

  // Terms to avoid
  avoidTerms: [
    'Emulator',
    'Fake data',
    'Simulated pricing',
    'Mock prices',
  ],

  // Helper: Get avoidance notice
  avoidanceNotice: `You're not faking — you're staging.`,
};

export default betaMessaging;
