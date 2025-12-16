// src/pages/MealPlannerPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { writeJSON } from "../utils/Storage";
import "../styles/MealPlannerPage.css";

const MP_KEY = "mp.plan.v1";

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

  const [step, setStep] = useState(0); // 0 date, 1 time, 2 meal
  const [dateISO, setDateISO] = useState(todayISO());
  const [mealId, setMealId] = useState("breakfast");
  const [time24, setTime24] = useState("06:00");

  const chosenMeal = useMemo(() => MEALS.find((m) => m.id === mealId) || MEALS[0], [mealId]);

  function goNext() {
    setStep((s) => Math.min(2, s + 1));
  }
  function goPrev() {
    setStep((s) => Math.max(0, s - 1));
  }

  function pickMeal(m) {
    setMealId(m.id);
    setTime24(m.defaultTime); // “destinated time” default
    setStep(2);
  }

  function savePlan() {
    const plan = {
      dateISO,
      time24,
      mealId,
      mealLabel: chosenMeal.label,
      createdAt: new Date().toISOString(),
    };
    writeJSON(MP_KEY, plan);
    alert("Saved (MVP). Next: push ingredients into Grocery Lab.");
    nav("/app/grocery-lab");
  }

  return (
    <section className="page">
      <header style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
        <div>
          <p className="kicker">Center • Meal Plans</p>
          <h1 className="h1">Meal Planner</h1>
          <p className="sub">Fast setup: pick a date, confirm the time, then choose the meal.</p>

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
          <strong>{step === 0 ? "Date" : step === 1 ? "Time" : "Meal"}</strong>
        </div>
      </header>

      <div className="card" style={{ marginTop: "1rem" }}>
        {step === 0 && (
          <>
            <div style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.15rem" }}>Pick a date</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              Default is <strong>Today</strong>. You can change it in one tap.
            </div>

            <div className="nav-row">
              <button className="btn btn-primary" onClick={() => setDateISO(todayISO())}>
                Today
              </button>
              <input className="input" type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.15rem" }}>Pick a time</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              We’ll pre-fill times based on the meal you choose. You can always override.
            </div>

            <div className="nav-row">
              <input className="input" type="time" value={time24} onChange={(e) => setTime24(e.target.value)} />
              <button className="btn btn-secondary" onClick={() => setTime24(chosenMeal.defaultTime)}>
                Use default ({chosenMeal.defaultTime})
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.15rem" }}>Pick the meal</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              Includes <strong>Snacks</strong> and <strong>One Meal a Day</strong>.
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

              <div className="nav-row" style={{ marginTop: ".75rem" }}>
                <button className="btn btn-primary" onClick={savePlan}>
                  Save + Send to Grocery Lab →
                </button>
              </div>
            </div>
          </>
        )}

        <div className="nav-row" style={{ marginTop: "1rem" }}>
          <button className="btn btn-secondary" onClick={goPrev} disabled={step === 0}>
            ← Previous
          </button>
          <button className="btn btn-secondary" onClick={goNext} disabled={step === 2}>
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}
