function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      note: "No credit card",
      items: [
        "Basic 3C dashboard",
        "Sample 7-day carnivore plan",
        "Limited grocery price tracking",
        "Community read-only access",
      ],
    },
    {
      name: "Pro",
      price: "$19/mo",
      note: "Most popular",
      items: [
        "Full meal plan engine",
        "Multi-store grocery comparison",
        "80/20 rewards tracking",
        "Post & comment in community",
        "Unlock Labs & Centers",
      ],
      highlighted: true,
    },
    {
      name: "Family Bundle",
      price: "$39/mo",
      note: "Up to 4 family members",
      items: [
        "Shared grocery lists & costs",
        "Per-member dashboards",
        "Family rewards & streaks",
        "Parent view for kids/teens",
      ],
    },
    {
      name: "Student / Military Lifetime",
      price: "One-time payment",
      note: "Verified accounts only",
      items: [
        "Lifetime access to Pro tier",
        "All future app upgrades",
        "Priority support & perks",
        "Recognition wall inside the app",
      ],
    },
  ];

  return (
    <section className="page">
      <h1>Pick your 3C lane</h1>
      <p className="page-subtitle">
        Start free, upgrade when you’re ready, or lock in lifetime access if
        you’re a student, in the military, or part of the founding crew.
      </p>

      <div className="pricing-grid">
        {tiers.map((t) => (
          <article
            key={t.name}
            className={`card pricing-card ${t.highlighted ? "highlighted" : ""}`}
          >
            <h2>{t.name}</h2>
            <p className="pricing-price">{t.price}</p>
            <p className="pricing-note">{t.note}</p>
            <ul className="pricing-list">
              {t.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <button className="primary-btn full-width">Choose {t.name}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Pricing;
