// src/pages/MealPlannerPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON, nowISO } from "../utils/Storage";
import { BASE_RECIPES } from "../utils/recipes";
import "../styles/MealPlannerPage.css";

// ✅ IMPORTANT: match your folder EXACTLY (Meal-Planner) + exact filenames
import DietConversionPanel from "../assets/components/Meal-Planner/DietConversionPanel.jsx";
import FastingSettings from "../assets/components/Meal-Planner/FastingSettings.jsx";
import FastingandTimer from "../assets/components/Meal-Planner/FastingandTimer.jsx";
import SpicePreferences from "../assets/components/Meal-Planner/SpicePreferences.jsx";
import MealSummaryPanel from "../assets/components/Meal-Planner/MealSummaryPanel.jsx";
import RecipeDeck from "../assets/components/Meal-Planner/RecipeDeck.jsx";
// import RecipeCard from "../assets/components/Meal-Planner/RecipeCard.jsx";

const MP_KEY = "mp.plan.v1";
const MP_META_KEY = "mp.meta.v1"; // stores diet/fasting/spice preferences
const MP_HISTORY_KEY = "mp.history.v1"; // stores previous saved meals
const HANDOFF_KEY = "handoff.mealToGrocery.v1";

const MEALS = [
  { id: "breakfast", label: "Breakfast", defaultTime: "06:00" },
  { id: "lunch", label: "Lunch", defaultTime: "12:00" },
  { id: "dinner", label: "Dinner / Supper", defaultTime: "18:00" },
  { id: "snack", label: "Snack", defaultTime: "15:00" },
  { id: "one-meal", label: "One Meal a Day (OMAD)", defaultTime: "17:00" },
];

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getAvailableMeals(selectedDateISO) {
  const now = new Date();
  const today = todayISO();
  
  // If date is in the future, all meals available
  if (selectedDateISO > today) {
    return MEALS;
  }
  
  // If date is today, filter out meals that have already passed
  if (selectedDateISO === today) {
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    return MEALS.filter((meal) => {
      const [mealHour, mealMinutes] = meal.defaultTime.split(":").map(Number);
      return mealHour > currentHour || (mealHour === currentHour && mealMinutes >= currentMinutes);
    });
  }
  
  // If date is in the past, no meals available
  return [];
}

