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
  value,
  onChange,
  spiceLevel: legacySpiceLevel,
  setSpiceLevel: setLegacySpiceLevel,
  customSpices: legacyCustomSpices,
  setCustomSpices: setLegacyCustomSpices,
}) {
  const spiceLevel = value?.level || value?.spiceLevel || legacySpiceLevel || "mild";
  const customSpices = value?.customSpices || legacyCustomSpices || "";

  function updateSpiceLevel(nextLevel) {
    setLegacySpiceLevel?.(nextLevel);
    onChange?.({
      ...(value || {}),
      level: nextLevel,
      spiceLevel: nextLevel,
    });
  }

  function updateCustomSpices(nextValue) {
    setLegacyCustomSpices?.(nextValue);
    onChange?.({
      ...(value || {}),
      customSpices: nextValue,
    });
  }

  return (
    <div className="mp-spice">
      <span className="mp-step-label mp-step-label-sub">
        Step 1b · Spices & heat
      </span>
      <h3 className="mp-section-title-sm">Spice profile & seasonings</h3>
      <p className="mp-section-subtitle-sm">
        Tell us how much heat you actually enjoy. We can also account for
        allergies and other dietary needs.
      </p>

      <div className="mp-field">
        <span className="mp-field-label">Spice level</span>
        <div className="pill-toggle-group" role="group" aria-label="Spice level">
          {SPICE_LEVELS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={
                "pill-toggle" + (spiceLevel === s.key ? " active" : "")
              }
              onClick={() => updateSpiceLevel(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mp-field">
        <label className="mp-field-label" htmlFor="mp-custom-spices">
          Favorite seasonings &amp; sauces
        </label>
        <textarea
          id="mp-custom-spices"
          rows={2}
          placeholder="Example: smoked paprika, garlic powder, ghost pepper, Ell Vii salsa, homemade BBQ…"
          value={customSpices}
          onChange={(e) => updateCustomSpices(e.target.value)}
        />
        <p className="mp-helper-text">
          We&apos;ll learn from this and from the community to suggest recipes
          that match your flavor vibe, not just macros.
        </p>
      </div>
    </div>
  );
}
