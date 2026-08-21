import React from "react";
import { APP_ORIGIN, MARKETING_ORIGIN } from "../utils/publicSeoRoutes.js";
import "../styles/PricingPage.css";

const PLANS = [
  {
    name: "Basic",
    price: "$0",
    period: "",
    audience: "For trying the core planning flow",
    summary: "A simple starting point for meal planning and grocery organization.",
    features: [
      "Core meal-planning workflow",
      "Connected meal-to-grocery handoff",
      "Basic Grocery Lab tools",
      "Saved household settings",
    ],
  },
  {
    name: "Pro",
    price: "$14.99",
    period: "/month",
    audience: "For individuals using the full workflow",
    summary: "More planning depth, comparison tools, and saved workflows for regular use.",
    features: [
      "Estimated grocery and store comparisons",
      "Advanced meal-planning templates",
      "Expanded saved planning tools",
      "Priority access to new product features",
    ],
    featured: true,
  },
  {
    name: "Family",
    price: "$24.99",
    period: "/month",
    audience: "For households planning together",
    summary: "Shared planning tools for households with multiple profiles and routines.",
    features: [
      "Multi-profile household planning",
      "Shared grocery strategy and defaults",
      "Expanded family workflow templates",
      "Priority beta support",
    ],
  },
];

const BETA_STEPS = [
  {
    number: "01",
    title: "Join the waitlist",
    text: "Tell us where to send testing and product updates. Joining the waitlist does not start billing.",
  },
  {
    number: "02",
    title: "Receive an invitation",
    text: "Closed-beta access is released in limited groups as store coverage and testing capacity expand.",
  },
  {
    number: "03",
    title: "Sign in and test",
    text: "Invited testers enter the secure app to use the current planning, grocery, and feedback experience.",
  },
];

const DELIVERY_ITEMS = [
  {
    title: "Pickup or in-store shopping",
    badge: "No 3C delivery fee",
    text: "Use 3C Mall for planning and comparison, then shop or pick up the order yourself.",
  },
  {
    title: "Optional third-party delivery",
    badge: "Provider priced",
    text: "When delivery is available, the delivery provider's current fee is separate from the 3C Mall membership price.",
  },
  {
    title: "Multi-store plans",
    badge: "Review before checkout",
    text: "Using more than one store can create separate fulfillment or delivery charges. Review final retailer and provider totals before purchasing.",
  },
];

export default function Pricing() {
  return (
    <div className="pricing-page">
      <section className="pricing-hero" aria-labelledby="pricing-title">
        <div className="pricing-hero-copy">
          <p className="pricing-eyebrow">3C Mall · Planned membership pricing</p>
          <h1 id="pricing-title">
            Clear plans for a <span>guided household shopping experience.</span>
          </h1>
          <p className="pricing-hero-summary">
            3C Mall is currently in closed beta. These tiers show the planned
            membership structure so you can understand the product before you
            request access. Joining the waitlist does not start a subscription.
          </p>

          <div className="pricing-hero-actions" aria-label="Pricing page actions">
            <a
              className="pricing-button pricing-button-primary"
              href={`${MARKETING_ORIGIN}/#beta-access`}
            >
              Join the beta waitlist
            </a>
            <a
              className="pricing-button pricing-button-secondary"
              href={`${APP_ORIGIN}/login`}
            >
              Invited tester? Sign in
            </a>
          </div>

          <div className="pricing-trust-row" aria-label="Pricing expectations">
            <span>No charge to join the waitlist</span>
            <span>Retailer prices remain estimates until checkout</span>
            <span>Optional delivery costs stay separate</span>
          </div>
        </div>

        <aside className="pricing-beta-card" aria-label="Closed beta access process">
          <span className="pricing-beta-badge">Closed beta</span>
          <h2>What happens before you use a plan?</h2>
          <ol>
            {BETA_STEPS.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="pricing-section" aria-labelledby="plans-title">
        <div className="pricing-section-heading">
          <div>
            <p className="pricing-eyebrow">Membership structure</p>
            <h2 id="plans-title">Choose by how much planning support you need.</h2>
          </div>
          <p>
            The product stays centered on the same journey: household and
            budget, meals, one shopping list, then clearer comparison options.
          </p>
        </div>

        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`pricing-plan${plan.featured ? " is-featured" : ""}`}
            >
              {plan.featured && <span className="pricing-plan-badge">Best fit for individuals</span>}
              <div className="pricing-plan-heading">
                <div>
                  <p>{plan.audience}</p>
                  <h3>{plan.name}</h3>
                </div>
                <div className="pricing-plan-price" aria-label={`${plan.name} price ${plan.price}${plan.period}`}>
                  <strong>{plan.price}</strong>
                  {plan.period && <span>{plan.period}</span>}
                </div>
              </div>

              <p className="pricing-plan-summary">{plan.summary}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="pricing-plan-status">
                <span>Current access</span>
                <strong>Closed beta · invitation based</strong>
              </div>
            </article>
          ))}
        </div>

        <p className="pricing-fineprint">
          Pricing shown reflects the planned membership structure and may be
          refined before general availability. Any paid enrollment step should
          show the final price and terms before a charge is created.
        </p>
      </section>

      <section className="pricing-section pricing-section-soft" aria-labelledby="delivery-title">
        <div className="pricing-section-heading">
          <div>
            <p className="pricing-eyebrow">Shopping and delivery</p>
            <h2 id="delivery-title">Membership price and fulfillment cost stay separate.</h2>
          </div>
          <p>
            This keeps the total easier to understand. 3C Mall can help organize
            the decision, while the retailer or delivery provider controls its
            final checkout price and availability.
          </p>
        </div>

        <div className="pricing-delivery-grid">
          {DELIVERY_ITEMS.map((item) => (
            <article key={item.title}>
              <span>{item.badge}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-clarity" aria-labelledby="pricing-clarity-title">
        <div>
          <p className="pricing-eyebrow">Before you decide</p>
          <h2 id="pricing-clarity-title">A few things should never be a surprise.</h2>
        </div>

        <div className="pricing-faq-list">
          <details>
            <summary>Does joining the waitlist start a subscription?</summary>
            <p>No. The waitlist is an access request and product-update channel. It does not create a paid membership.</p>
          </details>
          <details>
            <summary>Are grocery prices guaranteed?</summary>
            <p>No. Store prices, promotions, substitutions, package sizes, and availability can change. Review the retailer's final checkout price before purchasing.</p>
          </details>
          <details>
            <summary>Can I avoid delivery charges?</summary>
            <p>Yes. Pickup and in-store shopping remain valid options when available. Optional third-party delivery costs are separate from the membership price.</p>
          </details>
          <details>
            <summary>How do existing testers manage their account?</summary>
            <p>Sign in to the secure 3C Mall app. Account and subscription-management tools belong inside the authenticated experience rather than on the public pricing page.</p>
          </details>
        </div>
      </section>

      <section className="pricing-final-cta" aria-labelledby="pricing-cta-title">
        <div>
          <p className="pricing-eyebrow">Ready for the next step?</p>
          <h2 id="pricing-cta-title">Request beta access without choosing a paid plan today.</h2>
          <p>
            See how the experience fits your household first. Invited testers
            can sign in separately when access is available.
          </p>
        </div>
        <div className="pricing-final-actions">
          <a
            className="pricing-button pricing-button-primary"
            href={`${MARKETING_ORIGIN}/#beta-access`}
          >
            Join the beta waitlist
          </a>
          <a
            className="pricing-button pricing-button-secondary"
            href={`${APP_ORIGIN}/login`}
          >
            Sign in
          </a>
        </div>
      </section>
    </div>
  );
}
