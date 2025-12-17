import React, { useMemo, useState } from "react";
import { readJSON, writeJSON } from "../../utils/Storage.js";
import { useNavigate } from "react-router-dom";

const PREF_KEY = "3c.prefs.v1";

export default function ConciergeHub({ minimized, onMinimize, onExpand, onClose }) {
  const nav = useNavigate();
  const [msg, setMsg] = useState("");

  const prefs = useMemo(() => readJSON(PREF_KEY, {
    primaryFocus: "grocery",   // grocery | meal | fitness | community
    lowDataMode: true,
    onboardingSeen: false,
  }), []);

  function setPrefs(next) {
    writeJSON(PREF_KEY, next);
  }

  function chooseFocus(focus) {
    const next = { ...prefs, primaryFocus: focus, onboardingSeen: true };
    setPrefs(next);
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

  if (minimized) {
    return (
      <button className="concierge-min" onClick={onExpand}>
        Concierge
      </button>
    );
  }

  return (
    <div className="concierge">
      <div className="concierge-head">
        <div>
          <div className="card-tag">Concierge</div>
          <div style={{ fontWeight: 900, color: "var(--gold)", marginTop: ".2rem" }}>
            How can I help today?
          </div>
          <div className="small">
            Alpha mode: mostly local, low-data by design.
          </div>
        </div>

        <div style={{ display: "flex", gap: ".45rem" }}>
          <button className="btn btn-secondary" onClick={onMinimize}>Minimize</button>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: ".7rem" }}>
        <div className="small">
          <strong>Privacy / data:</strong> your choices are saved on-device in Alpha.
          Cloud sync + real AI comes later (Beta). You can keep “Low Data Mode” on.
        </div>

        <div className="nav-row" style={{ marginTop: ".65rem" }}>
          <button className={"btn " + (prefs.lowDataMode ? "btn-primary" : "btn-secondary")}
                  onClick={() => setPrefs({ ...prefs, lowDataMode: !prefs.lowDataMode })}>
            Low Data: {prefs.lowDataMode ? "ON" : "OFF"}
          </button>

          <button className="btn btn-secondary" onClick={() => nav("/app/settings")}>
            Preferences
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
