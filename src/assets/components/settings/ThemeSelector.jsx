// src/components/settings/ThemeSelector.jsx
import React from "react";

const THEMES = [
  { id: "midnight-lux", label: "Midnight Lux" },
  { id: "velocity-red", label: "Velocity Red" },
  { id: "pearl-luxe", label: "Pearl Luxe" },
  { id: "retro-fusion", label: "Retro Fusion" },
];

export default function ThemeSelector() {
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  }

  return (
    <div className="card">
      <h3>Theme</h3>
      <div className="grid">
        {THEMES.map((t) => (
          <button
            key={t.id}
            className="btn btn-secondary"
            onClick={() => setTheme(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
