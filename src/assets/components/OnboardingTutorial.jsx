import React, { useState } from "react";
import { writeJSON } from "../../utils/Storage";

const TUTORIAL_SEEN_KEY = "onboarding.tutorial.seen.v1";

// Screen content with copy focused on explaining the mall metaphor
const SCREENS = [
  {
    id: "mall",
    title: "Welcome to 3C Mall",
    headline: "One place for all your savings.",
    copy: "3C Mall puts your grocery stores, meal plans, and lifestyle tools in one space — so you stop juggling apps.",
    visual: "🏪",
    color: "rgba(255, 165, 0, 0.12)",
    borderColor: "rgba(255, 165, 0, 0.40)",
  },
  {
    id: "amenities",
    title: "No Mall Without Amenities",
    headline: "Here's what makes 3C special.",
    copy: "Every great mall has zones to explore. 3C includes grocery cost tracking, meal planning, community support, and training tools.",
    visual: "🎯",
    color: "rgba(0, 217, 255, 0.12)",
    borderColor: "rgba(0, 217, 255, 0.40)",
    amenities: [
      { icon: "🛒", label: "Grocery Lab", status: "Live" },
      { icon: "🍽️", label: "Meal Planner", status: "Live" },
      { icon: "💪", label: "Training", status: "Coming Soon" },
      { icon: "👥", label: "Community", status: "Beta" },
    ],
  },
  {
    id: "concierge",
    title: "Meet Your Guide",
    headline: "The Concierge is here to help.",
    copy: "Your AI-powered Concierge adapts to how you shop, eat, and live. It reduces decision fatigue and remembers your preferences so the app stays focused on what matters to you.",
    visual: "🤝",
    color: "rgba(126, 224, 255, 0.12)",
    borderColor: "rgba(126, 224, 255, 0.40)",
  },
  {
    id: "personalize",
    title: "Let's Get to Know You",
    headline: "Just the essentials, nothing heavy.",
    copy: "We'll ask a few quick questions so the Concierge can better support you. No long forms — just what matters.",
    visual: "✨",
    color: "rgba(255, 187, 0, 0.12)",
    borderColor: "rgba(255, 187, 0, 0.40)",
  },
];

export default function OnboardingTutorial({ open, onComplete }) {
  const [step, setStep] = useState(0);

  if (!open) return null;

  const currentScreen = SCREENS[step];
  const isLastScreen = step === SCREENS.length - 1;
  const progress = ((step + 1) / SCREENS.length) * 100;

  const handleNext = () => {
    if (isLastScreen) {
      // Mark tutorial as seen and move to name collection
      writeJSON(TUTORIAL_SEEN_KEY, { seenAt: new Date().toISOString() });
      onComplete?.();
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    writeJSON(TUTORIAL_SEEN_KEY, { seenAt: new Date().toISOString() });
    onComplete?.();
  };

  return (
    <div className="cc-overlay" role="dialog" aria-modal="true" aria-label="Welcome Tour">
      <div className="cc-backdrop" onClick={handleSkip} />
      <div className="cc-panel cc-panel-onboarding">
        <div className="cc-onboarding-content">
          {/* PROGRESS BAR */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                height: "3px",
                background: "rgba(255,255,255,.12)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, var(--gold), var(--blue))",
                  width: `${progress}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div className="small" style={{ marginTop: ".5rem", opacity: 0.7 }}>
              Step {step + 1} of {SCREENS.length}
            </div>
          </div>

          {/* VISUAL ICON */}
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
              animation: "bounce 2s ease-in-out infinite",
            }}
          >
            {currentScreen.visual}
          </div>

          {/* HEADLINE */}
          <h1
            className="h2"
            style={{
              marginBottom: ".5rem",
              textAlign: "center",
              color: "var(--gold)",
            }}
          >
            {currentScreen.headline}
          </h1>

          {/* COPY */}
          <p
            className="small cc-copy"
            style={{
              marginBottom: "1.5rem",
              textAlign: "center",
              maxWidth: "420px",
              lineHeight: 1.6,
              opacity: 0.9,
            }}
          >
            {currentScreen.copy}
          </p>

          {/* AMENITIES GRID (only for screen 2) */}
          {currentScreen.amenities && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: ".75rem",
                marginBottom: "1.5rem",
              }}
            >
              {currentScreen.amenities.map((a, idx) => (
                <div
                  key={idx}
                  className="cc-card"
                  style={{
                    padding: ".75rem",
                    textAlign: "center",
                    background: currentScreen.color,
                    borderColor: currentScreen.borderColor,
                  }}
                >
                  <div style={{ fontSize: "1.5rem", marginBottom: ".25rem" }}>
                    {a.icon}
                  </div>
                  <div className="small" style={{ fontWeight: 700 }}>
                    {a.label}
                  </div>
                  <div
                    className="small"
                    style={{ fontSize: ".70rem", opacity: 0.7, marginTop: ".15rem" }}
                  >
                    {a.status}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* COLORED BACKGROUND CARD */}
          <div
            className="cc-card"
            style={{
              background: currentScreen.color,
              borderColor: currentScreen.borderColor,
              padding: "1rem",
              marginBottom: "1.5rem",
              textAlign: "center",
              minHeight: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="small" style={{ opacity: 0.9 }}>
              {step === 0 && "Think of 3C Mall like a real mall — everything you need in one place."}
              {step === 1 && "Each zone has tools to help you save money and stay consistent."}
              {step === 2 && "The Concierge learns your preferences over time and adapts to you."}
              {step === 3 && "Just a couple of quick questions, and you're ready to explore."}
            </div>
          </div>

          {/* BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: ".6rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={handleNext}
              style={{ flex: "1 1 auto", minWidth: "120px" }}
            >
              {isLastScreen ? "Get Started →" : "Next →"}
            </button>
            <button
              className="btn btn-ghost"
              onClick={handleSkip}
              style={{ flex: "0 1 auto" }}
              type="button"
            >
              Skip Tour
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}

export { TUTORIAL_SEEN_KEY };
