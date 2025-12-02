// src/pages/GroceryLabPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import "../styles/GroceryLabPage.css";

const CATEGORY_FILTERS = [
  "All",
  "Meat",
  "Produce",
  "Dairy",
  "Pantry",
  "Snacks",
  "Frozen Foods",
];

const STORE_FILTERS = ["All", "Walmart", "Fry's", "Safeway", "ALDI"];

const MOCK_GROCERY_DATA = [
  // Meat
  {
    id: "eye-round",
    category: "Meat",
    store: "Walmart",
    item: "Eye of round roast",
    pricePerLb: 3.98,
    unit: "lb",
    lastChecked: "Today",
  },
  {
    id: "chicken-breast",
    category: "Meat",
    store: "Fry's",
    item: "Chicken breast",
    pricePerLb: 2.18,
    unit: "lb",
    lastChecked: "Today",
  },
  // Produce
  {
    id: "bananas",
    category: "Produce",
    store: "Safeway",
    item: "Bananas",
    pricePerLb: 0.59,
    unit: "lb",
    lastChecked: "Today",
  },
  {
    id: "broccoli",
    category: "Produce",
    store: "ALDI",
    item: "Broccoli crowns",
    pricePerLb: 1.45,
    unit: "lb",
    lastChecked: "Yesterday",
  },
  // Dairy
  {
    id: "eggs",
    category: "Dairy",
    store: "Walmart",
    item: "Large eggs (12 ct)",
    price: 1.29,
    unit: "carton",
    lastChecked: "Today",
  },
  {
    id: "milk",
    category: "Dairy",
    store: "Fry's",
    item: "Whole milk (1 gal)",
    price: 2.79,
    unit: "gallon",
    lastChecked: "Today",
  },
  // Pantry
  {
    id: "rice",
    category: "Pantry",
    store: "ALDI",
    item: "White rice (5 lb)",
    price: 3.25,
    unit: "bag",
    lastChecked: "This week",
  },
  {
    id: "pasta",
    category: "Pantry",
    store: "Safeway",
    item: "Penne pasta (16 oz)",
    price: 1.19,
    unit: "box",
    lastChecked: "Yesterday",
  },
  // Snacks
  {
    id: "tortilla-chips",
    category: "Snacks",
    store: "Walmart",
    item: "Tortilla chips (family size)",
    price: 2.29,
    unit: "bag",
    lastChecked: "This week",
  },
  // Frozen
  {
    id: "frozen-mixed-veggies",
    category: "Frozen Foods",
    store: "ALDI",
    item: "Mixed veggies (12 oz)",
    price: 0.95,
    unit: "bag",
    lastChecked: "Today",
  },
];

