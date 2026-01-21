import React, { useEffect, useMemo, useState } from "react";

export default function OnboardingTour({
  open,
  onComplete,
  onClose,
  brand = "3C Mall",
}) {
  const isOpen = !!open;

  const slides = useMemo(
    () => [
      {
        title: `Welcome to ${brand}`,
        body:
          "All your grocery stores and lifestyle tools — in one place, in the palm of your hand.\n\nNo juggling apps. No scattered decisions.",
        fields: null,
      },
      {
        title: "What is the 3C?",
        body:
          "3C stands for:\n\n🤝 Concierge\nYour AI guide that adapts to your choices.\n\n💰 Cost\nTrack and optimize what you spend on food.\n\n👥 Community\nSupport without judgment or pressure.\n\nTogether, they make the Mall—a unified space for shopping, planning, and living well.",
        fields: null,
      },
      {
        title: "The Mall is your hub",
        body:
          "Think of it like a real shopping mall:\n\nThe grocery stores are your shopping destinations—optimized with routing and pricing.\n\nThe amenities are your lifestyle tools:\n\n• Meal planner\n• Cost awareness\n• Recovery & momentum tools\n\nSome are live now. Some are coming soon.",
        fields: null,
      },
      {
        title: "Your built-in Concierge",
        body:
          "The Concierge reduces decision fatigue by adapting to how you shop, eat, and move.\n\nNo judgment.\nNo pressure.\nJust smarter defaults over time.",
        fields: null,
      },
      {
        title: "Let's personalize",
        body: "Quick setup — you can change this anytime.",
        fields: "profile",
      },
    ],
    [brand]
  );

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [shopMode, setShopMode] = useState("best_price"); // best_price | loyal
  const [homeStore, setHomeStore] = useState(""); // optional (string)
  const [birthday, setBirthday] = useState(""); // optional "MM/DD"

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
  }, [isOpen]);

  // ESC closes
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLast = step === slides.length - 1;

  function next() {
    setStep((s) => Math.min(s + 1, slides.length - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function complete() {
    const payload = {
      name: String(name || "").trim(),
      shopMode,
      homeStore: String(homeStore || "").trim(),
      birthday: String(birthday || "").trim(), // keep simple; validate later if you want
      completedAt: new Date().toISOString(),
    };
    onComplete?.(payload);
  }

  const slide = slides[step];

  return (
    <div className="ob-overlay" role="dialog" aria-modal="true" aria-label="Onboarding">
      <div className="ob-backdrop" onClick={onClose} />

      <div className="ob-panel">
        <div className="ob-head">
          <div className="ob-badge" aria-hidden="true">
            <img className="ob-logo" src="/icons/3c-mall.png" alt="" />
          </div>
          <div className="ob-head-text">
            <div className="ob-title">{slide.title}</div>
            <div className="ob-progress">
              Step {step + 1} of {slides.length}
            </div>
          </div>

          <button className="ob-x" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="ob-body">
          <p className="ob-body-text">
            {slide.body.split("\n").map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>

          {slide.fields === "profile" && (
            <div className="ob-form">
              <label className="ob-label">
                What should we call you?
                <input
                  className="ob-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name"
                  autoFocus
                />
              </label>

              <div className="ob-grid">
                <label className="ob-label">
                  Birthday (MM/DD) — optional
                  <input
                    className="ob-input"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    placeholder="MM/DD"
                  />
                </label>

                <label className="ob-label">
                  Preferred store — optional
                  <input
                    className="ob-input"
                    value={homeStore}
                    onChange={(e) => setHomeStore(e.target.value)}
                    placeholder="Costco / Walmart / etc."
                  />
                </label>
              </div>

              <div className="ob-radio">
                <div className="ob-label" style={{ marginBottom: ".35rem" }}>
                  How do you prefer to shop?
                </div>

                <button
                  type="button"
                  className={"ob-choice " + (shopMode === "best_price" ? "on" : "")}
                  onClick={() => setShopMode("best_price")}
                >
                    <div className="ob-choice-title">Compare estimated pricing</div>
                    <div className="ob-choice-desc">See estimated totals across stores to help inform your choice.</div>
                </button>

                <button
                  type="button"
                  className={"ob-choice " + (shopMode === "loyal" ? "on" : "")}
                  onClick={() => setShopMode("loyal")}
                >
                  <div className="ob-choice-title">Loyal to one main store</div>
                  <div className="ob-choice-desc">Keep it simple. Optimize within your preferred store.</div>
                </button>

                <div className="ob-note">
                  You can change this later in Settings.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ob-foot">
          <button className="btn btn-ghost" onClick={prev} disabled={step === 0}>
            Back
          </button>

          {!isLast ? (
            <button className="btn btn-primary" onClick={next}>
              Next
            </button>
          ) : (
            <button className="btn btn-primary" onClick={complete}>
              Enter Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
