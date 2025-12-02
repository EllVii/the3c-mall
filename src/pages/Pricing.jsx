import "../styles/PricingPage.css";
import React from "react";

function Pricing() {
  const tiers = [
    {
      name: "Core Monthly",
      price: "$19/mo",
      asLowAs: "$7.60/mo",
      note: "Start the lifestyle. Build the habit.",
      items: [
        "Basic 3C dashboard",
        "Carnivore, keto, and paleo starter phases",
        "Sample 7-day carnivore plan",
        "Limited grocery price tracking",
        "Community read-only access",
        "Earn discounts with posts & 80/20 streaks",
      ],
    },
    {
      name: "Lifestyle Plus",
      price: "$29/mo",
      asLowAs: "$11.60/mo",
      note: "Most popular",
      items: [
        "Full meal plan engine with protein targets",
        "Multi-store grocery comparison & budgeting",
        "80/20 lifestyle tracking + adherence rewards",
        "Post & comment in the community",
        "Unlock Labs & Centers (workouts, mindset, transitions)",
        "Priority rewards: higher discount ceilings & loyalty boosts",
      ],
      highlighted: true,
    },
    {
      name: "Family Bundle",
      price: "$39/mo",
      asLowAs: "$19.50/mo",
      note: "Up to 4 family members",
      items: [
        "Shared grocery lists & cost breakdowns",
        "Per-member dashboards & goals",
        "Family rewards & streaks",
        "Parent view for kids/teens",
        "Shared access to workouts & mindset content",
      ],
    },
    {
      name: "Annual & Lifetime (Student / Military / F3)",
      price: "Special pricing",
      note: "Verified accounts only",
      items: [
        "Annual and lifetime options for long-term players",
        "Student & Military lifetime access to Pro-level features",
        "F3 Founders Reward: exclusive perks & locked loyalty pricing",
        "All future app upgrades included",
        "Recognition wall inside the app",
      ],
    },
  ];

  return (
    <section className="page pricing-page">
      <p className="lp-kicker">Convert • Commit • Come Back</p>

      <h1>Pricing that rewards commitment.</h1>

      <p className="page-subtitle">
        Start with a simple monthly plan. Your consistency, 80/20 streaks, and
        community engagement can unlock <strong>“pay as low as”</strong>{" "}
        pricing over time — the more you show up, the less you pay.
      </p>

      <div className="pricing-grid">
        {tiers.map((t) => (
          <article
            key={t.name}
            className={`card pricing-card ${
              t.highlighted ? "highlighted selected" : ""
            }`}
          >
            <h2>{t.name}</h2>

            <div className="pricing-price-block">
              <p className="pricing-price">{t.price}</p>

              {t.asLowAs && (
                <p className="pricing-lowest">
                  <span className="pricing-lowest-label">as low as</span>{" "}
                  <span className="pricing-lowest-amount">{t.asLowAs}</span>
                </p>
              )}
            </div>

            <p className="pricing-note">{t.note}</p>

            <ul className="pricing-list">
              {t.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <button className="primary-btn full-width">
              Choose {t.name}
            </button>
          </article>
        ))}
      </div>

      <div className="pricing-fineprint">
        <h3>No shame. No gotchas. Just support.</h3>
        <p>
          You’re never punished for a quiet month. If life gets loud, you keep
          your account, your data, and your progress. Discounts are earned
          through encouragement, posting, and 80/20 consistency — not
          perfection. When you re-engage, your rewards engine wakes back up
          with you.
        </p>
      </div>
    </section>
  );
}

export default Pricing;