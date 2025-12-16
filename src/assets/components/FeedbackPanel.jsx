import React, { useEffect, useState } from "react";

export default function FeedbackPanel() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("bug"); // bug | feedback
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");

  useEffect(() => {
    // Auto-capture context (safe MVP)
    const path = window.location.pathname;
    setContext(`Path: ${path}`);
  }, [open]);

  function submit() {
    if (!message.trim()) {
      alert("Please type a message.");
      return;
    }

    const entry = {
      id: `fb_${Date.now()}`,
      type,
      message: message.trim(),
      context,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("feedbackLog") || "[]");
    localStorage.setItem("feedbackLog", JSON.stringify([entry, ...existing]));

    setMessage("");
    setOpen(false);
    alert("Saved. MVP: Later we’ll send this to email/DB automatically.");
  }

  return (
    <>
      {/* Floating Button */}
      <button
        className="btn btn-secondary"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 9999,
          padding: ".75rem 1rem",
        }}
        onClick={() => setOpen(true)}
      >
        Feedback / Bug
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            zIndex: 9998,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            className="card"
            style={{
              width: "min(900px, 100%)",
              borderRadius: "1.25rem",
              padding: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem", alignItems: "center" }}>
              <div>
                <div className="kicker" style={{ marginBottom: 0 }}>Support</div>
                <h3 style={{ margin: ".35rem 0", color: "var(--gold)" }}>Send Feedback or Report a Bug</h3>
                <p className="small" style={{ marginTop: 0 }}>{context}</p>
              </div>

              <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="nav-row" style={{ marginTop: ".75rem" }}>
              <button
                className={"btn " + (type === "bug" ? "btn-primary" : "btn-secondary")}
                onClick={() => setType("bug")}
              >
                Bug
              </button>
              <button
                className={"btn " + (type === "feedback" ? "btn-primary" : "btn-secondary")}
                onClick={() => setType("feedback")}
              >
                Feedback
              </button>
            </div>

            <label className="label" style={{ marginTop: ".75rem" }}>
              Message
              <textarea
                className="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What happened? What did you expect? Quick steps to reproduce helps a lot."
              />
            </label>

            <div className="nav-row">
              <button className="btn btn-primary" onClick={submit}>
                Save →
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const logs = JSON.parse(localStorage.getItem("feedbackLog") || "[]");
                  alert(`Saved entries: ${logs.length}\n\nMVP: Later this becomes a real support inbox.`);
                }}
              >
                View Count
              </button>
            </div>

            <p className="small" style={{ marginTop: ".75rem" }}>
              MVP note: this saves locally on this device. Next phase: sync to your profile + email/DB.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
