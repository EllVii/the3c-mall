import React, { useMemo, useState } from "react";

export default function Pricing() {
  // MVP: delivery math sandbox (no payments yet)
  const [plan, setPlan] = useState("credit"); // "credit" | "pay-your-own"
  const [credit, setCredit] = useState(24.99); // your idea
  const [avgFee, setAvgFee] = useState(7.99);  // typical delivery fee estimate
  const [deliveries, setDeliveries] = useState(8); // your example “8 deliveries in a month”

  const calc = useMemo(() => {
    const totalFees = avgFee * deliveries;
    const covered = plan === "credit" ? Math.min(totalFees, credit) : 0;
    const overage = plan === "credit" ? Math.max(0, totalFees - credit) : totalFees;
    return {
      totalFees: totalFees.toFixed(2),
      covered: covered.toFixed(2),
      overage: overage.toFixed(2),
    };
  }, [avgFee, deliveries, credit, plan]);

  const tiers = [
    { name: "Basic", price: "$0", desc: "Explore the mall. Limited tools." },
    { name: "Pro", price: "$19/mo", desc: "Full mall access + smarter workflows." },
    { name: "Delivery Credit", price: "$24.99/mo", desc: "We cover delivery fees up to your monthly credit." },
  ];

  return (
    <section className="page">
      <p className="kicker">Pricing</p>
      <h1 className="h1">Pick your lane</h1>
      <p className="sub">
        You can shop **in-store**, **pickup**, or **delivery**. The app does the work either way.
        Delivery is optional — not required.
      </p>

      <div className="grid">
        {tiers.map((t) => (
          <div className="card" key={t.name}>
            <h3 style={{ marginTop: 0, color: "var(--gold)" }}>{t.name}</h3>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, margin: ".25rem 0 .4rem" }}>
              {t.price}
            </div>
            <p className="small" style={{ marginTop: 0 }}>{t.desc}</p>

            <div className="nav-row">
              <button className="btn btn-primary" onClick={() => alert("MVP: checkout later")}>
                Choose
              </button>
              <button className="btn btn-secondary" onClick={() => alert("MVP: details later")}>
                Learn
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Delivery Options (inside Grocery Lab)</h3>
        <p className="small">
          If you choose delivery, you’ll see two options:
          <br />
          <strong style={{ color: "var(--gold)" }}>A)</strong> Pay delivery fees yourself
          <br />
          <strong style={{ color: "var(--gold)" }}>B)</strong> Delivery Credit plan (we cover fees up to your monthly credit)
        </p>

        <div className="grid" style={{ marginTop: ".7rem" }}>
          <div className="card" style={{ padding: ".95rem" }}>
            <div style={{ fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--blue)" }}>
              Delivery Simulator
            </div>

            <label className="label">Choose delivery plan</label>
            <select className="select" value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="credit">Delivery Credit (we cover up to credit)</option>
              <option value="pay-your-own">Pay Delivery Yourself</option>
            </select>

            <div className="grid" style={{ marginTop: ".6rem" }}>
              <div>
                <label className="label">Monthly credit ($)</label>
                <input className="input" type="number" step="0.01" value={credit}
                  onChange={(e) => setCredit(Number(e.target.value || 0))}
                  disabled={plan !== "credit"}
                />
              </div>

              <div>
                <label className="label">Avg delivery fee ($)</label>
                <input className="input" type="number" step="0.01" value={avgFee}
                  onChange={(e) => setAvgFee(Number(e.target.value || 0))}
                />
              </div>

              <div>
                <label className="label">Deliveries / month</label>
                <input className="input" type="number" value={deliveries}
                  onChange={(e) => setDeliveries(Number(e.target.value || 0))}
                />
              </div>
            </div>

            <div className="card" style={{ marginTop: ".75rem", padding: ".85rem" }}>
              <div className="small">
                Total fees: <strong style={{ color: "var(--gold)" }}>${calc.totalFees}</strong>
                <br />
                Covered by 3C: <strong style={{ color: "var(--gold)" }}>${calc.covered}</strong>
                <br />
                You pay: <strong style={{ color: "var(--gold)" }}>${calc.overage}</strong>
              </div>
              <div className="small" style={{ marginTop: ".5rem" }}>
                This is the “feels legit” part: you see the math, and you stay in control.
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: ".95rem" }}>
            <h4 style={{ marginTop: 0, color: "var(--gold)" }}>Key promise</h4>
            <p className="small">
              One workflow. Multiple fulfillment options.
              <br />
              The app selects items + stores automatically.
              <br />
              You can still compare prices if you want — but you don’t have to.
            </p>

            <div className="nav-row">
              <a className="btn btn-primary" href="/app/grocery-lab">Try Grocery Lab →</a>
              <a className="btn btn-secondary" href="/app">Back to Dashboard →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
