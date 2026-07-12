// src/assets/components/ConciergeOverlay.jsx
import React, { useEffect, useMemo, useState } from "react";
import { readJSON } from "../../utils/Storage";

const CONCIERGE_HIDDEN_KEY = "concierge.hidden.v1";
const PROFILE_KEY = "concierge.profile.v1";

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

  const [isHidden, setIsHidden] = useState(() => readJSON(CONCIERGE_HIDDEN_KEY, false));
  const hasProfile = Boolean(readJSON(PROFILE_KEY, null));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsHidden(readJSON(CONCIERGE_HIDDEN_KEY, false));
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = window.setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.clearInterval(interval);
    };
  }, []);

  const safeOptions = useMemo(() => options.slice(0, 6), [options]);

  // First-time customers should finish the dedicated onboarding flow before
  // another concierge surface is allowed to appear.
  if (isHidden || !hasProfile) {
    return null;
  }

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

  return (
    <div
      className="cc-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cc-overlay-title"
    >
      <div className="cc-backdrop" onClick={onClose} />

      <div className="cc-panel">
        <div className="cc-head">
          <div className="cc-head-left">
            <div className="cc-badge" aria-hidden="true">3C</div>
            <div>
              <div id="cc-overlay-title" className="cc-title">{title}</div>
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
              aria-label="Close Concierge"
            >
              Close
            </button>
          </div>
        </div>

        <div className="cc-body">
          <p className="small cc-copy">
            {userName ? (
              <>
                Hi <strong>{userName}</strong>. Choose what you want help with and I’ll take you directly there.
              </>
            ) : (
              <>Choose what you want help with and I’ll take you directly there.</>
            )}
          </p>

          <div className="cc-grid">
            {safeOptions.map((option) => (
              <button
                key={option.id}
                className="cc-choice"
                onClick={() => onPick?.(option)}
                type="button"
              >
                <div className="cc-choice-title">{option.label}</div>
                <div className="cc-choice-desc">{option.hint}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
