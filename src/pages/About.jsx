import React from "react";
import { Link } from "react-router-dom";
import "../styles/AboutPage.css";

const ANSWERS = [
  {
    question: "What is 3C Mall?",
    answer:
      "3C Mall is a household planning platform that connects meal planning, grocery organization, unit-price comparison, store estimates, and guided next steps in one experience.",
  },
  {
    question: "Who is it designed for?",
    answer:
      "It is designed for households that want a clearer way to plan food spending and shopping without being forced into one diet, store, fulfillment method, or routine.",
  },
  {
    question: "Does 3C Mall sell groceries or guarantee savings?",
    answer:
      "No. 3C Mall is decision-support software. Retailers and fulfillment providers control final prices, availability, substitutions, checkout, pickup, delivery, refunds, and fulfillment.",
  },
  {
    question: "How does 3C Mall compare value?",
    answer:
      "When product data supports it, 3C Mall normalizes package information into comparable units and combines those comparisons with the household plan. Store totals remain estimates until the retailer confirms the final cart.",
  },
];

const DIFFERENTIATORS = [
  {
    title: "Plan before comparing",
    text: "The grocery decision starts with the household, budget, and meals instead of beginning with an isolated product search.",
  },
  {
    title: "Keep context connected",
    text: "Meal ingredients, household staples, package value, and available store estimates are meant to move through one workflow instead of being recreated across separate tools.",
  },
  {
    title: "Show the limits",
    text: "The experience distinguishes estimates from retailer-confirmed information so a useful comparison does not become a false promise.",
  },
];

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div>
          <p className="about-eyebrow">About 3C Mall</p>
          <h1 id="about-title">Household planning before the checkout screen.</h1>
          <p className="about-lead">
            3C Mall is built around a simple idea: grocery decisions are easier
            when the budget, meals, shopping list, package value, and store
            options can be understood together.
          </p>
          <div className="about-actions">
            <a className="about-button about-button-primary" href="/#beta-access">
              Join the beta waitlist
            </a>
            <Link className="about-button about-button-secondary" to="/resources">
              Explore grocery guides
            </Link>
          </div>
        </div>

        <aside className="about-summary-card" aria-label="3C Mall at a glance">
          <span>3C Mall at a glance</span>
          <dl>
            <div>
              <dt>Product</dt>
              <dd>Meal planning and grocery decision support</dd>
            </div>
            <div>
              <dt>Experience</dt>
              <dd>Web, mobile-responsive, and installable PWA</dd>
            </div>
            <div>
              <dt>Core flow</dt>
              <dd>Household → meals → list → comparison</dd>
            </div>
            <div>
              <dt>Developer</dt>
              <dd>Ell Vii’s Automations LLC</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="about-section" aria-labelledby="answers-title">
        <div className="about-section-heading">
          <p className="about-eyebrow">Clear answers</p>
          <h2 id="answers-title">What people should know before using 3C Mall</h2>
        </div>
        <div className="about-answer-grid">
          {ANSWERS.map((item) => (
            <article key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-section-soft" aria-labelledby="different-title">
        <div className="about-section-heading">
          <p className="about-eyebrow">Why the workflow is different</p>
          <h2 id="different-title">The comparison is part of the plan, not a separate errand.</h2>
        </div>
        <div className="about-difference-grid">
          {DIFFERENTIATORS.map((item, index) => (
            <article key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-proof" aria-labelledby="proof-title">
        <div>
          <p className="about-eyebrow">Product boundaries</p>
          <h2 id="proof-title">Useful decision support without pretending to be the retailer.</h2>
        </div>
        <p>
          3C Mall does not process grocery checkout, determine SNAP eligibility,
          replace medical or nutrition professionals, or guarantee a fixed
          savings amount. Users remain in control of the final store and
          purchase decision.
        </p>
      </section>

      <section className="about-builder" aria-labelledby="builder-title">
        <div>
          <p className="about-eyebrow">Built by Ell Vii’s Automations</p>
          <h2 id="builder-title">A connected product built around customer experience.</h2>
          <p>
            3C Mall is designed and developed by Ell Vii’s Automations LLC. The
            product combines web application development, workflow design,
            data organization, automation, and customer-experience thinking.
          </p>
        </div>
        <a
          className="about-button about-button-secondary"
          href="https://ellviisautomations.com/"
          target="_blank"
          rel="author external noopener noreferrer"
        >
          Visit Ell Vii’s Automations
        </a>
      </section>
    </div>
  );
}
