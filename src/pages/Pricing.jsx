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
        "Saved settings + handoff (Meal → Grocery)",
        "Limited tools / features during Alpha",
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
        "Smart grocery routing (multi-store)",
        "Advanced meal planning & templates",
        "Grocery totals + store splits (MVP+)",
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
          You’ll always see what you pay. Delivery is optional — and when you use multi-store,
          delivery is charged per store delivery (because each store is a separate delivery event).
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

      {/* ✅ Delivery Pricing (added back) */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <p className="kicker">Delivery Pricing</p>
        <h2 className="h1" style={{ fontSize: "1.35rem" }}>
          Optional delivery — pay only when you use it
        </h2>

        <div className="sub" style={{ maxWidth: "900px" }}>
          If your cart routes to multiple stores, that can create multiple deliveries. We keep it transparent:
          <strong style={{ color: "var(--gold)" }}> delivery is priced per delivery event</strong> (per store),
          not hidden inside your subscription.
        </div>

        <div className="grid" style={{ marginTop: "1rem" }}>
          <div className="card" style={{ background: "rgba(5,9,18,.75)" }}>
            <div style={{ fontWeight: 900, color: "var(--gold)" }}>Self Pickup</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              $0 delivery fees. You pick up orders yourself.
            </div>
            <div className="pill" style={{ marginTop: ".9rem" }}>
              <span>Delivery Fee</span>
              <strong>$0</strong>
            </div>
          </div>

          <div className="card" style={{ background: "rgba(5,9,18,.75)" }}>
            <div style={{ fontWeight: 900, color: "var(--gold)" }}>Partner Delivery (Typical)</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              Example pricing model for Beta: each routed store delivery is charged separately.
            </div>

            <div className="grid" style={{ marginTop: ".9rem" }}>
              <div className="pill">
                <span>Per Store Delivery</span>
                <strong>$4.99–$9.99</strong>
              </div>
              <div className="pill">
                <span>Multi-Store Example</span>
                <strong>2 stores → 2 fees</strong>
              </div>
            </div>

            <div className="small" style={{ marginTop: ".85rem" }}>
              Final delivery fees depend on provider availability, store partner rules, and distance.
            </div>
          </div>

          <div className="card" style={{ background: "rgba(5,9,18,.75)" }}>
            <div style={{ fontWeight: 900, color: "var(--gold)" }}>Future: Delivery Bundles</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              We can add a “bundle” option later to cap delivery costs or include a monthly delivery allowance.
            </div>
            <div className="pill" style={{ marginTop: ".9rem" }}>
              <span>Status</span>
              <strong>Planned</strong>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / clarity */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <p className="kicker">FAQ</p>

        <div style={{ marginTop: ".5rem" }}>
          <div style={{ fontWeight: 900 }}>Why is delivery per store?</div>
          <div className="small" style={{ marginTop: ".25rem" }}>
            Because each store is its own fulfillment system. Multi-store routing saves money on groceries,
            but can increase delivery events — we keep that transparent.
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <div style={{ fontWeight: 900 }}>Can I avoid delivery?</div>
          <div className="small" style={{ marginTop: ".25rem" }}>
            Yes. Choose pickup or in-store shopping inside Grocery Lab.
          </div>
        </div>
      </section>
    </main>
  );
}