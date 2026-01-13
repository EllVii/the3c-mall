// src/pages/LandingPage.jsx
import React, { useState } from "react";
import "../styles/LandingPage.css";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = (e) => {
    e.preventDefault();
    // TODO: Connect to your waitlist backend/service
    console.log("Waitlist signup:", email);
    setSubmitted(true);
    // Store in localStorage for now
    localStorage.setItem("waitlist_email", email);
  };

  return (
    <main className="landing-page">
      {/* Hero Section */}
      <section className="lp-hero">
        <div className="lp-hero-left">
          <p className="lp-kicker">Concierge • Cost • Community</p>
          
          <h1>
            Eat smarter, spend less, <span className="lp-highlight">never do it alone.</span>
          </h1>
          
          <p className="lp-subtitle">
            The 3C Mall is your guided lifestyle dashboard: meal plans, grocery labs, and coaching tools—built for real life.
          </p>

          {/* Beta Waitlist Form */}
          <div className="lp-waitlist-card">
            <div className="lp-beta-badge">🔒 Beta Access</div>
            <h3>Join the Beta Waitlist</h3>
            <p className="lp-waitlist-desc">
              We're currently in closed beta. Sign up to get early access when we open new spots.
            </p>
            
            {!submitted ? (
              <form onSubmit={handleWaitlist} className="lp-waitlist-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="lp-email-input"
                />
                <button type="submit" className="lp-submit-btn">
                  Join Waitlist
                </button>
              </form>
            ) : (
              <div className="lp-success">
                <span className="lp-success-icon">✓</span>
                <p>You're on the list! We'll email you when spots open.</p>
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
              <div className="lp-video-label">Smart Grocery Routing</div>
            </div>
            
            <div className="lp-video-card">
              <video autoPlay loop muted playsInline className="lp-video">
                <source src="/assets/videos/coach.mp4" type="video/mp4" />
              </video>
              <div className="lp-video-label">Personal Concierge</div>
            </div>
            
            <div className="lp-video-card">
              <video autoPlay loop muted playsInline className="lp-video">
                <source src="/assets/videos/athlete.mp4" type="video/mp4" />
              </video>
              <div className="lp-video-label">Fitness Integration</div>
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
            <h3>Multi-Store Grocery Optimization</h3>
            <p>Save up to 40% by routing your grocery list across multiple stores with smart pricing.</p>
          </div>
          
          <div className="lp-feature-card">
            <div className="lp-feature-icon">🥗</div>
            <h3>Guided Meal Planning</h3>
            <p>AI-powered meal plans that adapt to your preferences, dietary needs, and budget.</p>
          </div>
          
          <div className="lp-feature-card">
            <div className="lp-feature-icon">💪</div>
            <h3>Community & Coaching</h3>
            <p>Connect with trainers, nutritionists, and a community focused on healthy living.</p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="lp-stats">
        <div className="lp-stat-pill">
          <span className="lp-stat-number">$2,400+</span>
          <span className="lp-stat-label">Avg. Annual Savings</span>
        </div>
        <div className="lp-stat-pill">
          <span className="lp-stat-number">500+</span>
          <span className="lp-stat-label">Beta Testers</span>
        </div>
        <div className="lp-stat-pill">
          <span className="lp-stat-number">4.8/5</span>
          <span className="lp-stat-label">User Rating</span>
        </div>
      </section>
    </main>
  );
}