// src/pages/PTModePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DEMO_CLIENTS = [
  { id: "c1", name: "Jason (Trainer)", status: "Active", focus: "Strength + macros" },
  { id: "c2", name: "Ava", status: "Needs check-in", focus: "Routine + meals" },
  { id: "c3", name: "Abigail", status: "On track", focus: "Energy + consistency" },
];

export default function PTModePage() {
  const nav = useNavigate();
  const [clients] = useState(DEMO_CLIENTS);
  const [showNextBlocks, setShowNextBlocks] = useState(false);

  return (
    <section className="page">
      <header style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
        <div>
          <p className="kicker">PT Mode • Beta</p>
          <h1 className="h1">Trainer Dashboard</h1>
          <p className="sub">
            MVP skeleton: clients, quick actions, adherence. Next: messaging + plan push.
          </p>

          <div className="nav-row">
            <button className="btn btn-secondary" onClick={() => nav("/app")}>
              ← Dashboard
            </button>
            <button className="btn btn-secondary" onClick={() => nav("/app/meal-plans")}>
              Meal Plans →
            </button>
          </div>
        </div>

        <div className="pill">
          <span>Clients</span>
          <strong>{clients.length}</strong>
        </div>
      </header>

      <div
        className="grid"
        style={{
          marginTop: "1rem",
          maxHeight: "50vh",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "0.35rem",
        }}
      >
        {clients.map((c) => (
          <div className="card" key={c.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <div style={{ fontWeight: 900, color: "var(--gold)", fontSize: "1.05rem" }}>{c.name}</div>
              <div style={{ color: "var(--blue)", fontWeight: 900 }}>{c.status}</div>
            </div>

            <div className="small" style={{ marginTop: ".35rem" }}>
              Focus: <strong>{c.focus}</strong>
            </div>

            <div className="nav-row" style={{ marginTop: ".85rem" }}>
              <button className="btn btn-primary" onClick={() => alert("MVP: Open client profile")}>
                Open →
              </button>
              <button className="btn btn-secondary" onClick={() => alert("MVP: Send check-in prompt")}>
                Send Check-In
              </button>
              <button className="btn btn-ghost" onClick={() => alert("MVP: Add note")}>
                Add Note
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => setShowNextBlocks((v) => !v)}
          aria-expanded={showNextBlocks}
        >
          {showNextBlocks ? "Hide" : "Show"} Next PT Mode Blocks
        </button>

        {showNextBlocks && (
          <div style={{ marginTop: "0.85rem" }}>
            <div style={{ fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--blue)" }}>
              Next PT Mode Blocks
            </div>
            <ul style={{ marginTop: ".5rem", paddingLeft: "1.1rem", color: "var(--muted)" }}>
              <li>Client profile view (goals, streaks, meal adherence)</li>
              <li>“Push plan” button → writes to client plan</li>
              <li>Message thread stub (later: real chat)</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
