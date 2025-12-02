import "../styles/LandingPage.css";
import React from "react";
import ConciergePane from "../assets/components/ConciergePane.jsx";

import athleteVideo from "../assets/videos/athlete.mp4";
import groceriesVideo from "../assets/videos/groceries.mp4";
import coachVideo from "../assets/videos/coach.mp4";

export default function LandingPage() {
  return (
    <main className="lp-page">
      {/* Hero section */}
      <section className="lp-hero">
        {/* LEFT: copy + buttons */}
        <div className="lp-hero-left">
          <p className="lp-kicker">Convert • Commit • Come Back</p>

          <h1>
            Eat smarter, spend less,{" "}
            <span className="highlight">never do it alone.</span>
          </h1>

          <p className="lp-hero-copy">
            The 3C Mall is your concierge for carnivore, keto, and
            budget-friendly living — with real grocery prices, real rewards,
            and real humans who understand what it’s like to change your life
            between shifts.
          </p>

          <div className="hero-buttons">
            <a href="/app" className="btn-primary">
              Open the 3C App
            </a>
            <a href="/pricing" className="btn-outline">
              View Plans &amp; Perks
            </a>
          </div>
        </div>

        {/* RIGHT: video stack + concierge */}
        <div className="lp-hero-right">
          {/* Video stack: 1 main, 2 smaller */}
          <div className="lp-video-stack">
            {/* Main / primary video */}
            <figure className="lp-video-card lp-video-card-main">
              <div className="lp-video-frame">
                <video
                  className="lp-video"
                  src={athleteVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
              <figcaption>
                Training-day check-in with your 3C concierge
              </figcaption>
            </figure>

            {/* Row of two smaller videos */}
            <div className="lp-video-row">
              <figure className="lp-video-card">
                <div className="lp-video-frame">
                  <video
                    className="lp-video"
                    src={groceriesVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
                <figcaption>
                  Confident grocery runs on a real-world budget
                </figcaption>
              </figure>

              <figure className="lp-video-card">
                <div className="lp-video-frame">
                  <video
                    className="lp-video"
                    src={coachVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
                <figcaption>
                  Coach &amp; client mapping the next move
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Adaptive concierge panel */}
          <div className="lp-concierge-wrapper">
            <ConciergePane />
          </div>

          <p className="lp-precision-note">
            Engineered for precision. Crafted for effortless performance.
          </p>
        </div>
      </section>

      {/* Stats row under the hero */}
      <div className="lp-stats">
        <div className="lp-stat-pill">
          <span className="lp-stat-number">0.8–1.0×</span>
          <span className="lp-stat-label">
            protein (g) per lb of target body weight, auto-guided for loss or
            gain
          </span>
        </div>

        <div className="lp-stat-pill">
          <span className="lp-stat-number">$12.60</span>
          <span className="lp-stat-label">example daily meat budget</span>
        </div>

        <div className="lp-stat-pill">
          <span className="lp-stat-number">90%</span>
          <span className="lp-stat-label">
            on-track streak this month (80/20 friendly)
          </span>
        </div>
      </div>
    </main>
  );
}