import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FitnessZonePage.css";

export default function FitnessZone() {
  const nav = useNavigate();

  return (
    <section className="page fz-shell">
      <header className="fz-header">
        <div>
          <p className="kicker">Zone · Fitness</p>
          <h1 className="h1">
            Fitness Zone <span className="fz-accent">— MVP foundation.</span>
          </h1>
          <p className="sub">
            Next: Metabolic Echo hooks that trend over time, strength goals, and trainer controls.
          </p>
        </div>

        <div className="pill fz-meta">
          <span>Status</span>
          <strong>Stub Ready</strong>
        </div>
      </header>

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={() => nav("/app")}>Dashboard →</button>
        <button className="btn btn-secondary" onClick={() => nav("/app/meal-plans")}>Meal Plans →</button>
        <button className="btn btn-ghost" onClick={() => nav("/app/pt")}>PT Mode →</button>
      </div>

      <div className="grid">
        <div className="card glass fz-card">
          <div className="card-tag">Metabolic Echo</div>
          <h2 className="fz-card-title">Today’s state (placeholder)</h2>
          <p className="small">
            We’ll replace this with daily signals (energy, recovery, hydration, etc.).
          </p>
          <p className="small fz-foot">Alpha note: this zone becomes active in Beta.</p>
        </div>

        <div className="card glass fz-card">
          <div className="card-tag">Goals</div>
          <h2 className="fz-card-title">Strength targets (placeholder)</h2>
          <p className="small">
            Later: PR goals, progression blocks, and trainer edits.
          </p>
          <p className="small fz-foot">Alpha note: tracking + charts land after API phase.</p>
        </div>
      </div>
    </section>
  );
}

