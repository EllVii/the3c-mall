// src/pages/SettingsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SettingsPage.css";
import { getPrefsSafe, setNavMode } from "../utils/prefs";

/**
 * OPTIONAL SETTINGS MODULES
 * - If you have these components, keep imports ON.
 * - If you don't have one yet, comment that import + the block below it.
 */
import ConciergeHub from "../assets/components/ConciergeHub.jsx";
import FeedbackPanel from "../assets/components/FeedbackPanel.jsx";
import FastingTimer from "../assets/components/FastingTimer.jsx";

const THEMES = [
  { id: "midnight-lux", title: "Midnight Lux", desc: "Deep navy, gold, and neon blue. Premium default." },
  { id: "velocity-red", title: "Velocity Red", desc: "Controlled performance energy with red highlights." },
  { id: "pearl-luxe", title: "Pearl Luxe", desc: "Soft silver luxury with refined contrast." },
  { id: "retro-fusion", title: "Retro Fusion", desc: "Tasteful neon — 80s / 90s / modern blend." },
];

function getThemeSafe() {
  try {
    return localStorage.getItem("3c.theme") || "midnight-lux";
  } catch {
    return "midnight-lux";
  }
}

function applyTheme(id) {
  try {
    localStorage.setItem("3c.theme", id);
  } catch {
    // ignore
  }
  document.documentElement.setAttribute("data-theme", id);
}

export default function SettingsPage() {
  const nav = useNavigate();

  const [prefs, setPrefs] = useState(() => getPrefsSafe());
  const [theme, setTheme] = useState(() => getThemeSafe());

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Ensure theme is applied on mount (covers refresh / first load)
  useEffect(() => {
    const t = getThemeSafe();
    setTheme(t);
    applyTheme(t);
  }, []);

  function toggleNavMode() {
    const next = prefs?.navMode === "full" ? "focused" : "full";
    const updated = setNavMode(next);
    setPrefs(updated);
  }

  const navModeLabel = useMemo(() => {
    return prefs?.navMode === "full" ? "Full Mall" : "Focused";
  }, [prefs?.navMode]);

  return (
    <section className="page settings-page">
      <header className="settings-header">
        <div>
          <div className="brand-emblem">
            <img src="/brand/3c-emblem.png" alt="3C Mall" />
          </div>

          <p className="kicker">Settings</p>
          <h1 className="h1">Appearance & Experience</h1>
          <p className="sub">Choose how the entire app feels — background, glow, contrast, and mood.</p>

          <div className="nav-row" style={{ marginTop: ".85rem" }}>
            <button className="btn btn-secondary" onClick={() => nav("/app")}>
              ← Dashboard
            </button>
            <button className="btn btn-secondary" onClick={() => nav("/app/meal-plans")}>
              Meal Planner →
            </button>
            <button className="btn btn-secondary" onClick={() => nav("/app/grocery-lab")}>
              Grocery Lab →
            </button>
          </div>
        </div>

        <div className="pill">
          <span>Navigation</span>
          <strong>{navModeLabel}</strong>
        </div>
      </header>

      {/* NAV MODE */}
      <div className="card glass settings-block">
        <h3 className="settings-h3">Navigation Mode</h3>
        <p className="small">Focused keeps the app minimal. Full Mall exposes all zones.</p>

        <div className="nav-row">
          <button className="btn btn-primary" onClick={toggleNavMode}>
            Toggle Mode
          </button>
          <button className="btn btn-secondary" onClick={() => nav("/app")}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* THEMES */}
      <div className="card glass settings-block">
        <h3 className="settings-h3">Theme</h3>
        <p className="small">Themes affect the entire application — not just buttons.</p>

        <div className="theme-grid">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`theme-tile ${active ? "active" : ""}`}
                onClick={() => setTheme(t.id)}
              >
                <div className="theme-title">{t.title}</div>
                <div className="theme-desc">{t.desc}</div>
                {active && <div className="theme-chip">Active</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* QUICK TOOLS (makes settings "live" beyond appearance) */}
      <div className="card glass settings-block">
        <h3 className="settings-h3">Quick Tools</h3>
        <p className="small">
          These are live modules that connect your concierge, feedback, and daily utilities.
        </p>

        {/* Concierge Hub */}
        <div style={{ marginTop: ".9rem" }}>
          <div style={{ fontWeight: 900, color: "var(--gold)" }}>Concierge</div>
          <div className="small" style={{ marginTop: ".25rem" }}>
            Help, shortcuts, and guided actions — without leaving your workflow.
          </div>

          <div style={{ marginTop: ".65rem" }}>
            <ConciergeHub />
          </div>
        </div>

        {/* Feedback */}
        <div style={{ marginTop: "1.25rem", paddingTop: "1.1rem", borderTop: "1px solid rgba(126,224,255,.12)" }}>
          <div style={{ fontWeight: 900, color: "var(--gold)" }}>Feedback</div>
          <div className="small" style={{ marginTop: ".25rem" }}>
            Capture alpha/beta issues fast (UI overflow, broken routes, grocery wizard, etc.).
          </div>

          <div style={{ marginTop: ".65rem" }}>
            <FeedbackPanel />
          </div>
        </div>

        {/* Fasting Timer */}
        <div style={{ marginTop: "1.25rem", paddingTop: "1.1rem", borderTop: "1px solid rgba(126,224,255,.12)" }}>
          <div style={{ fontWeight: 900, color: "var(--gold)" }}>Fasting Timer</div>
          <div className="small" style={{ marginTop: ".25rem" }}>
            Optional utility. Useful for meal timing + consistency.
          </div>

          <div style={{ marginTop: ".65rem" }}>
            <FastingTimer />
          </div>
        </div>
      </div>

      {/* PREVIEW */}
      <div className="settings-preview">
        <div className="settings-preview-title">Live Preview</div>
        <p className="small">
          This page, the background, and all cards update instantly when you switch themes.
        </p>
      </div>
    </section>
  );
}