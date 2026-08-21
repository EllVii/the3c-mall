/**
 * Beta Messaging Constants
 * Single source of truth for all beta-related copy across the app
 * Updated: August 21, 2026
 */

export const betaMessaging = {
  // 1 App badge / small UI label (top bar, pricing panel, or footer)
  appBadge: {
    label: 'Beta · Expanding Store Coverage',
    tooltip: 'Store and pricing coverage is expanding throughout the closed beta.',
  },

  // 2 First-time onboarding screen
  onboarding: {
    title: 'Welcome to 3C Mall (Beta)',
    description: `You're testing the core 3C Mall experience while store and pricing coverage continues to expand.`,
    highlights: [
      'Core planning, grocery, and comparison workflows are active.',
      'Retailer coverage will continue expanding throughout beta.',
      'Your feedback helps shape the launch experience.',
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
    growth: "As store coverage expands, I'll get even better.",
  },

  // 4 Grocery Lab pricing disclaimer
  groceryLab: {
    title: 'Beta Estimates',
    description: `Store pricing, promotions, package sizes, and availability can change.
Retailer coverage is expanding throughout beta.

Use comparisons as decision support and review the retailer's final price before purchasing.`,
  },

  // 5 Waitlist confirmation
  betaTesterConfirm: {
    headline: "You're on the waitlist ✓",
    subheading: 'Thanks for requesting access. Closed-beta invitations are released in limited groups as testing capacity expands.',
    mission: 'When invited, your feedback will help shape how 3C Mall:',
    missionPoints: [
      'Compares grocery costs',
      'Reduces shopping friction',
      'Connects food, planning, and lifestyle',
    ],
    closing: 'We’ll use this email for beta invitations and relevant product updates.',
  },

  // 6 Website footer or FAQ
  website: {
    footer: '3C Mall is currently in closed beta. Store and pricing coverage is expanding as we validate the experience with real household workflows.',
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
