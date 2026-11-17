import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON, nowISO, safeId } from "../utils/Storage";
import { FEATURED_RECIPES } from "../utils/featuredRecipes";
import { recipeToGroceryItems, mergeGroceryItems } from "../utils/recipeToGrocery";
import "../styles/RecipesCatalog.css";

const RECIPES_KEY = "recipes.v1";
const GROCERY_KEY = "grocery.items.v1";
const HANDOFF_KEY = "handoff.mealToGrocery.v1";
const RECIPE_PREFIX_KEY = (id) => `recipe.${id}.v1`;

function customRecipe() {
  const id = `custom-${Date.now()}-${safeId(Math.random().toString(36).slice(2))}`;
  const now = nowISO();
  return { id, title: "My New Recipe", description: "Add your ingredients and cooking steps.", createdAt: now, updatedAt: now,
    servings: { defaultServings: 4, unit: "serving" }, time: { prepMinutes: 0, cookMinutes: 0 },
    ingredients: [], steps: [], source: { type: "manual" }, favorites: false };
}

export default function RecipesPage() {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [saved, setSaved] = useState(() => readJSON(RECIPES_KEY, []));
  const recipes = useMemo(() => {
    const custom = saved.map(summary => readJSON(RECIPE_PREFIX_KEY(summary.id), null)).filter(Boolean);
    const customIds = new Set(custom.map(recipe => recipe.id));
    return [...custom, ...FEATURED_RECIPES.filter(recipe => !customIds.has(recipe.id))];
  }, [saved]);
  const filtered = useMemo(() => recipes.filter(recipe => {
    const q = query.toLowerCase().trim();
    const matches = !q || [recipe.title, recipe.description, ...(recipe.ingredients || []).map(i => i.name), ...(recipe.lifestyle?.tags || [])]
      .some(value => String(value || "").toLowerCase().includes(q));
    const matchesCategory = category === "All" || (recipe.lifestyle?.tags || []).some(tag => tag.toLowerCase() === category.toLowerCase());
    return matches && matchesCategory && (!onlyFavorites || recipe.favorites);
  }), [recipes, query, category, onlyFavorites]);

  function createRecipe() {
    const recipe = customRecipe();
    writeJSON(RECIPE_PREFIX_KEY(recipe.id), recipe);
    const next = [{ id: recipe.id, title: recipe.title, updatedAt: recipe.updatedAt }, ...saved];
    setSaved(next);
    writeJSON(RECIPES_KEY, next);
    nav(`/app/recipes/${recipe.id}`);
  }
  function toggleFavorite(recipe) {
    const nextRecipe = { ...recipe, favorites: !recipe.favorites, updatedAt: nowISO() };
    writeJSON(RECIPE_PREFIX_KEY(recipe.id), nextRecipe);
    const next = [{ id: recipe.id, title: recipe.title, updatedAt: nextRecipe.updatedAt },
      ...saved.filter(item => item.id !== recipe.id)];
    setSaved(next);
    writeJSON(RECIPES_KEY, next);
  }
  function addToGroceries(recipe) {
    const groceries = readJSON(GROCERY_KEY, []);
    writeJSON(GROCERY_KEY, mergeGroceryItems(groceries, recipeToGroceryItems(recipe, recipe.servings?.defaultServings || 1)));
    writeJSON(HANDOFF_KEY, { at: nowISO(), message: `Added ${recipe.title} ingredients to Grocery Lab`, source: "recipes", recipeId: recipe.id });
    nav("/app/grocery-lab", { state: { from: "recipes", quickReview: true } });
  }

  return <section className="recipes-catalog" aria-label="Recipe catalog">
    <header className="recipes-catalog__heading">
      <div><p className="kicker">Meal Planning Center</p><h1 className="h1">Find something good to cook</h1>
        <p className="sub">Browse meals with pictures, choose servings, and add ingredients to your grocery list.</p></div>
      <button className="btn btn-primary" type="button" onClick={createRecipe}>+ Create recipe</button>
    </header>
    <label htmlFor="recipe-catalog-search" className="label">Search meals or ingredients</label>
    <input id="recipe-catalog-search" type="search" className="input recipes-catalog__search"
      value={query} onChange={event => setQuery(event.target.value)} placeholder="Try chicken, rice, breakfast…" />
    <div className="recipes-catalog__categories" aria-label="Recipe filters">
      {["All", "Breakfast", "Lunch", "Dinner", "Budget", "Quick", "Vegetarian"].map(label =>
        <button key={label} type="button" className={`btn ${category === label ? "btn-primary" : "btn-secondary"}`}
          aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}
      <button type="button" className={`btn ${onlyFavorites ? "btn-primary" : "btn-secondary"}`}
        aria-pressed={onlyFavorites} onClick={() => setOnlyFavorites(value => !value)}>★ Favorites</button>
    </div>
    <p className="small" role="status">{filtered.length} recipes found</p>
    <div className="recipes-catalog__grid">
      {filtered.map(recipe => <article key={recipe.id} className="recipes-catalog__tile">
        {recipe.imageUrl ? <img className="recipes-catalog__image" loading="lazy"
          src={recipe.imageUrl} alt={`Prepared ${recipe.title}`} onError={event => { event.currentTarget.style.visibility = "hidden"; }} /> :
          <div className="recipes-catalog__placeholder" role="img" aria-label="Recipe without a picture">🍽️</div>}
        <div className="recipes-catalog__content">
          <h2>{recipe.title}</h2><p>{recipe.description}</p>
          <span className="recipes-catalog__meta">{recipe.servings?.defaultServings || 1} servings · {(recipe.time?.prepMinutes || 0) + (recipe.time?.cookMinutes || 0)} min</span>
          <div className="recipes-catalog__actions">
            <button className="btn btn-primary" type="button" onClick={() => nav(`/app/recipes/${recipe.id}`)}>View recipe</button>
            <button className="btn btn-secondary" type="button" onClick={() => addToGroceries(recipe)}>Add ingredients</button>
            <button className="btn btn-ghost" type="button" aria-label={`${recipe.favorites ? "Remove" : "Add"} ${recipe.title} ${recipe.favorites ? "from" : "to"} favorites`}
              onClick={() => toggleFavorite(recipe)}>{recipe.favorites ? "★ Saved" : "☆ Save"}</button>
          </div>
        </div>
      </article>)}
    </div>
    {filtered.length === 0 && <div className="card"><p>No matching recipes. Try another ingredient or choose All.</p></div>}
    <p className="small" style={{marginTop:20}}>Recipe quantities are planning guidance. Product packaging, prices, and nutrition must be checked separately.</p>
  </section>;
}
