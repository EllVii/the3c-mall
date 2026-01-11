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
      dateISO,
      time24,
      mealId,
      mealLabel: chosenMeal.label,
      createdAt: nowISO(),
      meta: {
        diet: dietMeta,
        fasting: fastingMeta,
        spice: spiceMeta,
      },
    };

    writeJSON(MP_KEY, plan);

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
          <p className="sub">Pick a date, confirm the time, choose the meal — then set preferences.</p>

          <div className="nav-row">
            <button className="btn btn-secondary" onClick={() => nav("/app")}>
              ← Dashboard
            </button>
            <button className="btn btn-secondary" onClick={() => nav("/app/grocery-lab")}>
              Grocery Lab →
            </button>
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
              Includes <strong>Snacks</strong> and <strong>OMAD</strong>.
            </div>

            <div className="grid" style={{ marginTop: ".75rem" }}>
              {MEALS.map((m) => (
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
                value={{
                  dateISO,
                  time24,
                  mealId,
                  mealLabel: chosenMeal.label,
                  diet: dietMeta,
                  fasting: fastingMeta,
                  spice: spiceMeta,
                }}
              />

              <div className="nav-row" style={{ marginTop: ".9rem" }}>
                <button className="btn btn-primary" onClick={savePlanAndSendToGrocery}>
                  Save + Send to Grocery Lab →
                </button>
              </div>
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
      </div>
    </section>
  );
}