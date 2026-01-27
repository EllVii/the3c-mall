// src/assets/components/ConciergeOverlay.jsx
import React, { useMemo, useState, useEffect } from "react";
import { readJSON } from "../../utils/Storage";

const CONCIERGE_HIDDEN_KEY = "concierge.hidden.v1";

export default function ConciergeOverlay({
  open,
  minimized,
  onMinimize,
  onOpen,
  onClose,
  onPick,
  title = "Concierge",
  subtitle = "Concierge · Cost · Community",
  options = [],
  userName = null,
}) {
  const visible = open && !minimized;
  
  // Check if concierge is hidden from profile settings
  const [isHidden, setIsHidden] = useState(() => readJSON(CONCIERGE_HIDDEN_KEY, false));
  
  // Listen for storage changes to update hide/show state
  useEffect(() => {
    const handleStorageChange = () => {
      setIsHidden(readJSON(CONCIERGE_HIDDEN_KEY, false));
    };
    
    window.addEventListener("storage", handleStorageChange);
    // Check periodically for same-tab changes
    const interval = setInterval(handleStorageChange, 500);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Feng shui: never exceed 6 visible actions
  const safeOptions = useMemo(() => options.slice(0, 6), [options]);

  /* ============================
     HIDDEN STATE - Don't show anything
     ============================ */
  if (isHidden) {
    return null;
  }

  /* ============================
     MINIMIZED STATE (FLOATING PILL)
     ============================ */
  if (!visible) {
    return (
      <button
        className="cc-pill cc-pill-floating"
        onClick={onOpen}
        aria-label="Open Concierge"
        type="button"
      >
        <span className="cc-pill-badge">3C</span>
        <span className="cc-pill-text">Concierge</span>
      </button>
    );
  }

  /* ============================
     FULL OVERLAY
     ============================ */
  return (
    <div className="cc-overlay" role="dialog" aria-modal="true">
      {/* backdrop */}
      <div className="cc-backdrop" onClick={onClose} />

      {/* panel */}
      <div className="cc-panel">
        {/* HEADER */}
        <div className="cc-head">
          <div className="cc-head-left">
            <div className="cc-badge">3C</div>
            <div>
              <div className="cc-title">{title}</div>
              <div className="cc-sub">{subtitle}</div>
            </div>
          </div>

          <div className="cc-actions">
            <button
              className="btn btn-ghost cc-btn"
              onClick={onMinimize}
              type="button"
            >
              Minimize
            </button>
            <button
              className="btn btn-secondary cc-btn"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="cc-body">
          <p className="small cc-copy">
            {userName ? (
              <>
                Hi <strong>{userName}</strong>! Pick your lane and I'll take you there. I'll remember your choice so the app stays focused on what matters to you.
              </>
            ) : (
              <>
                Pick your lane. I'll take you there and remember it so the app stays quiet.
              </>
            )}
          </p>

          <div className="cc-grid">
            {safeOptions.map((x) => (
              <button
                key={x.id}
                className="cc-choice"
                onClick={() => onPick?.(x)}
                type="button"
              >
                <div className="cc-choice-title">{x.label}</div>
                <div className="cc-choice-desc">{x.hint}</div>
              </button>
            ))}
          </div>

          <div className="cc-foot">
            <div className="small">
              Alpha: this overlay is the primary launcher — no hunting, no
              scrolling.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
