// src/pages/CommunityPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CommunityPage.css";

export default function CommunityPage() {
  const nav = useNavigate();

  return (
    <section className="cm-page">
      <header className="cm-header">
        <div>
          <p className="cm-kicker">Center · Community</p>
          <h1 className="cm-title">
            Community <span className="cm-accent">— family + challenges.</span>
          </h1>
          <p className="cm-subtitle">
            Household accounts: linked data, shared goals, savings competitions, and team challenges.
          </p>
        </div>

        <div className="cm-meta">
          <span>Mode</span>
          <strong>Household MVP</strong>
        </div>
      </header>

      <div className="cm-actions">
        <button className="btn btn-gold" onClick={() => nav("/app")}>Dashboard →</button>
        <button className="btn btn-blue" onClick={() => nav("/app/grocery-lab")}>Grocery Lab →</button>
        <button className="btn btn-ghost" onClick={() => nav("/app/settings")}>Settings →</button>
      </div>

      <div className="cm-grid">
        <article className="cm-card">
          <div className="card-tag">Challenges</div>
          <h2 className="cm-card-title">Team goals</h2>
          <p className="cm-card-sub">
            Strength championships, weight gain/loss goals, and consistency streaks.
          </p>
          <button className="btn btn-ghost" onClick={() => nav("/app/coming-soon")}>
            Coming soon →
          </button>
        </article>

        <article className="cm-card">
          <div className="card-tag">Savings</div>
          <h2 className="cm-card-title">Household competitions</h2>
          <p className="cm-card-sub">
            Later: monthly awards + affiliate-driven “spend more to save more” mechanics.
          </p>
          <button className="btn btn-ghost" onClick={() => nav("/app/coming-soon")}>
            Rewards roadmap →
          </button>
        </article>
      </div>
    </section>
  );
}
