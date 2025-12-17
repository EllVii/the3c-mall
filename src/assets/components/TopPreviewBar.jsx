import React, { useMemo } from "react";
import { readJSON } from "../../utils/Storage.js";

export default function TopPreviewBar({
  route,
  onToggleConcierge,
  conciergeOpen,
  conciergeMin,
  onMinimizeConcierge,
}) {
  const grocery = useMemo(() => readJSON("gl.strategy.v1", null), [route]);
  const meal = useMemo(() => readJSON("mp.plan.v1", null), [route]);

  const modeLabel = useMemo(() => {
    if (route.includes("/app/grocery")) return "Grocery";
    if (route.includes("/app/meal")) return "Meal";
    if (route.includes("/app/pt")) return "PT";
    if (route.includes("/app/community")) return "Community";
    if (route.includes("/app/fitness")) return "Fitness";
    return "Dashboard";
  }, [route]);

  return (
    <div className="tpb">
      <div className="tpb-left">
        <div className="tpb-title">3C Mall</div>
        <div className="tpb-sub">Mode: <strong style={{ color: "var(--gold)" }}>{modeLabel}</strong></div>
      </div>

      <div className="tpb-center">
        <div className="tpb-chip">
          <span>Grocery</span>
          <strong>
            {grocery ? `${grocery.lane === "single-store" ? "Single" : "Multi"} · ${grocery.fulfillment}` : "Not set"}
          </strong>
        </div>
        <div className="tpb-chip">
          <span>Meal</span>
          <strong>{meal ? `${meal.mealType || "Meal"} · ${meal.time || "Time"}` : "Not set"}</strong>
        </div>
      </div>

      <div className="tpb-right">
        <button className="btn btn-secondary" onClick={onToggleConcierge}>
          {conciergeOpen ? "Hide Concierge" : "Show Concierge"}
        </button>
        {conciergeOpen && (
          <button className="btn btn-ghost" onClick={onMinimizeConcierge}>
            {conciergeMin ? "Expand" : "Minimize"}
          </button>
        )}
      </div>
    </div>
  );
}
