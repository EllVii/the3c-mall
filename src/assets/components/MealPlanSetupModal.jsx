// src/assets/components/MealPlanSetupModal.jsx
import React, { useState, useEffect } from "react";
import "./MealPlanSetupModal.css";

export default function MealPlanSetupModal({ onConfirm }) {
  const [mealsPerDay, setMealsPerDay] = useState(2);
  const [snacks, setSnacks] = useState(false);
  const [fasting, setFasting] = useState("none");
  const [fastHours, setFastHours] = useState(16);
  const [fastDays, setFastDays] = useState(1);
  const [prepReminder, setPrepReminder] = useState(true);

  const closeAndSend = () => {
    onConfirm({
      mealsPerDay,
      snacks,
      fasting,
      fastHours,
      fastDays,
      prepReminder,
    });
  };

  // Lock scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="meal-modal-overlay">
      <div className="meal-modal-container">
        <h2 className="meal-modal-title">Set up today’s meal plan</h2>
        <p className="meal-modal-subtitle">
          Your concierge will shape macros, meals, and budget around today’s
          rhythm.
        </p>

        {/* Meals per day */}
        <div className="meal-modal-field">
          <label>Meals per day</label>
          <div className="pill-toggle-group">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                className={`pill-toggle ${
                  mealsPerDay === num ? "active" : ""
                }`}
                onClick={() => setMealsPerDay(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Snacks toggle */}
        <div className="meal-modal-field">
          <label>Include snacks between meals</label>
          <div className="pill-toggle-group">
            {["No", "Yes"].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`pill-toggle ${
                  snacks === (opt === "Yes") ? "active" : ""
                }`}
                onClick={() => setSnacks(opt === "Yes")}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Fasting options */}
        <div className="meal-modal-field">
          <label>Fasting plan</label>
          <div className="pill-toggle-group">
            {["none", "hours", "full-day"].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`pill-toggle ${fasting === opt ? "active" : ""}`}
                onClick={() => setFasting(opt)}
              >
                {opt === "none"
                  ? "No fasting"
                  : opt === "hours"
                  ? "Daily hours"
                  : "Full day(s)"}
              </button>
            ))}
          </div>

          {fasting === "hours" && (
            <div className="meal-modal-subinput">
              <label>Fasting hours (per day)</label>
              <input
                type="number"
                min="12"
                max="48"
                value={fastHours}
                onChange={(e) =>
                  setFastHours(Math.max(12, Math.min(48, +e.target.value || 0)))
                }
              />
            </div>
          )}

          {fasting === "full-day" && (
            <div className="meal-modal-subinput">
              <label>Number of full fasting days</label>
              <input
                type="number"
                min="1"
                max="7"
                value={fastDays}
                onChange={(e) =>
                  setFastDays(Math.max(1, Math.min(7, +e.target.value || 1)))
                }
              />
            </div>
          )}
        </div>

        {/* Prep-time reminder */}
        <div className="meal-modal-field">
          <label>Prep-time reminder</label>
          <div className="pill-toggle-group">
            {["No", "Yes"].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`pill-toggle ${
                  prepReminder === (opt === "Yes") ? "active" : ""
                }`}
                onClick={() => setPrepReminder(opt === "Yes")}
              >
                {opt}
              </button>
            ))}
          </div>
          <p className="meal-modal-hint">
            When you’re fasting, reminders can line up cooking so your meal
            finishes right as your fast ends.
          </p>
        </div>

        <button
          type="button"
          className="meal-modal-confirm"
          onClick={closeAndSend}
        >
          Build my plan →
        </button>
      </div>
    </div>
  );
}
