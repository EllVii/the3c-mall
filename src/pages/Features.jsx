import React from "react";
import { Link } from "react-router-dom";
import "../styles/FeaturesPage.css";

const FEATURE_CARDS = [
  {
    icon: "⌂",
    label: "Start with your household",
    title: "Budget-aware setup",
    description:
      "Set the grocery amount you want to work within, who you shop for, and the preferences that matter in your home.",
    details: ["Household size", "Food preferences", "Grocery budget"],
  },
  {
    icon: "◷",
    label: "Plan around real life",
    title: "Guided meal planning",
    description:
      "Build practical meal ideas around your schedule, routines, dietary considerations, and ingredients your household will use.",
    details: ["Flexible meal ideas", "Routine-aware planning", "Saved preferences"],
  },
  {
    icon: "✓",
    label: "Keep it connected",
    title: "One organized shopping list",
    description:
      "Carry planned ingredients into one list, then add household staples without rebuilding everything in another tool.",
    details: ["Meal ingredients", "Everyday staples", "Review before shopping"],
  },
  {
    icon: "÷",
    label: "Compare like with like",
    title: "True unit-price clarity",
    description:
      "Compare package value with common measurements, including price per ounce or gram when product information supports it.",
    details: ["Package-size context", "Common unit comparisons", "Clearer product value"],
  },
  {
    icon: "◎",
    label: "Review your options",
    title: "Store estimate support",
    description:
      "See available store estimates and package choices together before deciding where and how you want to shop.",
    details: ["Available store estimates", "Pickup or delivery context", "Final choice stays yours"],
  },
  {
    icon: "✦",
    label: "Know what comes next",
    title: "3C Concierge guidance",
    description:
      "Move through the experience with clear, relevant next steps instead of facing every tool and decision at once.",
    details: ["Guided starting point", "Plain-language support", "Less decision overload"],
  },
];

const JOURNEY_STEPS = [
  {
    number: "01",
    title: "Set the plan",
    text: "Household, preferences, and budget.",
  },
  {
    number: "02",
    title: "Choose meals",
    text: "Ideas that fit the people and week ahead.",
  },
  {
    number: "03",
    title: "Build the list",
    text: "Meal ingredients and household staples together.",
  },
  {
    number: "04",
    title: "Compare value",
    text: "Package sizes, common units, and available estimates.",
  },
  {
    number: "05",
    title: "Decide how to shop",
    text: "You review the retailer’s final price and make the choice.",
  },
];

const EXPECTATION_ROWS = [
  {
    label: "3C Mall organizes",
    value: "Your household budget, meal ideas, ingredients, and shopping list.",
  },
  {
    label: "3C Mall clarifies",
    value: "Package sizes, unit-price comparisons, and available store estimates.",
  },
  {
    label: "You control",
    value: "The store, substitutions, pickup or delivery, and the final purchase.",
  },
];

