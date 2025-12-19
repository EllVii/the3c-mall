// src/pages/SettingsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SettingsPage.css";
import { getPrefsSafe, setNavMode } from "../utils/prefs";

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
  } catch {}
  document.documentElement.setAttribute("data-theme", id);
}

export default function SettingsPage() {
  const nav = useNavigate();
  const [prefs, setPrefs] = useState(() => getPrefsSafe());
  const [theme, setTheme] = useState(() => getThemeSafe());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const t = getThemeSafe();
    setTheme(t);
    applyTheme(t);
  }, []);

  function toggleNavMode() {
    const next = prefs?.navMode === "full" ? "focused" : "full";
    setPrefs(setNavMode(next));
  }

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
  </div>

  <div className="pill">
    <span>Navigation</span>
    <strong>{prefs?.navMode === "full" ? "Full Mall" : "Focused"}</strong>
  </div>
</header>

      {/* NAV MODE */}
      <div className="card glass settings-block">
        <h3 className="settings-h3">Navigation Mode</h3>
        <p className="small">
          Focused keeps the app minimal. Full Mall exposes all zones.
        </p>

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
        <p className="small">
          Themes affect the entire application — not just buttons.
        </p>

        <div className="theme-grid">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
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

