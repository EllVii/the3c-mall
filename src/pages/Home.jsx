// src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="landing">
      {/* Left: Hero text */}
      <div className="landing-hero">
        <div className="landing-pill">Convert • Commit • Come Back</div>

        <h1 className="landing-title">
          Lifestyle coaching with
          <span className="landing-title-highlight">
            precision, power, and calm.
          </span>
        </h1>

        <p className="landing-subtitle">
          The 3C Mall is your always-on lifestyle hub. Track your protein,
          grocery costs, and momentum — all in one emotionally safe, high-performance space.
        </p>

        <div className="landing-actions">
          <a href="https://the3cmall.app/app" className="btn-primary">
            Open the 3C App
          </a>
          <Link to="/pricing" className="btn-ghost">
            View plans
          </Link>
        </div>

        {/* Precision-style metrics */}
        <div className="landing-metrics">
          <div className="metric">
            <span className="metric-label">Consistency rate</span>
            <span className="metric-value">87.4%</span>
            <span className="metric-hint">Trailing 30 days</span>
          </div>
          <div className="metric">
            <span className="metric-label">Time reclaimed</span>
            <span className="metric-value">3.2 hrs</span>
            <span className="metric-hint">Per week, on average</span>
          </div>
          <div className="metric">
            <span className="metric-label">Grocery savings</span>
            <span className="metric-value">$48</span>
            <span className="metric-hint">Typical 30-day cycle</span>
          </div>
        </div>
      </div>

      {/* Right: Concierge + Labs grid */}
      <div className="landing-side">
        {/* Concierge card */}
        <article className="concierge-card">
          <header className="concierge-header">
            <span className="concierge-badge">3C Concierge</span>
            <span className="concierge-status">Adaptive tone · On</span>
          </header>

          <p className="concierge-message">
            “You’ve hit 4 out of 5 check-ins this week. That’s momentum, not
            perfection. I’ll keep the next two days light on decision fatigue and heavy on wins.”
          </p>

          <div className="concierge-toggle-row">
            <div className="concierge-toggle">
              <span className="toggle-label">Tone</span>
              <div className="toggle-pill">
                <span className="toggle-chip toggle-chip-active">Relatable</span>
                <span className="toggle-chip">Neutral</span>
              </div>
            </div>
            <div className="concierge-toggle">
              <span className="toggle-label">Check-in cadence</span>
              <div className="toggle-pill">
                <span className="toggle-chip">Light</span>
                <span className="toggle-chip toggle-chip-active">Standard</span>
                <span className="toggle-chip">Intense</span>
              </div>
            </div>
          </div>
        </article>

        {/* Labs & Zones */}
        <section className="labs-grid">
          <div className="labs-header">
            <span className="labs-label">Your 3C zones</span>
            <div className="labs-links">
              <Link to="/features" className="neon-link">
                Explore features
              </Link>
              <Link to="/coming-soon" className="neon-link">
                See what’s next
              </Link>
            </div>
          </div>

          <div className="labs-cards">
            <article className="lab-card">
              <h3>Cost Lab</h3>
              <p>
                Compare local prices and see your exact cost-per-day for the next 30 days.
              </p>
              <span className="lab-tag">Live</span>
            </article>

            <article className="lab-card">
              <h3>Energy Zone</h3>
              <p>
                Sync your check-ins with your real schedule, not someone else’s highlight reel.
              </p>
              <span className="lab-tag lab-tag-soft">Gentle</span>
            </article>

            <article className="lab-card">
              <h3>Community Deck</h3>
              <p>
                Quiet accountability without the noise — curated threads, not chaotic feeds.
              </p>
              <span className="lab-tag">Members</span>
            </article>

            <article className="lab-card">
              <h3>Recovery Lane</h3>
              <p>
                Structured resets for when life hits hard, without wiping out your streaks.
              </p>
              <span className="lab-tag lab-tag-soft">On your terms</span>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}
