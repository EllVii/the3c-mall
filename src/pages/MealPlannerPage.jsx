// src/pages/MealPlannerPage.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MealPlannerPage.css";

// Static meat macros (avg) for budget + protein math
const MEATS = {
  beef: { label: "Beef", protein: 90, cost: 4.0 },
  chicken: { label: "Chicken", protein: 100, cost: 2.5 },
  pork: { label: "Pork", protein: 85, cost: 3.2 },
  fish: { label: "Fish", protein: 95, cost: 5.5 },
  eggs: { label: "Eggs", protein: 75, cost: 2.2 },
};

// Diet styles map → which meats we emphasize
const DIET_STYLES = {
  carnivore: {
    label: "Carnivore",
    meats: ["beef", "pork", "eggs"],
  },
  keto: {
    label: "Keto",
    meats: ["beef", "chicken", "fish", "eggs"],
  },
  paleo: {
    label: "Paleo",
    meats: ["beef", "chicken", "fish", "pork"],
  },
  "no-restrictions": {
    label: "No Restrictions",
    meats: ["chicken", "beef", "pork", "fish", "eggs"],
  },
};

// Simple demo recipe deck – in a real phase, these come from your DB/AI
const RECIPE_DECK = [
  {
    id: "steak-cast-iron",
    title: "Cast-Iron Ribeye + Buttered Broccoli",
    diets: ["carnivore", "keto", "paleo"],
    methods: ["Stovetop", "Cast Iron"],
    spiceRange: ["None", "Mild", "Medium"],
    image:
      "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Heavy sear, simple salt, and crisp green broccoli on the side.",
  },
  {
    id: "chicken-thighs-airfryer",
    title: "Crispy Air-Fryer Chicken Thighs",
    diets: ["keto", "paleo", "no-restrictions"],
    methods: ["Air Fryer"],
    spiceRange: ["Mild", "Medium", "Hot"],
    image:
      "https://images.pexels.com/photos/4106483/pexels-photo-4106483.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Bone-in thighs with crackling skin and a low-mess cleanup.",
  },
  {
    id: "salmon-sheet-pan",
    title: "Sheet-Pan Salmon & Veg",
    diets: ["keto", "paleo", "no-restrictions"],
    methods: ["Oven"],
    spiceRange: ["None", "Mild", "Medium"],
    image:
      "https://images.pexels.com/photos/3296273/pexels-photo-3296273.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "One pan, full dinner. Roast and done.",
  },
  {
    id: "pork-roast-slow",
    title: "Slow-Roasted Pork Shoulder",
    diets: ["carnivore", "keto", "no-restrictions"],
    methods: ["Oven"],
    spiceRange: ["Mild", "Medium", "Hot"],
    image:
      "https://images.pexels.com/photos/4109990/pexels-photo-4109990.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Big batch roast perfect for leftover nights.",
  },
  {
    id: "egg-bake",
    title: "Loaded Egg Bake",
    diets: ["carnivore", "keto", "no-restrictions"],
    methods: ["Oven"],
    spiceRange: ["None", "Mild"],
    image:
      "https://images.pexels.com/photos/3731474/pexels-photo-3731474.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Breakfast-for-dinner, sliceable and easy to reheat.",
  },
];

const COOK_METHODS = ["Stovetop", "Oven", "Grill", "Air Fryer", "Cast Iron"];

const SPICE_LEVELS = [
  "None",
  "Mild",
  "Medium",
  "Hot",
  "Extreme",
  "Beyond Extreme",
];

