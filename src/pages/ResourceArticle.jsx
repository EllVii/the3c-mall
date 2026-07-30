import React, { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { RESOURCE_CARDS, RESOURCE_GUIDES } from "../data/resourceGuides.js";
import "../styles/Resources.css";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

function UnitPriceCalculator() {
  const [unit, setUnit] = useState("ounce");
  const [packageA, setPackageA] = useState({ price: "", quantity: "" });
  const [packageB, setPackageB] = useState({ price: "", quantity: "" });

  const results = useMemo(() => {
    const calculate = (item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      if (!Number.isFinite(price) || !Number.isFinite(quantity) || price <= 0 || quantity <= 0) {
        return null;
      }
      return price / quantity;
    };

    const a = calculate(packageA);
    const b = calculate(packageB);
    let winner = null;

    if (a !== null && b !== null) {
      if (Math.abs(a - b) < 0.000001) winner = "tie";
      else winner = a < b ? "a" : "b";
    }

    return { a, b, winner };
  }, [packageA, packageB]);

  const updatePackage = (setter, key, value) => {
    setter((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="unit-calculator" aria-labelledby="unit-calculator-title">
      <div className="unit-calculator-heading">
        <div>
          <p>Free comparison tool</p>
          <h2 id="unit-calculator-title">Compare two grocery packages</h2>
        </div>
        <label>
          Measurement
          <select value={unit} onChange={(event) => setUnit(event.target.value)}>
            <option value="ounce">Ounce</option>
            <option value="pound">Pound</option>
            <option value="gram">Gram</option>
            <option value="item">Item</option>
          </select>
        </label>
      </div>

      <div className="unit-package-grid">
        {[
          { label: "Package A", value: packageA, setter: setPackageA, result: results.a, key: "a" },
          { label: "Package B", value: packageB, setter: setPackageB, result: results.b, key: "b" },
        ].map((item) => (
          <fieldset className="unit-package" key={item.key}>
            <legend>{item.label}</legend>
            <label>
              Package price
              <span className="unit-input-wrap">
                <span aria-hidden="true">$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={item.value.price}
                  onChange={(event) => updatePackage(item.setter, "price", event.target.value)}
                  placeholder="6.00"
                />
              </span>
            </label>
            <label>
              Total {unit}s in package
              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={item.value.quantity}
                onChange={(event) => updatePackage(item.setter, "quantity", event.target.value)}
                placeholder="24"
              />
            </label>
            <div className="unit-result" aria-live="polite">
              <span>Unit price</span>
              <strong>
                {item.result === null
                  ? "Enter price and quantity"
                  : `${moneyFormatter.format(item.result)} per ${unit}`}
              </strong>
            </div>
          </fieldset>
        ))}
      </div>

      {results.winner && (
        <p className="unit-winner" role="status">
          {results.winner === "tie"
            ? "Both packages have the same unit price."
            : `Package ${results.winner.toUpperCase()} has the lower unit price.`}
          {" "}Also consider how much your household will use, storage, and the total grocery budget.
        </p>
      )}
    </section>
  );
}

export default function ResourceArticle() {
  const { slug } = useParams();
  const guide = RESOURCE_GUIDES[slug];

  if (!guide) return <Navigate to="/resources" replace />;

  const relatedResources = RESOURCE_CARDS.filter((resource) =>
    guide.related.includes(resource.slug),
  );

  return (
    <div className="resource-article-page">
      <nav className="resource-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <a href="/resources">Guides</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{guide.title}</span>
      </nav>

      <article className="resource-article">
        <header className="resource-article-header">
          <p className="resources-eyebrow">{guide.eyebrow}</p>
          <h1>{guide.title}</h1>
          <p className="resource-article-summary">{guide.summary}</p>
          <div className="resource-article-meta">
            <span>Published July 29, 2026</span>
            <span>{guide.readingTime}</span>
            <span>By 3C Mall and Ell Vii&apos;s Automations</span>
          </div>
        </header>

        {guide.calculator && <UnitPriceCalculator />}

        <div className="resource-article-body">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <aside className="resource-note" aria-label="Price and availability note">
          <strong>Remember:</strong> Grocery prices, availability, promotions, taxes, and
          fulfillment fees can change. Confirm final details with the retailer before
          traveling or completing an order.
        </aside>
      </article>

      <section className="related-resources" aria-labelledby="related-resources-title">
        <div className="resources-section-heading">
          <div>
            <p>Continue planning</p>
            <h2 id="related-resources-title">Related 3C Mall guides</h2>
          </div>
          <a href="/resources">View all guides</a>
        </div>
        <div className="resources-card-grid resources-card-grid-compact">
          {relatedResources.map((resource) => (
            <article className="resource-card" key={resource.slug}>
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
    </div>
  );
}
