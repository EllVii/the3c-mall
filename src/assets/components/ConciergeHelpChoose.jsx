// src/assets/components/ConciergeHelpChoose.jsx
import React, { useState } from "react";

export default function ConciergeHelpChoose({ onChoose }) {
  const [mode, setMode] = useState("quick"); // quick | guided

  return (
    <div className="card">
      <div style={{ fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--blue)" }}>
        Concierge
      </div>
      <h3 style={{ marginTop: ".5rem", color: "var(--gold)" }}>Help me choose</h3>
      <p className="small">
        Quick if you’re in a hurry. Guided if you want the full walkthrough.
      </p>

      <div className="nav-row">
        <button
          className={"btn " + (mode === "quick" ? "btn-primary" : "btn-secondary")}
          onClick={() => setMode("quick")}
        >
          Quick
        </button>
        <button
          className={"btn " + (mode === "guided" ? "btn-primary" : "btn-secondary")}
          onClick={() => setMode("guided")}
        >
          Guided
        </button>
      </div>

      <div className="nav-row">
        <button
          className="btn btn-primary"
          onClick={() => onChoose?.(mode)}
        >
          Start →
        </button>
      </div>
    </div>
  );
}
