// src/assets/components/Meal-Planner/DietConversionPanel.jsx
import React, { useEffect, useMemo, useState } from "react";

const DIETS = [
  { id: "carnivore", label: "Carnivore", notes: "Meat-first, minimal plants." },
  { id: "keto", label: "Keto", notes: "Low-carb, higher fat." },
  { id: "paleo", label: "Paleo", notes: "Whole foods, no processed." },
  { id: "balanced", label: "Balanced", notes: "Normal eating, smart portions." },
];

const MEALS = [
  { id: "quick", label: "Quick Meals", desc: "Fast, simple, low prep." },
  { id: "standard", label: "Standard Meals", desc: "Regular cooking, normal prep." },
  { id: "prep", label: "Meal Prep", desc: "Batch cook for the week." },
];

export default function DietConversionPanel({ value, onChange }) {
  const [diet, setDiet] = useState(value?.diet || "balanced");
  const [mealStyle, setMealStyle] = useState(value?.mealStyle || "standard");
  const [notes, setNotes] = useState(value?.notes || "");

  // ✅ Keep internal state in sync if parent loads saved value later
  useEffect(() => {
    if (!value) return;
    if (value.diet) setDiet(value.diet);
    if (value.mealStyle) setMealStyle(value.mealStyle);
    if (typeof value.notes === "string") setNotes(value.notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.diet, value?.mealStyle, value?.notes]);

  const summary = useMemo(() => {
    const d = DIETS.find((x) => x.id === diet);
    const m = MEALS.find((x) => x.id === mealStyle);
    return {
      dietLabel: d?.label || "",
      dietNotes: d?.notes || "",
      mealLabel: m?.label || "",
      mealDesc: m?.desc || "",
    };
  }, [diet, mealStyle]);

  function pushChange(next = {}) {
    const payload = { diet, mealStyle, notes, ...next };
    onChange?.(payload);
  }

  return (
    <section
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "18px",
        padding: "1.2rem",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <header style={{ marginBottom: "0.9rem" }}>
        <h3 style={{ margin: 0 }}>Diet Conversion Panel</h3>
        <p style={{ margin: "0.25rem 0 0 0", opacity: 0.8 }}>
          Switch your eating style without losing your plan structure.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
        <div>
          <label style={{ opacity: 0.85, fontWeight: 700 }}>Diet Type</label>
          <select
            value={diet}
            onChange={(e) => {
              const v = e.target.value;
              setDiet(v);
              pushChange({ diet: v });
            }}
            style={{
              width: "100%",
              marginTop: "0.45rem",
              padding: "0.7rem 0.8rem",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.25)",
              color: "white",
            }}
          >
            {DIETS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
          <p style={{ margin: "0.45rem 0 0 0", opacity: 0.75, fontSize: "0.92rem" }}>
            {summary.dietNotes}
          </p>
        </div>

        <div>
          <label style={{ opacity: 0.85, fontWeight: 700 }}>Meal Style</label>
          <select
            value={mealStyle}
            onChange={(e) => {
              const v = e.target.value;
              setMealStyle(v);
              pushChange({ mealStyle: v });
            }}
            style={{
              width: "100%",
              marginTop: "0.45rem",
              padding: "0.7rem 0.8rem",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.25)",
              color: "white",
            }}
          >
            {MEALS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <p style={{ margin: "0.45rem 0 0 0", opacity: 0.75, fontSize: "0.92rem" }}>
            {summary.mealDesc}
          </p>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label style={{ opacity: 0.85, fontWeight: 700 }}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => {
            const v = e.target.value;
            setNotes(v);
            pushChange({ notes: v });
          }}
          placeholder="Example: 'Keto weekdays, balanced weekends' or 'Quick meals only for lunch'..."
          style={{
            width: "100%",
            minHeight: "84px",
            marginTop: "0.45rem",
            padding: "0.7rem 0.8rem",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.25)",
            color: "white",
            resize: "vertical",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          opacity: 0.9,
        }}
      >
        <div>
          <div style={{ fontWeight: 800 }}>{summary.dietLabel}</div>
          <div style={{ opacity: 0.75, fontSize: "0.92rem" }}>{summary.mealLabel}</div>
        </div>

        <button
          type="button"
          onClick={() => {
            setDiet("balanced");
            setMealStyle("standard");
            setNotes("");
            onChange?.({ diet: "balanced", mealStyle: "standard", notes: "" });
          }}
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.22)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}