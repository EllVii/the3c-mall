import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";
import { reportWaitlistSignup } from "../utils/reportingService";
import { betaMessaging } from "../utils/betaMessaging";

const JOURNEY_STEPS = [
  {
    number: "01",
    title: "Set your household and budget",
    text: "Start with the people you shop for, food preferences, and the grocery amount you want to work within.",
  },
  {
    number: "02",
    title: "Plan meals that fit real life",
    text: "Choose meals around your schedule, preferences, and the ingredients your household will actually use.",
  },
  {
    number: "03",
    title: "Build one connected list",
    text: "Carry meal ingredients into a shopping list, then add household staples and other everyday items.",
  },
  {
    number: "04",
    title: "Compare your shopping options",
    text: "Review unit prices and available store estimates before deciding where and how you want to shop.",
  },
];

const BENEFITS = [
  {
    icon: "$",
    title: "Budget-aware planning",
    text: "Keep the grocery amount you are working with visible while you plan meals and organize purchases.",
  },
  {
    icon: "÷",
    title: "Unit-price clarity",
    text: "Compare package sizes using common measurements so a larger box does not automatically look like the better value.",
  },
  {
    icon: "✓",
    title: "One connected shopping list",
    text: "Keep planned ingredients and everyday household items together instead of rebuilding the same list in several apps.",
  },
  {
    icon: "◎",
    title: "Household preferences",
    text: "Organize food preferences, dietary considerations, and shopping priorities around the people in your home.",
  },
  {
    icon: "⌂",
    title: "Flexible shopping choices",
    text: "Use the comparison as decision support while you remain in control of the store, pickup, delivery, and final purchase.",
  },
  {
    icon: "✦",
    title: "Guided next steps",
    text: "The 3C Concierge helps you understand where to begin and what to do next without overwhelming you with every tool at once.",
  },
];

const CONFIDENCE_POINTS = [
  "Store prices, package sizes, promotions, and availability can change; comparisons are presented as decision-support estimates.",
  "You choose where to shop and review the final retailer price before completing a purchase.",
  "Account tools and household planning information remain inside the secure 3C Mall application experience.",
];

