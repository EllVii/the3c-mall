// src/assets/components/GuidedAssistOverlay.jsx
import React, { useEffect, useMemo } from "react";

export default function GuidedAssistOverlay({
  open,
  title = "Need a hand?",
  message = "Most people start here.",
  primaryLabel = "Start",
  secondaryLabel = "Not now",
  onPrimary,
  onSecondary,
  onClose,
  iconText = "3C",
}) {
  const isOpen = !!open;

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const safeTitle = useMemo(() => String(title || "Need a hand?"), [title]);
  const safeMsg = useMemo(() => String(message || ""), [message]);

  if (!isOpen) return null;

  return (
    <div className="ga-overlay" role="dialog" aria-modal="true" aria-label="Guided Assist">
      <div className="ga-backdrop" onClick={() => onClose?.()} />

      {/* IMPORTANT: stop clicks inside from closing it */}
      <div className="ga-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ga-head">
          <div className="ga-badge" aria-hidden="true">{iconText}</div>

          <div className="ga-head-text">
            <div className="ga-title">{safeTitle}</div>
            {safeMsg ? <div className="ga-sub">{safeMsg}</div> : null}
          </div>

          <button className="ga-x" onClick={() => onClose?.()} aria-label="Close guide">
            ×
          </button>
        </div>

        <div className="ga-body">
          <div className="ga-actions">
            <button
              className="btn btn-primary ga-btn"
              onClick={() => {
                onPrimary?.();
              }}
            >
              {primaryLabel}
            </button>

            <button
              className="btn btn-secondary ga-btn"
              onClick={() => {
                onSecondary?.();
              }}
            >
              {secondaryLabel}
            </button>
          </div>

          <div className="ga-foot">
            <span className="ga-foot-dot" />
            <span className="ga-foot-text">Tip: You can reopen the Concierge anytime.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
