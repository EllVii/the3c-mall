// src/pages/DashboardPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/DashboardPage.css";

export default function DashboardPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [metrics, setMetrics] = useState({
    proteinTarget: 210,
    grocerySpend: 42,
    onTrack: 82,
  });

  function handleSync() {
    if (isSyncing) return;

    setIsSyncing(true);

    // Fake API call / sync delay
    setTimeout(() => {
      // Tiny “realistic” wiggle around base values
      const proteinBase = 210;
      const groceryBase = 42;
      const onTrackBase = 82;

      const proteinTarget =
        proteinBase +
        Math.round((Math.random() - 0.5) * 30); // +/- 15g
      const grocerySpend =
        groceryBase +
        (Math.random() - 0.5) * 8; // +/- $4-ish
      const onTrack =
        onTrackBase +
        Math.round((Math.random() - 0.5) * 10); // +/- 5%

      setMetrics({
        proteinTarget: Math.max(120, proteinTarget),
        grocerySpend: Math.max(10, Math.round(grocerySpend * 100) / 100),
        onTrack: Math.min(100, Math.max(40, onTrack)),
      });

      setLastSyncedAt(new Date());
      setIsSyncing(false);
    }, 1100);
  }

  function formatLastSynced(ts) {
    if (!ts) return "Not synced yet today";
    const time = ts.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    return `Synced at ${time}`;
  }

  return (
    <section className="page dash-page">
      {/* ---------- Header ---------- */}
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Welcome back to your 3C Mall</h1>
          <p className="dash-subtitle">
            Everything you need lives in your <strong>Labs</strong> &amp;{" "}
            <strong>Zones</strong>. Start where your energy is highest today — or
            jump straight into planning your next <em>3C-aligned</em> day.
          </p>
        </div>

        <button
          className={
            "btn btn-ghost dash-sync-btn" +
            (isSyncing ? " dash-sync-btn--busy" : "")
          }
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <span className="dash-sync-spinner" />
              Syncing…
            </>
          ) : (
            <>⚡ Sync Today’s Plan</>
          )}
        </button>
      </header>

      {/* ---------- Snapshot Card ---------- */}
      <article className="card dash-snapshot-card">
        <div className="dash-snapshot-top">
          <div>
            <span className="card-tag">Today’s Snapshot</span>
            <h2 className="card-title">3C Rhythm Check-In</h2>
          </div>
          <p className="dash-last-synced">
            {formatLastSynced(lastSyncedAt)}
          </p>
        </div>

        <p className="card-body">
          Quick read on today’s protein target, grocery spend, and 80/20 streak —
          for <strong>real households</strong>, not just dieters.
        </p>

        <ul className="stat-row">
          <li className="stat-card">
            <span className="stat-label">Target protein</span>
            <strong className="stat-value">
              {metrics.proteinTarget}
              <span className="stat-unit"> g</span>
            </strong>
            <span className="stat-footnote">Based on your profile &amp; goals</span>
          </li>

          <li className="stat-card">
            <span className="stat-label">Estimated grocery spend</span>
            <strong className="stat-value">
              ${metrics.grocerySpend.toFixed(2)}
            </strong>
            <span className="stat-footnote">
              Today’s cart across meat + staples
            </span>
          </li>

          <li className="stat-card">
            <span className="stat-label">On-track this month</span>
            <strong className="stat-value">
              {metrics.onTrack}
              <span className="stat-unit"> %</span>
            </strong>
            <span className="stat-footnote">
              80/20 score with built-in grace
            </span>
          </li>
        </ul>
      </article>

      {/* ---------- Labs & Zones Grid ---------- */}
      <div className="dash-grid">
        {/* Daily Brief */}
        <article className="card dash-card">
          <span className="card-tag">🗓 Today at Your 3C Mall</span>
          <h2 className="card-title">Daily Brief</h2>
          <p className="card-body">
            One-glance view of today’s focus, budget snapshot, and a single
            3C-aligned nudge for the next 24 hours.
          </p>
          <div className="card-meta">
            <span>⏱ 2 min</span>
            <span>On-track 90 %</span>
          </div>
        </article>

        {/* Grocery Cost Lab */}
        <article className="card dash-card dash-card--highlight">
          <span className="card-tag">🏷 Grocery Cost Lab</span>
          <h2 className="card-title">Best Price in Every Aisle</h2>
          <p className="card-body">
            Compare meat, produce, dairy, pantry, snacks, and frozen across your
            favorite stores so your whole cart hits the <em>best deals</em> — not
            just the protein.
          </p>
          <div className="card-meta">
            <Link to="/app/grocery-lab" className="link-neon">
              Explore Lab →
            </Link>
            <span>Live Demo</span>
          </div>
        </article>

        {/* Meal Plan Center */}
        <article className="card dash-card">
          <span className="card-tag">🍖 Meal Plan Center</span>
          <h2 className="card-title">Create Your Next 3C Plan</h2>
          <p className="card-body">
            Build a high-protein, budget-aware plan that still works for the whole
            household — from bulk meats to kid snacks and “I’m tired” dinners.
          </p>
          <div className="card-meta">
            <Link to="/app/meal-plans" className="link-neon">
              Open Planner →
            </Link>
            <span>Now Live</span>
          </div>
        </article>

        {/* 80/20 Rewards */}
        <article className="card dash-card">
          <span className="card-tag">🎯 80/20 Rewards</span>
          <h2 className="card-title">Cheat Without Quitting</h2>
          <p className="card-body">
            Track your 80/20 lifestyle, unlock rewards for consistency, and never
            nuke your streak over one rough night, party, or road trip.
          </p>
          <div className="card-meta">
            <span>🏆 Tiered Perks</span>
            <span>Streak Logic</span>
          </div>
        </article>

        {/* F3 / Military / Students */}
        <article className="card dash-card">
          <span className="card-tag">🛡 F3 • Military • Students</span>
          <h2 className="card-title">Lifetime Perks</h2>
          <p className="card-body">
            Special memberships for the crews who always show up: F3, military,
            and students can lock in lifetime perks and pricing.
          </p>
          <div className="card-meta">
            <span>🏅 Verified</span>
            <span>Lifetime Pricing</span>
          </div>
        </article>
      </div>
    </section>
  );
}