function DeferredVideo({ src, label }) {
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (
      connection?.saveData ||
      ["slow-2g", "2g"].includes(connection?.effectiveType) ||
      prefersReducedMotion
    ) {
      return undefined;
    }

    let idleId;
    let timerId;

    const scheduleLoad = () => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(
          () => setShouldLoad(true),
          { timeout: 2500 },
        );
      } else {
        timerId = window.setTimeout(() => setShouldLoad(true), 1000);
      }
    };

    if (!("IntersectionObserver" in window)) {
      scheduleLoad();
      return () => {
        if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
        if (timerId !== undefined) window.clearTimeout(timerId);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        scheduleLoad();
      },
      { rootMargin: "150px" },
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);

  return (
    <figure className="lp-video-card" ref={containerRef}>
      <video
        autoPlay={shouldLoad}
        loop
        muted
        playsInline
        preload="none"
        poster="/brand/3c-mall-entrance.jpg"
        className="lp-video"
        aria-label={label}
      >
        {shouldLoad && <source src={src} type="video/mp4" />}
      </video>
      <figcaption className="lp-video-label">{label}</figcaption>
    </figure>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const detailedFormUrl = import.meta.env.VITE_WAITLIST_FORM_URL;

  const handleWaitlist = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      localStorage.setItem("waitlist_email", email);
      await reportWaitlistSignup(email);
      setSubmitted(true);
    } catch (waitlistError) {
      console.error("Waitlist error:", waitlistError);
      setError("We could not add you to the waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailedForm = () => {
    if (detailedFormUrl) {
      window.open(detailedFormUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="landing-page">
      <section className="lp-hero" aria-labelledby="landing-title">
        <div className="lp-hero-copy">
          <p className="lp-kicker">Concierge • Cost • Community</p>
          <h1 id="landing-title">
            Plan meals and groceries around your{" "}
            <span className="lp-highlight">real household budget.</span>
          </h1>
          <p className="lp-subtitle">
            3C Mall connects meal planning, shopping lists, unit-price clarity,
            and store estimates in one guided experience built for everyday
            households.
          </p>

          <div className="lp-hero-actions" aria-label="Get started">
            <a className="lp-button lp-button-primary" href="#beta-access">
              Join the closed beta
            </a>
            <a className="lp-button lp-button-secondary" href="#how-it-works">
              See how it works
            </a>
          </div>

          <ul className="lp-hero-points" aria-label="Key product benefits">
            <li>Start with your household and grocery budget</li>
            <li>Turn meal ideas into one organized shopping list</li>
            <li>Compare package value and available store estimates</li>
          </ul>
        </div>

        <aside className="lp-journey-card" aria-label="Your first 3C Mall journey">
          <div className="lp-journey-heading">
            <p>Your first few minutes</p>
            <h2>One clear path from planning to shopping</h2>
          </div>

          <ol className="lp-journey-list">
            {JOURNEY_STEPS.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="lp-journey-result">
            <span>Result</span>
            <strong>
              A connected meal and grocery plan you can review before you shop.
            </strong>
          </div>
        </aside>
      </section>

      <section className="lp-value-strip" aria-label="3C Mall product principles">
        <div>
          <strong>Budget-aware</strong>
          <span>Plan around the amount available to your household.</span>
        </div>
        <div>
          <strong>Comparison-ready</strong>
          <span>Make package sizes and estimated store costs easier to understand.</span>
        </div>
        <div>
          <strong>User-controlled</strong>
          <span>You decide where, when, and how the final purchase happens.</span>
        </div>
      </section>

      <section className="lp-section" id="how-it-works" aria-labelledby="how-title">
        <div className="lp-section-heading">
          <p>How it works</p>
          <h2 id="how-title">Four steps. One connected household plan.</h2>
          <span>
            Begin with the information that matters, then move through the app
            one useful decision at a time.
          </span>
        </div>

        <div className="lp-step-grid">
          {JOURNEY_STEPS.map((step) => (
            <article className="lp-step-card" key={step.number}>
              <span className="lp-step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section lp-section-soft" aria-labelledby="benefits-title">
        <div className="lp-section-heading">
          <p>What 3C Mall brings together</p>
          <h2 id="benefits-title">Useful tools without the disconnected-app feeling.</h2>
          <span>
            Meal planning, grocery organization, and comparison tools should
            work together instead of making households repeat the same work.
          </span>
        </div>

        <div className="lp-feature-grid">
          {BENEFITS.map((benefit) => (
            <article className="lp-feature-card" key={benefit.title}>
              <span className="lp-feature-icon" aria-hidden="true">
                {benefit.icon}
              </span>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>

        <div className="lp-inline-link">
          <Link to="/features">Explore all 3C Mall features</Link>
          <Link to="/pricing">Review planned membership options</Link>
        </div>
      </section>

      <section className="lp-demo-section" aria-labelledby="demo-title">
        <div className="lp-demo-copy">
          <p>Designed to guide, not overwhelm</p>
          <h2 id="demo-title">See the grocery and concierge ideas in motion.</h2>
          <span>
            The interface is being developed to keep the next useful action
            visible while more advanced tools remain available when needed.
          </span>
        </div>

        <div className="lp-video-grid">
          <DeferredVideo
            src="/assets/videos/groceries.mp4"
            label="Grocery comparison experience preview"
          />
          <DeferredVideo
            src="/assets/videos/coach.mp4"
            label="3C Concierge guidance preview"
          />
        </div>
      </section>

      <section className="lp-confidence" aria-labelledby="confidence-title">
        <div>
          <p>Clear expectations</p>
          <h2 id="confidence-title">Decision support—not a promise of a fixed store price.</h2>
        </div>
        <ul>
          {CONFIDENCE_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="lp-beta-section" id="beta-access" aria-labelledby="beta-title">
        <div className="lp-beta-copy">
          <p>Closed beta</p>
          <h2 id="beta-title">Help shape a clearer household shopping experience.</h2>
          <span>
            Join the waitlist for future testing opportunities, product
            updates, and requests for practical feedback.
          </span>
          <div className="lp-beta-notes">
            <span>No payment is required to join the waitlist.</span>
            <span>Beta access is released in limited groups.</span>
          </div>
        </div>

        <div className="lp-waitlist-card">
          {!submitted ? (
            <>
              <div className="lp-beta-badge">Beta waitlist</div>
              <h3>Request early access</h3>
              <p className="lp-waitlist-desc">
                Enter the email address where you would like to receive 3C Mall
                testing and product updates.
              </p>

              <form onSubmit={handleWaitlist} className="lp-waitlist-form">
                <label htmlFor="waitlist-email">Email address</label>
                <div className="lp-form-row">
                  <input
                    id="waitlist-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="lp-email-input"
                  />
                  <button
                    type="submit"
                    className="lp-submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Joining…" : "Join waitlist"}
                  </button>
                </div>
              </form>

              {error && <p className="lp-form-error" role="alert">{error}</p>}

              {detailedFormUrl && (
                <button
                  type="button"
                  onClick={handleDetailedForm}
                  className="lp-detailed-form-btn"
                >
                  Share detailed household feedback instead
                </button>
              )}
            </>
          ) : (
            <div className="lp-success" role="status" aria-live="polite">
              <span className="lp-success-icon" aria-hidden="true">✓</span>
              <div>
                <h3>{betaMessaging.betaTesterConfirm.headline}</h3>
                <p>{betaMessaging.betaTesterConfirm.subheading}</p>
                <strong>{betaMessaging.betaTesterConfirm.mission}</strong>
                <ul>
                  {betaMessaging.betaTesterConfirm.missionPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <p className="lp-success-closing">
                  {betaMessaging.betaTesterConfirm.closing}
                </p>
                {detailedFormUrl && (
                  <button type="button" onClick={handleDetailedForm}>
                    Provide more detailed feedback
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
