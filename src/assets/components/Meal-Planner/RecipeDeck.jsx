// src/components/meal-planner/RecipeDeck.jsx
import React, { useState } from "react";
import { BASE_RECIPES } from "../../../utils/recipes.js";

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
  { key: "skillet", label: "Skillet" },
  { key: "wok", label: "Wok" },
  { key: "slow-cooker", label: "Slow Cooker" },
  { key: "pot", label: "Pot" },
  { key: "stovetop", label: "Stovetop" },
  { key: "sheet pan", label: "Sheet Pan" },
  { key: "no-cook", label: "No Cook" },
];

export default function RecipeDeck({
  focus,
  setFocus,
  cookingMethods,
  onToggleCookingMethod,
  currentRecipe,
  totalRecipes,
  onNext,
  onPrev,
}) {
  const [selectedVariant, setSelectedVariant] = useState(currentRecipe?.variants?.[0] || null);

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
                  {currentRecipe.imageUrl ? (
                    <img 
                      src={currentRecipe.imageUrl} 
                      alt={currentRecipe.name}
                      className="mp-rolodex-image"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px 8px 0 0"
                      }}
                    />
                  ) : (
                    <div className="mp-rolodex-image-placeholder">
                      <span className="mp-rolodex-image-label">
                        {currentRecipe.name}
                      </span>
                    </div>
                  )}
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
                      Spice: {currentRecipe.spiceLevel?.toUpperCase() || "Mild"}
                    </span>
                  </div>

                  {/* Variant selection */}
                  {currentRecipe.variants && currentRecipe.variants.length > 0 && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(126,224,255,.12)" }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>
                        Choose variant
                      </label>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {currentRecipe.variants.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            style={{
                              padding: "6px 10px",
                              fontSize: 12,
                              borderRadius: 4,
                              border: selectedVariant === v ? "1px solid var(--gold)" : "1px solid rgba(126,224,255,.12)",
                              background: selectedVariant === v ? "rgba(246,220,138,.15)" : "transparent",
                              color: selectedVariant === v ? "var(--gold)" : "inherit",
                              cursor: "pointer",
                              transition: "all 0.2s ease"
                            }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mp-rolodex-blurb">
                    Full recipe and shopping list coming when you select this meal.
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
