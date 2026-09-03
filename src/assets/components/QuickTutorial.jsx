// src/assets/components/QuickTutorial.jsx
/**
 * Quick Tutorial (30-second guided walkthrough)
 *
 * Automatically shows on first load (optional to re-run from Settings)
 * Highlights key features: Meal Planner → Grocery Lab → planning progress
 *
 * Uses TutorialContext to manage state
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/QuickTutorial.css";

const TUTORIAL_SLIDES = [
  {
    id: "welcome",
    title: "👋 Welcome to 3C Mall",
    tagline: "Household meal and grocery planning in one place",
    copy: "Tap through this quick tour to see the main parts of your 3C Mall workflow.",
    feature: null,
    icon: "🏬",
  },
  {
    id: "meal-planner",
    title: "🍽️ Meal Planner",
    tagline: "Plan meals and carry ingredients forward",
    copy: "Set your household preferences and build practical meal ideas that can flow into your grocery planning.",
    feature: "meal-planner",
    icon: "📅",
    action: { label: "Try it →", route: "/app/meal-plans" },
  },
  {
    id: "grocery-lab",
    title: "🛒 Grocery Lab",
    tagline: "Compare available options with clearer context",
    copy: "Review package value and available store estimates while keeping retailer-confirmed price and availability as the final source.",
    feature: "grocery-lab",
    icon: "💰",
    action: { label: "Try it →", route: "/app/grocery-lab" },
  },
  {
    id: "progress",
    title: "📊 Keep Your Plan Connected",
    tagline: "See how your household plan comes together",
    copy: "Use your saved planning context to reduce repeated work and make the next grocery decision easier to understand.",
    feature: null,
    icon: "📊",
  },
  {
    id: "concierge",
    title: "🤖 Meet Your Concierge",
    tagline: "Guidance when you need the next step",
    copy: "Use the 3C Concierge for plain-language guidance through planning and comparison choices without replacing your judgment.",
    feature: null,
    icon: "✨",
  },
  {
    id: "done",
    title: "You're All Set!",
    tagline: "Explore at your own pace",
    copy: "This tutorial is available anytime from Settings → Experience & Onboarding.",
    feature: null,
    icon: "🎉",
    action: { label: "Done", isPrimary: true },
  },
];

export default function QuickTutorial({ open, onComplete }) {
  const nav = useNavigate();
  const [step, setStep] = useState(0);

  const slide = TUTORIAL_SLIDES[step];
  const isLast = step === TUTORIAL_SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete?.();
      return;
    }
    setStep((s) => Math.min(s + 1, TUTORIAL_SLIDES.length - 1));
  };

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleAction = () => {
    if (slide.action?.route) {
      onComplete?.();
      nav(slide.action.route);
    } else {
      handleNext();
    }
  };

  if (!open) return null;

  return (
    <div className="qt-overlay" role="dialog" aria-modal="true" aria-label="Quick Tutorial">
      <div className="qt-backdrop" />

      <div className="qt-panel">
        <div className="qt-head">
          <div className="qt-progress">
            <span className="qt-step">Step {step + 1}</span>
            <span className="qt-divider">·</span>
            <span className="qt-total">{TUTORIAL_SLIDES.length}</span>
          </div>

          <button
            className="qt-close"
            onClick={onComplete}
            aria-label="Skip tutorial"
            title="Skip tutorial"
          >
            ✕
          </button>
        </div>

        <div className="qt-content">
          <div className="qt-icon" aria-hidden="true">
            {slide.icon}
          </div>

          <h2 className="qt-title">{slide.title}</h2>
          <p className="qt-tagline">{slide.tagline}</p>
          <p className="qt-copy">{slide.copy}</p>

          {slide.feature && (
            <div className="qt-feature-preview">
              <div className="qt-feature-badge">{slide.feature}</div>
            </div>
          )}
        </div>

        <div className="qt-foot">
          <div className="qt-dots">
            {TUTORIAL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                className={`qt-dot ${idx === step ? "active" : ""}`}
                onClick={() => setStep(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === step ? "true" : "false"}
              />
            ))}
          </div>

          <div className="qt-actions">
            <button
              className="btn btn-ghost"
              onClick={handlePrev}
              disabled={step === 0}
              title="Previous slide"
            >
              ← Back
            </button>

            {slide.action ? (
              <button
                className={`btn ${slide.action.isPrimary ? "btn-primary" : "btn-secondary"}`}
                onClick={handleAction}
              >
                {slide.action.label}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleNext}>
                {isLast ? "Complete" : "Next →"}
              </button>
            )}
          </div>
        </div>

        <div className="qt-hint">
          <small>Tip: Access this anytime from <strong>Settings → Experience & Onboarding</strong></small>
        </div>
      </div>
    </div>
  );
}