export default function Features() {
  return (
    <div className="features-page">
      <section className="features-hero" aria-labelledby="features-title">
        <div className="features-hero-copy">
          <p className="features-eyebrow">3C Mall • Product experience</p>
          <h1 id="features-title">
            One clearer path from{" "}
            <span>meal idea to shopping decision.</span>
          </h1>
          <p className="features-hero-summary">
            3C Mall brings household planning, grocery organization, and
            package-value clarity into one guided experience—without forcing
            every household into the same eating style or routine.
          </p>

          <div className="features-hero-actions" aria-label="Feature page actions">
            <a className="features-button features-button-primary" href="#feature-overview">
              Explore the experience
            </a>
            <a
              className="features-button features-button-secondary"
              href="https://the3cmall.com/#beta-access"
            >
              Join the closed beta
            </a>
          </div>

          <ul className="features-hero-points" aria-label="3C Mall principles">
            <li>Built around real household budgets</li>
            <li>Inclusive of different food preferences</li>
            <li>Designed to support—not replace—your decisions</li>
          </ul>
        </div>

        <aside className="features-preview-card" aria-label="Connected planning preview">
          <div className="features-preview-top">
            <div>
              <p>Your connected plan</p>
              <h2>Tonight’s dinner, tomorrow’s list</h2>
            </div>
            <span className="features-beta-pill">Beta</span>
          </div>

          <div className="features-budget-row">
            <div>
              <span>Weekly grocery target</span>
              <strong>$175.00</strong>
            </div>
            <span className="features-budget-status">On plan</span>
          </div>

          <ol className="features-preview-list">
            <li>
              <span className="features-preview-icon">01</span>
              <div>
                <strong>Meal plan</strong>
                <small>5 dinners selected for this week</small>
              </div>
              <span className="features-check" aria-hidden="true">✓</span>
            </li>
            <li>
              <span className="features-preview-icon">02</span>
              <div>
                <strong>Connected list</strong>
                <small>Ingredients and household staples</small>
              </div>
              <span className="features-check" aria-hidden="true">✓</span>
            </li>
            <li className="is-current">
              <span className="features-preview-icon">03</span>
              <div>
                <strong>Compare options</strong>
                <small>Review package value and store estimates</small>
              </div>
              <span className="features-current-label">Next</span>
            </li>
          </ol>

          <div className="features-preview-result">
            <span>3C Concierge</span>
            <p>Your plan is organized. Compare your options when you’re ready.</p>
          </div>
        </aside>
      </section>

      <section
        id="feature-overview"
        className="features-section"
        aria-labelledby="feature-overview-title"
      >
        <div className="features-section-heading">
          <div>
            <p className="features-eyebrow">The core experience</p>
            <h2 id="feature-overview-title">
              Practical tools that work better together
            </h2>
          </div>
          <p>
            Each part of 3C Mall carries useful context into the next, so you
            spend less time recreating the same plan.
          </p>
        </div>

        <div className="features-card-grid">
          {FEATURE_CARDS.map((feature) => (
            <article key={feature.title} className="features-card">
              <div className="features-card-top">
                <span className="features-card-icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <span className="features-card-label">{feature.label}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <ul aria-label={`${feature.title} includes`}>
                {feature.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="features-journey" aria-labelledby="connected-journey-title">
        <div className="features-journey-copy">
          <p className="features-eyebrow">One connected journey</p>
          <h2 id="connected-journey-title">
            Your information moves forward with you.
          </h2>
          <p>
            A meal choice can inform the list. The list can inform the
            comparison. The comparison can help you choose how to shop—all
            while you remain in control.
          </p>
          <a href="https://the3cmall.app/app" className="features-text-link">
            Open the beta app <span aria-hidden="true">→</span>
          </a>
        </div>

        <ol className="features-journey-steps">
          {JOURNEY_STEPS.map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="features-expectations" aria-labelledby="clarity-title">
        <div className="features-expectations-heading">
          <p className="features-eyebrow">Clarity builds trust</p>
          <h2 id="clarity-title">Know what the app does—and what stays yours.</h2>
          <p>
            Store prices, promotions, package sizes, and availability can
            change. 3C Mall presents decision-support estimates so you can
            review the retailer’s final information before purchasing.
          </p>
        </div>

        <dl className="features-expectation-list">
          {EXPECTATION_ROWS.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="features-cta" aria-labelledby="features-cta-title">
        <div>
          <p className="features-eyebrow">Help shape what comes next</p>
          <h2 id="features-cta-title">Start with the beta. Build with us.</h2>
          <p>
            Explore the current experience and share the household needs,
            safeguards, and comparisons that would make 3C Mall genuinely
            useful.
          </p>
        </div>
        <div className="features-cta-actions">
          <a
            className="features-button features-button-primary"
            href="https://the3cmall.com/#beta-access"
          >
            Join the closed beta
          </a>
          <Link className="features-button features-button-secondary" to="/pricing">
            Review pricing
          </Link>
        </div>
      </section>
    </div>
  );
}
