// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPrefsSafe,
  setFocus,
  setNavMode,
  shouldShowNudge,
  advanceNudgeSchedule,
  disableNudges
} from "../utils/prefs";

const ZONES = [
  { id: "grocery", title: "Save money on groceries", desc: "Build a cart optimized automatically.", route: "/app/grocery-lab" },
  { id: "meals", title: "Plan meals fast", desc: "Set a meal slot and generate a grocery list.", route: "/app/meal-plans" },
  { id: "workout", title: "Training & performance", desc: "Strength goals + recovery pacing.", route: "/app/coming-soon" },
  { id: "community", title: "Community support", desc: "Encouragement without pressure.", route: "/app/community" },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function DashboardPage() {
  const nav = useNavigate();
  const [prefs, setPrefsState] = useState(() => getPrefsSafe());
  const [conciergeOpen, setConciergeOpen] = useState(true);
  const [nudge, setNudge] = useState({ show: false, state: null });

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
    // focused mode: show only grocery + one “explore” option + one “upgrade” teaser
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
    setNudge({ show: false, state: shouldShowNudge().state });
  }

  function handleDisableNudges() {
    disableNudges();
    setNudge({ show: false, state: shouldShowNudge().state });
  }

  const explorePick = useMemo(() => pickRandom(ZONES), []);

  return (
    <section className="page dashboard-watermark">
      <div className="dash-top">
        <div>
          <p className="kicker">3C Mall · Lifestyle Intelligence OS</p>
          <h1 className="h1">How can we help today?</h1>
          <p className="sub">
            Pick one focus — the Concierge remembers. You can keep it grocery-only and still get full value.
          </p>
        </div>

        <div className="pill">
          <span>Mode</span>
          <strong>{prefs?.navMode === "full" ? "Full Mall" : "Focused"}</strong>
        </div>
      </div>

      {/* Concierge FIRST */}
      <div className="card glass" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
          <div>
            <div className="card-tag">Concierge Demo</div>
            <h2 style={{ margin: ".35rem 0 .4rem", color: "var(--gold)" }}>
              3C Concierge
            </h2>
            <p className="small">
              Quick demo. In Beta this becomes real AI. For now: choose a focus and we guide you.
            </p>
          </div>

          <button className="btn btn-ghost" onClick={() => setConciergeOpen((p) => !p)}>
            {conciergeOpen ? "Minimize" : "Open"}
          </button>
        </div>

        {conciergeOpen && (
          <div className="grid" style={{ marginTop: "1rem" }}>
            {[
              { id: "grocery", label: "Groceries only" },
              { id: "meals", label: "Meal planning" },
              { id: "workout", label: "Training" },
              { id: "community", label: "Community" },
              { id: "explore", label: "Surprise me 🎲" },
            ].map((x) => (
              <button
                key={x.id}
                className={"btn " + (prefs?.focus === x.id ? "btn-primary" : "btn-secondary")}
                onClick={() => {
                  if (x.id === "explore") {
                    chooseFocus(explorePick.id);
                    nav(explorePick.route);
                    return;
                  }
                  chooseFocus(x.id);
                  // auto-navigate for fast UX:
                  const hit = ZONES.find((z) => z.id === x.id);
                  if (hit) nav(hit.route);
                }}
              >
                {x.label}
              </button>
            ))}
          </div>
        )}

        <div className="nav-row" style={{ marginTop: "1rem" }}>
          <button className="btn btn-secondary" onClick={toggleNavMode}>
            {prefs?.navMode === "full" ? "Switch to Focused" : "Switch to Full Mall"}
          </button>
        </div>
      </div>

      {/* In-app Nudge (Alpha “notifications”) */}
      {nudge.show && (
        <div className="card glass" style={{ marginTop: "1rem", borderColor: "rgba(246,220,138,.35)" }}>
          <div className="card-tag">Quick Tip</div>
          <h3 style={{ margin: ".35rem 0", color: "var(--gold)" }}>
            You’re only using one feature — want the other wins too?
          </h3>
          <p className="small">
            3C Mall can also plan meals, track fasting timers, and support consistency without pressure.
            You can ignore this forever — your choice.
          </p>

          <div className="nav-row">
            <button className="btn btn-primary" onClick={() => { handleNudgeSeen(); setNavMode("full"); }}>
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

      {/* Focused Cards (less options) */}
      <div className="grid" style={{ marginTop: "1rem" }}>
        {visibleZones.map((z) => (
          <div key={z.id} className="card glass">
            <div className="card-tag">Zone</div>
            <h3 style={{ margin: ".35rem 0", color: "var(--gold)" }}>{z.title}</h3>
            <p className="small">{z.desc}</p>
            <div className="nav-row">
              <button className="btn btn-primary" onClick={() => nav(z.route)}>
                Open →
              </button>
              <button className="btn btn-secondary" onClick={() => chooseFocus(z.id)}>
                Set as default
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Optional image slot (your dashboard image) */}
      <div className="card glass" style={{ marginTop: "1rem" }}>
        <div className="card-tag">Preview</div>
        <h3 style={{ margin: ".35rem 0", color: "var(--gold)" }}>What to expect</h3>
        <p className="small">This is a guided experience. The app does the work — you choose the lane.</p>

        {/* Put your image in /public and reference it like below */}
        <div style={{ marginTop: ".8rem", overflow: "hidden", borderRadius: "1rem", border: "1px solid rgba(126,224,255,.18)" }}>
          <img
            src="/dashboard-mock.png"
            alt="3C Mall Dashboard Preview"
            style={{ width: "100%", display: "block", opacity: 0.92 }}
          />
        </div>
      </div>
    </section>
  );
}
