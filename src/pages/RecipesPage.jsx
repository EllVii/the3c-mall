// src/pages/RecipesPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON, safeId, nowISO } from "../utils/Storage";
import { applyRecipePreset } from "../utils/recipeTransform";
import { recipeToGroceryItems, mergeGroceryItems } from "../utils/recipeToGrocery";

const RECIPES_KEY = "recipes.v1";
const RECIPE_PREFIX_KEY = (id) => `recipe.${id}.v1`;
const GROCERY_KEY = "grocery.items.v1";
const HANDOFF_KEY = "handoff.mealToGrocery.v1";

function seedRecipe() {
  const id = safeId("rcp");
  const t = nowISO();
  const recipe = {
    schemaVersion: 1,
    id,
    title: "Grandma's Lasagna",
    description: "Family classic. Comfort meal.",
    createdAt: t,
    updatedAt: t,
    owner: { userId: null, deviceId: null },
    visibility: "private",
    source: { type: "manual", url: null, provider: null, externalId: null },
    servings: { defaultServings: 6, unit: "serving" },
    time: { prepMinutes: 25, cookMinutes: 45 },
    ingredients: [
      {
        id: safeId("ing"),
        name: "ground beef",
        amount: 2,
        unit: "lb",
        form: "90/10",
        category: "Meat",
        tags: ["protein"],
        optional: false,
        grocery: { canonicalName: "ground beef", storeSku: null, brand: null },
        substitutions: [],
      },
      {
        id: safeId("ing"),
        name: "lasagna noodles",
        amount: 1,
        unit: "box",
        form: null,
        category: "Pantry",
        tags: ["carb"],
        optional: false,
        grocery: { canonicalName: "lasagna noodles", storeSku: null, brand: null },
        substitutions: [],
      },
      {
        id: safeId("ing"),
        name: "marinara sauce",
        amount: 1,
        unit: "jar",
        form: null,
        category: "Pantry",
        tags: ["sauce"],
        optional: false,
        grocery: { canonicalName: "marinara sauce", storeSku: null, brand: null },
        substitutions: [],
      },
      {
        id: safeId("ing"),
        name: "mozzarella cheese",
        amount: 16,
        unit: "oz",
        form: "shredded",
        category: "Dairy",
        tags: ["dairy"],
        optional: false,
        grocery: { canonicalName: "mozzarella cheese", storeSku: null, brand: null },
        substitutions: [],
      },
    ],
    steps: [
      { n: 1, text: "Brown beef and season." },
      { n: 2, text: "Layer sauce, noodles, cheese." },
      { n: 3, text: "Bake until bubbly." },
    ],
    nutrition: { perServing: { calories: null, proteinG: null, carbsG: null, fatG: null } },
    lifestyle: {
      tags: ["family", "comfort"],
      compatible: { carnivore: false, keto: false, paleo: false, balanced: true },
    },
    transform: { lastAppliedPreset: null, delta: { removed: [], added: [], swapped: [] } },
    notes: "",
    favorites: false,
  };

  return recipe;
}

function loadRecipeSummaries() {
  return readJSON(RECIPES_KEY, []);
}

function saveRecipeSummaries(list) {
  writeJSON(RECIPES_KEY, list);
}

function loadRecipe(id) {
  return readJSON(RECIPE_PREFIX_KEY(id), null);
}

function saveRecipe(recipe) {
  writeJSON(RECIPE_PREFIX_KEY(recipe.id), recipe);
}

