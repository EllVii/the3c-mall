// src/pages/LandingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import "../styles/LandingPage.css";
import { reportWaitlistSignup } from "../utils/reportingService";
import { betaMessaging } from "../utils/betaMessaging";
import VideoIntro, {
  VIDEO_INTRO_SEEN_KEY,
} from "../assets/components/VideoIntro.jsx";
import { readJSON } from "../utils/Storage";

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
    <div className="lp-video-card" ref={containerRef}>
      <video
        autoPlay={shouldLoad}
        loop
        muted
        playsInline
        preload="none"
        poster="/brand/3c-mall-entrance.jpg"
        className="lp-video"
      >
        {shouldLoad && <source src={src} type="video/mp4" />}
      </video>
      <div className="lp-video-label">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Show video intro on first visit.
  const [showVideoIntro, setShowVideoIntro] = useState(() => {
    const hasSeenIntro = readJSON(VIDEO_INTRO_SEEN_KEY, null);
    return !hasSeenIntro;
  });

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
      setError("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleForm = () => {
    const formUrl = import.meta.env.VITE_WAITLIST_FORM_URL;
    if (formUrl) window.open(formUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="landing-page">
      <VideoIntro
        open={showVideoIntro}
        onComplete={() => setShowVideoIntro(false)}
      />

      <section className="lp-hero">
        <div className="lp-hero-left">
          <p className="lp-kicker">Concierge • Cost • Community</p>

          <h1>
            Eat smarter, spend less,{" "}
            <span className="lp-highlight">you're not alone.</span>
          </h1>

          <p className="lp-subtitle">
            The 3C Mall is your guided lifestyle dashboard: meal plans,
            grocery labs, and coaching tools—built for real life.
          </p>

          <div className="lp-waitlist-card">
            <div className="lp-beta-badge">🔒 Beta Access</div>
            <h3>Join the Beta Waitlist</h3>
            <p className="lp-waitlist-desc">
              We're currently in closed beta. Sign up to get early access
              when we open new spots.
            </p>

            {!submitted ? (
              <>
                <form onSubmit={handleWaitlist} className="lp-waitlist-form">
                  <input
                    type="email"
                    placeholder="Enter your email"
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
                    {loading ? "Joining..." : "Join Waitlist"}
                  </button>
                </form>
                {error && <p className="lp-form-error">{error}</p>}

                <div className="lp-form-divider">or</div>

                <button
                  type="button"
                  onClick={handleGoogleForm}
                  className="lp-google-form-btn"
                >
                  📋 Fill Out Detailed Form
                </button>
              </>
            ) : (
              <div className="lp-success">
                <span className="lp-success-icon">🎉</span>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    marginBottom: ".5rem",
                  }}
                >
                  {betaMessaging.betaTesterConfirm.headline}
                </p>
                <p
                  style={{
                    fontSize: "0.9rem",
                    marginBottom: "1rem",
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {betaMessaging.betaTesterConfirm.subheading}
                </p>

                <div
                  style={{
                    textAlign: "left",
                    marginBottom: "1rem",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  <p style={{ fontWeight: 600, marginBottom: ".4rem" }}>
                    {betaMessaging.betaTesterConfirm.mission}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                    {betaMessaging.betaTesterConfirm.missionPoints.map(
                      (point) => (
                        <li key={point} style={{ marginBottom: ".3rem" }}>
                          • {point}
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <p
                  style={{
                    fontSize: "0.85rem",
                    fontStyle: "italic",
                    color: "rgba(246,220,138,0.9)",
                    marginBottom: "1rem",
                  }}
                >
                  {betaMessaging.betaTesterConfirm.closing}
                </p>

                <button
                  type="button"
                  onClick={handleGoogleForm}
                  className="lp-google-form-link"
                >
                  Want to provide more info? Fill out our form →
                </button>
              </div>
            )}
          </div>

          <div className="lp-cta-row">
            <a href="/pricing" className="btn btn-outline">
              View Pricing
            </a>
            <a href="/features" className="btn btn-ghost">
              Explore Features
            </a>
          </div>
        </div>

        <div className="lp-hero-right">
          <div className="lp-video-grid">
            <DeferredVideo
              src="/assets/videos/groceries.mp4"
              label="Smart Grocery Routing"
            />
            <DeferredVideo
              src="/assets/videos/coach.mp4"
              label="Personal Concierge"
            />
          </div>
        </div>
      </section>

      <section className="lp-features">
        <h2 className="lp-section-title">Why Join 3C Mall?</h2>

        <div className="lp-feature-grid">
          <div className="lp-feature-card">
            <div className="lp-feature-icon">🛒</div>
            <h3>Multi-Store Grocery Optimization</h3>
            <p>
              Smart pricing comparison across stores can potentially save
              20-40% on groceries.
            </p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-icon">🥗</div>
            <h3>Guided Meal Planning</h3>
            <p>
              AI-powered meal plans that adapt to your preferences, dietary
              needs, and budget.
            </p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-icon">💪</div>
            <h3>Community & Coaching</h3>
            <p>
              Connect with trainers, nutritionists, and a community focused
              on healthy living.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-stats">
        <div className="lp-stat-pill">
          <span className="lp-stat-number">Early Access</span>
          <span className="lp-stat-label">Closed Beta Phase</span>
        </div>
        <div className="lp-stat-pill">
          <span className="lp-stat-number">3 Modules</span>
          <span className="lp-stat-label">
            Concierge, Cost, Community
          </span>
        </div>
        <div className="lp-stat-pill">
          <span className="lp-stat-number">Free Beta</span>
          <span className="lp-stat-label">Help Shape the Future</span>
        </div>
      </section>
    </main>
  );
}
