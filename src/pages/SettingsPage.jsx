// src/pages/SettingsPage.jsx
import React, { useEffect, useState } from "react";

const THEMES = [
  { id: "midnight-lux", label: "Midnight Lux" },
  { id: "velocity-red", label: "Velocity Red" },
  { id: "pearl-luxe", label: "Pearl Luxe" },
  { id: "retro-fusion", label: "Retro Fusion" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("appSettings");
    return saved
      ? JSON.parse(saved)
      : { dateFormat: "mm/dd/yyyy", timeFormat: "12h", theme: "midnight-lux" };
  });

  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings]);

  return (
    <section className="page">
      <p className="kicker">App · Settings</p>
      <h1 className="h1">Settings</h1>
      <p className="sub">Made to be easy to read (servicemen + military friendly).</p>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0, color: "var(--gold)" }}>Date & Time</h3>

        <label className="label">Date format</label>
        <select
          className="select"
          value={settings.dateFormat}
          onChange={(e) => setSettings((s) => ({ ...s, dateFormat: e.target.value }))}
        >
          <option value="mm/dd/yyyy">MM/DD/YYYY</option>
          <option value="yyyy-mm-dd">YYYY-MM-DD</option>
        </select>

        <label className="label">Time format</label>
        <select
          className="select"
          value={settings.timeFormat}
          onChange={(e) => setSettings((s) => ({ ...s, timeFormat: e.target.value }))}
        >
          <option value="12h">12 Hour</option>
          <option value="24h">24 Hour</option>
        </select>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0, color: "var(--gold)" }}>Theme</h3>
        <div className="grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={"btn " + (settings.theme === t.id ? "btn-primary" : "btn-secondary")}
              onClick={() => setSettings((s) => ({ ...s, theme: t.id }))}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
