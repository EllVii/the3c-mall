// src/assets/components/MakeItHealthierModal.jsx
import React, { useMemo, useState } from "react";

const PRESETS = [
  { id: "LOWER_CARB", label: "Lower Carb", desc: "Common swaps to reduce carbs without judging your choices." },
  { id: "KETO", label: "Keto", desc: "Lower carb + keto-friendly swaps." },
  { id: "PALEO", label: "Paleo", desc: "Avoid grains/legumes, reduce processed ingredients." },
  { id: "LOWER_CALORIE", label: "Lower Calorie", desc: "Reduce calorie density while keeping flavor." },
];

export default function MakeItHealthierModal({ open, onClose, onApply }) {
  const [selected, setSelected] = useState("LOWER_CARB");

  const preset = useMemo(() => PRESETS.find((p) => p.id === selected), [selected]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // click outside closes
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 9999,
      }}
    >
      <div
        className="card"
        style={{
          width: "min(920px, 100%)",
          padding: "1.1rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem", alignItems: "center" }}>
          <div>
            <div className="kicker">Tool</div>
            <div style={{ fontWeight: 900, fontSize: "1.25rem", color: "var(--gold)" }}>Make it Healthier</div>
            <p className="small" style={{ marginTop: ".25rem" }}>
              Pick a preset. We’ll apply common swaps. You can edit anything after.
            </p>
          </div>

          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid" style={{ marginTop: "1rem" }}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={"btn " + (selected === p.id ? "btn-primary" : "btn-secondary")}
              style={{
                width: "100%",
                justifyContent: "flex-start",
                borderRadius: "18px",
                padding: "1rem",
                textAlign: "left",
              }}
              onClick={() => setSelected(p.id)}
            >
              <div>
                <div style={{ fontWeight: 900 }}>{p.label}</div>
                <div className="small" style={{ marginTop: ".25rem" }}>{p.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="card" style={{ marginTop: "1rem" }}>
          <div style={{ fontWeight: 900, color: "var(--blue)", letterSpacing: ".08em", textTransform: "uppercase" }}>
            Selected
          </div>
          <p className="sub" style={{ marginTop: ".35rem" }}>
            {preset?.label}: {preset?.desc}
          </p>

          <div className="nav-row" style={{ marginTop: ".9rem" }}>
            <button className="btn btn-primary" onClick={() => onApply?.(selected)}>
              Apply preset
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>

          <p className="small" style={{ marginTop: ".75rem" }}>
            Alpha-safe: this uses preset rules (no AI). Beta can add “AI suggestions” as an optional extra.
          </p>
        </div>
      </div>
    </div>
  );
}
