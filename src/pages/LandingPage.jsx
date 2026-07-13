// src/pages/LandingPage.jsx
import React, { useState } from "react";
import "../styles/LandingPage.css";
import { reportWaitlistSignup } from "../utils/reportingService";
import { betaMessaging } from "../utils/betaMessaging";
import VideoIntro, { VIDEO_INTRO_SEEN_KEY } from "../assets/components/VideoIntro.jsx";
import { readJSON } from "../utils/Storage";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Show video intro on first visit
  const [showVideoIntro, setShowVideoIntro] = useState(() => {
    const hasSeenIntro = readJSON(VIDEO_INTRO_SEEN_KEY, null);
    return !hasSeenIntro; // Show if never seen
  });

  const handleWaitlist = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    console.log("📧 Waitlist form submitted with email:", email);
    console.log("🔗 API Base:", import.meta.env.VITE_API_BASE);
    console.log("✅ Report enabled:", import.meta.env.VITE_REPORT_WAITLIST);

    try {
      // Store in localStorage
      localStorage.setItem("waitlist_email", email);
      
      // Report to backend (email confirmation happens server-side)
      console.log("Calling reportWaitlistSignup...");
      await reportWaitlistSignup(email);
      console.log("✅ Reported to backend");

      setSubmitted(true);
    } catch (err) {
      console.error("❌ Waitlist error:", err);
      setError("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleForm = () => {
    const formUrl = import.meta.env.VITE_WAITLIST_FORM_URL;
    if (formUrl) {
      window.open(formUrl, "_blank");
    }
  };

  return (
    <main className="landing-page">
      {/* VIDEO INTRO - first-time visitors only (PRE-AUTH) */}
      <VideoIntro
        open={showVideoIntro}
        onComplete={() => {
          setShowVideoIntro(false);
          // Video complete - user can now interact with landing page
        }}
      />
      
      {/* Hero Section */}
      <section className="lp-hero">
        <div className="lp-hero-left">
          <p className="lp-kicker">Concierge • Cost • Community</p>
          
          <h1>
            Eat smarter, plan better, <span className="lp-highlight">you're not alone.</span>
          </h1>
          
          <p className="lp-subtitle">
            The 3C Mall is a guided family dashboard for grocery comparison, meal planning, and household food decisions—built for real life.
          </p>

          {/* Beta Waitlist Form */}
          <div className="lp-waitlist-card">
            <div className="lp-beta-badge">🔒 Beta Access</div>
            <h3>Join the Beta Waitlist</h3>
            <p className="lp-waitlist-desc">
              We're currently in beta. Sign up to help test grocery comparison, meal planning, and family-friendly decision-support tools.
            </p>
            
            {!submitted ? (
              <>
                <form onSubmit={handleWaitlist} className="lp-waitlist-form">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="lp-email-input"
                  />
                  <button type="submit" className="lp-submit-btn" disabled={loading}>
                    {loading ? "Joining..." : "Join Waitlist"}
                  </button>
                </form>
                {error && <p className="lp-form-error">{error}</p>}
                
                <div className="lp-form-divider">or</div>
                
                <button onClick={handleGoogleForm} className="lp-google-form-btn">
                  📋 Fill Out Detailed Form
                </button>
              </>
            ) : (
              <div className="lp-success">
                <span className="lp-success-icon">🎉</span>
                <p style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: ".5rem" }}>{betaMessaging.betaTesterConfirm.headline}</p>
                <p style={{ fontSize: "0.9rem", marginBottom: "1rem", color: "rgba(255,255,255,0.85)" }}>{betaMessaging.betaTesterConfirm.subheading}</p>
                
                <div style={{ textAlign: "left", marginBottom: "1rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>
                  <p style={{ fontWeight: 600, marginBottom: ".4rem" }}>{betaMessaging.betaTesterConfirm.mission}</p>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                    {betaMessaging.betaTesterConfirm.missionPoints.map((point, i) => (
                      <li key={i} style={{ marginBottom: ".3rem" }}>• {point}</li>
                    ))}
                  </ul>
                </div>
                
                <p style={{ fontSize: "0.85rem", fontStyle: "italic", color: "rgba(246,220,138,0.9)", marginBottom: "1rem" }}>{betaMessaging.betaTesterConfirm.closing}</p>
                
                <button onClick={handleGoogleForm} className="lp-google-form-link">
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
          {/* Video Showcase */}
          <div className="lp-video-grid">
            <div className="lp-video-card">
              <video autoPlay loop muted playsInline className="lp-video">
                <source src="/assets/videos/groceries.mp4" type="video/mp4" />
              </video>
              <div className="lp-video-label">Grocery Comparison</div>
            </div>
            
            <div className="lp-video-card">
              <video autoPlay loop muted playsInline className="lp-video">
                <source src="/assets/videos/coach.mp4" type="video/mp4" />
              </video>
              <div className="lp-video-label">Personal Concierge</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="lp-features">
        <h2 className="lp-section-title">Why Join 3C Mall?</h2>
        
        <div className="lp-feature-grid">
          <div className="lp-feature-card">
            <div className="lp-feature-icon">🛒</div>
            <h3>Estimated Grocery Comparison</h3>
            <p>Compare estimated grocery totals across stores so your family can make clearer planning decisions.</p>
          </div>
          
          <div className="lp-feature-card">
            <div className="lp-feature-icon">🥗</div>
            <h3>Guided Meal Planning</h3>
            <p>Build practical meal plans around preferences, household needs, and grocery planning goals.</p>
          </div>
          
          <div className="lp-feature-card">
            <div className="lp-feature-icon">💪</div>
            <h3>Community & Support</h3>
            <p>Connect with practical tools, encouragement, and future professional support options as the platform grows.</p>
          </div>
        </div>
      </section>

      {/* Positioning Note */}
      <section className="lp-stats">
        <div className="lp-stat-pill">
          <span className="lp-stat-number">Beta</span>
          <span className="lp-stat-label">Family Testing Phase</span>
        </div>
        <div className="lp-stat-pill">
          <span className="lp-stat-number">3 Modules</span>
          <span className="lp-stat-label">Concierge, Cost, Community</span>
        </div>
        <div className="lp-stat-pill">
          <span className="lp-stat-number">Decision Support</span>
          <span className="lp-stat-label">Users confirm final choices with retailers</span>
        </div>
      </section>
    </main>
  );
}
