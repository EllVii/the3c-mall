// src/pages/SettingsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SettingsPage.css";
import { getPrefsSafe, setNavMode, resetOnboarding } from "../utils/prefs";
import { THEMES, getThemeId, setThemeId, applyTheme } from "../utils/Settings/theme.js";
import { getDateFormat, setDateFormat, getTimeFormat, setTimeFormat } from "../utils/Settings/dateTime.js";
import { writeJSON } from "../utils/Storage";

/**
 * OPTIONAL SETTINGS MODULES
 * - If you have these components, keep imports ON.
 * - If you don't have one yet, comment that import + the block below it.
 */
import ConciergeHub from "../assets/components/ConciergeHub.jsx";
import FeedbackPanel from "../assets/components/FeedbackPanel.jsx";
import FastingTimer from "../assets/components/FastingTimer.jsx";

export default function SettingsPage() {
  const nav = useNavigate();

  const [prefs, setPrefs] = useState(() => getPrefsSafe());
  const [theme, setTheme] = useState(() => getThemeId());
  const [dateFormat, setDateFormatState] = useState(() => getDateFormat());
  const [timeFormat, setTimeFormatState] = useState(() => getTimeFormat());

  // Apply theme whenever it changes
  useEffect(() => {
    setThemeId(theme);
    applyTheme(theme);
  }, [theme]);

  // Apply date/time format whenever it changes
  useEffect(() => {
    setDateFormat(dateFormat);
  }, [dateFormat]);

  useEffect(() => {
    setTimeFormat(timeFormat);
  }, [timeFormat]);

  // Ensure theme is applied on mount (covers refresh / first load)
  useEffect(() => {
    const t = getThemeId();
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

  // Re-run tour function
  function handleRerunTour() {
    resetOnboarding();
    // send them straight back to dashboard; tour will show immediately
    nav("/app");
  }

  // Dev reset function
  const handleDevReset = () => {
    const isDev = import.meta.env.MODE === 'development';
    if (!isDev) return;

    const LAST_RESET_KEY = "dev.lastOnboardingReset";
    const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

    const lastReset = parseInt(localStorage.getItem(LAST_RESET_KEY) || "0", 10);
    const now = Date.now();
    const timeSinceReset = now - lastReset;

    if (timeSinceReset < COOLDOWN_MS) {
      const minutesLeft = Math.ceil((COOLDOWN_MS - timeSinceReset) / 60000);
      alert(`DEV: Onboarding reset is on cooldown. Wait ${minutesLeft} more minute(s).`);
      return;
    }

    const confirm = window.confirm("DEV MODE: Reset onboarding and clear profile?\n\nThis will:\n- Clear your name and preferences\n- Show the welcome screen again\n- Allow re-entering all info\n\nCooldown: 30 minutes");
    
    if (confirm) {
      localStorage.removeItem("concierge.profile.v1");
      localStorage.removeItem("grocery.strategy.v1");
      localStorage.setItem(LAST_RESET_KEY, now.toString());
      window.location.reload();
    }
  };

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
                <div className="theme-title">{t.name}</div>
                <div className="theme-desc">{t.desc}</div>
                {active && <div className="theme-chip">Active</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* GUIDED TOUR */}
      <div className="card glass settings-block">
        <h3 className="settings-h3">Experience & Onboarding</h3>
        <p className="small">
          Re-run the introductory experiences.
        </p>

        <div className="nav-row" style={{ flexDirection: "column", gap: "10px", alignItems: "stretch" }}>
          <button className="btn btn-primary" onClick={handleRerunTour}>
            Re-run Guided Tour
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              localStorage.removeItem("redCarpet.seen.v1");
              localStorage.removeItem("concierge.profile.v1");
              nav("/app");
              window.location.reload();
            }}
          >
            Replay Red Carpet Intro
          </button>
          <p className="small" style={{ marginTop: "0.5rem", opacity: 0.7, fontStyle: "italic" }}>
            Note: Replaying the Red Carpet intro will reset your onboarding state.
          </p>
        </div>
      </div>

      {/* DATE & TIME FORMAT */}
      <div className="card glass settings-block">
        <h3 className="settings-h3">Date & Time Format</h3>
        <p className="small">Choose how dates and times are displayed throughout the app.</p>

        <div style={{ marginTop: "1rem" }}>
          <div style={{ fontWeight: 900, color: "var(--gold)", marginBottom: ".5rem" }}>Date Format</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className={`btn ${dateFormat === "MM/DD/YYYY" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDateFormatState("MM/DD/YYYY")}
            >
              MM/DD/YYYY
            </button>
            <button
              className={`btn ${dateFormat === "DD/MM/YYYY" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDateFormatState("DD/MM/YYYY")}
            >
              DD/MM/YYYY
            </button>
            <button
              className={`btn ${dateFormat === "YYYY-MM-DD" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDateFormatState("YYYY-MM-DD")}
            >
              YYYY-MM-DD
            </button>
          </div>
        </div>

        <div style={{ marginTop: "1.25rem" }}>
          <div style={{ fontWeight: 900, color: "var(--gold)", marginBottom: ".5rem" }}>Time Format</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className={`btn ${timeFormat === "12h" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setTimeFormatState("12h")}
            >
              12-hour
            </button>
            <button
              className={`btn ${timeFormat === "24h" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setTimeFormatState("24h")}
            >
              24-hour
            </button>
          </div>
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
            Capture beta issues fast (UI overflow, broken routes, grocery wizard, etc.).
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

      {/* DEV RESET BUTTON - only shows in development mode */}
      {import.meta.env.MODE === 'development' && (
        <div className="card glass settings-block" style={{ marginTop: "2rem", borderColor: "rgba(255, 107, 143, 0.35)", background: "rgba(255, 107, 143, 0.05)" }}>
          <h3 className="settings-h3" style={{ color: "#ff6b8f" }}>🔧 Developer Reset</h3>
          <p className="small">Clear onboarding and profile to test the initial flow again. 30-minute cooldown applies.</p>

          <button
            className="btn btn-secondary"
            onClick={handleDevReset}
            style={{
              marginTop: ".75rem",
              borderColor: "rgba(255, 107, 143, 0.50)",
              color: "#ff6b8f",
            }}
          >
            Reset Onboarding & Profile
          </button>
        </div>
      )}
    </section>
  );
}