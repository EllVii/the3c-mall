// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardPage.css";

import FeedbackDrawer from "../assets/components/FeedbackDrawer";

import {
  getPrefsSafe,
  setFocus,
  setNavMode,
  shouldShowNudge,
  advanceNudgeSchedule,
  disableNudges,
} from "../utils/prefs";

const FEEDBACK_FORM = "https://forms.gle/bdWFtAEAABbJnb8n7";

const ZONES = [
  {
    id: "grocery",
    title: "Save money on groceries",
    desc: "Build a cart strategy in seconds. Multi-store or single-store.",
    route: "/app/grocery-lab",
  },
  {
    id: "meals",
    title: "Plan meals fast",
    desc: "Pick a date → time → meal. Snacks included (Alpha demo).",
    route: "/app/meal-plans",
  },
  {
    id: "workout",
    title: "Training & performance",
    desc: "Strength goals + recovery pacing (Alpha demo / coming soon).",
    route: "/app/coming-soon",
  },
  {
    id: "community",
    title: "Community support",
    desc: "Encouragement without pressure (Alpha demo).",
    route: "/app/community",
  },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function DashboardPage() {
  const nav = useNavigate();

  const [prefs, setPrefsState] = useState(() => getPrefsSafe());
  const [conciergeOpen, setConciergeOpen] = useState(true);

  // Wizard “card swipe” behavior (no scrolling mindset)
  // 0 = Concierge, 1 = Zones, 2 = What to expect
  const [step, setStep] = useState(0);

  // Alpha “nudge/notification” demo
  const [nudge, setNudge] = useState({ show: false, state: null });

  // Feedback drawer (same visual language)
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    setPrefsState(getPrefsSafe());
    setNudge(shouldShowNudge());
  }, []);

  const focusedZone = useMemo(() => {
    if (!prefs?.focus || prefs.focus === "explore") return null;
    return ZONES.find((z) => z.id === prefs.focus) || null;
  }, [prefs]);

  // Focused vs Full Mall
  const visibleZones = useMemo(() => {
    if (prefs?.navMode === "full") return ZONES;

    // Focused: show only their chosen focus (or grocery by default)
    const grocery = ZONES.find((z) => z.id === "grocery");
    const pick = focusedZone || grocery;
    return [pick].filter(Boolean);
  }, [prefs, focusedZone]);

  const explorePick = useMemo(() => pickRandom(ZONES), []);

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

  function next() {
    setStep((s) => Math.min(2, s + 1));
  }
  function prev() {
    setStep((s) => Math.max(0, s - 1));
  }

  // Optional: keeps UI tight and avoids accidental scroll vibe
  // You can remove this if it causes issues on small devices.
  useEffect(() => {
    document.body.style.overflowY = "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

  return (
    <section className="page db-shell">
      {/* Top header — NO buttons */}
      <div className="db-top">
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p className="kicker">3C Mall · Lifestyle Intelligence OS</p>
            <h1 className="h1">How can we help today?</h1>
            <p className="sub">
              Choose a focus — the Concierge remembers. Everything is optional. You can stay grocery-only and still win.
            </p>
          </div>

          <div className="pill">
            <span>Mode</span>
            <strong>{prefs?.navMode === "full" ? "Full Mall" : "Focused"}</strong>
          </div>
        </div>
      </div>

      {/* Wizard Card (single container) */}
      <div className="card glass db-card">
        <div className="db-card-head">
          <div className="db-step">
            <span className="db-step-dot" data-on={step === 0 ? "true" : "false"} />
            <span className="db-step-dot" data-on={step === 1 ? "true" : "false"} />
            <span className="db-step-dot" data-on={step === 2 ? "true" : "false"} />
          </div>

          {/* Minimal actions ONLY (not in header) */}
          <div className="db-head-actions">
            <button className="btn btn-secondary db-head-btn" onClick={toggleNavMode}>
              {prefs?.navMode === "full" ? "Focused" : "Full Mall"}
            </button>
            <button className="btn btn-secondary db-head-btn" onClick={() => setFeedbackOpen(true)}>
              Feedback
            </button>
          </div>
        </div>

        <div className="db-stage glass-inner">
          <div
            className="db-track"
            style={{ transform: `translateX(-${step * 100}%)` }}
          >
            {/* PANEL 0 — Concierge first */}
            <div className="db-panel">
              <div className="db-ai">
                <div className="db-ai-badge">3C</div>
                <div>
                  <div className="db-ai-title">Concierge Demo</div>
                  <div className="small" style={{ color: "var(--muted)" }}>
                    In Beta this becomes real AI. For Alpha: guided choices + saved preference.
                  </div>
                </div>

                <div style={{ marginLeft: "auto" }}>
                  <button className="btn btn-ghost" onClick={() => setConciergeOpen((v) => !v)}>
                    {conciergeOpen ? "Minimize" : "Open"}
                  </button>
                </div>
              </div>

              <div className="card glass-inner db-ai-panel">
                <p className="db-ai-p">
                  Tell me what you want to work on today — groceries, meals, training, or community.
                  I’ll remember your choice so the app stays clean and doesn’t waste your time.
                </p>
                <div className="db-ai-foot small">
                  Alpha note: settings are saved on this device. (Login/profile sync comes in Beta.)
                </div>

                {conciergeOpen && (
                  <div className="db-choice-grid">
                    {[
                      { id: "grocery", label: "Groceries only" },
                      { id: "meals", label: "Meal planning" },
                      { id: "workout", label: "Training" },
                      { id: "community", label: "Community" },
                      { id: "explore", label: "Surprise me 🎲" },
                    ].map((x) => {
                      const on = prefs?.focus === x.id;
                      return (
                        <button
                          key={x.id}
                          className={"db-choice glass-inner " + (on ? "db-choice-on" : "")}
                          onClick={() => {
                            if (x.id === "explore") {
                              chooseFocus(explorePick.id);
                              nav(explorePick.route);
                              return;
                            }
                            chooseFocus(x.id);
                            const hit = ZONES.find((z) => z.id === x.id);
                            if (hit) nav(hit.route);
                          }}
                        >
                          <div className="db-choice-title">{x.label}</div>
                          <div className="db-choice-desc">
                            {x.id === "grocery" && "Cart strategy + store routing (demo)."}
                            {x.id === "meals" && "Date → time → meal + snacks (demo)."}
                            {x.id === "workout" && "Performance goals (demo / coming soon)."}
                            {x.id === "community" && "Support without pressure (demo)."}
                            {x.id === "explore" && "Random zone pick to explore."}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="db-nav">
                <button className="btn btn-secondary" disabled>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={next}>
                  Next
                </button>
              </div>
            </div>

            {/* PANEL 1 — Zone cards (less options, clean) */}
            <div className="db-panel">
              <div className="db-card-tag">ZONES</div>
              <h2 className="db-h2">Your Mall (based on your focus)</h2>
              <p className="small">
                If you’re in Focused mode, you’ll see only what you chose. You can switch to Full Mall anytime.
              </p>

              {/* Alpha “nudge” card (notification demo) */}
              {nudge?.show && (
                <div className="card glass-inner" style={{ marginTop: ".9rem", borderColor: "rgba(246,220,138,.25)" }}>
                  <div className="db-card-tag">QUICK TIP</div>
                  <h3 style={{ margin: ".35rem 0", color: "var(--gold)" }}>
                    Want the other wins too?
                  </h3>
                  <p className="small">
                    You can stay grocery-only — but 3C can also help with meal planning and consistency tools.
                    You control what shows up.
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

              <div className="db-choice-grid" style={{ marginTop: ".9rem" }}>
                {visibleZones.map((z) => (
                  <button
                    key={z.id}
                    className={"db-choice glass-inner " + (prefs?.focus === z.id ? "db-choice-on" : "")}
                    onClick={() => nav(z.route)}
                  >
                    <div className="db-choice-title">{z.title}</div>
                    <div className="db-choice-desc">{z.desc}</div>
                    <div className="nav-row" style={{ marginTop: ".75rem" }}>
                      <span className="pill">
                        <span>Default</span>
                        <strong>{prefs?.focus === z.id ? "Yes" : "No"}</strong>
                      </span>
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          chooseFocus(z.id);
                        }}
                      >
                        Set default
                      </button>
                    </div>
                  </button>
                ))}
              </div>

              <div className="db-nav">
                <button className="btn btn-secondary" onClick={prev}>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={next}>
                  Next
                </button>
              </div>
            </div>

            {/* PANEL 2 — What to expect + preview image slot */}
            <div className="db-panel">
              <div className="db-card-tag">PREVIEW</div>
              <h2 className="db-h2">What to expect (Alpha)</h2>
              <p className="small">
                Alpha is about smoothness, clarity, and confidence. We’re testing flow, not perfection.
              </p>

              <div className="card glass-inner" style={{ marginTop: ".9rem", padding: "1rem" }}>
                <div className="db-right-title">Your promise</div>
                <p className="small" style={{ marginTop: ".45rem" }}>
                  3C doesn’t shame you. It shows options and makes choices easier. You stay in control.
                </p>
                <div className="db-right-foot small">
                  Tip: If something feels “too busy,” that’s exactly what we want to hear in Feedback.
                </div>
              </div>

              {/* Optional dashboard image: put file in /public/icons or /public */}
              <div
                className="card glass-inner"
                style={{
                  marginTop: ".9rem",
                  padding: "1rem",
                  overflow: "hidden",
                }}
              >
                <div className="db-card-tag">MOCK</div>
                <div style={{ borderRadius: "1rem", overflow: "hidden", border: "1px solid rgba(126,224,255,.16)" }}>
                  <img
                    src="/icons/3c-mall.png"
                    alt="3C Mall"
                    style={{ width: "100%", display: "block", opacity: 0.92 }}
                  />
                </div>
              </div>

              <div className="db-nav">
                <button className="btn btn-secondary" onClick={prev}>
                  Previous
                </button>
                <button className="btn btn-primary" onClick={() => nav("/app/grocery-lab")}>
                  Start → Grocery Lab
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback drawer: same design language (not a different “app inside the app”) */}
      <FeedbackDrawer
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        formUrl={FEEDBACK_FORM}
        context={{
          page: "dashboard",
          build: window.location.origin,
          device: navigator.userAgent,
        }}
      />

      {/* Optional floating concierge “Apple-like” pill (hide if you don’t want it yet) */}
      <button
        className="db-float-pill"
        onClick={() => {
          setStep(0);
          setConciergeOpen(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        aria-label="Open Concierge"
        title="Open Concierge"
      >
        Concierge
      </button>
    </section>
  );
}
