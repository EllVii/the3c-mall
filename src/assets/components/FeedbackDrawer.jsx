import React from "react";

export default function FeedbackDrawer({
  open,
  onClose,
  formUrl,
  context = {},
}) {
  if (!open) return null;

  const params = new URLSearchParams({
    page: context.page || "",
    build: context.build || "",
    device: context.device || "",
  });

  const fullUrl = `${formUrl}?${params.toString()}`;

  return (
    <div className="card glass" style={{ marginTop: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <div className="card-tag">ALPHA FEEDBACK</div>
          <h3 style={{ margin: ".35rem 0", color: "var(--gold)" }}>
            Help us tighten the experience
          </h3>
          <p className="small">
            Bug reports, UI/UX notes, feature requests — all in one place.
          </p>
        </div>

        <button className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>

      {/* same “pill row” vibe */}
      <div className="nav-row" style={{ marginTop: ".8rem" }}>
        <span className="pill"><span>Type</span><strong>General</strong></span>
        <span className="pill"><span>Type</span><strong>Bug</strong></span>
        <span className="pill"><span>Type</span><strong>Feature</strong></span>
        <span className="pill"><span>Type</span><strong>UI/UX</strong></span>
      </div>

      <div className="card glass-inner" style={{ marginTop: ".9rem", padding: "1rem" }}>
        <p className="small" style={{ margin: 0 }}>
          For reliability (especially on iPhone), feedback opens in your browser.
        </p>
        <p className="small" style={{ marginTop: ".45rem", color: "var(--muted2)" }}>
          Tip: Include what you tapped, what you expected, and a screenshot if you can.
        </p>

        <div className="nav-row" style={{ marginTop: ".9rem" }}>
          <a className="btn btn-primary" href={fullUrl} target="_blank" rel="noreferrer">
            Open feedback
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
        </div>
      </div>
    </div>
  );
}
