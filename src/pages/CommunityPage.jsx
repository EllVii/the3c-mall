import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CommunityPage.css";

export default function CommunityPage() {
  const nav = useNavigate();

  return (
    <section className="page cm-shell">
      <header className="cm-header">
        <div>
          <p className="kicker">Center · Community</p>
          <h1 className="h1">
            Community <span className="cm-accent">— family + challenges.</span>
          </h1>
          <p className="sub">
            Household accounts: linked data, shared goals, savings competitions, and team challenges.
          </p>
        </div>

        <div className="pill cm-meta">
          <span>Mode</span>
          <strong>Household MVP</strong>
        </div>
      </header>

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={() => nav("/app")}>
          Dashboard →
        </button>
        <button className="btn btn-secondary" onClick={() => nav("/app/grocery-lab")}>
          Grocery Lab →
        </button>
        <button className="btn btn-ghost" onClick={() => nav("/app/settings")}>
          Settings →
        </button>
      </div>

      <div className="grid">
        <article className="card glass cm-card">
          <div className="card-tag">Challenges</div>
          <h2 className="cm-card-title">Team goals</h2>
          <p className="small">
            Strength championships, weight gain/loss goals, and consistency streaks.
          </p>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => nav("/app/coming-soon")}>
              Coming soon →
            </button>
          </div>
        </article>

        <article className="card glass cm-card">
          <div className="card-tag">Savings</div>
          <h2 className="cm-card-title">Household competitions</h2>
          <p className="small">
            Later: monthly awards + affiliate-driven “spend more to save more” mechanics.
          </p>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => nav("/app/coming-soon")}>
              Rewards roadmap →
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
