import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CommunityPage.css";

export default function CommunityPage() {
  const nav = useNavigate();

  return (
    <section className="page cm-shell">
      <header className="cm-header">
        <div>
          <p className="kicker">Community Center</p>
          <h1 className="h1">
            Make progress <span className="cm-accent">together.</span>
          </h1>
          <p className="sub">
            Share goals, celebrate wins, and keep your household connected without pressure.
          </p>
        </div>

        <div className="pill cm-meta">
          <span>Mode</span>
          <strong>Family preview</strong>
        </div>
      </header>

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={() => nav("/app")}>
          Home →
        </button>
        <button className="btn btn-secondary" onClick={() => nav("/app/grocery-lab")}>
          Grocery Lab →
        </button>
      </div>

      <div className="grid">
        <article className="card glass cm-card">
          <div className="card-tag">Challenges</div>
          <h2 className="cm-card-title">Team goals</h2>
          <p className="small">
            Work toward shared strength, nutrition, and consistency goals at a pace that feels realistic.
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
            Compare progress, recognize smart shopping wins, and celebrate the household together.
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
