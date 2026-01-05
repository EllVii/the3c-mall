// src/pages/RecipeDetailPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { readJSON, writeJSON, nowISO, safeId } from "../utils/Storage";
import { applyRecipePreset } from "../utils/recipeTransform";
import { recipeToGroceryItems, mergeGroceryItems } from "../utils/recipeToGrocery";
import MakeItHealthierModal from "../assets/components/MakeItHealthierModal";

const RECIPE_PREFIX_KEY = (id) => `recipe.${id}.v1`;
const RECIPES_KEY = "recipes.v1";
const GROCERY_KEY = "grocery.items.v1";
const HANDOFF_KEY = "handoff.mealToGrocery.v1";

function loadRecipe(id) {
  return readJSON(RECIPE_PREFIX_KEY(id), null);
}
function saveRecipe(recipe) {
  writeJSON(RECIPE_PREFIX_KEY(recipe.id), recipe);
}

function updateSummary(recipe) {
  const list = readJSON(RECIPES_KEY, []);
  const next = list.map((x) =>
    x.id === recipe.id
      ? {
          ...x,
          title: recipe.title,
          description: recipe.description,
          updatedAt: recipe.updatedAt,
          favorites: recipe.favorites,
        }
      : x
  );
  writeJSON(RECIPES_KEY, next);
}

