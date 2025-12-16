// src/components/meal-planner/CommunityActions.jsx
import React from "react";

export default function CommunityActions({
  onSendToGroceryLab,
  onAskCommunity,
}) {
  return (
    <div className="mp-actions">
      <span className="mp-step-label mp-step-label-sub">
        Step 4 · Next move
      </span>
      <h3 className="mp-section-title-sm">Where do you want to go next?</h3>

      <div className="mp-actions-row">
        <button
          type="button"
          className="btn mp-btn-gold"
          onClick={onSendToGroceryLab}
        >
          Send this plan to Grocery Lab
        </button>

        <button
          type="button"
          className="btn mp-btn-outline"
          onClick={onAskCommunity}
        >
          Ask the community for ideas
        </button>
      </div>

      <p className="mp-helper-text">
        This keeps the experience gentle: you can use{" "}
        <strong>only the Meal Planner</strong>, or chain it into{" "}
        <strong>Grocery Lab</strong> and the{" "}
        <strong>Community boards</strong> when you&apos;re ready.
      </p>
    </div>
  );
}
