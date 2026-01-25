// src/pages/PTDashboard.jsx
import React, { useMemo, useState, useEffect } from "react";
import "../styles/PTDashboard.css";
import PTMessaging from "../assets/components/PT/PTMessaging.jsx";
import PTMealPlanAssignment from "../assets/components/PT/PTMealPlanAssignment.jsx";
import { canAccessPTMode, getPTModeRestrictionReason } from "../utils/deviceDetection.js";

const MOCK_CLIENTS = [
  { id: "c1", name: "Client One", goal: "Cut", adherence: 82, protein: 165, lastCheckIn: "Today" },
  { id: "c2", name: "Client Two", goal: "Gain", adherence: 74, protein: 190, lastCheckIn: "Yesterday" },
  { id: "c3", name: "Client Three", goal: "Strength", adherence: 88, protein: 210, lastCheckIn: "2 days ago" },
];

export default function PTDashboard() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(MOCK_CLIENTS[0]?.id || null);
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview | messages | meal-plans
  const [hasDesktopAccess, setHasDesktopAccess] = useState(true);
  const [restrictionReason, setRestrictionReason] = useState(null);

  // Check desktop access on mount
  useEffect(() => {
    const hasAccess = canAccessPTMode();
    setHasDesktopAccess(hasAccess);
    if (!hasAccess) {
      setRestrictionReason(getPTModeRestrictionReason());
    }
  }, []);

  const clients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_CLIENTS;
    return MOCK_CLIENTS.filter((c) => c.name.toLowerCase().includes(q) || c.goal.toLowerCase().includes(q));
  }, [query]);

  const selected = useMemo(() => clients.find((c) => c.id === selectedId) || clients[0], [clients, selectedId]);

  const handleMealPlanAssign = (assignment) => {
    console.log("Meal plan assigned:", assignment);
    // Future: persist to backend
  };

  // Show restriction screen if not on desktop
  if (!hasDesktopAccess) {
    return (
      <div className="pt-page">
        <div className="pt-restriction-screen">
          <div className="pt-restriction-icon">🖥️</div>
          <h2 className="pt-restriction-title">Desktop Required</h2>
          <p className="pt-restriction-message">{restrictionReason}</p>
          <div className="pt-restriction-features">
            <div className="pt-restriction-feature-title">Why Desktop Only?</div>
            <ul className="pt-restriction-list">
              <li>Multi-panel interface for efficient client management</li>
              <li>Real-time messaging with keyboard shortcuts</li>
              <li>Meal plan builder with drag-and-drop</li>
              <li>Detailed analytics and reporting views</li>
              <li>Better security for client data management</li>
            </ul>
          </div>
          <div className="pt-restriction-hint">
            💡 Access this page from your laptop or desktop computer to continue.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-page">
      <header className="pt-header">
        <div>
          <div className="pt-kicker">PT MODE · DESKTOP ONLY</div>
          <h1 className="pt-title">Trainer Dashboard</h1>
          <p className="pt-subtitle">
            Monitor clients, send messages, assign meal plans, and manage training (Full PT Suite).
          </p>
        </div>

        <div className="pt-pill">
          <span>STATUS</span>
          <strong>Live MVP</strong>
        </div>
      </header>

      <div className="pt-grid">
        {/* LEFT: client list (SCROLLABLE) */}
        <section className="pt-card">
          <div className="pt-card-top">
            <div>
              <div className="pt-tag">Your Clients</div>
              <div className="pt-small">Search + select a client</div>
            </div>
            <input
              className="pt-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or goal..."
            />
          </div>

          <div className="pt-client-list">
            {clients.map((c) => {
              const active = selected?.id === c.id;
              return (
                <button
                  key={c.id}
                  className={`pt-client ${active ? "pt-client-active" : ""}`}
                  onClick={() => setSelectedId(c.id)}
                  type="button"
                >
                  <div className="pt-client-main">
                    <div className="pt-client-name">{c.name}</div>
                    <div className="pt-client-meta">
                      Goal: <strong>{c.goal}</strong> • Last check-in: <strong>{c.lastCheckIn}</strong>
                    </div>
                  </div>
                  <div className="pt-client-score">
                    <div className="pt-score">{c.adherence}%</div>
                    <div className="pt-score-label">adherence</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-muted">
            MVP note: real clients will come from your backend later. This keeps the UI + flow stable now.
          </div>
        </section>

        {/* RIGHT: client detail with TABS */}
        <section className="pt-card pt-card-detail">
          <div className="pt-tag">Selected Client: {selected?.name || "None"}</div>
          <div className="pt-tag">Selected Client: {selected?.name || "None"}</div>

          {selected ? (
            <>
              {/* Tab Navigation */}
              <div className="pt-tabs">
                <button
                  className={`pt-tab ${activeTab === "overview" ? "pt-tab-active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                  type="button"
                >
                  📊 Overview
                </button>
                <button
                  className={`pt-tab ${activeTab === "messages" ? "pt-tab-active" : ""}`}
                  onClick={() => setActiveTab("messages")}
                  type="button"
                >
                  💬 Messages
                </button>
                <button
                  className={`pt-tab ${activeTab === "meal-plans" ? "pt-tab-active" : ""}`}
                  onClick={() => setActiveTab("meal-plans")}
                  type="button"
                >
                  📋 Meal Plans
                </button>
              </div>

              {/* Tab Content */}
              <div className="pt-tab-content">
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <>
                    <div className="pt-selected">
                      <div>
                        <div className="pt-selected-name">{selected.name}</div>
                        <div className="pt-selected-sub">
                          Goal: <strong>{selected.goal}</strong>
                        </div>
                      </div>

                      <div className="pt-metrics">
                        <div className="pt-metric">
                          <span>Adherence</span>
                          <strong>{selected.adherence}%</strong>
                        </div>
                        <div className="pt-metric">
                          <span>Protein</span>
                          <strong>{selected.protein}g</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-actions">
                      <button className="pt-btn" type="button" onClick={() => setActiveTab("messages")}>
                        💬 Open Messages
                      </button>
                      <button className="pt-btn pt-btn-outline" type="button" onClick={() => setActiveTab("meal-plans")}>
                        📋 Assign Meal Plan
                      </button>
                      <button className="pt-btn pt-btn-ghost" type="button" onClick={() => alert("Workout builder coming soon!")}>
                        Adjust Training Block
                      </button>
                    </div>

                    <div className="pt-note">
                      <label className="pt-label">
                        Coach Note (internal)
                        <textarea
                          className="pt-textarea"
                          rows={4}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Example: Increase squat volume next week. Keep protein 190g+."
                        />
                      </label>

                      <button
                        className="pt-save"
                        type="button"
                        onClick={() => alert("MVP: save note (persist later)")}
                      >
                        Save Note
                      </button>
                    </div>

                    <div className="pt-muted">
                      Future: permissions, client invites, voice notes, workout swaps, progress pics, metabolic echo trend view.
                    </div>
                  </>
                )}

                {/* MESSAGES TAB */}
                {activeTab === "messages" && (
                  <PTMessaging clientId={selected.id} clientName={selected.name} />
                )}

                {/* MEAL PLANS TAB */}
                {activeTab === "meal-plans" && (
                  <PTMealPlanAssignment
                    clientId={selected.id}
                    clientName={selected.name}
                    onAssign={handleMealPlanAssign}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="pt-muted">No client selected.</div>
          )}
        </section>
      </div>
    </div>
  );
}