export default function RecipesPage() {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [onlyFav, setOnlyFav] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const summaries = useMemo(() => loadRecipeSummaries(), []);
  const [list, setList] = useState(summaries);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list
      .filter((r) => (onlyFav ? !!r.favorites : true))
      .filter((r) => (!q ? true : (r.title || "").toLowerCase().includes(q)));
  }, [list, query, onlyFav]);

  // Predictive search - generate suggestions as user types
  const predictiveSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    
    // Search in title, description, and ingredient names
    const matches = list
      .map((recipe) => {
        const fullRecipe = loadRecipe(recipe.id);
        if (!fullRecipe) return null;
        
        const titleMatch = (recipe.title || "").toLowerCase().includes(q);
        const descMatch = (recipe.description || "").toLowerCase().includes(q);
        const ingredientMatch = fullRecipe.ingredients?.some(ing => 
          (ing.name || "").toLowerCase().includes(q)
        );
        const tagMatch = fullRecipe.lifestyle?.tags?.some(tag => 
          tag.toLowerCase().includes(q)
        );
        
        if (titleMatch || descMatch || ingredientMatch || tagMatch) {
          return {
            ...recipe,
            matchType: titleMatch ? 'title' : descMatch ? 'description' : ingredientMatch ? 'ingredient' : 'tag',
            ingredients: fullRecipe.ingredients
          };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 5); // Limit to top 5 suggestions
    
    return matches;
  }, [query, list]);

  function handleQueryChange(value) {
    setQuery(value);
    setShowSuggestions(value.trim().length >= 2);
  }

  function selectSuggestion(recipe) {
    setQuery(recipe.title);
    setShowSuggestions(false);
    nav(`/app/recipes/${recipe.id}`);
  }

  function persist(next) {
    setList(next);
    saveRecipeSummaries(next);
  }

  function handleCreateRecipe() {
    const recipe = seedRecipe();
    saveRecipe(recipe);

    const summary = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      updatedAt: recipe.updatedAt,
      favorites: recipe.favorites,
    };
    persist([summary, ...list]);
    nav(`/app/recipes/${recipe.id}`);
  }

  function toggleFavorite(id) {
    const next = list.map((r) => (r.id === id ? { ...r, favorites: !r.favorites } : r));
    persist(next);

    const full = loadRecipe(id);
    if (full) {
      full.favorites = !full.favorites;
      full.updatedAt = nowISO();
      saveRecipe(full);
    }
  }

  // ✅ UPDATED: Add to Grocery + navigate to Grocery Lab with handoff message
  function addRecipeToGrocery(id) {
    const recipe = loadRecipe(id);
    if (!recipe) return;

    const add = recipeToGroceryItems(recipe, recipe.servings?.defaultServings || 1);
    const current = readJSON(GROCERY_KEY, []);
    const merged = mergeGroceryItems(current, add);
    writeJSON(GROCERY_KEY, merged);

    // ✅ this is what GroceryLabPage will read + show once
    writeJSON(HANDOFF_KEY, {
      at: nowISO(),
      message: `Added "${recipe.title}" → Grocery updated ✅`,
      source: "recipes",
      recipeId: recipe.id,
      recipeTitle: recipe.title,
    });

    // ✅ go to Grocery Lab (optionally jump to review)
    nav("/app/grocery-lab", {
      state: {
        from: "recipes",
        quickReview: true,
      },
    });
  }

  function quickHealthier(id, preset) {
    const recipe = loadRecipe(id);
    if (!recipe) return;

    const { nextRecipe } = applyRecipePreset(recipe, preset);
    saveRecipe(nextRecipe);

    const nextList = list.map((x) =>
      x.id === id
        ? { ...x, title: nextRecipe.title, description: nextRecipe.description, updatedAt: nextRecipe.updatedAt }
        : x
    );
    persist(nextList);

    writeJSON("toast.v1", { message: `Applied: ${preset.replaceAll("_", " ")} ✅`, at: nowISO() });
  }

  return (
    <section className="page">
      <p className="kicker">Center · Recipes</p>
      <h1 className="h1">Recipes</h1>
      <p className="sub">
        Save your favorites, convert them for your lifestyle, and push ingredients into Grocery Lab.
      </p>

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={() => nav("/app")}>
          Back to Dashboard
        </button>
        <button className="btn btn-primary" onClick={handleCreateRecipe}>
          Add Recipe
        </button>
        <button className={"btn " + (onlyFav ? "btn-primary" : "btn-secondary")} onClick={() => setOnlyFav((p) => !p)}>
          {onlyFav ? "Showing Favorites" : "Show Favorites"}
        </button>
      </div>

      <div className="card" style={{ marginTop: "1rem", position: "relative" }}>
        <label className="label">Search recipes</label>
        <input
          className="input"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setShowSuggestions(query.trim().length >= 2)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search by recipe name, ingredient, or tag…"
        />
        
        {/* Predictive Search Suggestions */}
        {showSuggestions && predictiveSuggestions.length > 0 && (
          <div style={{
            position: "absolute",
            top: "calc(100% - 1rem)",
            left: "0",
            right: "0",
            background: "rgba(20, 20, 20, 0.98)",
            border: "1px solid rgba(255, 215, 0, 0.3)",
            borderRadius: "0 0 8px 8px",
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: 100,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{ padding: "0.5rem 0" }}>
              {predictiveSuggestions.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => selectSuggestion(recipe)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "var(--text)",
                    transition: "background 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 215, 0, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ fontWeight: 600, color: "var(--gold)" }}>
                    {recipe.title}
                  </div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                    {recipe.description}
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "0.15rem" }}>
                    Match: {recipe.matchType}
                    {recipe.matchType === 'ingredient' && recipe.ingredients && (
                      <span> • {recipe.ingredients.filter(ing => 
                        ing.name.toLowerCase().includes(query.toLowerCase())
                      ).map(ing => ing.name).join(', ')}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <p className="small" style={{ marginTop: ".6rem" }}>
          Predictive search: searches recipe names, ingredients, and tags. v2: URL import coming.
        </p>
      </div>

      <div className="grid">
        {filtered.map((r) => (
          <div key={r.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 900, color: "var(--gold)", fontSize: "1.05rem" }}>{r.title}</div>
                <div className="small" style={{ marginTop: ".35rem" }}>{r.description}</div>
              </div>

              <button
                className={"btn " + (r.favorites ? "btn-primary" : "btn-secondary")}
                onClick={() => toggleFavorite(r.id)}
              >
                {r.favorites ? "★ Fav" : "☆ Fav"}
              </button>
            </div>

            <div className="nav-row" style={{ marginTop: ".9rem" }}>
              <button className="btn btn-secondary" onClick={() => nav(`/app/recipes/${r.id}`)}>
                Open
              </button>

              {/* ✅ this now links into Grocery Lab flow */}
              <button className="btn btn-primary" onClick={() => addRecipeToGrocery(r.id)}>
                Add to Grocery
              </button>
            </div>

            <div className="nav-row" style={{ marginTop: ".6rem" }}>
              <button className="btn btn-ghost" onClick={() => quickHealthier(r.id, "LOWER_CARB")}>
                Lower Carb
              </button>
              <button className="btn btn-ghost" onClick={() => quickHealthier(r.id, "KETO")}>
                Keto
              </button>
              <button className="btn btn-ghost" onClick={() => quickHealthier(r.id, "PALEO")}>
                Paleo
              </button>
              <button className="btn btn-ghost" onClick={() => quickHealthier(r.id, "LOWER_CALORIE")}>
                Lower Cal
              </button>
            </div>

            <p className="small" style={{ marginTop: ".75rem" }}>
              Updated: {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}
            </p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <p className="sub">
            No recipes yet. Tap <strong>Add Recipe</strong> to seed your first one.
          </p>
        </div>
      )}
    </section>
  );
}