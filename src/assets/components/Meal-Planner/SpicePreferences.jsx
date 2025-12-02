// src/components/meal-planner/SpicePreferences.jsx
import React from "react";

const SPICE_LEVELS = [
  { key: "none", label: "No Heat" },
  { key: "mild", label: "Mild" },
  { key: "medium", label: "Medium" },
  { key: "hot", label: "Hot" },
  { key: "extreme", label: "Extreme" },
  { key: "beyond", label: "Beyond Extreme" },
];

export default function SpicePreferences({
  spiceLevel,
  setSpiceLevel,
  customSpices,
  setCustomSpices,
}) {
  return (
    <div className="mp-spice">
      <span className="mp-step-label mp-step-label-sub">
        Step 1b · Spices & heat
      </span>
      <h3 className="mp-section-title-sm">Spice profile & seasonings</h3>
      <p className="mp-section-subtitle-sm">
        Tell us how much heat you actually enjoy. Later we&apos;ll also respect
        allergies, autoimmune triggers, and strict carnivore rules.
      </p>

      <div className="mp-field">
        <label className="mp-field-label">Spice level</label>
        <div className="pill-toggle-group">
          {SPICE_LEVELS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={
                "pill-toggle" + (spiceLevel === s.key ? " active" : "")
              }
              onClick={() => setSpiceLevel(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mp-field">
        <label className="mp-field-label">
          Favorite seasonings &amp; sauces
        </label>
        <textarea
          rows={2}
          placeholder="Example: smoked paprika, garlic powder, ghost pepper, Ell Vii salsa, homemade BBQ…"
          value={customSpices}
          onChange={(e) => setCustomSpices(e.target.value)}
        />
        <p className="mp-helper-text">
          We&apos;ll learn from this and from the community to suggest recipes
          that match your flavor vibe, not just macros.
        </p>
      </div>
    </div>
  );
}
