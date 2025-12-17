// src/pages/RecipesPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON, safeId, nowISO } from "../utils/Storage";
import { applyRecipePreset } from "../utils/recipeTransform";
import { recipeToGroceryItems, mergeGroceryItems } from "../utils/recipeToGrocery";

const RECIPES_KEY = "recipes.v1";
const RECIPE_PREFIX_KEY = (id) => `recipe.${id}.v1`;
const GROCERY_KEY = "grocery.items.v1";

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

  const summaries = useMemo(() => loadRecipeSummaries(), []);
  const [list, setList] = useState(summaries);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list
      .filter((r) => (onlyFav ? !!r.favorites : true))
      .filter((r) => (!q ? true : (r.title || "").toLowerCase().includes(q)));
  }, [list, query, onlyFav]);

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

  function addRecipeToGrocery(id) {
    const recipe = loadRecipe(id);
    if (!recipe) return;

    const add = recipeToGroceryItems(recipe, recipe.servings?.defaultServings || 1);
    const current = readJSON(GROCERY_KEY, []);
    const merged = mergeGroceryItems(current, add);
    writeJSON(GROCERY_KEY, merged);

    // lightweight UX feedback without alerts
    const stamp = nowISO();
    writeJSON("toast.v1", { message: "Grocery list updated ✅", at: stamp });
  }

  function quickHealthier(id, preset) {
    const recipe = loadRecipe(id);
    if (!recipe) return;

    const { nextRecipe } = applyRecipePreset(recipe, preset);
    saveRecipe(nextRecipe);

    const nextList = list.map((x) =>
      x.id === id ? { ...x, title: nextRecipe.title, description: nextRecipe.description, updatedAt: nextRecipe.updatedAt } : x
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

      <div className="card" style={{ marginTop: "1rem" }}>
        <label className="label">Search recipes</label>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a recipe name…"
        />
        <p className="small" style={{ marginTop: ".6rem" }}>
          Alpha mode: manual recipes. Beta: URL import comes later.
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

              <button className={"btn " + (r.favorites ? "btn-primary" : "btn-secondary")} onClick={() => toggleFavorite(r.id)}>
                {r.favorites ? "★ Fav" : "☆ Fav"}
              </button>
            </div>

            <div className="nav-row" style={{ marginTop: ".9rem" }}>
              <button className="btn btn-secondary" onClick={() => nav(`/app/recipes/${r.id}`)}>
                Open
              </button>

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
          <p className="sub">No recipes yet. Tap <strong>Add Recipe</strong> to seed your first one.</p>
        </div>
      )}
    </section>
  );
}
