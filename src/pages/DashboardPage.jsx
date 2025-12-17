// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardPage.css";

import {
  getPrefsSafe,
  setFocus,
  setNavMode,
  shouldShowNudge,
  advanceNudgeSchedule,
  disableNudges,
} from "../utils/prefs";

const ZONES = [
  { id: "grocery", title: "Save money on groceries", desc: "Build a cart strategy automatically.", route: "/app/grocery-lab" },
  { id: "meals", title: "Plan meals fast", desc: "Pick a meal slot and prep a list.", route: "/app/meal-plans" },
  { id: "workout", title: "Training & performance", desc: "Strength goals + recovery pacing.", route: "/app/coming-soon" },
  { id: "community", title: "Community support", desc: "Encouragement without pressure.", route: "/app/community" },
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function DashboardPage() {
  const nav = useNavigate();

  const [prefs, setPrefsState] = useState(() => getPrefsSafe());
  const [nudge, setNudge] = useState({ show: false, state: null });

  // Wizard cards inside dashboard (left-to-right, 3 panels)
  // 0 = Concierge (demo)
  // 1 = Focused Zone card(s)
  // 2 = Preview (image + short synopsis)
  const [step, setStep] = useState(0);

  const [conciergeOpen, setConciergeOpen] = useState(true);

  useEffect(() => {
    const p = getPrefsSafe();
    setPrefsState(p);
    setNudge(shouldShowNudge());
  }, []);

  const focusedZone = useMemo(() => {
    if (!prefs?.focus || prefs.focus === "explore") return null;
    return ZONES.find((z) => z.id === prefs.focus) || null;
  }, [prefs]);

  const explorePick = useMemo(() => pickRandom(ZONES), []);

  const visibleZones = useMemo(() => {
    // Focused mode = show 2 cards: the chosen zone + one "Try something new"
    if (prefs?.navMode === "full") return ZONES;
    const primary = focusedZone || ZONES.find((z) => z.id === "grocery");
    const tryNew = {
      id: "try-new",
      title: "Try something new",
      desc: "Open the Concierge and switch focus anytime.",
      route: "/app", // stays here, just opens concierge
    };
    return [primary, tryNew].filter(Boolean);
  }, [prefs, focusedZone]);

  function chooseFocus(id) {
    const next = setFocus(id);
    setPrefsState(next);
  }

  function toggleNavMode() {
    const nextMode = prefs?.navMode === "full" ? "focused" : "full";
    const next = setNavMode(nextMode);
    setPrefsState(next);
  }

  function handleNudgeSeen() {
    advanceNudgeSchedule();
    setNudge(shouldShowNudge());
  }

  function handleDisableNudges() {
    disableNudges();
    setNudge(shouldShowNudge());
  }

  function goNext() {
    setStep((s) => clamp(s + 1, 0, 2));
  }

  function goPrev() {
    setStep((s) => clamp(s - 1, 0, 2));
  }

  function handleConciergePick(xid) {
    if (xid === "explore") {
      chooseFocus(explorePick.id);
      nav(explorePick.route);
      return;
    }
    chooseFocus(xid);
    const hit = ZONES.find((z) => z.id === xid);
    if (hit) nav(hit.route);
  }

  return (
    <section className="page db-shell">
      <div className="db-top">
        <p className="kicker">3C Mall · Lifestyle Intelligence OS</p>
        <h1 className="h1">How can we help today?</h1>
        <p className="sub">
          Pick one focus — the Concierge remembers. You can keep it grocery-only and still get full value.
        </p>
      </div>

      {/* MAIN DASH WIZARD CARD (slides L->R) */}
      <div className="card glass db-card">
        <div className="db-card-head">
          <div className="db-step" aria-label="dashboard steps">
            {[0, 1, 2].map((n) => (
              <span key={n} className="db-step-dot" data-on={step === n ? "true" : "false"} />
            ))}
          </div>

          <div className="pill">
            <span>Mode</span>
            <strong>{prefs?.navMode === "full" ? "Full Mall" : "Focused"}</strong>
          </div>
        </div>

        <div className="db-stage glass-inner">
          <div className="db-track" style={{ transform: `translateX(-${step * 100}%)` }}>
            {/* PANEL 0: Concierge Demo */}
            <div className="db-panel">
              <div className="db-card-tag">Concierge Demo</div>
              <h2 className="db-h2">3C Concierge</h2>

              <div className="db-ai-panel glass-inner">
                <div className="db-ai">
                  <div className="db-ai-badge">3C</div>
                  <div>
                    <div className="db-ai-title">Mock AI (Alpha)</div>
                    <div className="small" style={{ color: "var(--muted2)", marginTop: ".15rem" }}>
                      Beta becomes real AI. Alpha is guided + saved locally.
                    </div>
                  </div>
                </div>

                <p className="db-ai-p">
                  Tell me what you want to focus on today. You can keep the app grocery-only, or explore other zones later.
                </p>

                <div className="nav-row" style={{ marginTop: ".9rem" }}>
                  <button className="btn btn-ghost" onClick={() => setConciergeOpen((p) => !p)}>
                    {conciergeOpen ? "Minimize" : "Open"}
                  </button>
                  <button className="btn btn-secondary" onClick={toggleNavMode}>
                    {prefs?.navMode === "full" ? "Switch to Focused" : "Switch to Full Mall"}
                  </button>
                </div>

                {conciergeOpen && (
                  <div className="db-choice-grid">
                    {[
                      { id: "grocery", title: "Groceries only", desc: "Price routing and cart strategy." },
                      { id: "meals", title: "Meal planning", desc: "Meal slots + list building." },
                      { id: "workout", title: "Training", desc: "Strength goals + pacing." },
                      { id: "community", title: "Community", desc: "Support without pressure." },
                      { id: "explore", title: "Surprise me 🎲", desc: "Random zone to explore." },
                    ].map((x) => (
                      <div
                        key={x.id}
                        className={
                          "db-choice glass-inner " +
                          (prefs?.focus === x.id ? "db-choice-on" : "")
                        }
                        role="button"
                        tabIndex={0}
                        onClick={() => handleConciergePick(x.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleConciergePick(x.id)}
                      >
                        <div className="db-choice-title">{x.title}</div>
                        <div className="db-choice-desc">{x.desc}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="db-ai-foot small">
                  Your choices are saved to your device during Alpha. You can change your focus anytime.
                </div>
              </div>

              <div className="db-nav">
                <button className="btn btn-secondary" disabled>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={goNext}>
                  Next
                </button>
              </div>
            </div>

            {/* PANEL 1: Focused Cards */}
            <div className="db-panel">
              <div className="db-card-tag">Your Focus</div>
              <h2 className="db-h2">Recommended next</h2>
              <p className="small">
                Keep it simple. Tap one card to continue.
              </p>

              <div className="db-choice-grid">
                {visibleZones.map((z) => {
                  if (z.id === "try-new") {
                    return (
                      <div
                        key={z.id}
                        className="db-choice glass-inner"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setConciergeOpen(true);
                          setStep(0);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && (setConciergeOpen(true), setStep(0))}
                      >
                        <div className="db-choice-title">{z.title}</div>
                        <div className="db-choice-desc">{z.desc}</div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={z.id}
                      className={"db-choice glass-inner " + (prefs?.focus === z.id ? "db-choice-on" : "")}
                      role="button"
                      tabIndex={0}
                      onClick={() => nav(z.route)}
                      onKeyDown={(e) => e.key === "Enter" && nav(z.route)}
                    >
                      <div className="db-choice-title">{z.title}</div>
                      <div className="db-choice-desc">{z.desc}</div>

                      <div className="nav-row" style={{ marginTop: ".75rem" }}>
                        <button className="btn btn-primary" onClick={() => nav(z.route)}>
                          Open →
                        </button>
                        <button className="btn btn-secondary" onClick={() => chooseFocus(z.id)}>
                          Set default
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Nudge panel (in-app “notifications”) */}
              {nudge.show && (
                <div className="card glass" style={{ marginTop: "1rem", borderColor: "rgba(246,220,138,.30)" }}>
                  <div className="db-card-tag">Quick Tip</div>
                  <h3 style={{ margin: ".35rem 0", color: "var(--gold)" }}>
                    Want more wins without extra effort?
                  </h3>
                  <p className="small">
                    3C can also help with meal planning, fasting timers, and consistency. You can ignore this forever — your choice.
                  </p>

                  <div className="nav-row">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        handleNudgeSeen();
                        const next = setNavMode("full");
                        setPrefsState(next);
                      }}
                    >
                      Show me more
                    </button>
                    <button className="btn btn-secondary" onClick={handleNudgeSeen}>
                      Not now
                    </button>
                    <button className="btn btn-ghost" onClick={handleDisableNudges}>
                      Don’t remind me
                    </button>
                  </div>
                </div>
              )}

              <div className="db-nav">
                <button className="btn btn-secondary" onClick={goPrev}>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={goNext}>
                  Next
                </button>
              </div>
            </div>

            {/* PANEL 2: Preview */}
            <div className="db-panel">
              <div className="db-card-tag">Preview</div>
              <h2 className="db-h2">What to expect</h2>

              <div className="card glass-inner db-ai-panel">
                <p className="db-ai-p">
                  This is a guided experience. The app does the work — you choose the lane. During Alpha, prices and AI are demo-mode.
                </p>
                <div className="db-ai-foot small">
                  Beta adds real store pricing (where possible) + real AI responses.
                </div>
              </div>

              <div className="card glass-inner" style={{ marginTop: "1rem", overflow: "hidden" }}>
                <img
                  src="/dashboard-mock.png"
                  alt="3C Mall Dashboard Preview"
                  style={{ width: "100%", display: "block", opacity: 0.92 }}
                />
              </div>

              <div className="small db-right-foot">
                Tip: If you only want groceries, set “Groceries only” as your default and you’ll stay focused.
              </div>

              <div className="db-nav">
                <button className="btn btn-secondary" onClick={goPrev}>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={() => nav("/app/grocery-lab")}>
                  Start Grocery Lab →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Concierge pill (Apple-like) */}
      <button
        className="db-float-pill"
        onClick={() => {
          setConciergeOpen(true);
          setStep(0);
        }}
      >
        Concierge
      </button>
    </section>
  );
}