export default function RecipeDetailPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ingredients"); // ingredients | steps | notes

  const recipe = useMemo(() => loadRecipe(id), [id]);
  const [draft, setDraft] = useState(recipe);

  if (!draft) {
    return (
      <section className="page">
        <p className="kicker">Center · Recipes</p>
        <h1 className="h1">Recipe not found</h1>
        <div className="nav-row">
          <button className="btn btn-secondary" onClick={() => nav("/app/recipes")}>
            Back to Recipes
          </button>
        </div>
      </section>
    );
  }

  function saveDraft(next) {
    const updated = { ...next, updatedAt: nowISO() };
    setDraft(updated);
    saveRecipe(updated);
    updateSummary(updated);
  }

  function addIngredientRow() {
    const ing = {
      id: safeId("ing"),
      name: "",
      amount: 1,
      unit: "each",
      form: null,
      category: "Other",
      tags: [],
      optional: false,
      grocery: { canonicalName: "", storeSku: null, brand: null },
      substitutions: [],
    };
    saveDraft({ ...draft, ingredients: [...(draft.ingredients || []), ing] });
  }

  function updateIngredient(idx, patch) {
    const next = [...(draft.ingredients || [])];
    next[idx] = { ...next[idx], ...patch };
    saveDraft({ ...draft, ingredients: next });
  }

  function removeIngredient(idx) {
    const next = [...(draft.ingredients || [])];
    next.splice(idx, 1);
    saveDraft({ ...draft, ingredients: next });
  }

  // ✅ UPDATED: add to grocery + navigate to grocery lab with handoff message
  function addToGrocery() {
    const add = recipeToGroceryItems(draft, draft.servings?.defaultServings || 1);
    const current = readJSON(GROCERY_KEY, []);
    const merged = mergeGroceryItems(current, add);
    writeJSON(GROCERY_KEY, merged);

    // handoff message for GroceryLabPage to display once
    writeJSON(HANDOFF_KEY, {
      at: nowISO(),
      message: "Recipe ingredients added → Grocery updated ✅",
      source: "recipes",
      recipeId: draft.id,
      recipeTitle: draft.title,
    });

    // ✅ take them straight to grocery lab (strategy + review)
    nav("/app/grocery-lab", {
      state: {
        from: "recipes",
        quickReview: true, // GroceryLabPage can jump to Review step if you want
      },
    });
  }

  function applyPreset(preset) {
    const { nextRecipe } = applyRecipePreset(draft, preset);
    saveDraft(nextRecipe);
    setModalOpen(false);

    // optional: keep your toast style for global app messaging if you want it
    writeJSON("toast.v1", { message: `Applied: ${preset.replaceAll("_", " ")} ✅`, at: nowISO() });
  }

  return (
    <section className="page">
      <p className="kicker">Center · Recipes</p>
      <h1 className="h1">{draft.title}</h1>
      <p className="sub">{draft.description}</p>

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={() => nav("/app/recipes")}>
          Back to Recipes
        </button>

        {/* ✅ this now links into Grocery Lab flow */}
        <button className="btn btn-primary" onClick={addToGrocery}>
          Add to Grocery
        </button>

        <button className="btn btn-ghost" onClick={() => setModalOpen(true)}>
          Make it Healthier
        </button>
      </div>

      <div className="grid" style={{ marginTop: "1rem" }}>
        <div className="card">
          <label className="label">Title</label>
          <input
            className="input"
            value={draft.title}
            onChange={(e) => saveDraft({ ...draft, title: e.target.value })}
          />

          <label className="label">Description</label>
          <textarea
            className="textarea"
            value={draft.description || ""}
            onChange={(e) => saveDraft({ ...draft, description: e.target.value })}
          />

          <div className="nav-row" style={{ marginTop: ".9rem" }}>
            <button
              className={"btn " + (activeTab === "ingredients" ? "btn-primary" : "btn-secondary")}
              onClick={() => setActiveTab("ingredients")}
            >
              Ingredients
            </button>
            <button
              className={"btn " + (activeTab === "steps" ? "btn-primary" : "btn-secondary")}
              onClick={() => setActiveTab("steps")}
            >
              Steps
            </button>
            <button
              className={"btn " + (activeTab === "notes" ? "btn-primary" : "btn-secondary")}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>
          </div>

          <p className="small" style={{ marginTop: ".8rem" }}>
            Updated: {draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : "—"}
          </p>
        </div>

        <div className="card">
          {activeTab === "ingredients" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem", alignItems: "center" }}>
                <div style={{ fontWeight: 900, color: "var(--gold)" }}>Ingredients</div>
                <button className="btn btn-primary" onClick={addIngredientRow}>
                  + Add
                </button>
              </div>

              <div style={{ marginTop: ".75rem" }}>
                {(draft.ingredients || []).map((it, idx) => (
                  <div
                    key={it.id}
                    style={{ borderTop: "1px solid rgba(126,224,255,.12)", paddingTop: ".75rem", marginTop: ".75rem" }}
                  >
                    <div className="grid" style={{ gridTemplateColumns: "1.5fr .8fr .8fr", gap: ".6rem" }}>
                      <div>
                        <label className="label">Name</label>
                        <input
                          className="input"
                          value={it.name}
                          onChange={(e) =>
                            updateIngredient(idx, {
                              name: e.target.value,
                              grocery: { ...(it.grocery || {}), canonicalName: e.target.value },
                            })
                          }
                          placeholder="e.g., ground beef"
                        />
                      </div>

                      <div>
                        <label className="label">Amount</label>
                        <input
                          className="input"
                          type="number"
                          value={it.amount}
                          onChange={(e) => updateIngredient(idx, { amount: Number(e.target.value || 0) })}
                        />
                      </div>

                      <div>
                        <label className="label">Unit</label>
                        <input
                          className="input"
                          value={it.unit}
                          onChange={(e) => updateIngredient(idx, { unit: e.target.value })}
                          placeholder="lb / oz / each"
                        />
                      </div>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: ".6rem", marginTop: ".6rem" }}>
                      <div>
                        <label className="label">Category</label>
                        <select
                          className="select"
                          value={it.category || "Other"}
                          onChange={(e) => updateIngredient(idx, { category: e.target.value })}
                        >
                          {["Meat", "Produce", "Pantry", "Dairy", "Frozen", "Other"].map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="label">Form (optional)</label>
                        <input
                          className="input"
                          value={it.form || ""}
                          onChange={(e) => updateIngredient(idx, { form: e.target.value })}
                          placeholder="90/10, shredded…"
                        />
                      </div>

                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost" onClick={() => removeIngredient(idx)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "steps" && (
            <>
              <div style={{ fontWeight: 900, color: "var(--gold)" }}>Steps</div>
              <p className="small" style={{ marginTop: ".35rem" }}>Alpha-safe: simple step list (text).</p>

              <textarea
                className="textarea"
                value={(draft.steps || []).map((s) => s.text).join("\n")}
                onChange={(e) => {
                  const lines = e.target.value.split("\n").filter((x) => x.trim().length);
                  const steps = lines.map((t, i) => ({ n: i + 1, text: t }));
                  saveDraft({ ...draft, steps });
                }}
                placeholder={"Step 1...\nStep 2...\nStep 3..."}
                style={{ marginTop: ".6rem" }}
              />
            </>
          )}

          {activeTab === "notes" && (
            <>
              <div style={{ fontWeight: 900, color: "var(--gold)" }}>Notes</div>
              <textarea
                className="textarea"
                value={draft.notes || ""}
                onChange={(e) => saveDraft({ ...draft, notes: e.target.value })}
                placeholder="Anything you want to remember…"
                style={{ marginTop: ".6rem" }}
              />
            </>
          )}
        </div>
      </div>

      <MakeItHealthierModal open={modalOpen} onClose={() => setModalOpen(false)} onApply={applyPreset} />
    </section>
  );
}