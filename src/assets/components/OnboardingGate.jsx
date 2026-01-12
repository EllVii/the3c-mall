import React from "react";
import { useNavigate } from "react-router-dom";
import { writeJSON, nowISO } from "../../utils/Storage";

const PROFILE_KEY = "concierge.profile.v1";
const STRATEGY_KEY = "grocery.strategy.v1";

export default function OnboardingGate({ open, onClose }) {
  const nav = useNavigate();

  if (!open) return null;

  const handleStartGroceries = () => {
    // Save minimal profile (name = empty, will ask in Grocery Lab or Settings)
    const profile = {
      firstName: "",
      defaultStoreId: "walmart", // safe default
      shoppingMode: "best_price",
      reasonId: "closest",
      birthMonth: "",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      onboardedVia: "gate",
    };
    writeJSON(PROFILE_KEY, profile);

    // Set strategy
    writeJSON(STRATEGY_KEY, {
      shoppingMode: "multi",
      selectedStores: ["walmart"],
      lastUpdated: nowISO(),
    });

    // Close the gate and go directly to Grocery Lab
    onClose?.();
    nav("/app/grocery-lab", { state: { from: "onboarding", showFirstWin: true } });
  };

  const handleExplore = () => {
    // Save minimal profile
    const profile = {
      firstName: "",
      defaultStoreId: "not_sure",
      shoppingMode: "balanced",
      reasonId: "other",
      birthMonth: "",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      onboardedVia: "explore",
    };
    writeJSON(PROFILE_KEY, profile);

    // Close the gate and return to Dashboard
    onClose?.();
  };

  return (
    <div className="cc-overlay" role="dialog" aria-modal="true" aria-label="Welcome to 3C Mall">
      <div className="cc-backdrop" />
      <div className="cc-panel cc-panel-onboarding">
        <div className="cc-onboarding-content">
          {/* Logo / Brand */}
          <div className="cc-badge" style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>3C</div>

          {/* Headline */}
          <h1 className="h2" style={{ marginBottom: ".5rem", textAlign: "center" }}>
            Welcome to 3C Mall
          </h1>

          {/* Sub-headline with value prop */}
          <p className="cc-sub" style={{ marginBottom: "1.5rem", textAlign: "center", maxWidth: "420px", lineHeight: 1.6 }}>
            I'll help you <strong>save money on groceries</strong>, <strong>plan meals fast</strong>, and <strong>stay consistent</strong> — all connected in one place.
          </p>

          {/* Explanation of the "Mall" concept */}
          <div className="cc-card glass" style={{ marginBottom: "1.5rem", padding: "1rem", textAlign: "center" }}>
            <div className="small" style={{ opacity: 0.85 }}>
              <strong>3C Mall</strong> connects your meals, groceries, and strategy in one place — so every decision works together.
            </div>
          </div>

          {/* Primary CTA */}
          <button
            className="btn btn-primary"
            onClick={handleStartGroceries}
            style={{
              width: "100%",
              padding: "1rem",
              marginBottom: ".75rem",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Start with Groceries (Recommended)
          </button>

          {/* Secondary CTA */}
          <button
            className="btn btn-ghost"
            onClick={handleExplore}
            style={{
              width: "100%",
              padding: ".75rem",
              fontSize: ".95rem",
            }}
          >
            Explore on my own
          </button>
        </div>
      </div>

      <style jsx>{`
        .cc-panel-onboarding {
          max-width: 480px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem 2rem;
          text-align: center;
        }

        .cc-onboarding-content {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
