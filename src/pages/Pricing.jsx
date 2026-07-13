// src/pages/Pricing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PricingPage.css"; // keep if you already have it (optional)


export default function Pricing() {
  const nav = useNavigate();

  const tiers = [
    {
      name: "Basic",
      price: "$0",
      tagline: "Try the system. Build your first plan.",
      features: [
        "Meal Planner (MVP)",
        "Grocery Lab strategy (MVP)",
        "Saved settings + handoff (Meal → Grocery), anonymized stores",
        "Limited tools / features during Beta",
      ],
      cta: "Start Free",
      onClick: () => nav("/login"),
      kind: "secondary",
    },
    {
      name: "Pro",
      price: "$14.99",
      period: "/mo",
      tagline: "Full workflow. Best value for individuals.",
      features: [
        "Smart estimated grocery comparison",
        "Advanced meal planning & templates",
        "Estimated grocery totals + store comparisons",
        "Priority access to new features",
      ],
      cta: "Go Pro",
      onClick: () => nav("/login"),
      kind: "primary",
    },
    {
      name: "Family",
      price: "$24.99",
      period: "/mo",
      tagline: "Household mode. More planning power.",
      features: [
        "Multi-profile household planning",
        "Shared grocery strategy + saved defaults",
        "More templates + family workflow tools",
        "Priority support during Beta",
      ],
      cta: "Get Family",
      onClick: () => nav("/login"),
      kind: "ghost",
    },
  ];

  return (
<main className="page pricing-page" style={{ paddingBottom: "4rem" }}>
      <header className="card" style={{ marginTop: "1rem" }}>
        <p className="kicker">3C Mall • Pricing</p>
        <h1 className="h1">Simple, honest pricing</h1>
        <p className="sub">
          3C Mall is a planning and comparison platform. Subscription pricing covers access to software tools;
          final grocery prices, checkout, pickup, delivery, and retailer fees are confirmed directly with the applicable retailer or provider.
        </p>

        <div className="nav-row" style={{ marginTop: "1rem" }}>
          <button className="btn btn-secondary" onClick={() => nav("/features")}>
            ← Features
          </button>
          <button className="btn btn-primary" onClick={() => nav("/login")}>
            Login / Start →
          </button>
        </div>
      </header>

      {/* Tier cards */}
      <section className="pricing-grid" style={{ marginTop: "1rem" }}>
        {tiers.map((t) => (
          <article key={t.name} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <div>
                <div style={{ fontWeight: 900, letterSpacing: ".03em", fontSize: "1.1rem" }}>
                  {t.name}
                </div>
                <div className="small" style={{ marginTop: ".25rem" }}>
                  {t.tagline}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 1000, fontSize: "1.55rem", color: "var(--gold)" }}>
                  {t.price}
                  {t.period ? <span style={{ fontSize: ".9rem", color: "var(--muted)" }}>{t.period}</span> : null}
                </div>
              </div>
            </div>
            <ul style={{ marginTop: "1rem", paddingLeft: "1.1rem", opacity: 0.92 }}>
              {t.features.map((f) => (
                <li key={f} style={{ marginBottom: ".5rem" }}>
                  {f}
                </li>
              ))}
            </ul>

            <div className="nav-row" style={{ marginTop: "1rem" }}>
              <button
                className={
                  "btn " +
                  (t.kind === "primary"
                    ? "btn-primary"
                    : t.kind === "ghost"
                    ? "btn-ghost"
                    : "btn-secondary")
                }
                onClick={t.onClick}
              >
                {t.cta}
              </button>
            </div>
          </article>
        ))}
      </section>
<div style={{ textAlign: "center", marginTop: "2.5rem" }}>
  <p className="small" style={{ opacity: 0.75 }}>
    Already a member?
  </p>

  <a
    href="/cancel"
    style={{
      display: "inline-block",
      marginTop: ".5rem",
      fontSize: ".85rem",
      textDecoration: "underline",
      color: "var(--muted)"
    }}
  >
    Manage or cancel your subscription
  </a>
</div>
      {/* Fulfillment clarity */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <p className="kicker">Retailer / Provider Fulfillment</p>
        <h2 className="h1" style={{ fontSize: "1.35rem" }}>
          3C Mall helps you plan. Retailers and providers confirm the final order.
        </h2>

        <div className="sub" style={{ maxWidth: "900px" }}>
          Grocery totals, pickup options, delivery availability, service fees, and final checkout terms may vary by retailer, provider, location, and time.
          <strong style={{ color: "var(--gold)" }}> 3C Mall does not guarantee final prices or complete purchases on behalf of users during beta.</strong>
        </div>

        <div className="grid" style={{ marginTop: "1rem" }}>
          <div className="card" style={{ background: "rgba(5,9,18,.75)" }}>
            <div style={{ fontWeight: 900, color: "var(--gold)" }}>Self Pickup / In-Store Shopping</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              Use 3C Mall to organize your list, then confirm the final purchase directly with the retailer.
            </div>
            <div className="pill" style={{ marginTop: ".9rem" }}>
              <span>3C Mall Delivery Fee</span>
              <strong>$0</strong>
            </div>
          </div>

          <div className="card" style={{ background: "rgba(5,9,18,.75)" }}>
            <div style={{ fontWeight: 900, color: "var(--gold)" }}>Retailer / Third-Party Delivery</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              If a retailer or delivery provider offers delivery, their checkout flow controls the final fee, availability, and terms.
            </div>

            <div className="grid" style={{ marginTop: ".9rem" }}>
              <div className="pill">
                <span>Final Delivery Fee</span>
                <strong>Provider confirms</strong>
              </div>
              <div className="pill">
                <span>Multi-Store Planning</span>
                <strong>May involve separate checkouts</strong>
              </div>
            </div>

            <div className="small" style={{ marginTop: ".85rem" }}>
              3C Mall may show planning estimates, but final prices and fulfillment terms are confirmed outside 3C Mall.
            </div>
          </div>

          <div className="card" style={{ background: "rgba(5,9,18,.75)" }}>
            <div style={{ fontWeight: 900, color: "var(--gold)" }}>Future Fulfillment Options</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              Future delivery or fulfillment features may be reviewed separately and added only when the legal, payment, tax, and partner requirements are clear.
            </div>
            <div className="pill" style={{ marginTop: ".9rem" }}>
              <span>Status</span>
              <strong>Planned / Not active</strong>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / clarity */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <p className="kicker">FAQ</p>

        <div style={{ marginTop: ".5rem" }}>
          <div style={{ fontWeight: 900 }}>Does 3C Mall order groceries for me?</div>
          <div className="small" style={{ marginTop: ".25rem" }}>
            No. During beta, 3C Mall helps you compare and plan. You confirm final purchases through the retailer or provider.
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <div style={{ fontWeight: 900 }}>Are prices guaranteed?</div>
          <div className="small" style={{ marginTop: ".25rem" }}>
            No. Prices are estimates for planning. Final prices are confirmed by the retailer or provider at checkout.
          </div>
        </div>
      </section>
    </main>
  );
}
