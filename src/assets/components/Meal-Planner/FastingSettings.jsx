// src/assets/components/Meal-Planner/FastingSettings.jsx
import React, { useEffect, useState } from "react";
import { readJSON, writeJSON, nowISO } from "../../../utils/Storage";

const FASTING_KEY = "mp.fasting.v1";

export default function FastingSettings({ value, onChange }) {
  const saved = (() => {
    try {
      return readJSON(FASTING_KEY, null);
    } catch {
      return null;
    }
  })();

  const [enabled, setEnabled] = useState(value?.enabled ?? saved?.enabled ?? false);
  const [mode, setMode] = useState(value?.mode ?? saved?.mode ?? "16:8"); // 16:8 | 18:6 | OMAD
  const [start, setStart] = useState(value?.start ?? saved?.start ?? "20:00");
  const [end, setEnd] = useState(value?.end ?? saved?.end ?? "12:00");

  function emit(nextPatch = {}) {
    const payload = {
      enabled,
      mode,
      start,
      end,
      ...nextPatch,
      updatedAt: nowISO(),
    };
    try {
      writeJSON(FASTING_KEY, payload);
    } catch {}
    onChange?.(payload);
  }

  // keep storage + parent synced when local state changes
  useEffect(() => {
    emit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, mode, start, end]);

  return (
    <section className="card glass" style={{ marginTop: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 900, color: "var(--gold)", fontSize: "1.05rem" }}>Fasting Settings</div>
          <p className="small" style={{ marginTop: ".35rem" }}>
            Optional. Helps timing suggestions (no judgment).
          </p>
        </div>

        <button
          type="button"
          className={"btn " + (enabled ? "btn-primary" : "btn-secondary")}
          onClick={() => setEnabled((p) => !p)}
        >
          {enabled ? "Enabled" : "Off"}
        </button>
      </div>

      {enabled && (
        <>
          <div className="grid" style={{ marginTop: ".9rem", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
            <div>
              <label className="label">Mode</label>
              <select className="select" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="16:8">16:8</option>
                <option value="18:6">18:6</option>
                <option value="OMAD">OMAD</option>
              </select>
            </div>

            <div>
              <label className="label">Eating Window</label>
              <div className="nav-row" style={{ gap: ".5rem" }}>
                <input className="input" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
                <span className="small" style={{ opacity: 0.8 }}>to</span>
                <input className="input" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
          </div>

          <p className="small" style={{ marginTop: ".75rem", opacity: 0.85 }}>
            Saved locally. Beta: link to reminders + grocery timing.
          </p>
        </>
      )}
    </section>
  );
}