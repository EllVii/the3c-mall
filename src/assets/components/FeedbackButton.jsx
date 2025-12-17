import React, { useMemo, useState } from "react";

export default function FeedbackButton({
  formUrl,
  context = {}
}) {
  const [open, setOpen] = useState(false);

  const debugText = useMemo(() => {
    const payload = {
      path: window.location.pathname,
      theme: document.documentElement.getAttribute("data-theme") || "default",
      ua: navigator.userAgent,
      ...context
    };
    return JSON.stringify(payload, null, 2);
  }, [context]);

  function copyDebug() {
    try {
      navigator.clipboard.writeText(debugText);
      alert("Copied debug info (demo). Paste it into the form if needed.");
    } catch {
      alert("Could not copy. You can still submit feedback.");
    }
  }

  function openForm(type) {
    const url = new URL(formUrl);
    // Optional: pass “type” as a query string so your form can auto-fill (if you set it up)
    url.searchParams.set("type", type);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <>
      {/* Floating button */}
      <button
        className="btn btn-secondary fb-float"
        onClick={() => setOpen(true)}
        aria-label="Open feedback"
      >
        Feedback
      </button>

      {/* Modal */}
      {open && (
        <div className="fb-backdrop" role="dialog" aria-modal="true">
          <div className="card glass fb-modal">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <div>
                <div className="card-tag">Alpha Feedback</div>
                <h3 style={{ margin: ".35rem 0", color: "var(--gold)" }}>
                  Help improve 3C Mall
                </h3>
                <p className="small">
                  This opens a quick Google Form. No spam, no pressure.
                </p>
              </div>

              <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="grid" style={{ marginTop: "1rem" }}>
              <button className="btn btn-primary" onClick={() => openForm("bug")}>
                Report a Bug
              </button>
              <button className="btn btn-primary" onClick={() => openForm("feature")}>
                Request a Feature
              </button>
            </div>

            <div className="nav-row" style={{ marginTop: "1rem" }}>
              <button className="btn btn-secondary" onClick={copyDebug}>
                Copy Debug Info
              </button>
              <button className="btn btn-secondary" onClick={() => openForm("general")}>
                Open Form
              </button>
            </div>

            <pre className="fb-debug">
              {debugText}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
