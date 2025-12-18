import React from "react";
import "./FeedbackPanel.css";

export default function FeedbackPanel({
  open,
  onClose,
  title = "3C Mall — Alpha Feedback",
  formUrl,
  context = {},
}) {
  if (!open) return null;

  const params = new URLSearchParams({
    page: context.page || "",
    build: context.buildUrl || "",
    device: context.deviceLabel || "",
  });

  const fullUrl = `${formUrl}?${params.toString()}`;

  return (
    <div className="fb-overlay" role="dialog" aria-modal="true">
      <div className="fb-modal glass">
        <div className="fb-head">
          <div>
            <div className="fb-tag">ALPHA FEEDBACK</div>
            <h2 className="fb-title">{title}</h2>
            <p className="fb-sub">
              Tell us what happened and what you expected. Screenshots help a lot.
            </p>
          </div>

          <button className="fb-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Category pills (visual only — matches Google Form) */}
        <div className="fb-pills">
          <span className="fb-pill on">General</span>
          <span className="fb-pill">Bug</span>
          <span className="fb-pill">Feature</span>
          <span className="fb-pill">UI/UX</span>
        </div>

        {/* Explanation */}
        <div className="fb-body">
          <div className="fb-placeholder">
            <div className="fb-icon">📄</div>
            <p className="small">
              For reliability and privacy, Alpha feedback opens in your browser.
            </p>
            <p className="small muted">
              (Google Forms may not load inside the app on iPhone.)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="fb-actions">
          <a
            className="btn btn-primary"
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open in browser
          </a>

          <button
            className="btn btn-secondary"
            onClick={() => {
              navigator.clipboard.writeText(fullUrl);
              alert("Feedback link copied");
            }}
          >
            Copy link
          </button>

          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>

        <div className="fb-foot small">
          Alpha note: feedback is anonymous unless you include your name.
        </div>
      </div>
    </div>
  );
}
