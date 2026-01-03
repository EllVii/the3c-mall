// src/assets/components/SettingsModal.jsx
import React, { useMemo, useState } from "react";
import { getPrefsSafe, setNavMode } from "../../utils/prefs";

const THEMES = [
  { id: "midnight-lux", name: "Midnight Lux" },
  { id: "velocity-red", name: "Velocity Red" },
  { id: "pearl-luxe", name: "Pearl Luxe" },
  { id: "retro-fusion", name: "Retro Fusion" },
];

export default function SettingsModal({ open, onClose, prefs, onChange }) {
  const [local, setLocal] = useState(() => prefs || getPrefsSafe());

  // keep local in sync when opened
  const safePrefs = useMemo(() => prefs || getPrefsSafe(), [prefs]);

  if (!open) return null;

  const currentTheme = document.documentElement.getAttribute("data-theme") || "midnight-lux";

  function applyTheme(themeId) {
    document.documentElement.setAttribute("data-theme", themeId);
  }

  function applyMode(nextMode) {
    const next = setNavMode(nextMode);
    setLocal(next);
    onChange?.(next);
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal-panel">
        <div className="modal-head">
          <div>
            <div className="modal-title">Settings</div>
            <div className="modal-sub">Theme + navigation</div>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <div className="modal-section-title">Theme</div>
            <div className="modal-grid">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  className="modal-choice"
                  data-on={currentTheme === t.id ? "true" : "false"}
                  onClick={() => applyTheme(t.id)}
                >
                  <div className="modal-choice-title">{t.name}</div>
                  <div className="modal-choice-desc">Tap to apply</div>
                </button>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-title">Navigation</div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={() => applyMode("focused")}
              >
                Focused
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => applyMode("full")}
              >
                Full Mall
              </button>
            </div>

            <div className="small" style={{ marginTop: "10px" }}>
              Current: <strong>{safePrefs?.navMode === "full" ? "Full Mall" : "Focused"}</strong>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={() => applyTheme("midnight-lux")}>
            Reset theme
          </button>
        </div>
      </div>
    </div>
  );
}
