import React from "react";
import { useNavigate } from "react-router-dom";
import { writeJSON, nowISO } from "../../utils/Storage";

const PROFILE_KEY = "concierge.profile.v1";
const STRATEGY_KEY = "grocery.strategy.v1";

export default function OnboardingGate({ open, onClose }) {
  const nav = useNavigate();
  const [firstName, setFirstName] = React.useState("");
  const [step, setStep] = React.useState("name"); // "name" or "choose"

  if (!open) return null;

  const handleContinueFromName = () => {
    const name = firstName.trim();
    if (!name) {
      alert("Please enter your first name so we can personalize your experience.");
      return;
    }
    setStep("choose");
  };

  const handleStartGroceries = () => {
    // Save profile WITH name (forced upfront)
    const profile = {
      firstName: firstName.trim(),
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
    // Save profile WITH name (forced upfront)
    const profile = {
      firstName: firstName.trim(),
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

          {step === "name" ? (
            <>
              {/* Step 1: Get user's name */}
              <h1 className="h2" style={{ marginBottom: ".5rem", textAlign: "center" }}>
                Nice to Meet You
              </h1>

              <p className="cc-sub" style={{ marginBottom: "1.5rem", textAlign: "center", maxWidth: "420px", lineHeight: 1.6 }}>
                Let's personalize your 3C experience. First things first — what should I call you?
              </p>

              <div className="cc-card" style={{ marginBottom: "1.5rem" }}>
                <input
                  className="input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  required
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleContinueFromName();
                  }}
                />
                <div className="small cc-copy" style={{ marginTop: ".5rem" }}>
                  I'll use this to speak to you personally throughout 3C.
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleContinueFromName}
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                Continue →
              </button>
            </>
          ) : (
            <>
              {/* Step 2: Choose path */}
              <h1 className="h2" style={{ marginBottom: ".5rem", textAlign: "center" }}>
                Nice to meet you, {firstName}!
              </h1>

              <p className="cc-sub" style={{ marginBottom: "1.5rem", textAlign: "center", maxWidth: "420px", lineHeight: 1.6 }}>
                Let's get you started. How would you like to begin?
              </p>

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
            </>
          )}
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
