import React, { useState } from "react";
import { readJSON, writeJSON } from "../../utils/Storage.js";
import { useNavigate } from "react-router-dom";
import ConciergeIntro from "./ConciergeIntro.jsx";
import { betaMessaging } from "../../utils/betaMessaging.js";

const PREF_KEY = "3c.prefs.v1";

const STORE_OPTIONS = [
  { id: "costco", name: "Costco" },
  { id: "walmart", name: "Walmart" },
  { id: "aldi", name: "ALDI" },
  { id: "target", name: "Target" },
  { id: "sprouts", name: "Sprouts" },
];

const DEFAULT_PREFS = {
  primaryFocus: "grocery", // grocery | meal | fitness | community
  lowDataMode: true,
  onboardingSeen: false,
  name: "",
  birthday: "",
  preferredStore: STORE_OPTIONS[0].id,
  pricePreference: "best", // best | loyal
  loyaltyReason: "",
};

export default function ConciergeHub({ minimized, onMinimize, onExpand, onClose }) {
  const nav = useNavigate();
  const [msg, setMsg] = useState("");
  const [introOpen, setIntroOpen] = useState(false);

  const [prefs, setPrefs] = useState(() => readJSON(PREF_KEY, DEFAULT_PREFS));

  const [intro, setIntro] = useState(() => ({
    name: prefs.name || "",
    birthday: prefs.birthday || "",
    preferredStore: prefs.preferredStore || DEFAULT_PREFS.preferredStore,
    pricePreference: prefs.pricePreference || "best",
    loyaltyReason: prefs.loyaltyReason || "",
  }));

  const persistPrefs = (next) => {
    const merged = { ...DEFAULT_PREFS, ...next };
    setPrefs(merged);
    writeJSON(PREF_KEY, merged);
  };

  function chooseFocus(focus) {
    const next = { ...prefs, primaryFocus: focus, onboardingSeen: true };
    persistPrefs(next);
    if (focus === "grocery") nav("/app/grocery-lab");
    if (focus === "meal") nav("/app/meal-plans");
    if (focus === "fitness") nav("/app/fitness");
    if (focus === "community") nav("/app/community");
  }

  function handleMockAsk() {
    const text = msg.trim().toLowerCase();
    if (!text) return;

    // Alpha-safe “mock AI”
    if (text.includes("save") || text.includes("grocery") || text.includes("shop")) {
      chooseFocus("grocery");
      return;
    }
    if (text.includes("meal") || text.includes("prep") || text.includes("eat")) {
      chooseFocus("meal");
      return;
    }
    if (text.includes("workout") || text.includes("train") || text.includes("gym")) {
      chooseFocus("fitness");
      return;
    }
    if (text.includes("community") || text.includes("people") || text.includes("support")) {
      chooseFocus("community");
      return;
    }

    // fallback
    nav("/app");
  }

  const updateIntro = (patch) => setIntro((prev) => ({ ...prev, ...patch }));

  const saveIntro = () => {
    persistPrefs({ ...prefs, ...intro, onboardingSeen: true });
  };

  if (minimized) {
    return (
      <button className="concierge-min" onClick={onExpand}>
        Concierge
      </button>
    );
  }

  return (
    <div className="concierge">
      {introOpen ? <ConciergeIntro open={introOpen} onClose={() => setIntroOpen(false)} /> : null}
      <div className="concierge-head">
        <div>
          <div className="card-tag">Your AI Guide</div>
          <div style={{ fontWeight: 900, color: "var(--gold)", marginTop: ".2rem" }}>
            {betaMessaging.concierge.greeting}
          </div>
          <div className="small">
            {betaMessaging.concierge.intro}
          </div>
        </div>

        <div style={{ display: "flex", gap: ".45rem" }}>
          <button className="btn btn-secondary" onClick={onMinimize}>Minimize</button>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: ".7rem" }}>
        <div className="small">
          <strong>3C Mall AI:</strong> Your preferences stay on-device (Alpha). Cloud sync + advanced AI comes later (Beta). Low Data Mode keeps everything local.
        </div>

        <div className="nav-row" style={{ marginTop: ".65rem" }}>
          <button className={"btn " + (prefs.lowDataMode ? "btn-primary" : "btn-secondary")}
              onClick={() => persistPrefs({ ...prefs, lowDataMode: !prefs.lowDataMode })}>
            Local Mode: {prefs.lowDataMode ? "ON" : "OFF"}
          </button>

          <button className="btn btn-secondary" onClick={() => nav("/app/settings")}>
            Preferences
          </button>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: ".7rem" }}>
        <div className="small" style={{ marginBottom: ".45rem" }}>
          20–40s concierge setup. Big buttons, saved once.
        </div>
        <div className="nav-row">
          <button className="btn btn-primary" onClick={() => setIntroOpen(true)}>
            Open Concierge Intro
          </button>
          <button className="btn btn-secondary" onClick={() => setIntroOpen(false)}>
            Skip for now
          </button>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: ".7rem" }}>
        <div className="small" style={{ marginBottom: ".45rem" }}>
          Quick intro so I can personalize grocery coaching.
        </div>

        <label className="label">Name</label>
        <input
          className="input"
          value={intro.name}
          onChange={(e) => updateIntro({ name: e.target.value })}
          placeholder="Your name"
        />

        <label className="label" style={{ marginTop: ".6rem" }}>Birthday (MM/DD)</label>
        <input
          className="input"
          value={intro.birthday}
          onChange={(e) => updateIntro({ birthday: e.target.value })}
          placeholder="07/14"
          inputMode="numeric"
        />

        <label className="label" style={{ marginTop: ".6rem" }}>Preferred store</label>
        <select
          className="input"
          value={intro.preferredStore}
          onChange={(e) => updateIntro({ preferredStore: e.target.value })}
        >
          {STORE_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <label className="label" style={{ marginTop: ".6rem" }}>How do you shop?</label>
        <div className="nav-row" style={{ flexWrap: "wrap", gap: ".4rem" }}>
          <button
            className={"btn " + (intro.pricePreference === "best" ? "btn-primary" : "btn-secondary")}
            onClick={() => updateIntro({ pricePreference: "best" })}
            type="button"
          >
            Lowest estimated total
          </button>
          <button
            className={"btn " + (intro.pricePreference === "loyal" ? "btn-primary" : "btn-secondary")}
            onClick={() => updateIntro({ pricePreference: "loyal" })}
            type="button"
          >
            Loyal to a store
          </button>
        </div>

        {intro.pricePreference === "loyal" ? (
          <>
            <label className="label" style={{ marginTop: ".45rem" }}>Why this store?</label>
            <textarea
              className="input"
              rows={3}
              value={intro.loyaltyReason}
              onChange={(e) => updateIntro({ loyaltyReason: e.target.value })}
              placeholder="Convenience, service, brand loyalty, rewards…"
            />
          </>
        ) : null}

        <div className="nav-row" style={{ marginTop: ".7rem" }}>
          <button className="btn btn-primary" onClick={saveIntro}>
            Save intro
          </button>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: ".7rem" }}>
        <label className="label">Try the concierge demo</label>
        <input
          className="input"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder='Examples: "Help me save money", "Plan my meals", "I want a workout"'
        />
        <div className="nav-row">
          <button className="btn btn-primary" onClick={handleMockAsk}>Go</button>
          <button className="btn btn-secondary" onClick={() => setMsg("")}>Clear</button>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: ".7rem" }}>
        <div className="small" style={{ marginBottom: ".45rem" }}>
          Or pick a focus (you can change this anytime).
        </div>
        <div className="nav-row">
          <button className="btn btn-primary" onClick={() => chooseFocus("grocery")}>Save Money (Groceries)</button>
          <button className="btn btn-secondary" onClick={() => chooseFocus("meal")}>Meal Prep</button>
          <button className="btn btn-secondary" onClick={() => chooseFocus("fitness")}>Workout</button>
          <button className="btn btn-secondary" onClick={() => chooseFocus("community")}>Community</button>
        </div>
      </div>
    </div>
  );
}
