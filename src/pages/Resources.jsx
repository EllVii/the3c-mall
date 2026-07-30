import React from "react";
import { RESOURCE_CARDS } from "../data/resourceGuides.js";
import "../styles/Resources.css";

export default function Resources() {
  return (
    <div className="resources-page">
      <section className="resources-hero" aria-labelledby="resources-title">
        <p className="resources-eyebrow">3C Mall learning center</p>
        <h1 id="resources-title">Grocery budget and meal-planning guides</h1>
        <p>
          Practical tools for comparing value, planning around a household budget,
          and making clearer grocery decisions before checkout.
        </p>
      </section>

      <section className="resources-section" aria-labelledby="resource-guides-title">
        <div className="resources-section-heading">
          <div>
            <p>Start with the decision in front of you</p>
            <h2 id="resource-guides-title">Free guides and calculators</h2>
          </div>
          <span>Clear steps. No account required.</span>
        </div>

        <div className="resources-card-grid">
          {RESOURCE_CARDS.map((resource, index) => (
            <article className="resource-card" key={resource.slug}>
              <span className="resource-card-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p>{resource.label}</p>
              <h2>{resource.title}</h2>
              <span>{resource.description}</span>
              <a href={`/resources/${resource.slug}`}>
                Open guide <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="resources-callout" aria-labelledby="resources-product-title">
        <div>
          <p>From learning to planning</p>
          <h2 id="resources-product-title">Keep the decisions connected in 3C Mall</h2>
          <span>
            Set a grocery amount, plan meals, build one list, and compare store
            estimates without recreating the same information in separate tools.
          </span>
        </div>
        <div className="resources-callout-actions">
          <a className="resource-button resource-button-primary" href="/#beta-access">
            Join the beta
          </a>
          <a className="resource-button resource-button-secondary" href="/features">
            Explore features
          </a>
        </div>
      </section>
    </div>
  );
}
