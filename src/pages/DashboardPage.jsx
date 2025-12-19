// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardPage.css";

import FeedbackPanel from "../assets/components/FeedbackPanel.jsx";

import {
  getPrefsSafe,
  setFocus,
  setNavMode,
  shouldShowNudge,
  advanceNudgeSchedule,
  disableNudges,
} from "../utils/prefs";

<div className="brand-emblem">
  <img src="/brand/3c-emblem.png" alt="3C Mall" />
</div>


// Keep zones tight for Alpha
const ZONES = [
  {
    id: "grocery",
    title: "Save money on groceries",
    desc: "Build a cart optimized automatically.",
    route: "/app/grocery-lab",
  },
  {
    id: "meals",
    title: "Plan meals fast",
    desc: "Choose a date → time → meal. Snacks included.",
    route: "/app/meal-plans",
  },
  {
    id: "workout",
    title: "Training & performance",
    desc: "Strength goals + recovery pacing (Alpha preview).",
    route: "/app/coming-soon",
  },
  {
    id: "community",
    title: "Community support",
    desc: "Encouragement without pressure (Alpha preview).",
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
  const [nudge, setNudge] = useState({ show: false, state: null });

  // Feedback modal
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    setPrefsState(getPrefsSafe());
    setNudge(shouldShowNudge());
  }, []);

  const focusedZone = useMemo(() => {
    if (!prefs?.focus || prefs.focus === "explore") return null;
    return ZONES.find((z) => z.id === prefs.focus) || null;
  }, [prefs]);

  const visibleZones = useMemo(() => {
    // Focused mode shows only their chosen zone (or grocery default)
    if (prefs?.navMode === "full") return ZONES;
    const grocery = ZONES.find((z) => z.id === "grocery");
    const pick = focusedZone || grocery;
    return [pick].filter(Boolean);
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

  const explorePick = useMemo(() => pickRandom(ZONES), []);

  return (
    <section className="page db-shell">
      {/* TOP HEADER */}
      <div className="brand-emblem">
  <img src="/brand/3c-emblem.png" alt="3C Mall" />
</div>
      <div className="db-top">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p className="kicker">3C Mall · Lifestyle Intelligence OS</p>
            <h1 className="h1">How can we help today?</h1>
            <p className="sub">
              Pick one focus — the Concierge remembers. You can stay grocery-only and still get full value.
            </p>
          </div>

          <div className="pill">
            <span>Mode</span>
            <strong>{prefs?.navMode === "full" ? "Full Mall" : "Focused"}</strong>
          </div>
        </div>
      </div>

      {/* Concierge FIRST */}
      <div className="card glass db-card">
        <div className="db-card-head">
          <div className="db-ai">
            <div className="db-ai-badge">3C</div>
            <div>
              <div className="db-ai-title">Concierge Demo</div>
              <div className="small">In Beta this becomes real AI. In Alpha: guided choices.</div>
            </div>
          </div>

          <div className="db-head-actions">
            <button className="btn btn-ghost db-head-btn" onClick={() => setFeedbackOpen(true)}>
              Feedback
            </button>
            <button className="btn btn-secondary db-head-btn" onClick={() => setConciergeOpen((p) => !p)}>
              {conciergeOpen ? "Minimize" : "Open"}
            </button>
          </div>
        </div>

        {conciergeOpen && (
          <div className="card glass-inner db-ai-panel">
            <p className="db-ai-p">
              Tell me what you want today. I’ll take you there, and I’ll remember your preference so the app stays quiet.
            </p>

            <div className="db-choice-grid">
              {[
                { id: "grocery", label: "Groceries only", hint: "Best value cart strategy" },
                { id: "meals", label: "Meal planning", hint: "Fast meal + snack flow" },
                { id: "workout", label: "Training", hint: "Strength + recovery" },
                { id: "community", label: "Community", hint: "Support without pressure" },
                { id: "explore", label: "Surprise me 🎲", hint: "Explore one zone" },
              ].map((x) => {
                const isOn = prefs?.focus === x.id;

                return (
                  <button
                    key={x.id}
                    className={"db-choice glass-inner " + (isOn ? "db-choice-on" : "")}
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
                    <div className="db-choice-desc">{x.hint}</div>
                  </button>
                );
              })}
            </div>

            <div className="nav-row" style={{ marginTop: "1rem" }}>
              <button className="btn btn-secondary" onClick={toggleNavMode}>
                {prefs?.navMode === "full" ? "Switch to Focused" : "Switch to Full Mall"}
              </button>
              <button className="btn btn-secondary" onClick={() => nav("/app/settings")}>
                Settings
              </button>
            </div>

            <div className="db-ai-foot small">
              Alpha note: your choices save to your device. In Beta they’ll also sync to your account.
            </div>
          </div>
        )}
      </div>

      {/* Nudge */}
      {nudge.show && (
        <div className="card glass db-card" style={{ marginTop: "1rem", borderColor: "rgba(246,220,138,.35)" }}>
          <div className="db-card-tag">Quick Tip</div>
          <h3 className="db-h2" style={{ color: "var(--gold)" }}>
            Want the other wins too?
          </h3>
          <p className="small">
            3C Mall can plan meals, track fasting windows, and support consistency without pressure.
            You can ignore this forever — your choice.
          </p>

          <div className="nav-row">
            <button
              className="btn btn-primary"
              onClick={() => {
                handleNudgeSeen();
                const nextPrefs = setNavMode("full");
                setPrefsState(nextPrefs);
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

      {/* Zone cards */}
      <div className="grid" style={{ marginTop: "1rem" }}>
        {visibleZones.map((z) => (
          <div key={z.id} className="card glass db-card">
            <div className="db-card-tag">Zone</div>
            <h3 className="db-h2" style={{ color: "var(--gold)" }}>
              {z.title}
            </h3>
            <p className="small">{z.desc}</p>

            <div className="nav-row">
              <button className="btn btn-primary" onClick={() => nav(z.route)}>
                Open
              </button>
              <button className="btn btn-secondary" onClick={() => chooseFocus(z.id)}>
                Set as default
              </button>
              <button className="btn btn-ghost" onClick={() => setFeedbackOpen(true)}>
                Feedback
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="card glass db-card" style={{ marginTop: "1rem" }}>
        <div className="db-card-tag">Preview</div>
        <h3 className="db-h2" style={{ color: "var(--gold)" }}>
          What to expect
        </h3>
        <p className="small">This is a guided experience. The app does the work — you choose the lane.</p>

        <div
          style={{
            marginTop: ".8rem",
            overflow: "hidden",
            borderRadius: "1rem",
            border: "1px solid rgba(126,224,255,.18)",
          }}
        >
          <img
            src="/dashboard-mock.png"
            alt="3C Mall Dashboard Preview"
            style={{ width: "100%", display: "block", opacity: 0.92 }}
          />
        </div>

        <div className="nav-row" style={{ marginTop: "1rem" }}>
          <button className="btn btn-secondary" onClick={() => setFeedbackOpen(true)}>
            Send feedback
          </button>
        </div>
      </div>

      {/* Floating feedback pill */}
      <button className="db-float-pill" onClick={() => setFeedbackOpen(true)}>
        Feedback
      </button>

      {/* FEEDBACK MODAL */}
      <FeedbackPanel
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="3C Mall — Alpha Feedback"
        formUrl="https://forms.gle/bdWFtAEAABbJnb8n7"
        context={{
          page: "Dashboard",
          buildUrl: window.location.href,
          deviceLabel: navigator.userAgent,
        }}
      />
    </section>
  );
}



