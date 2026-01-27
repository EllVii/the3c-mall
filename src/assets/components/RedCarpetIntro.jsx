// src/assets/components/RedCarpetIntro.jsx
import React, { useState, useEffect } from "react";

const RED_CARPET_SEEN_KEY = "redCarpet.seen.v1";

/**
 * The "Red Carpet" First-Launch Experience
 * A 10-14 second luxury intro that establishes status, calm, and confidence.
 * No features. No explanations. Just arrival.
 */
export default function RedCarpetIntro({ open, onComplete }) {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    if (!open) return;

    setScene(0);

    const timers = [
      setTimeout(() => setScene(1), 3000),  // Scene 1 → 2 (0-3s: Arrival)
      setTimeout(() => setScene(2), 6000),  // Scene 2 → 3 (3-6s: Doors open)
      setTimeout(() => setScene(3), 9000),  // Scene 3 → 4 (6-9s: Unmarked stores)
      setTimeout(() => setScene(4), 12000), // Scene 4 → 5 (9-12s: Map reveal)
      setTimeout(() => {
        // Mark as seen and complete
        localStorage.setItem(RED_CARPET_SEEN_KEY, JSON.stringify({ 
          seenAt: new Date().toISOString() 
        }));
        onComplete?.();
      }, 14000), // Scene 5 complete (12-14s: Entry moment)
    ];

    return () => timers.forEach(clearTimeout);
  }, [open, onComplete]);

  if (!open) return null;

  return (
    <div className="red-carpet-overlay">
      {/* Background Video */}
      <video 
        className="rc-background-video"
        autoPlay 
        muted 
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: scene >= 0 ? 0.4 : 0,
          transition: 'opacity 2s ease',
          filter: 'contrast(1.15) brightness(1.05) saturate(1.1)',
          imageRendering: 'crisp-edges',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        <source src="/RUIDb230dc15b18c43e88c3dd4db8d70a06f.mp4" type="video/mp4" />
      </video>

      {/* Scene 0-1: Arrival (0-3s) */}
      <div className={`rc-scene rc-arrival ${scene >= 0 ? "active" : ""}`}>
        <div className="rc-building">
          <div className="rc-facade">
            <div className="rc-gold-trim rc-gold-trim-top" />
            <div className="rc-gold-trim rc-gold-trim-bottom" />
          </div>
        </div>
      </div>

      {/* Scene 2: Doors Open (3-6s) */}
      <div className={`rc-scene rc-doors ${scene >= 1 ? "active" : ""}`}>
        <div className="rc-door-container">
          <div className="rc-door rc-door-left" />
          <div className="rc-door rc-door-right" />
          <div className="rc-glow" />
        </div>
      </div>

      {/* Scene 3: Unmarked Stores (6-9s) */}
      <div className={`rc-scene rc-stores ${scene >= 2 ? "active" : ""}`}>
        <div className="rc-interior">
          <div className="rc-store rc-store-1" />
          <div className="rc-store rc-store-2" />
          <div className="rc-store rc-store-3" />
          <div className="rc-store rc-store-4" />
        </div>
      </div>

      {/* Scene 4: Map Reveal (9-12s) */}
      <div className={`rc-scene rc-map ${scene >= 3 ? "active" : ""}`}>
        <div className="rc-map-container">
          <div className="rc-map-node rc-node-grocery" data-label="Grocery" />
          <div className="rc-map-node rc-node-workout" data-label="Workout" />
          <div className="rc-map-node rc-node-meal" data-label="Meal Planning" />
          <div className="rc-map-node rc-node-lab" data-label="Grocery Lab" />
        </div>
      </div>

      {/* Scene 5: Entry Moment (12-14s) */}
      <div className={`rc-scene rc-entry ${scene >= 4 ? "active" : ""}`}>
        <div className="rc-entry-text">Choose your destination.</div>
      </div>

      <style>{`
        .red-carpet-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #0a0a0a;
          z-index: 10000;
          overflow: hidden;
        }

        .rc-scene {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 1.2s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rc-scene.active {
          opacity: 1;
        }

        /* Scene 1: Arrival */
        .rc-arrival {
          background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
        }

        .rc-building {
          animation: walkForward 3s ease-out;
        }

        .rc-facade {
          width: 400px;
          height: 500px;
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
          border-radius: 8px;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        }

        .rc-gold-trim {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #b8860b, #ffd700, #b8860b);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
        }

        .rc-gold-trim-top { top: 0; }
        .rc-gold-trim-bottom { bottom: 0; }

        @keyframes walkForward {
          0% {
            transform: scale(0.6) translateY(50px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        /* Scene 2: Doors Open */
        .rc-doors {
          background: #0f0f0f;
        }

        .rc-door-container {
          position: relative;
          width: 500px;
          height: 600px;
        }

        .rc-door {
          position: absolute;
          top: 0;
          width: 250px;
          height: 100%;
          background: linear-gradient(180deg, rgba(30, 30, 30, 0.95), rgba(20, 20, 20, 0.98));
          backdrop-filter: blur(10px);
          transition: transform 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .rc-door-left {
          left: 0;
          border-radius: 0 4px 4px 0;
        }

        .rc-door-right {
          right: 0;
          border-radius: 4px 0 0 4px;
        }

        .rc-doors.active .rc-door-left {
          transform: translateX(-100%);
        }

        .rc-doors.active .rc-door-right {
          transform: translateX(100%);
        }

        .rc-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
          opacity: 0;
          animation: glowPulse 2s ease-in-out forwards;
          animation-delay: 1s;
        }

        @keyframes glowPulse {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        /* Scene 3: Unmarked Stores */
        .rc-stores {
          background: #0a0a0a;
        }

        .rc-interior {
          display: grid;
          grid-template-columns: repeat(2, 200px);
          gap: 40px;
        }

        .rc-store {
          width: 200px;
          height: 250px;
          background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          opacity: 0;
          transform: translateY(30px);
        }

        .rc-stores.active .rc-store {
          animation: storeReveal 0.8s ease-out forwards;
        }

        .rc-store-1 { animation-delay: 0.1s; }
        .rc-store-2 { animation-delay: 0.2s; }
        .rc-store-3 { animation-delay: 0.3s; }
        .rc-store-4 { animation-delay: 0.4s; }

        @keyframes storeReveal {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Scene 4: Map Reveal */
        .rc-map {
          background: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%);
        }

        .rc-map-container {
          position: relative;
          width: 500px;
          height: 500px;
        }

        .rc-map-node {
          position: absolute;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
          border: 2px solid rgba(255, 215, 0, 0.4);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0);
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
        }

        .rc-map-node::after {
          content: attr(data-label);
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.75rem;
          color: rgba(255, 215, 0, 0.8);
          white-space: nowrap;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .rc-map.active .rc-map-node {
          animation: nodeReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .rc-node-grocery {
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: 0.1s;
        }

        .rc-node-workout {
          top: 50%;
          left: 15%;
          animation-delay: 0.2s;
        }

        .rc-node-meal {
          top: 50%;
          right: 15%;
          animation-delay: 0.3s;
        }

        .rc-node-lab {
          bottom: 20%;
          left: 50%;
          transform: translateX(-50%);
          animation-delay: 0.4s;
        }

        @keyframes nodeReveal {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Scene 5: Entry Moment */
        .rc-entry {
          background: #0a0a0a;
        }

        .rc-entry-text {
          font-size: 1.8rem;
          font-weight: 300;
          color: #ffd700;
          letter-spacing: 1px;
          opacity: 0;
          transform: translateY(20px);
          text-align: center;
        }

        .rc-entry.active .rc-entry-text {
          animation: entryReveal 1.5s ease-out forwards;
        }

        @keyframes entryReveal {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Ambient sound cue placeholder */
        .rc-doors.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .rc-facade {
            width: 300px;
            height: 400px;
          }

          .rc-door-container {
            width: 350px;
            height: 450px;
          }

          .rc-door {
            width: 175px;
          }

          .rc-interior {
            grid-template-columns: repeat(2, 150px);
            gap: 20px;
          }

          .rc-store {
            width: 150px;
            height: 200px;
          }

          .rc-map-container {
            width: 350px;
            height: 350px;
          }

          .rc-map-node {
            width: 60px;
            height: 60px;
          }

          .rc-entry-text {
            font-size: 1.4rem;
            padding: 0 20px;
          }
        }
      `}</style>
    </div>
  );
}

export { RED_CARPET_SEEN_KEY };
