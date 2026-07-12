import React from "react";
import { writeJSON, nowISO } from "../../utils/Storage";

const PROFILE_KEY = "concierge.profile.v1";
const STRATEGY_KEY = "grocery.strategy.v1";

export default function OnboardingGate({ open, onClose }) {
  const [firstName, setFirstName] = React.useState("");
  const [step, setStep] = React.useState(1);
  const [error, setError] = React.useState("");
  const [isStarting, setIsStarting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  if (!open) return null;

  const handleContinueFromName = (event) => {
    event?.preventDefault();
    const name = firstName.trim();

    if (!name) {
      setError("Enter your first name to continue.");
      return;
    }

    setFirstName(name);
    setError("");
    setStep(2);
  };

  const saveProfile = ({ destination, storeId, shoppingMode, reasonId, onboardedVia }) => {
    if (isStarting) return;
    setIsStarting(true);

    const profile = {
      firstName: firstName.trim(),
      defaultStoreId: storeId,
      shoppingMode,
      reasonId,
      birthMonth: "",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      onboardedVia,
    };

    writeJSON(PROFILE_KEY, profile);
    writeJSON(STRATEGY_KEY, {
      shoppingMode: shoppingMode === "fastest" ? "single" : "multi",
      selectedStores: storeId === "not_sure" ? [] : [storeId],
      lastUpdated: nowISO(),
    });

    onClose?.(destination);
  };

  const handleStartGroceries = () => {
    saveProfile({
      destination: "/app/grocery-lab",
      storeId: "walmart",
      shoppingMode: "best_price",
      reasonId: "closest",
      onboardedVia: "grocery-first",
    });
  };

  const handleExplore = () => {
    saveProfile({
      destination: "/app/directory",
      storeId: "not_sure",
      shoppingMode: "balanced",
      reasonId: "other",
      onboardedVia: "explore",
    });
  };

  return (
    <div
      className="cc-overlay cc-onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cc-onboarding-title"
    >
      <div className="cc-backdrop cc-onboarding-backdrop" />

      <section className="cc-panel cc-onboarding-panel">
        <header className="cc-onboarding-header">
          <div className="cc-onboarding-brand">
            <div className="cc-onboarding-logo-wrap" aria-hidden="true">
              <img className="cc-onboarding-logo" src="/icons/3c-mall.png" alt="" />
            </div>
            <div>
              <div className="cc-onboarding-brand-name">3C Mall</div>
              <div className="cc-onboarding-brand-line">Concierge · Cost · Community</div>
            </div>
          </div>

          <div className="cc-onboarding-progress" aria-label={`Step ${step} of 2`}>
            <span>Step {step} of 2</span>
            <div className="cc-onboarding-progress-track" aria-hidden="true">
              <div
                className="cc-onboarding-progress-fill"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>
          </div>
        </header>

        <div className="cc-onboarding-body">
          {step === 1 ? (
            <div className="cc-onboarding-step">
              <div className="cc-onboarding-eyebrow">Your personal starting point</div>
              <h1 id="cc-onboarding-title" className="cc-onboarding-title">
                Welcome to your 3C Mall
              </h1>
              <p className="cc-onboarding-copy">
                I’ll guide you to the right tools without making you hunt through the app. First, what should I call you?
              </p>

              <form className="cc-onboarding-form" onSubmit={handleContinueFromName} noValidate>
                <label className="cc-onboarding-label" htmlFor="cc-first-name">
                  First name
                </label>
                <input
                  id="cc-first-name"
                  className={`input cc-onboarding-input ${error ? "has-error" : ""}`}
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                  autoCapitalize="words"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "cc-name-error" : "cc-name-help"}
                  autoFocus
                />

                {error ? (
                  <p id="cc-name-error" className="cc-onboarding-error" role="alert">
                    {error}
                  </p>
                ) : (
                  <p id="cc-name-help" className="cc-onboarding-help">
                    Used only to personalize your experience inside 3C Mall.
                  </p>
                )}

                <button className="btn btn-primary cc-onboarding-primary" type="submit">
                  Continue
                  <span aria-hidden="true">→</span>
                </button>
              </form>

              <div className="cc-onboarding-benefits" aria-label="What the concierge helps with">
                <span>✓ Find the right zone</span>
                <span>✓ Remember your preferences</span>
                <span>✓ Keep the app simple</span>
              </div>
            </div>
          ) : (
            <div className="cc-onboarding-step">
              <button
                className="cc-onboarding-back"
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                disabled={isStarting}
              >
                ← Back
              </button>

              <div className="cc-onboarding-eyebrow">Choose your first destination</div>
              <h1 id="cc-onboarding-title" className="cc-onboarding-title">
                Nice to meet you, {firstName}.
              </h1>
              <p className="cc-onboarding-copy">
                Start with the fastest value win, or open the mall directory and explore at your own pace.
              </p>

              <div className="cc-onboarding-paths">
                <button
                  className="cc-onboarding-path is-primary"
                  type="button"
                  onClick={handleStartGroceries}
                  disabled={isStarting}
                >
                  <span className="cc-onboarding-path-icon" aria-hidden="true">🛒</span>
                  <span className="cc-onboarding-path-content">
                    <strong>Start with groceries</strong>
                    <small>Build a smarter shopping strategy and compare your options.</small>
                  </span>
                  <span className="cc-onboarding-path-arrow" aria-hidden="true">→</span>
                </button>

                <button
                  className="cc-onboarding-path"
                  type="button"
                  onClick={handleExplore}
                  disabled={isStarting}
                >
                  <span className="cc-onboarding-path-icon" aria-hidden="true">🗺️</span>
                  <span className="cc-onboarding-path-content">
                    <strong>Explore the mall</strong>
                    <small>See every available zone and choose where to begin.</small>
                  </span>
                  <span className="cc-onboarding-path-arrow" aria-hidden="true">→</span>
                </button>
              </div>

              {isStarting && (
                <div className="cc-onboarding-loading" role="status" aria-live="polite">
                  <span className="cc-onboarding-spinner" aria-hidden="true" />
                  Preparing your 3C Mall…
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .cc-onboarding-overlay {
          padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
          z-index: 1700;
        }

        .cc-onboarding-backdrop {
          background:
            radial-gradient(circle at 20% 15%, rgba(126, 224, 255, 0.18), transparent 42%),
            radial-gradient(circle at 82% 85%, rgba(246, 220, 138, 0.14), transparent 45%),
            rgba(2, 5, 12, 0.88);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .cc-onboarding-panel {
          width: min(600px, 100%);
          max-width: 600px;
          max-height: min(760px, calc(100dvh - 24px));
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background:
            linear-gradient(145deg, rgba(20, 27, 43, 0.98), rgba(8, 12, 22, 0.98));
          box-shadow: 0 32px 100px rgba(0, 0, 0, 0.62);
          color: #fff;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          overflow: hidden;
        }

        .cc-onboarding-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.035);
        }

        .cc-onboarding-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .cc-onboarding-logo-wrap {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: linear-gradient(135deg, rgba(246, 220, 138, 0.98), rgba(126, 224, 255, 0.96));
          box-shadow: 0 10px 30px rgba(126, 224, 255, 0.14);
        }

        .cc-onboarding-logo {
          width: 30px;
          height: 30px;
          object-fit: contain;
        }

        .cc-onboarding-brand-name {
          font-size: 1rem;
          font-weight: 900;
          letter-spacing: 0.02em;
        }

        .cc-onboarding-brand-line {
          margin-top: 2px;
          color: rgba(255, 255, 255, 0.62);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .cc-onboarding-progress {
          width: 112px;
          flex: 0 0 112px;
          color: rgba(255, 255, 255, 0.68);
          font-size: 0.74rem;
          font-weight: 700;
          text-align: right;
        }

        .cc-onboarding-progress-track {
          height: 5px;
          margin-top: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
        }

        .cc-onboarding-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, var(--gold), var(--blue));
          transition: width 0.28s ease;
        }

        .cc-onboarding-body {
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: clamp(24px, 5vw, 46px);
          -webkit-overflow-scrolling: touch;
        }

        .cc-onboarding-step {
          width: min(100%, 500px);
          margin: 0 auto;
        }

        .cc-onboarding-eyebrow {
          margin-bottom: 10px;
          color: var(--blue);
          font-size: 0.76rem;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .cc-onboarding-title {
          margin: 0;
          color: #fff;
          font-size: clamp(2rem, 6vw, 3rem);
          line-height: 1.04;
          letter-spacing: -0.04em;
        }

        .cc-onboarding-copy {
          max-width: 48ch;
          margin: 16px 0 0;
          color: rgba(255, 255, 255, 0.75);
          font-size: 1rem;
          line-height: 1.62;
        }

        .cc-onboarding-form {
          display: grid;
          gap: 10px;
          margin-top: 28px;
        }

        .cc-onboarding-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          font-weight: 800;
        }

        .cc-onboarding-input {
          width: 100%;
          min-height: 54px;
          padding: 0 16px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .cc-onboarding-input::placeholder {
          color: rgba(255, 255, 255, 0.42);
        }

        .cc-onboarding-input:focus {
          border-color: rgba(126, 224, 255, 0.78);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 0 4px rgba(126, 224, 255, 0.12);
        }

        .cc-onboarding-input.has-error {
          border-color: rgba(255, 120, 120, 0.8);
          box-shadow: 0 0 0 4px rgba(255, 90, 90, 0.1);
        }

        .cc-onboarding-help,
        .cc-onboarding-error {
          min-height: 20px;
          margin: 0;
          font-size: 0.82rem;
          line-height: 1.4;
        }

        .cc-onboarding-help {
          color: rgba(255, 255, 255, 0.55);
        }

        .cc-onboarding-error {
          color: #ffabab;
          font-weight: 700;
        }

        .cc-onboarding-primary {
          width: 100%;
          min-height: 54px;
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 15px;
          font-size: 0.98rem;
          font-weight: 900;
        }

        .cc-onboarding-benefits {
          display: flex;
          flex-wrap: wrap;
          gap: 9px 16px;
          margin-top: 24px;
          color: rgba(255, 255, 255, 0.58);
          font-size: 0.78rem;
        }

        .cc-onboarding-back {
          margin: 0 0 22px;
          padding: 0;
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.68);
          font: inherit;
          font-size: 0.86rem;
          font-weight: 800;
          cursor: pointer;
        }

        .cc-onboarding-back:hover,
        .cc-onboarding-back:focus-visible {
          color: #fff;
        }

        .cc-onboarding-paths {
          display: grid;
          gap: 12px;
          margin-top: 28px;
        }

        .cc-onboarding-path {
          width: 100%;
          min-height: 92px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.055);
          color: #fff;
          text-align: left;
          cursor: pointer;
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }

        .cc-onboarding-path.is-primary {
          border-color: rgba(246, 220, 138, 0.42);
          background: linear-gradient(135deg, rgba(246, 220, 138, 0.13), rgba(126, 224, 255, 0.07));
        }

        .cc-onboarding-path:hover,
        .cc-onboarding-path:focus-visible {
          transform: translateY(-2px);
          border-color: rgba(126, 224, 255, 0.5);
          background: rgba(255, 255, 255, 0.09);
          outline: none;
        }

        .cc-onboarding-path:disabled,
        .cc-onboarding-back:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .cc-onboarding-path-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.08);
          font-size: 1.45rem;
        }

        .cc-onboarding-path-content {
          min-width: 0;
          display: grid;
          gap: 5px;
        }

        .cc-onboarding-path-content strong {
          color: #fff;
          font-size: 1rem;
        }

        .cc-onboarding-path-content small {
          color: rgba(255, 255, 255, 0.62);
          font-size: 0.84rem;
          line-height: 1.42;
        }

        .cc-onboarding-path-arrow {
          color: var(--gold);
          font-size: 1.2rem;
          font-weight: 900;
        }

        .cc-onboarding-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 34px;
          margin-top: 18px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.86rem;
          font-weight: 700;
        }

        .cc-onboarding-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: cc-onboarding-spin 0.75s linear infinite;
        }

        @keyframes cc-onboarding-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .cc-onboarding-overlay {
            padding: 0;
            place-items: stretch;
          }

          .cc-onboarding-panel {
            width: 100%;
            max-width: none;
            height: 100dvh;
            max-height: 100dvh;
            border: 0;
            border-radius: 0;
          }

          .cc-onboarding-header {
            padding:
              max(14px, env(safe-area-inset-top))
              max(16px, env(safe-area-inset-right))
              14px
              max(16px, env(safe-area-inset-left));
          }

          .cc-onboarding-brand-line {
            display: none;
          }

          .cc-onboarding-progress {
            width: 94px;
            flex-basis: 94px;
          }

          .cc-onboarding-body {
            padding:
              28px
              max(20px, env(safe-area-inset-right))
              max(28px, env(safe-area-inset-bottom))
              max(20px, env(safe-area-inset-left));
          }

          .cc-onboarding-title {
            font-size: clamp(2rem, 10vw, 2.7rem);
          }

          .cc-onboarding-copy {
            font-size: 0.96rem;
          }

          .cc-onboarding-benefits {
            display: grid;
            gap: 8px;
          }
        }

        @media (max-width: 380px) {
          .cc-onboarding-logo-wrap {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
          }

          .cc-onboarding-brand-name {
            font-size: 0.92rem;
          }

          .cc-onboarding-progress {
            width: 82px;
            flex-basis: 82px;
            font-size: 0.68rem;
          }

          .cc-onboarding-path {
            grid-template-columns: auto minmax(0, 1fr);
          }

          .cc-onboarding-path-arrow {
            display: none;
          }
        }

        @media (orientation: landscape) and (max-height: 560px) {
          .cc-onboarding-panel {
            max-height: calc(100dvh - 12px);
          }

          .cc-onboarding-header {
            padding: 10px 16px;
          }

          .cc-onboarding-body {
            padding: 18px 24px;
          }

          .cc-onboarding-title {
            font-size: 2rem;
          }

          .cc-onboarding-copy {
            margin-top: 10px;
          }

          .cc-onboarding-form,
          .cc-onboarding-paths {
            margin-top: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cc-onboarding-progress-fill,
          .cc-onboarding-path,
          .cc-onboarding-spinner {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
