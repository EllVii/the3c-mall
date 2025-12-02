// src/components/meal-planner/FastingAndTiming.jsx
import React from "react";

export default function FastingAndTiming({
  fastingHours,
  setFastingHours,
  mealsPerDay,
  setMealsPerDay,
}) {
  return (
    <div className="mp-fasting">
      <span className="mp-step-label mp-step-label-sub">
        Step 3 · Fasting & timing
      </span>
      <h3 className="mp-section-title-sm">Fasting windows & meal count</h3>
      <p className="mp-section-subtitle-sm">
        If you fast, we can line up meal prep so food is ready near the end of
        your eating window — not at a random hour.
      </p>

      <div className="mp-grid-two">
        <div className="mp-field">
          <label className="mp-field-label">Fasting window (hours)</label>
          <input
            type="number"
            min="0"
            max="24"
            value={fastingHours}
            onChange={(e) =>
              setFastingHours(
                Math.max(0, Math.min(24, parseInt(e.target.value) || 0))
              )
            }
          />
          <p className="mp-helper-text">
            0 = no fasting. Common windows: 12, 16, 18.
          </p>
        </div>

        <div className="mp-field">
          <label className="mp-field-label">Meals per day</label>
          <input
            type="number"
            min="1"
            max="6"
            value={mealsPerDay}
            onChange={(e) =>
              setMealsPerDay(
                Math.max(1, Math.min(6, parseInt(e.target.value) || 1))
              )
            }
          />
        </div>
      </div>

      <p className="mp-helper-text">
        In a later phase, you&apos;ll be able to set exact meal times and let
        the app remind you when to start prepping so your food finishes right
        as your fast ends.
      </p>
    </div>
  );
}
