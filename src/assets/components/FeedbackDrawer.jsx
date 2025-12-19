// src/assets/components/FeedbackDrawer.jsx
import React from "react";
import "../../styles/FeedbackDrawer.css";

export default function FeedbackDrawer({ open, onClose, formUrl, context }) {
  if (!open) return null;

  const payload = {
    ...context,
    ts: new Date().toISOString(),
  };

  function openForm() {
    // NOTE: We can't prefill a shortlink Google Form without a special prefill URL.
    // So we open the official form and show context in the drawer for copy/paste.
    window.open(formUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fb-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="fb-modal card glass" onClick={(e) => e.stopPropagation()}>
        <div className="fb-head">
          <div>
            <div className="db-card-tag">ALPHA FEEDBACK</div>
            <h3 className="fb-title">Help us tighten the experience</h3>
            <p className="small fb-sub">
              Bug reports, UI/UX notes, feature requests — all submitted in one place using our official form.
            </p>
          </div>

          <button className="btn btn-secondary fb-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="fb-actions">
          <button className="btn btn-primary" onClick={openForm}>
            Open Feedback Form
          </button>
          <button className="btn btn-ghost" onClick={openForm}>
            Open in Browser
          </button>
        </div>

        <div className="fb-hint card glass-inner">
          <div className="db-card-tag">WHAT YOU’LL SEE</div>
          <p className="small" style={{ margin: 0 }}>
            The form will ask for: <strong>Name/Tester ID</strong>, <strong>Type</strong> (Bug/Feature/UI/UX/Performance),
            <strong>Severity</strong>, and <strong>Details</strong>.
          </p>
        </div>

        <div className="fb-debug">
          <div className="db-card-tag">OPTIONAL CONTEXT (COPY/PASTE)</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
{JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
