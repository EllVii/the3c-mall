// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardPage.css";

import FeedbackPanel from "../assets/components/FeedbackPanel.jsx";
import ConciergeOverlay from "../assets/components/ConciergeOverlay.jsx";

import {
  getPrefsSafe,
  setFocus,
  setNavMode,
  shouldShowNudge,
  advanceNudgeSchedule,
  disableNudges,
} from "../utils/prefs";

/* =========================================================
   ZONES (ALPHA — KEEP TIGHT)
   ========================================================= */
const ZONES = [
  { id: "grocery", title: "Save money on groceries", desc: "Build a cart optimized automatically.", route: "/app/grocery-lab" },
  { id: "meals", title: "Plan meals fast", desc: "Choose a date → time → meal. Snacks included.", route: "/app/meal-plans" },
  { id: "workout", title: "Training & performance", desc: "Strength goals + recovery pacing (Alpha preview).", route: "/app/coming-soon" },
  { id: "community", title: "Community support", desc: "Encouragement without pressure (Alpha preview).", route: "/app/community" },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function DashboardPage() {
  const nav = useNavigate();

  const [prefs, setPrefsState] = useState(() => getPrefsSafe());
  const [nudge, setNudge] = useState({ show: false });

  // Concierge overlay — OPEN BY DEFAULT
  const [ccOpen, setCcOpen] = useState(true);
  const [ccMin, setCcMin] = useState(false);

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
    if (prefs?.navMode === "full") return ZONES;
    const grocery = ZONES.find((z) => z.id === "grocery");
    return [focusedZone || grocery].filter(Boolean);
  }, [prefs, focusedZone]);

  function chooseFocus(id) {
    const next = setFocus(id);
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

  const conciergeOptions = useMemo(
    () => [
      { id: "grocery", label: "Groceries only", hint: "Best value cart strategy", route: "/app/grocery-lab" },
      { id: "meals", label: "Meal planning", hint: "Fast meal + snack flow", route: "/app/meal-plans" },
      { id: "workout", label: "Training", hint: "Strength + recovery", route: "/app/coming-soon" },
      { id: "community", label: "Community", hint: "Support without pressure", route: "/app/community" },
      { id: "settings", label: "Settings", hint: "Theme + navigation", route: "/app/settings" },
      { id: "explore", label: "Surprise me 🎲", hint: "Explore one zone", route: explorePick.route },
    ],
    [explorePick.route]
  );

  function onConciergePick(x) {
    if (x.id === "explore") {
      chooseFocus(explorePick.id);
      nav(explorePick.route);
    } else {
      if (["grocery", "meals", "workout", "community"].includes(x.id)) chooseFocus(x.id);
      nav(x.route);
    }
    setCcOpen(false);
  }

  return (
    <section className="page db-shell">
      {/* BRAND HEADER (top band) */}
      <div className="brand-emblem">
        <img src="/brand/3c-emblem.png" alt="3C Mall" />
      </div>

      {/* CONCIERGE OVERLAY (PRIMARY ENTRY POINT) */}
      <ConciergeOverlay
        open={ccOpen}
        minimized={ccMin}
        onMinimize={() => {
          setCcMin(true);
          setCcOpen(true);
        }}
        onOpen={() => {
          setCcMin(false);
          setCcOpen(true);
        }}
        onClose={() => {
          setCcOpen(false);
          setCcMin(false);
        }}
        onPick={onConciergePick}
        title="Concierge"
        subtitle="Concierge · Cost · Community"
        options={conciergeOptions}
      />

      {/* PAGE HEADER (this is content, not the top band) */}
      <div className="page-content">
        <div className="tile tile-hero">
          <div className="kicker">Concierge · Cost · Community</div>
          <div className="h1">How can we help today?</div>
          <div className="sub">No scrolling. Pick your lane. If it doesn’t fit, it becomes a new screen.</div>
          <div style={{ marginTop: ".6rem", display: "flex", justifyContent: "center" }}>
            <div className="pill">
              <span>Mode</span>
              <strong>{prefs?.navMode === "full" ? "Full Mall" : "Focused"}</strong>
            </div>
          </div>
        </div>

        {/* OPTIONAL NUDGE */}
        {nudge.show && (
          <div className="tile tile-hero" style={{ borderColor: "rgba(246,220,138,.35)" }}>
            <div className="kicker">Quick Tip</div>
            <div className="tile-title">Want the other wins too?</div>
            <div className="small">3C can plan meals and support consistency. Ignore forever if you want.</div>
            <div className="page-footer" style={{ borderTop: "0", padding: 0, marginTop: ".6rem" }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleNudgeSeen();
                  setPrefsState(setNavMode("full"));
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

        {/* ZONES (tile grid, feng shui) */}
        <div className="fit-grid">
          {visibleZones.map((z) => (
            <div key={z.id} className="tile">
              <div className="tile-title">{z.title}</div>
              <div className="tile-desc">{z.desc}</div>
              <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".5rem" }}>
                <button className="btn btn-primary" onClick={() => nav(z.route)}>
                  Open
                </button>
                <button className="btn btn-secondary" onClick={() => chooseFocus(z.id)}>
                  Set default
                </button>
                <button className="btn btn-ghost" onClick={() => setFeedbackOpen(true)}>
                  Feedback
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER BAND (keep light) */}
      <div className="page-footer">
        <button className="btn btn-secondary" onClick={() => { setCcMin(false); setCcOpen(true); }}>
          Concierge
        </button>
        <button className="btn btn-secondary" onClick={() => nav("/app/settings")}>
          Settings
        </button>
      </div>

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