export default function GroceryLabPage() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [storeFilter, setStoreFilter] = useState("All");
  const [mealDraft, setMealDraft] = useState(null);

  // Load any draft from Meal Planner
  useEffect(() => {
    try {
      const raw = localStorage.getItem("3c-meal-draft");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setMealDraft(parsed);
    } catch (e) {
      console.error("Failed to read meal draft:", e);
    }
  }, []);

  const filteredItems = useMemo(() => {
    return MOCK_GROCERY_DATA.filter((item) => {
      const matchCategory =
        categoryFilter === "All" || item.category === categoryFilter;
      const matchStore =
        storeFilter === "All" || item.store === storeFilter;
      return matchCategory && matchStore;
    });
  }, [categoryFilter, storeFilter]);

  const uniqueCategories = useMemo(
    () => Array.from(new Set(MOCK_GROCERY_DATA.map((i) => i.category))),
    []
  );

  const uniqueStores = useMemo(
    () => Array.from(new Set(MOCK_GROCERY_DATA.map((i) => i.store))),
    []
  );

  // Group filtered items by category to create “shelves”
  const groupedByCategory = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <section className="page gl-page">
      {/* HEADER */}
      <header className="meal-header gl-header">
        <div>
          <p className="gl-kicker">Labs · Cost Intelligence</p>
          <h1 className="gl-title">Grocery Cost Lab</h1>
          <p className="meal-subtitle gl-subtitle">
            One place to see{" "}
            <span className="meal-subtle-highlight">
              best prices across your whole cart
            </span>{" "}
            — meat, produce, dairy, pantry, snacks, and frozen. Built for{" "}
            <strong>real households</strong>, not just one person on a
            diet.
          </p>
        </div>

        <div className="meal-meta-pill gl-meta-pill">
          <span>Phase</span>
          <strong>Cost Lab · Demo</strong>
        </div>
      </header>

      {/* GRID */}
      <div className="meal-grid gl-grid">
        {/* LEFT – FILTERS, SUMMARY, BRIDGE FROM MEAL PLANNER */}
        <article className="meal-card gl-card gl-card-filters">
          {mealDraft && (
            <div className="gl-summary gl-summary-bridge">
              <p>
                <strong>Meal Plan draft detected.</strong>
              </p>
              <p>
                {mealDraft.days} days · {mealDraft.householdSize}{" "}
                {mealDraft.householdSize === 1 ? "person" : "people"} ·{" "}
                {mealDraft.dietLabel}
              </p>
              <p>
                Est. meat cost{" "}
                <strong>${mealDraft.totalCost}</strong> for about{" "}
                <strong>{mealDraft.totalProtein} g</strong> protein.
              </p>
              {mealDraft.activeRecipe && (
                <p className="gl-bridge-recipe">
                  Starting from{" "}
                  <em>{mealDraft.activeRecipe.title}</em>.
                </p>
              )}
            </div>
          )}

          <span className="gl-card-tag">Filters &amp; Summary</span>
          <h2 className="gl-card-title">Tune your grocery lane</h2>
          <p className="gl-card-subtitle">
            Use this demo to see how the Lab will behave when it’s wired
            into <strong>live store data</strong> and your{" "}
            <strong>zip code</strong>.
          </p>

          {/* Category filter */}
          <div className="gl-field">
            <label>Category</label>
            <div className="pill-toggle-group gl-pill-group">
              {CATEGORY_FILTERS.map((cat) => {
                const disabled =
                  cat !== "All" && !uniqueCategories.includes(cat);
                const isActive = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={
                      "pill-toggle" +
                      (isActive ? " active" : "") +
                      (disabled ? " disabled" : "")
                    }
                    onClick={() =>
                      !disabled && setCategoryFilter(cat)
                    }
                    disabled={disabled}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Store filter */}
          <div className="gl-field">
            <label>Store</label>
            <div className="pill-toggle-group gl-pill-group">
              {STORE_FILTERS.map((store) => {
                const disabled =
                  store !== "All" && !uniqueStores.includes(store);
                const isActive = storeFilter === store;
                return (
                  <button
                    key={store}
                    type="button"
                    className={
                      "pill-toggle" +
                      (isActive ? " active" : "") +
                      (disabled ? " disabled" : "")
                    }
                    onClick={() =>
                      !disabled && setStoreFilter(store)
                    }
                    disabled={disabled}
                  >
                    {store}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="gl-summary">
            <p>
              Showing{" "}
              <strong>
                {filteredItems.length} item
                {filteredItems.length === 1 ? "" : "s"}
              </strong>{" "}
              across{" "}
              <strong>
                {Object.keys(groupedByCategory).length} active
                categor
                {Object.keys(groupedByCategory).length === 1
                  ? "y"
                  : "ies"}
              </strong>{" "}
              and{" "}
              <strong>
                {uniqueStores.length} store
                {uniqueStores.length === 1 ? "" : "s"}
              </strong>
              .
            </p>
            <p className="gl-hint">
              In future phases, the Lab will plug into your{" "}
              <strong>zip code</strong>,{" "}
              <strong>favorite stores</strong>, and{" "}
              <strong>Meal Plan Center</strong> so you can push picks
              straight into your AI shopping list.
            </p>
          </div>
        </article>

        {/* RIGHT – VERTICAL SHELVES */}
        <article className="meal-card gl-card gl-card-lane">
          <span className="gl-card-tag gl-card-tag-gold">
            Vertical Shelves
          </span>
          <h2 className="gl-card-title">Scroll your cart by aisle</h2>
          <p className="gl-card-subtitle">
            Each category becomes its own shelf — meat, produce, dairy,
            pantry, snacks, frozen — stacked like a real{" "}
            <strong>app lane</strong>.
          </p>

          <div className="gl-output">
            <div className="gl-info">
              <p>
                Demo prices are static for now. When the live feed is
                ready, this view will show{" "}
                <strong>highlighted lowest prices</strong> per unit
                across all your stores.
              </p>
            </div>

            <div className="gl-list">
              {filteredItems.length === 0 && (
                <div className="gl-row">
                  <div className="gl-row-meta">
                    No items match these filters yet. Try switching
                    category or store.
                  </div>
                </div>
              )}

              {Object.entries(groupedByCategory).map(
                ([category, items]) => (
                  <div
                    key={category}
                    className="gl-category-block"
                  >
                    <h3 className="gl-category-title">
                      {category}
                    </h3>
                    {items.map((item) => (
                      <div key={item.id} className="gl-row">
                        <div className="gl-row-label">
                          {item.item}
                        </div>
                        <div className="gl-row-value">
                          {item.category} · {item.store} ·{" "}
                          {item.pricePerLb
                            ? `$${item.pricePerLb.toFixed(
                                2
                              )}/${item.unit}`
                            : `$${item.price.toFixed(
                                2
                              )} / ${item.unit}`}
                        </div>
                        <div className="gl-row-meta">
                          Last check: {item.lastChecked}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            <div className="gl-footer">
              In future phases: tap a row to pin it as{" "}
              <strong>“best price”</strong>, swap stores, or push that
              item straight into your{" "}
              <strong>Meal Plan Center</strong> and{" "}
              <strong>AI shopping list</strong>.
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
