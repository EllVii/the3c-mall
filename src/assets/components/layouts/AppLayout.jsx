import React, { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getPrefsSafe } from "../../../utils/prefs.js";
import ConciergeHub from "../ConciergeHub.jsx";
import TopPreviewBar from "../TopPreviewBar.jsx";

export default function AppLayout() {
  const [conciergeOpen, setConciergeOpen] = useState(true);
  const [conciergeMin, setConciergeMin] = useState(false);

  // Global user prefs (use proper utility instead of direct localStorage access)
  const prefs = useMemo(() => {
    return getPrefsSafe();
  }, []);

  const { pathname } = useLocation();

  return (
    <div className="app-shell app-one-screen">
      {/* Preview always at TOP */}
      <TopPreviewBar
        route={pathname}
        onToggleConcierge={() => setConciergeOpen((v) => !v)}
        conciergeOpen={conciergeOpen}
        conciergeMin={conciergeMin}
        onMinimizeConcierge={() => setConciergeMin((v) => !v)}
        prefs={prefs}
      />

      {/* Main content (NO VERTICAL SCROLL) */}
      <div className="app-stage">
        <Outlet />
      </div>

      {/* Concierge overlay (center of app) */}
      {conciergeOpen && (
        <ConciergeHub
          minimized={conciergeMin}
          onMinimize={() => setConciergeMin(true)}
          onExpand={() => setConciergeMin(false)}
          onClose={() => setConciergeOpen(false)}
        />
      )}
    </div>
  );
}
