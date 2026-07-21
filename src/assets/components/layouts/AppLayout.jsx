import React, { lazy, Suspense, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getPrefsSafe } from "../../../utils/prefs.js";
import TopPreviewBar from "../TopPreviewBar.jsx";

const ConciergeHub = lazy(() => import("../ConciergeHub.jsx"));

export default function AppLayout() {
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [conciergeMin, setConciergeMin] = useState(false);

  // Global user prefs (use proper utility instead of direct localStorage access)
  const prefs = useMemo(() => getPrefsSafe(), []);
  const { pathname } = useLocation();

  return (
    <div className="app-shell app-one-screen">
      <TopPreviewBar
        route={pathname}
        onToggleConcierge={() => setConciergeOpen((value) => !value)}
        conciergeOpen={conciergeOpen}
        conciergeMin={conciergeMin}
        onMinimizeConcierge={() => setConciergeMin((value) => !value)}
        prefs={prefs}
      />

      <div className="app-stage">
        <Outlet />
      </div>

      {conciergeOpen && (
        <Suspense
          fallback={
            <button className="concierge-min" type="button" disabled>
              Loading concierge...
            </button>
          }
        >
          <ConciergeHub
            minimized={conciergeMin}
            onMinimize={() => setConciergeMin(true)}
            onExpand={() => setConciergeMin(false)}
            onClose={() => {
              setConciergeOpen(false);
              setConciergeMin(false);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