export default function MealPlannerPage() {
  const nav = useNavigate();

  // lightweight toast (no external lib)
  const [toast, setToast] = useState("");

  // wizard state
  const [step, setStep] = useState(0); // 0 date, 1 time, 2 meal, 3 preferences, 4 summary
  const [dateISO, setDateISO] = useState(todayISO());
  const [mealId, setMealId] = useState("breakfast");
  const [time24, setTime24] = useState("06:00");

  // ✅ Load saved meta (diet/fasting/spice)
  const savedMeta = useMemo(() => readJSON(MP_META_KEY, null), []);
  const [dietMeta, setDietMeta] = useState(savedMeta?.diet || { diet: "balanced", mealStyle: "standard", notes: "" });
  const [fastingMeta, setFastingMeta] = useState(savedMeta?.fasting || {});
  const [spiceMeta, setSpiceMeta] = useState(savedMeta?.spice || {});

  // ✅ Load meal history
  const savedHistory = useMemo(() => readJSON(MP_HISTORY_KEY, []), []);
  const [mealHistory, setMealHistory] = useState(savedHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [showHealthierOption, setShowHealthierOption] = useState(false);

  // Deck filters
  const [deckFocus, setDeckFocus] = useState("no-restrictions");
  const [deckMethods, setDeckMethods] = useState([]);
  const deckSpiceLevel = (spiceMeta?.level || spiceMeta?.spiceLevel || "mild");
  const [deckIndex, setDeckIndex] = useState(0);

  const filteredRecipes = useMemo(() => {
    const byFocus = BASE_RECIPES.filter((r) => r.focus.includes(deckFocus));
    const byMethods = deckMethods.length
      ? byFocus.filter((r) => deckMethods.every((m) => r.methods.join(" ").includes(m)))
      : byFocus;
    return byMethods;
  }, [deckFocus, deckMethods]);

  const currentRecipe = filteredRecipes[deckIndex] || null;
  const totalRecipes = filteredRecipes.length;

  function onNextDeck() {
    setDeckIndex((i) => (totalRecipes ? (i + 1) % totalRecipes : 0));
  }
  function onPrevDeck() {
    setDeckIndex((i) => (totalRecipes ? (i - 1 + totalRecipes) % totalRecipes : 0));
  }
  function toggleDeckMethod(m) {
    setDeckMethods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  // Persist meta whenever it changes
  useEffect(() => {
    writeJSON(MP_META_KEY, {
      diet: dietMeta,
      fasting: fastingMeta,
      spice: spiceMeta,
      updatedAt: nowISO(),
    });
  }, [dietMeta, fastingMeta, spiceMeta]);

  const chosenMeal = useMemo(
    () => MEALS.find((m) => m.id === mealId) || MEALS[0],
    [mealId]
  );

  const availableMeals = useMemo(() => getAvailableMeals(dateISO), [dateISO]);

  // Auto-select first available meal when date changes
  useEffect(() => {
    if (availableMeals.length > 0) {
      const meal = availableMeals[0];
      setMealId(meal.id);
      setTime24(meal.defaultTime);
    }
  }, [availableMeals]);

  function goNext() {
    setStep((s) => Math.min(4, s + 1));
  }
  function goPrev() {
    setStep((s) => Math.max(0, s - 1));
  }

  function pickMeal(m) {
    setMealId(m.id);
    setTime24(m.defaultTime);
    setStep(3); // jump into preferences after meal pick
  }

  function showToast(msg) {
    setToast(msg);
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(""), 2200);
  }

  function savePlanAndSendToGrocery() {
    const plan = {
      id: `meal-${Date.now()}`,
      dateISO,
      time24,
      mealId,
      mealLabel: chosenMeal.label,
      recipe: currentRecipe,
      createdAt: nowISO(),
      meta: {
        diet: dietMeta,
        fasting: fastingMeta,
        spice: spiceMeta,
      },
    };

    writeJSON(MP_KEY, plan);

    // ✅ Save to history for "Previous Meals" view
    const updatedHistory = [...mealHistory, plan].slice(-50); // Keep last 50 meals
    setMealHistory(updatedHistory);
    writeJSON(MP_HISTORY_KEY, updatedHistory);

    // ✅ handoff with meals for Grocery Lab display
    writeJSON(HANDOFF_KEY, {
      at: nowISO(),
      message: "Saved. Sent to Grocery Lab.",
      from: "meal",
      mealContext: {
        dateISO,
        mealId,
        mealLabel: chosenMeal.label,
        time24,
        recipe: currentRecipe,
      },
    });

    showToast("Saved ✓ Sending to Grocery Lab…");

    // ✅ route to grocery lab with state to optionally quick-review
    nav("/app/grocery-lab", {
      state: { from: "meal", quickReview: true },
    });
  }

  return (
    <section className="page mp-page">
      {/* Local toast */}
      {toast && (
        <div className="app-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      <header style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
        <div>
          <p className="kicker">Center • Meal Plans</p>
          <h1 className="h1">Meal Planner</h1>
          <p className="sub">Pick your meal, set preferences — then Grocery Lab optimizes your shop. Everything connected in 3C Mall.</p>

          <div className="nav-row">
            <button className="btn btn-secondary" onClick={() => nav("/app")}>
              ← Dashboard
            </button>
            <button className="btn btn-secondary" onClick={() => nav("/app/grocery-lab")}>
              Grocery Lab →
            </button>
            {mealHistory.length > 0 && (
              <button className="btn btn-ghost" onClick={() => setShowHistory(!showHistory)}>
                📋 Previous Meals ({mealHistory.length})
              </button>
            )}
          </div>
        </div>

        <div className="pill">
          <span>Step</span>
          <strong>
            {step === 0
              ? "Date"
              : step === 1
              ? "Time"
              : step === 2
              ? "Meal"
              : step === 3
              ? "Preferences"
              : "Summary"}
          </strong>
        </div>
      </header>

      <div className="card mp-card" style={{ marginTop: "1rem" }}>
        {/* PREVIOUS MEALS */}
        {showHistory && mealHistory.length > 0 && (
          <>
            <div style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.15rem", marginBottom: ".7rem" }}>
              📋 Previous Meals ({mealHistory.length})
            </div>
            <div className="small" style={{ marginBottom: "1rem", opacity: 0.85 }}>
              Quickly re-use or modify any of your saved meals.
            </div>

            <div style={{ display: "grid", gap: ".7rem", maxHeight: "400px", overflowY: "auto" }}>
              {[...mealHistory].reverse().map((meal) => (
                <div key={meal.id} className="card" style={{ padding: ".75rem", background: "rgba(255,255,255,.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: ".5rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "var(--gold)", marginBottom: ".2rem" }}>
                        {meal.mealLabel}
                      </div>
                      <div className="small" style={{ opacity: 0.75 }}>
                        {meal.dateISO} at {meal.time24} • {meal.recipe?.name || "Recipe saved"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: ".4rem" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: ".4rem .6rem", fontSize: ".85rem" }}
                        onClick={() => {
                          setMealId(meal.mealId);
                          setTime24(meal.time24);
                          setDateISO(meal.dateISO);
                          setDietMeta(meal.meta?.diet || dietMeta);
                          setStep(3);
                          showToast("Meal loaded!");
                        }}
                      >
                        Use
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: ".4rem .6rem", fontSize: ".85rem" }}
                        onClick={() => {
                          const shareText = `Check out: ${meal.mealLabel} - ${meal.recipe?.name || "Delicious meal"} from 3C Mall!`;
                          if (navigator.share) {
                            navigator.share({ title: "3C Mall Meal", text: shareText });
                          } else {
                            showToast("Share link copied!");
                          }
                        }}
                      >
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-ghost"
              onClick={() => setShowHistory(false)}
              style={{ marginTop: ".7rem", width: "100%" }}
            >
              Hide History
            </button>
          </>
        )}

        {showHistory && mealHistory.length === 0 && (
          <div className="card" style={{ padding: ".9rem", textAlign: "center" }}>
            <div className="small" style={{ opacity: 0.75 }}>
              No saved meals yet. Plan and save your first meal to see history here.
            </div>
          </div>
        )}

        {!showHistory && (
          <>
        {/* STEP 0: DATE */}
        {step === 0 && (
          <>
            <div style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.15rem" }}>Pick a date</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              Default is <strong>Today</strong>.
            </div>

            <div className="nav-row">
              <button className="btn btn-primary" onClick={() => setDateISO(todayISO())}>
                Today
              </button>
              <input className="input" type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} />
            </div>
          </>
        )}

        {/* STEP 1: TIME */}
        {step === 1 && (
          <>
            <div style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.15rem" }}>Pick a time</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              We pre-fill times based on the meal. You can override.
            </div>

            <div className="nav-row">
              <input className="input" type="time" value={time24} onChange={(e) => setTime24(e.target.value)} />
              <button className="btn btn-secondary" onClick={() => setTime24(chosenMeal.defaultTime)}>
                Use default ({chosenMeal.defaultTime})
              </button>
            </div>
          </>
        )}

        {/* STEP 2: MEAL */}
        {step === 2 && (
          <>
            <div style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.15rem" }}>Pick the meal</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              {dateISO === todayISO() ? "Next available meal or non-fasting option:" : "Choose a meal for this date."}
            </div>

            {availableMeals.length === 0 && dateISO === todayISO() && (
              <div className="card" style={{ marginTop: ".75rem", padding: ".9rem", background: "rgba(246,220,138,.08)", borderColor: "rgba(246,220,138,.25)" }}>
                <div className="small">
                  No meals available for today at this time. Try tomorrow or a future date.
                </div>
              </div>
            )}

            <div className="grid" style={{ marginTop: ".75rem" }}>
              {availableMeals.map((m) => (
                <button
                  key={m.id}
                  className={"btn " + (mealId === m.id ? "btn-primary" : "btn-secondary")}
                  onClick={() => pickMeal(m)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="card" style={{ marginTop: "1rem", padding: ".9rem" }}>
              <div className="small">
                Selected: <strong style={{ color: "var(--gold)" }}>{chosenMeal.label}</strong> •{" "}
                <strong style={{ color: "var(--blue)" }}>{dateISO}</strong> •{" "}
                <strong style={{ color: "var(--blue)" }}>{time24}</strong>
              </div>
            </div>
          </>
        )}

        {/* STEP 3: PREFERENCES (THIS IS "MAKE IT LIVE") */}
        {step === 3 && (
          <>
            <div style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.15rem" }}>Preferences</div>
            <p className="small" style={{ marginTop: ".35rem" }}>
              These panels are now live and saved. They will influence meal suggestions + routing later.
            </p>

            <div className="grid" style={{ marginTop: ".9rem" }}>
              <div className="card" style={{ padding: "0.9rem" }}>
                <DietConversionPanel value={dietMeta} onChange={setDietMeta} />
              </div>

              <div className="card" style={{ padding: "0.9rem" }}>
                <FastingSettings value={fastingMeta} onChange={setFastingMeta} />
              </div>

              <div className="card" style={{ padding: "0.9rem" }}>
                <FastingandTimer value={fastingMeta} onChange={setFastingMeta} />
              </div>

              <div className="card" style={{ padding: "0.9rem" }}>
                <SpicePreferences value={spiceMeta} onChange={setSpiceMeta} />
              </div>
            </div>

            {/* Curated Recipe Deck (beta) */}
            <div className="card" style={{ padding: "0.9rem", marginTop: "1rem" }}>
              <RecipeDeck
                focus={deckFocus}
                setFocus={setDeckFocus}
                cookingMethods={deckMethods}
                onToggleCookingMethod={toggleDeckMethod}
                spiceLevel={deckSpiceLevel}
                setSpiceLevel={(lvl) => setSpiceMeta((prev) => ({ ...prev, level: lvl }))}
                currentRecipe={currentRecipe}
                totalRecipes={totalRecipes}
                onNext={onNextDeck}
                onPrev={onPrevDeck}
              />
            </div>
          </>
        )}

        {/* STEP 4: SUMMARY + SEND */}
        {step === 4 && (
          <>
            <div style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.15rem" }}>Summary</div>
            <p className="small" style={{ marginTop: ".35rem" }}>
              Confirm everything, then send to Grocery Lab.
            </p>

            <div className="card" style={{ marginTop: ".9rem", padding: ".9rem" }}>
              <MealSummaryPanel
                meal={{
                  dateISO,
                  time24,
                  mealId,
                  mealLabel: chosenMeal.label,
                }}
                diet={dietMeta}
                fasting={fastingMeta}
                spice={spiceMeta}
              />

              <div className="nav-row" style={{ marginTop: ".9rem" }}>
                <button className="btn btn-primary" onClick={savePlanAndSendToGrocery}>
                  Save + Send to Grocery Lab →
                </button>
                <button className="btn btn-secondary" onClick={() => setShowHealthierOption(!showHealthierOption)}>
                  ✨ Make it Healthier (Beta)
                </button>
                <button className="btn btn-ghost" onClick={() => {
                  const shareText = `Check out this meal: ${chosenMeal.label} at ${time24} on ${dateISO}. Shared from 3C Mall!`;
                  if (navigator.share) {
                    navigator.share({ title: "3C Mall Meal", text: shareText });
                  } else {
                    showToast("Share via: Copy link or email");
                  }
                }}>
                  📤 Share Meal
                </button>
              </div>

              {showHealthierOption && (
                <div className="card" style={{ marginTop: ".9rem", padding: ".9rem", background: "rgba(126,224,255,.08)", borderColor: "rgba(126,224,255,.25)" }}>
                  <div className="small" style={{ color: "var(--blue)", fontWeight: 800, marginBottom: ".5rem" }}>
                    🏃 Make it Healthier
                  </div>
                  <p className="small" style={{ marginBottom: ".7rem" }}>
                    Swap ingredients for lower-calorie, higher-protein, or nutrient-dense alternatives.
                  </p>
                  <div className="nav-row">
                    <button className="btn btn-secondary" onClick={() => {
                      setDietMeta({ ...dietMeta, diet: "high-protein" });
                      showToast("Switched to High-Protein!");
                    }}>
                      High-Protein Swap
                    </button>
                    <button className="btn btn-secondary" onClick={() => {
                      setDietMeta({ ...dietMeta, diet: "low-carb" });
                      showToast("Switched to Low-Carb!");
                    }}>
                      Low-Carb Swap
                    </button>
                    <button className="btn btn-secondary" onClick={() => {
                      setDietMeta({ ...dietMeta, diet: "balanced" });
                      showToast("Back to Balanced!");
                    }}>
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Bottom nav */}
        <div className="nav-row" style={{ marginTop: "1rem" }}>
          <button className="btn btn-secondary" onClick={goPrev} disabled={step === 0}>
            ← Previous
          </button>
          <button className="btn btn-secondary" onClick={goNext} disabled={step === 4}>
            Next →
          </button>

          {/* quick jump */}
          <button className="btn btn-ghost" onClick={() => setStep(4)}>
            Jump to Summary
          </button>
        </div>
        </>
        )}
      </div>
    </section>
  );
}