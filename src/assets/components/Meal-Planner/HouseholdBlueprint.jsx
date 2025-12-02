// src/components/meal-planner/HouseholdBlueprint.jsx
import React from "react";

export default function HouseholdBlueprint({
  householdSize,
  setHouseholdSize,
  days,
  setDays,
  dailyProteinTarget,
  setDailyProteinTarget,
  weeklyBudget,
  setWeeklyBudget,
  wantsLeftovers,
  setWantsLeftovers,
  leftoverDays,
  setLeftoverDays,
}) {
  return (
    <div className="mp-blueprint">
      <div className="mp-grid-two">
        <div className="mp-field">
          <label className="mp-field-label">Household size</label>
          <input
            type="number"
            min="1"
            max="12"
            value={householdSize}
            onChange={(e) =>
              setHouseholdSize(Math.max(1, parseInt(e.target.value) || 1))
            }
          />
        </div>

        <div className="mp-field">
          <label className="mp-field-label">Days to cover</label>
          <input
            type="number"
            min="1"
            max="30"
            value={days}
            onChange={(e) =>
              setDays(Math.max(1, parseInt(e.target.value) || 1))
            }
          />
        </div>
      </div>

      <div className="mp-grid-two">
        <div className="mp-field">
          <label className="mp-field-label">
            Protein target (g / person / day)
          </label>
          <input
            type="number"
            min="40"
            max="300"
            value={dailyProteinTarget}
            onChange={(e) =>
              setDailyProteinTarget(
                Math.max(40, parseInt(e.target.value) || 40)
              )
            }
          />
        </div>

        <div className="mp-field">
          <label className="mp-field-label">Weekly budget ($)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={weeklyBudget}
            onChange={(e) =>
              setWeeklyBudget(Math.max(0, parseFloat(e.target.value) || 0))
            }
          />
        </div>
      </div>

      <div className="mp-leftovers">
        <div className="mp-field">
          <label className="mp-field-label">
            Plan for leftovers &amp; “fridge nights”?
          </label>
          <div className="pill-toggle-group">
            <button
              type="button"
              className={"pill-toggle" + (!wantsLeftovers ? " active" : "")}
              onClick={() => setWantsLeftovers(false)}
            >
              No leftovers
            </button>
            <button
              type="button"
              className={"pill-toggle" + (wantsLeftovers ? " active" : "")}
              onClick={() => setWantsLeftovers(true)}
            >
              Yes, built-in leftovers
            </button>
          </div>
        </div>

        {wantsLeftovers && (
          <div className="mp-field mp-field-inline">
            <label className="mp-field-label">
              How many leftover days per week?
            </label>
            <input
              type="number"
              min="1"
              max="6"
              value={leftoverDays}
              onChange={(e) =>
                setLeftoverDays(
                  Math.max(1, Math.min(6, parseInt(e.target.value) || 1))
                )
              }
            />
          </div>
        )}

        <p className="mp-helper-text">
          Later, the app will ask:{" "}
          <em>“Did your {`{dish}`}&nbsp;actually last this many days?”</em>{" "}
          and adjust portions and budget to match real life — not just a label.
        </p>
      </div>
    </div>
  );
}
