// src/components/settings/ThemeSelector.jsx
import React from "react";
import { THEMES, setThemeId, applyTheme } from "../../utils/Settings/theme.js";

export default function ThemeSelector() {
  function setTheme(t) {
    setThemeId(t);
    applyTheme(t);
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
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}
