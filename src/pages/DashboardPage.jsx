// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardPage.css";

const KEY = "3c.dashboard.wizard.v3";
const KEY_MIN = "3c.concierge.min.v1";

const GOALS = [
  { id: "save", title: "Save money on groceries", desc: "Auto-build your cart strategy.", route: "/app/grocery-lab" },
  { id: "meal", title: "Meal prep / meal plan", desc: "Date → time → meal (demo).", route: "/app/meal-plans" },
  { id: "workout", title: "Workout today", desc: "Quick plan + tracking (demo).", route: "/app/coming-soon" },
  { id: "pt", title: "PT Mode", desc: "Client list + check-ins (demo).", route: "/app/pt" },
];

const EXPERIENCE = [
  { id: "fast", title: "Fast", desc: "Keep it short. Minimal text." },
  { id: "normal", title: "Normal", desc: "Quick choices. Keep me moving." },
  { id: "deep", title: "Deep", desc: "Show comparisons + the “why” (optional)." },
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export default function DashboardPage() {
  const nav = useNavigate();

  // steps: 0=concierge, 1=goal, 2=experience
  const [step, setStep] = useState(0);
  const [goalId, setGoalId] = useState(null);
  const [expId, setExpId] = useState("normal");
  const [conciergeMin, setConciergeMin] = useState(false);

  // Load persisted
  useEffect(() => {
    const saved = readJSON(KEY, null);
    if (saved) {
      setStep(typeof saved.step === "number" ? saved.step : 0);
      setGoalId(saved.goalId ?? null);
      setExpId(saved.expId ?? "normal");
    } else {
      // no saved state: ALWAYS start at concierge
      setStep(0);
    }

    const m = readJSON(KEY_MIN, null);
    if (m && typeof m.min === "boolean") setConciergeMin(m.min);
  }, []);

  // Persist wizard
  useEffect(() => {
    writeJSON(KEY, { step, goalId, expId });
  }, [step, goalId, expId]);

  // Persist concierge minimized state
  useEffect(() => {
    writeJSON(KEY_MIN, { min: conciergeMin });
  }, [conciergeMin]);

  const selectedGoal = useMemo(() => GOALS.find((g) => g.id === goalId) || null, [goalId]);
  const selectedExp = useMemo(() => EXPERIENCE.find((e) => e.id === expId) || EXPERIENCE[1], [expId]);

  function startOver() {
    // Start over brings them back to Concierge, and expands it.
    setGoalId(null);
    setExpId("normal");
    setConciergeMin(false);
    setStep(0);
    writeJSON(KEY, { step: 0, goalId: null, expId: "normal" });
    writeJSON(KEY_MIN, { min: false });
  }

  function chooseGoal(id) {
    setGoalId(id);
    setStep(2); // auto-advance
  }

  function chooseExp(id) {
    setExpId(id);
  }

  function minimizeConcierge() {
    setConciergeMin(true);
    // Move them forward so they don't feel stuck
    if (step === 0) setStep(1);
  }

  function openConcierge() {
    setConciergeMin(false);
    setStep(0);
  }

  const concierge = useMemo(() => {
    if (conciergeMin) return null;

    // simple “teaching” copy (alpha safe)
    if (!selectedGoal) {
      return {
        title: "3C Concierge (Demo)",
        body:
          "I’m here to guide you. Pick what you want today, and I’ll route you to the right zone. You can minimize me anytime.",
        ctas: [
          { label: "Save money on groceries", action: () => { setGoalId("save"); setStep(2); } },
          { label: "Meal prep / meal plan", action: () => { setGoalId("meal"); setStep(2); } },
          { label: "Workout today", action: () => { setGoalId("workout"); setStep(2); } },
          { label: "PT Mode", action: () => { setGoalId("pt"); setStep(2); } },
        ],
        hint: "Alpha = smooth + clear. Beta = real integrations + real data.",
      };
    }

    return {
      title: "Locked in.",
      body: `You chose "${selectedGoal.title}". Pick how fast you want the experience, then I’ll open the correct zone.`,
      ctas: [
        { label: "Continue", action: () => setStep(2) },
        { label: "Open now", action: () => nav(selectedGoal.route) },
      ],
      hint: `Mode: ${selectedExp.title}`,
    };
  }, [conciergeMin, selectedGoal, selectedExp, nav]);

  const launchLabel = useMemo(() => {
    if (!selectedGoal) return "Choose a goal first";
    if (selectedGoal.id === "save") return "Open Grocery Lab";
    if (selectedGoal.id === "meal") return "Open Meal Plans";
    if (selectedGoal.id === "workout") return "Open Fitness";
    return "Open PT Mode";
  }, [selectedGoal]);

  return (
    <section className="page db-shell">
      {/* Headline only (no logo next to title) */}
      <div className="db-top">
        <p className="kicker">DASHBOARD</p>
        <h1 className="h1" style={{ margin: 0 }}>
          How can we help you today?
        </h1>
        <p className="sub" style={{ marginTop: ".45rem" }}>
          Start with the Concierge. Minimize it if you prefer a clean dashboard.
        </p>
      </div>

      {/* Floating concierge pill (only when minimized) */}
      {conciergeMin && (
        <button className="db-float-pill" onClick={openConcierge} aria-label="Open Concierge">
          Concierge
        </button>
      )}

      <div className="grid" style={{ marginTop: "1rem" }}>
        {/* LEFT: Wizard */}
        <div className="card db-card glass">
          <div className="db-card-head">
            <div className="db-step">
              <span className="db-step-dot" data-on={step === 0} />
              <span className="db-step-dot" data-on={step === 1} />
              <span className="db-step-dot" data-on={step === 2} />
            </div>

            <div className="db-head-actions">
              {!conciergeMin ? (
                <button className="btn btn-ghost db-head-btn" onClick={minimizeConcierge}>
                  Minimize Concierge
                </button>
              ) : (
                <button className="btn btn-secondary db-head-btn" onClick={openConcierge}>
                  Open Concierge
                </button>
              )}

              <button className="btn btn-ghost db-head-btn" onClick={startOver}>
                Start Over
              </button>
            </div>
          </div>

          {/* Sliding stage */}
          <div className="db-stage glass-inner">
            <div className="db-track" style={{ transform: `translateX(-${step * 100}%)` }}>
              {/* STEP 0: Concierge */}
              <div className="db-panel">
                <div className="db-card-tag">STEP 0</div>
                <h2 className="db-h2">Concierge</h2>
                <p className="small">This is the guided entry point (the app teaches you first).</p>

                {!conciergeMin && concierge && (
                  <div className="db-ai-panel glass-inner">
                    <div className="db-ai">
                      <div className="db-ai-badge">3C</div>
                      <div>
                        <div className="db-ai-title">{concierge.title}</div>
                        <div className="small">Mock AI for Alpha. Real AI later.</div>
                      </div>
                    </div>

                    <p className="db-ai-p">{concierge.body}</p>

                    <div className="nav-row">
                      {concierge.ctas.map((c) => (
                        <button key={c.label} className="btn btn-primary" onClick={c.action}>
                          {c.label}
                        </button>
                      ))}
                    </div>

                    <div className="db-ai-foot small">{concierge.hint}</div>
                  </div>
                )}

                <div className="db-nav">
                  <button className="btn btn-secondary" disabled>
                    Previous
                  </button>
                  <button className="btn btn-primary" onClick={() => setStep(1)}>
                    Next
                  </button>
                </div>
              </div>

              {/* STEP 1: Goal */}
              <div className="db-panel">
                <div className="db-card-tag">STEP 1</div>
                <h2 className="db-h2">Pick your goal</h2>
                <p className="small">Pick intent. We route you. No overload.</p>

                <div className="db-choice-grid">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      className={"db-choice glass-inner " + (goalId === g.id ? "db-choice-on" : "")}
                      onClick={() => chooseGoal(g.id)}
                    >
                      <div className="db-choice-title">{g.title}</div>
                      <div className="db-choice-desc">{g.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="db-nav">
                  <button className="btn btn-secondary" onClick={() => setStep(0)}>
                    Previous
                  </button>
                  <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!goalId}>
                    Next
                  </button>
                </div>
              </div>

              {/* STEP 2: Experience */}
              <div className="db-panel">
                <div className="db-card-tag">STEP 2</div>
                <h2 className="db-h2">Choose your experience</h2>
                <p className="small">Controls how much detail we show — not your outcome.</p>

                <div className="db-choice-grid">
                  {EXPERIENCE.map((x) => (
                    <button
                      key={x.id}
                      className={"db-choice glass-inner " + (expId === x.id ? "db-choice-on" : "")}
                      onClick={() => chooseExp(x.id)}
                    >
                      <div className="db-choice-title">{x.title}</div>
                      <div className="db-choice-desc">{x.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="db-nav">
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>
                    Previous
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => selectedGoal && nav(selectedGoal.route)}
                    disabled={!selectedGoal}
                  >
                    {launchLabel}
                  </button>
                </div>

                <div className="small" style={{ marginTop: ".75rem" }}>
                  Focus:{" "}
                  <strong style={{ color: "var(--gold)" }}>
                    {selectedGoal ? selectedGoal.title : "Not set"}
                  </strong>{" "}
                  · Mode: <strong style={{ color: "var(--blue)" }}>{selectedExp.title}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Summary */}
        <div className="card db-card glass">
          <div className="db-right">
            <div className="db-right-title">Today’s Plan</div>
            <div className="small" style={{ marginTop: ".35rem" }}>
              {selectedGoal ? (
                <>
                  You’re headed to <strong style={{ color: "var(--gold)" }}>{selectedGoal.title}</strong>.
                  <br />
                  Mode: <strong style={{ color: "var(--blue)" }}>{selectedExp.title}</strong>.
                </>
              ) : (
                "Use the Concierge first, or pick a goal."
              )}
            </div>

            <div className="nav-row" style={{ marginTop: "1rem" }}>
              <button className="btn btn-primary" disabled={!selectedGoal} onClick={() => selectedGoal && nav(selectedGoal.route)}>
                {launchLabel}
              </button>
              <button className="btn btn-secondary" onClick={() => nav("/app/settings")}>
                Settings
              </button>
            </div>

            <div className="db-right-foot small">
              Alpha goal: smoothness + clarity.
              <br />
              Beta goal: real integrations + real data.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
