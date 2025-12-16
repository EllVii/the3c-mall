// src/pages/PTDashboard.jsx
import React, { useMemo, useState } from "react";
import "../styles/PTDashboard.css";

const MOCK_CLIENTS = [
  { id: "c1", name: "Client One", goal: "Cut", adherence: 82, protein: 165, lastCheckIn: "Today" },
  { id: "c2", name: "Client Two", goal: "Gain", adherence: 74, protein: 190, lastCheckIn: "Yesterday" },
  { id: "c3", name: "Client Three", goal: "Strength", adherence: 88, protein: 210, lastCheckIn: "2 days ago" },
];

export default function PTDashboard() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(MOCK_CLIENTS[0]?.id || null);
  const [note, setNote] = useState("");

  const clients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_CLIENTS;
    return MOCK_CLIENTS.filter((c) => c.name.toLowerCase().includes(q) || c.goal.toLowerCase().includes(q));
  }, [query]);

  const selected = useMemo(() => clients.find((c) => c.id === selectedId) || clients[0], [clients, selectedId]);

  return (
    <div className="pt-page">
      <header className="pt-header">
        <div>
          <div className="pt-kicker">PT MODE</div>
          <h1 className="pt-title">Trainer Dashboard</h1>
          <p className="pt-subtitle">
            Monitor clients, send quick check-ins, and control training blocks (MVP skeleton).
          </p>
        </div>

        <div className="pt-pill">
          <span>STATUS</span>
          <strong>Skeleton Live</strong>
        </div>
      </header>

      <div className="pt-grid">
        {/* LEFT: client list */}
        <section className="pt-card">
          <div className="pt-card-top">
            <div>
              <div className="pt-tag">Clients</div>
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

        {/* RIGHT: selected client detail */}
        <section className="pt-card">
          <div className="pt-tag">Selected Client</div>

          {selected ? (
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
                <button className="pt-btn" type="button" onClick={() => alert("MVP: send check-in (wire later)")}>
                  Send Check-In
                </button>
                <button className="pt-btn pt-btn-ghost" type="button" onClick={() => alert("MVP: adjust plan (wire later)")}>
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
          ) : (
            <div className="pt-muted">No client selected.</div>
          )}
        </section>
      </div>
    </div>
  );
}
