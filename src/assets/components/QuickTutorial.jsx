// src/assets/components/QuickTutorial.jsx
/**
 * Quick Tutorial (30-second guided walkthrough)
 * 
 * Automatically shows on first load (optional to re-run from Settings)
 * Highlights key features: Meal Planner → Grocery Lab → Savings
 * 
 * Uses TutorialContext to manage state
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/QuickTutorial.css";

const TUTORIAL_SLIDES = [
  {
    id: "welcome",
    title: "👋 Welcome to 3C Mall",
    tagline: "Smart grocery shopping, meal planning & wellness",
    copy: "Tap through this quick 30-second tour to discover your key zones.",
    feature: null,
    icon: "🏬",
  },
  {
    id: "meal-planner",
    title: "🍽️ Meal Planner",
    tagline: "Plan your meals, auto-generate grocery lists",
    copy: "Set meals per day, dietary preferences, and let the Concierge suggest balanced menus.",
    feature: "meal-planner",
    icon: "📅",
    action: { label: "Try it →", route: "/app/meal-plans" },
  },
  {
    id: "grocery-lab",
    title: "🛒 Grocery Lab",
    tagline: "Search, compare, optimize your cart",
    copy: "Find the best prices across stores. See nutrition per $ and get smart substitutions.",
    feature: "grocery-lab",
    icon: "💰",
    action: { label: "Try it →", route: "/app/grocery-lab" },
  },
  {
    id: "savings",
    title: "💵 Track Your Savings",
    tagline: "See your cost over time",
    copy: "The Concierge learns your choices and helps you save without sacrifice.",
    feature: null,
    icon: "📊",
  },
  {
    id: "concierge",
    title: "🤖 Meet Your Concierge",
    tagline: "Your personal AI guide",
    copy: "Personalize your tone (Coach, Clinical, Chill), then let it guide you through every decision.",
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
  const [autoProgress, setAutoProgress] = useState(false);

  if (!open) return null;

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

  // Auto-advance slides every 3-4 seconds if user clicks "Auto" (optional)
  useEffect(() => {
    if (!autoProgress) return;
    const timer = setTimeout(handleNext, 3500);
    return () => clearTimeout(timer);
  }, [autoProgress, step]);

  return (
    <div className="qt-overlay" role="dialog" aria-modal="true" aria-label="Quick Tutorial">
      <div className="qt-backdrop" />

      <div className="qt-panel">
        {/* Header */}
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

        {/* Icon & Title */}
        <div className="qt-content">
          <div className="qt-icon" aria-hidden="true">
            {slide.icon}
          </div>

          <h2 className="qt-title">{slide.title}</h2>
          <p className="qt-tagline">{slide.tagline}</p>

          <p className="qt-copy">{slide.copy}</p>

          {/* Feature Preview (visual affordance) */}
          {slide.feature && (
            <div className="qt-feature-preview">
              <div className="qt-feature-badge">{slide.feature}</div>
            </div>
          )}
        </div>

        {/* Footer - Navigation & Actions */}
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

        {/* Settings breadcrumb hint */}
        <div className="qt-hint">
          <small>Tip: Access this anytime from <strong>Settings → Experience & Onboarding</strong></small>
        </div>
      </div>
    </div>
  );
}
