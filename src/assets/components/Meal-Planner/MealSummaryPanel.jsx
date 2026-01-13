// src/assets/components/Meal-Planner/MealSummaryPanel.jsx
import React, { useMemo } from "react";

/**
 * MealSummaryPanel
 * Lightweight read-only summary for Meal Planner
 * Safe for Alpha/Beta – no API calls
 */
export default function MealSummaryPanel({
  meal,
  diet,
  fasting,
  spice,
}) {
  const summary = useMemo(() => {
    // Combine date + time for clarity
    const dateTimeDisplay = meal?.dateISO && meal?.time24 
      ? `${meal.dateISO} at ${meal.time24}`
      : "—";
    
    return {
      mealLabel: meal?.mealLabel || meal?.mealId || "—",
      scheduled: dateTimeDisplay,
      diet: diet?.diet || "balanced",
      mealStyle: diet?.mealStyle || "standard",
      fasting: fasting?.enabled ? fasting?.mode : "Off",
      spice: spice?.level || "Normal",
    };
  }, [meal, diet, fasting, spice]);

  return (
    <section className="card glass" style={{ marginTop: "1rem" }}>
      <div style={{ fontWeight: 900, color: "var(--gold)", fontSize: "1.05rem" }}>
        Meal Summary
      </div>

      <p className="small" style={{ marginTop: ".35rem" }}>
        Final snapshot before Grocery Lab handoff.
      </p>

      <div
        style={{
          marginTop: ".9rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: ".6rem",
        }}
      >
        <SummaryRow label="Meal" value={summary.mealLabel} />
        <SummaryRow label="Scheduled" value={summary.scheduled} />
        <SummaryRow label="Diet" value={summary.diet} />
        <SummaryRow label="Meal Style" value={summary.mealStyle} />
        <SummaryRow label="Fasting" value={summary.fasting} />
        <SummaryRow label="Spice Level" value={summary.spice} />
      </div>

      <p className="small" style={{ marginTop: ".75rem", opacity: 0.8 }}>
        This summary is saved locally and sent to Grocery Lab for routing.
      </p>
    </section>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: ".5rem",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: ".25rem",
      }}
    >
      <span className="small" style={{ opacity: 0.7 }}>{label}</span>
      <strong style={{ color: "var(--blue)" }}>{value}</strong>
    </div>
  );
}