export default function MealPlannerPage() {
  const navigate = useNavigate();

  // Step 1 – Household & diet
  const [householdSize, setHouseholdSize] = useState(2);
  const [days, setDays] = useState(7);
  const [dietStyle, setDietStyle] = useState("no-restrictions");
  const [leftoverDays, setLeftoverDays] = useState(1);

  // Step 2 – Methods & flavors
  const [methodChoice, setMethodChoice] = useState("Oven");
  const [spiceLevel, setSpiceLevel] = useState("Mild");
  const [customSpices, setCustomSpices] = useState("");
  const [favoriteMeals, setFavoriteMeals] = useState("");

  // Step 2 – Rolodex deck
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // Step 2 – Simple meat selection toggle
  const [selectedMeats, setSelectedMeats] = useState(["chicken", "beef"]);

  const dietConfig = DIET_STYLES[dietStyle];

  // Filter deck to match diet/method/spice loosely
  const filteredDeck = useMemo(() => {
    return RECIPE_DECK.filter((card) => {
      const dietMatch =
        !card.diets || card.diets.includes(dietStyle) || dietStyle === "no-restrictions";
      const methodMatch =
        !card.methods || card.methods.includes(methodChoice);
      const spiceMatch =
        !card.spiceRange || card.spiceRange.includes(spiceLevel) || spiceLevel === "None";
      return dietMatch && methodMatch && spiceMatch;
    });
  }, [dietStyle, methodChoice, spiceLevel]);

  const activeCard =
    filteredDeck.length > 0
      ? filteredDeck[activeCardIndex % filteredDeck.length]
      : null;

  // Toggle which meats are in play
  function toggleMeat(key) {
    setSelectedMeats((prev) =>
      prev.includes(key)
        ? prev.filter((m) => m !== key)
        : [...prev, key]
    );
  }

  // Meat summary based on selections
  const meatSummary = useMemo(() => {
    if (selectedMeats.length === 0) return null;

    const effectiveDays = Math.max(days - leftoverDays, 1);
    const proteinPerPersonPerDay =
      dietStyle === "carnivore" ? 210 : dietStyle === "keto" ? 180 : 150;

    const totalProteinNeeded =
      proteinPerPersonPerDay * householdSize * effectiveDays;

    const perTypeProtein = totalProteinNeeded / selectedMeats.length;

    const meats = selectedMeats.map((key) => {
      const meta = MEATS[key];
      const pounds = perTypeProtein / meta.protein;
      const cost = pounds * meta.cost;
      return {
        key,
        label: meta.label,
        protein: Math.round(perTypeProtein),
        pounds: pounds.toFixed(1),
        cost: cost.toFixed(2),
      };
    });

    const totalCost = meats.reduce((sum, m) => sum + parseFloat(m.cost), 0);

    return {
      totalProtein: Math.round(totalProteinNeeded),
      totalCost: totalCost.toFixed(2),
      meats,
      proteinPerPersonPerDay,
      effectiveDays,
    };
  }, [selectedMeats, householdSize, days, leftoverDays, dietStyle]);

  // Bridge: Send current plan to Grocery Lab (Phase 2 stub)
  function handleSendToGroceryLab() {
    if (!meatSummary) return;

    const payload = {
      householdSize,
      days,
      leftoverDays,
      dietStyle,
      dietLabel: DIET_STYLES[dietStyle].label,
      methodChoice,
      spiceLevel,
      customSpices: customSpices.trim(),
      favoriteMeals: favoriteMeals.trim(),
      meats: meatSummary.meats,
      totalCost: meatSummary.totalCost,
      totalProtein: meatSummary.totalProtein,
      proteinPerPersonPerDay: meatSummary.proteinPerPersonPerDay,
      effectiveDays: meatSummary.effectiveDays,
      activeRecipe: activeCard
        ? {
            id: activeCard.id,
            title: activeCard.title,
          }
        : null,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("3c-meal-draft", JSON.stringify(payload));
    } catch (e) {
      // Fail silently – in a later phase we can show a toast
      console.error("Failed to save meal draft:", e);
    }

    navigate("/app/grocery-lab");
  }

  function handleNextCard() {
    if (filteredDeck.length === 0) return;
    setActiveCardIndex((prev) => (prev + 1) % filteredDeck.length);
  }

  function handlePrevCard() {
    if (filteredDeck.length === 0) return;
    setActiveCardIndex((prev) =>
      (prev - 1 + filteredDeck.length) % filteredDeck.length
    );
  }

  return (
    <section className="page meal-page mp-page">
      {/* HEADER */}
      <header className="meal-header mp-header">
        <div>
          <p className="mp-kicker">Center · Meal Plan</p>
          <h1 className="mp-title">Meal Plan Center</h1>
          <p className="meal-subtitle mp-subtitle">
            Build a <strong>household-aware</strong>,{" "}
            <strong>budget-conscious</strong> plan that still feels like
            real food — not a diet chart.
          </p>
        </div>
        <div className="meal-meta-pill">
          <span>Phase</span>
          <strong>Meal Planner · 2.0 Demo</strong>
        </div>
      </header>

      <div className="meal-grid mp-grid">
        {/* STEP 1 – HOUSEHOLD BLUEPRINT */}
        <article className="meal-card mp-card mp-card-setup">
          <span className="card-tag">Step 1 · Household Blueprint</span>
          <h2 className="meal-card-title">Who are we feeding?</h2>
          <p className="meal-card-subtitle">
            Quick snapshot of your household so your plan matches{" "}
            <strong>real portions</strong>, not textbook serving sizes.
          </p>

          <div className="mp-field-row">
            <div className="mp-field">
              <label>Household size</label>
              <input
                type="number"
                min="1"
                max="12"
                value={householdSize}
                onChange={(e) =>
                  setHouseholdSize(
                    Math.max(1, Math.min(12, Number(e.target.value) || 1))
                  )
                }
              />
            </div>

            <div className="mp-field">
              <label>Days to cover</label>
              <input
                type="number"
                min="1"
                max="30"
                value={days}
                onChange={(e) =>
                  setDays(Math.max(1, Math.min(30, Number(e.target.value) || 1)))
                }
              />
            </div>

            <div className="mp-field">
              <label>Leftover days</label>
              <input
                type="number"
                min="0"
                max={days}
                value={leftoverDays}
                onChange={(e) =>
                  setLeftoverDays(
                    Math.max(0, Math.min(days, Number(e.target.value) || 0))
                  )
                }
              />
            </div>
          </div>

          <div className="mp-field">
            <label>Eating style</label>
            <div className="pill-toggle-group">
              {Object.entries(DIET_STYLES).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  className={
                    "pill-toggle" + (dietStyle === key ? " active" : "")
                  }
                  onClick={() => setDietStyle(key)}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mp-summary-block">
            <p>
              Planning for{" "}
              <strong>
                {householdSize}{" "}
                {householdSize === 1 ? "person" : "people"}
              </strong>{" "}
              over{" "}
              <strong>
                {days} day{days === 1 ? "" : "s"}
              </strong>
              , with{" "}
              <strong>
                {leftoverDays} leftover{" "}
                {leftoverDays === 1 ? "day" : "days"}
              </strong>{" "}
              built in.
            </p>
            <p className="mp-hint">
              This helps your app learn how long meals actually last in{" "}
              <strong>your</strong> home — not just on paper.
            </p>
          </div>
        </article>

        {/* STEP 2 – METHODS, FLAVOR & RECIPE DECK */}
        <article className="meal-card mp-card mp-card-recipes">
          <span className="card-tag">Step 2 · Recipes & Methods</span>
          <h2 className="meal-card-title">How do you like to cook?</h2>
          <p className="meal-card-subtitle">
            We’ll match recipes to your{" "}
            <strong>favorite cooking methods</strong>,{" "}
            <strong>spice profile</strong>, and the meats you actually buy.
          </p>

          {/* Cooking method */}
          <div className="mp-field">
            <label>Preferred method</label>
            <div className="pill-toggle-group">
              {COOK_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  className={
                    "pill-toggle" +
                    (methodChoice === method ? " active" : "")
                  }
                  onClick={() => setMethodChoice(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Spice level */}
          <div className="mp-field">
            <label>Spice / heat level</label>
            <div className="pill-toggle-group">
              {SPICE_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={
                    "pill-toggle" +
                    (spiceLevel === level ? " active" : "")
                  }
                  onClick={() => setSpiceLevel(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Custom spices */}
          <div className="mp-field">
            <label>Favorite spices / seasonings</label>
            <textarea
              rows={2}
              placeholder="Example: smoked paprika, garlic salt, ghost pepper, homemade salsa…"
              value={customSpices}
              onChange={(e) => setCustomSpices(e.target.value)}
            />
          </div>

          {/* Favorite meals note */}
          <div className="mp-field">
            <label>Favorite meals right now</label>
            <textarea
              rows={2}
              placeholder="Example: beef stroganoff, taco bowls, wings night, Sunday roast…"
              value={favoriteMeals}
              onChange={(e) => setFavoriteMeals(e.target.value)}
            />
          </div>

          {/* Meat toggles */}
          <div className="mp-field">
            <label>Meats to feature</label>
            <div className="pill-toggle-group">
              {dietConfig.meats.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={
                    "pill-toggle" +
                    (selectedMeats.includes(key) ? " active" : "")
                  }
                  onClick={() => toggleMeat(key)}
                >
                  {MEATS[key].label}
                </button>
              ))}
            </div>
            <p className="mp-hint">
              We’ll divide protein and cost across the meats you keep in
              your cart most.
            </p>
          </div>

          {/* Recipe rolodex */}
          <div className="mp-deck-wrapper">
            <div className="mp-deck-label">
              <span>Recipe Deck</span>
              <span>
                {filteredDeck.length} option
                {filteredDeck.length === 1 ? "" : "s"} for this combo
              </span>
            </div>

            <div className="mp-deck">
              {/* Back card to give “stack” feel */}
              <div className="mp-deck-card mp-deck-card-back" />

              {/* Front active card */}
              {activeCard ? (
                <article className="mp-deck-card mp-deck-card-front">
                  <div className="mp-deck-image-wrap">
                    <img
                      src={activeCard.image}
                      alt={activeCard.title}
                      className="mp-deck-image"
                    />
                    <div className="mp-deck-image-overlay" />
                    <div className="mp-deck-title">
                      {activeCard.title}
                    </div>
                  </div>
                  <div className="mp-deck-body">
                    <p>{activeCard.blurb}</p>
                    <div className="mp-deck-meta">
                      <span>{DIET_STYLES[dietStyle].label}</span>
                      <span>{methodChoice}</span>
                      <span>{spiceLevel}</span>
                    </div>
                  </div>
                </article>
              ) : (
                <article className="mp-deck-card mp-deck-card-front mp-deck-empty">
                  <p>No recipes match this combo yet.</p>
                  <p className="mp-hint">
                    Try changing your method or spice level.
                  </p>
                </article>
              )}

              {/* Controls */}
              <div className="mp-deck-controls">
                <button
                  type="button"
                  className="mp-deck-btn"
                  onClick={handlePrevCard}
                  disabled={filteredDeck.length === 0}
                >
                  ‹ Prev
                </button>
                <button
                  type="button"
                  className="mp-deck-btn"
                  onClick={handleNextCard}
                  disabled={filteredDeck.length === 0}
                >
                  Next ›
                </button>
              </div>
            </div>

            <p className="mp-hint mp-hint-small">
              Later phases: long-press a card to open the full white
              recipe sheet with steps, timers, and workout timing tips.
            </p>
          </div>
        </article>

        {/* STEP 3 – SUMMARY & SEND TO GROCERY LAB */}
        <article className="meal-card mp-card mp-card-summary">
          <span className="card-tag">Step 3 · Plan Summary</span>
          <h2 className="meal-card-title">Protein & cost snapshot</h2>
          <p className="meal-card-subtitle">
            We’ll turn this into a{" "}
            <strong>smart grocery lane</strong> in the Lab — one click
            away.
          </p>

          {meatSummary ? (
            <>
              <table className="mp-table">
                <thead>
                  <tr>
                    <th>Meat</th>
                    <th>Protein (g)</th>
                    <th>Weight (lb)</th>
                    <th>Cost ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {meatSummary.meats.map((m) => (
                    <tr key={m.key}>
                      <td className="mp-type">{m.label}</td>
                      <td>{m.protein}</td>
                      <td>{m.pounds}</td>
                      <td>{m.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mp-total-row">
                <div>
                  <span>Total protein:</span>{" "}
                  <strong>{meatSummary.totalProtein} g</strong>
                </div>
                <div>
                  <span>Estimated meat cost:</span>{" "}
                  <strong>${meatSummary.totalCost}</strong>
                </div>
              </div>

              <p className="mp-hint">
                We&apos;ll compare these meats against live store pricing
                in the <strong>Grocery Cost Lab</strong> so you can see
                which lane wins.
              </p>

              <button
                type="button"
                className="btn mp-send-btn"
                onClick={handleSendToGroceryLab}
              >
                Send this plan to Grocery Lab →
              </button>

              <p className="mp-fineprint">
                Phase 2: before sending, we’ll double-check quantities and
                leftovers so you never double-order by accident.
              </p>
            </>
          ) : (
            <div className="mp-empty-summary">
              <p>
                Pick at least one meat in Step 2 to see your protein and
                cost breakdown.
              </p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
