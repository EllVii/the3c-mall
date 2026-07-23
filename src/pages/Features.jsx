import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Guided Meal Planning",
    description:
      "Build practical meal plans around household size, dietary preferences, available time, and grocery budget.",
  },
  {
    title: "Grocery Cost Comparison",
    description:
      "Compare estimated totals, package sizes, and unit prices so different products and stores are easier to evaluate.",
  },
  {
    title: "Household Shopping Organization",
    description:
      "Move from meal ideas to an organized grocery list, then choose pickup, delivery, or an in-store shopping workflow.",
  },
  {
    title: "Personalized Lifestyle Support",
    description:
      "Use concierge-style guidance, saved preferences, fitness tools, and progress features designed for everyday routines.",
  },
  {
    title: "Community and Professional Input",
    description:
      "Connect planning tools with community support and future guidance from qualified food, nutrition, and fitness professionals.",
  },
  {
    title: "Privacy-Aware Account Controls",
    description:
      "Keep household planning inside a secure account experience with protected app pages that are excluded from public search results.",
  },
];

export default function Features() {
  return (
    <main className="page-wrap">
      <header>
        <p className="kicker">3C Mall • App Features</p>
        <h1 className="h1">Meal planning and grocery tools built for real households</h1>
        <p className="sub" style={{ maxWidth: "850px" }}>
          3C Mall brings meal planning, grocery cost comparison, household
          organization, and guided lifestyle support into one app. The goal is
          to help people make clearer shopping decisions without forcing every
          household into the same eating style or routine.
        </p>
      </header>

      <section aria-labelledby="feature-list-heading" style={{ marginTop: "1.5rem" }}>
        <h2 id="feature-list-heading" className="h2">
          What the 3C Mall app includes
        </h2>

        <div className="grid-cards">
          {features.map((feature) => (
            <article key={feature.title} className="card card-pad">
              <h3 className="card-title">{feature.title}</h3>
              <p className="card-text">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card card-pad" style={{ marginTop: "1.5rem" }}>
        <h2 className="h2">Designed as an app, explained through a public website</h2>
        <p className="card-text">
          Public pages explain what 3C Mall does and help search engines
          understand the product. Personal dashboards, grocery plans, profiles,
          and other signed-in areas stay private and are marked not to appear in
          search results.
        </p>
        <div className="nav-row" style={{ marginTop: "1rem" }}>
          <Link className="btn btn-primary" to="/pricing">
            Review pricing
          </Link>
          <a className="btn btn-secondary" href="https://the3cmall.app/app">
            Open beta app
          </a>
        </div>
      </section>
    </main>
  );
}
