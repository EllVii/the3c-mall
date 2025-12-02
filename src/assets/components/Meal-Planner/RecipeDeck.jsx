// src/components/meal-planner/RecipeDeck.jsx
import React from "react";
import { BASE_RECIPES } from "../../pages/MealPlannerPage.jsx";

const FOCUS_LABELS = {
  "no-restrictions": "No Restrictions",
  carnivore: "Carnivore",
  keto: "Keto",
  paleo: "Paleo",
};

const COOKING_METHODS = [
  { key: "stove", label: "Stove" },
  { key: "oven", label: "Oven / Sheet Pan" },
  { key: "air-fryer", label: "Air Fryer" },
  { key: "cast-iron", label: "Cast Iron" },
  { key: "grill", label: "Grill" },
];

export default function RecipeDeck({
  focus,
  setFocus,
  cookingMethods,
  onToggleCookingMethod,
  spiceLevel,
  setSpiceLevel,
  currentRecipe,
  totalRecipes,
  onNext,
  onPrev,
}) {
  const displayIndex =
    currentRecipe && totalRecipes > 0
      ? BASE_RECIPES.findIndex((r) => r.id === currentRecipe.id) + 1
      : 0;

  return (
    <div className="mp-deck">
      {/* Focus row */}
      <div className="mp-deck-controls">
        <div className="mp-field">
          <label className="mp-field-label">Diet focus</label>
          <div className="pill-toggle-group">
            {["no-restrictions", "carnivore", "keto", "paleo"].map((f) => (
              <button
                key={f}
                type="button"
                className={
                  "pill-toggle" + (focus === f ? " active" : "")
                }
                onClick={() => setFocus(f)}
              >
                {FOCUS_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Cooking methods */}
        <div className="mp-field">
          <label className="mp-field-label">Preferred methods</label>
          <div className="pill-toggle-group">
            {COOKING_METHODS.map((m) => (
              <button
                key={m.key}
                type="button"
                className={
                  "pill-toggle" +
                  (cookingMethods.includes(m.key) ? " active" : "")
                }
                onClick={() => onToggleCookingMethod(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe card rolodex */}
      <div className="mp-rolodex">
        <div className="mp-rolodex-stack">
          {/* back ghost card */}
          <div className="mp-rolodex-card mp-rolodex-card-back" />

          {/* active card */}
          <div className="mp-rolodex-card mp-rolodex-card-front">
            {currentRecipe ? (
              <>
                <div className="mp-rolodex-image-shell">
                  <div className="mp-rolodex-image-placeholder">
                    {/* Later: plug AI/live image here */}
                    <span className="mp-rolodex-image-label">
                      {currentRecipe.imagePrompt}
                    </span>
                  </div>
                </div>

                <div className="mp-rolodex-content">
                  <h3 className="mp-rolodex-title">
                    {currentRecipe.name}
                  </h3>
                  <div className="mp-rolodex-tags">
                    <span className="mp-tag mp-tag-focus">
                      {FOCUS_LABELS[focus]}
                    </span>
                    <span className="mp-tag">
                      {currentRecipe.timeTag || "Under 45 min"}
                    </span>
                    <span className="mp-tag">
                      {currentRecipe.methods.join(" · ")}
                    </span>
                    <span className="mp-tag">
                      Spice: {spiceLevel.toUpperCase()}
                    </span>
                  </div>
                  <p className="mp-rolodex-blurb">
                    Full recipe lives in a pop-out card. When you&apos;re
                    ready to cook, we&apos;ll show you the exact steps,
                    timing, and a live image so you know exactly what it
                    should look like.
                  </p>
                </div>

                <div className="mp-rolodex-footer">
                  <button
                    type="button"
                    className="mp-rolodex-nav mp-rolodex-nav-prev"
                    onClick={onPrev}
                  >
                    ← Prev
                  </button>
                  <div className="mp-rolodex-counter">
                    {totalRecipes > 0 ? (
                      <>
                        <span>
                          Card {displayIndex} of {totalRecipes}
                        </span>
                        <span className="mp-rolodex-hint">
                          Swipe / tap next to rotate your deck
                        </span>
                      </>
                    ) : (
                      <span>No recipes match this filter yet.</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="mp-rolodex-nav mp-rolodex-nav-next"
                    onClick={onNext}
                  >
                    Next →
                  </button>
                </div>
              </>
            ) : (
              <div className="mp-rolodex-empty">
                No recipes match your current focus + methods. Try turning a
                method back on or switching focus.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
