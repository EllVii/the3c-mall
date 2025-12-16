import React from "react";
import { useNavigate } from "react-router-dom";

export default function ComingSoon() {
  const nav = useNavigate();

  return (
    <section className="page">
      <p className="kicker">Roadmap</p>
      <h1 className="h1">Coming Soon</h1>
      <p className="sub">
        Next zones: Fitness Zone, Metabolic Echo, Family challenges, rewards, device integrations.
      </p>

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={() => nav("/app")}>← Dashboard</button>
        <button className="btn btn-primary" onClick={() => nav("/app/pt")}>PT Mode →</button>
      </div>

      <div className="grid">
        {[
          "Fitness Zone",
          "Metabolic Echo Bridge",
          "Family Accounts + Challenges",
          "Rewards + Payout Challenges",
          "Geo-Aware Nutrition Engine"
        ].map((x) => (
          <div className="card" key={x}>
            <h3 style={{ marginTop: 0, color: "var(--gold)" }}>{x}</h3>
            <p style={{ color: "var(--muted)", marginBottom: 0 }}>
              Locked for after MVP. We’ll scaffold safely.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
