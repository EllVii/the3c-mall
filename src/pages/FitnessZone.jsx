// src/pages/FitnessZone.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FitnessZonePage.css";

export default function FitnessZone() {
  const nav = useNavigate();

  return (
    <section className="fz-page">
      <header className="fz-header">
        <div>
          <p className="fz-kicker">Zone · Fitness</p>
          <h1 className="fz-title">
            Fitness Zone <span className="highlight">— MVP foundation.</span>
          </h1>
          <p className="fz-subtitle">
            Next: Metabolic Echo hooks that trend over time, strength goals, and trainer controls.
          </p>
        </div>

        <div className="fz-meta-pill">
          <span>Status</span>
          <strong>Stub Ready</strong>
        </div>
      </header>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <button className="btn btn-gold" onClick={() => nav("/app")}>Dashboard →</button>
        <button className="btn btn-blue" onClick={() => nav("/app/meal-plans")}>Meal Plans →</button>
        <button className="btn btn-ghost" onClick={() => nav("/app/pt")}>PT Mode →</button>
      </div>

      <div className="fz-grid">
        <div className="fz-card fz-card-today">
          <div className="card-tag">Metabolic Echo</div>
          <div className="fz-plan-title">Today’s state (placeholder)</div>
          <p className="fz-plan-subtitle">
            We’ll replace this with actual daily signals (energy, recovery, hydration, etc.).
          </p>
        </div>

        <div className="fz-card fz-card-right">
          <div className="card-tag">Goals</div>
          <div className="fz-plan-title">Strength targets (placeholder)</div>
          <p className="fz-plan-subtitle">
            Later: PR goals, progression blocks, and trainer edits.
          </p>
        </div>
      </div>
    </section>
  );
}
