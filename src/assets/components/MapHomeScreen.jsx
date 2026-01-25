// src/assets/components/MapHomeScreen.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON } from "../../utils/Storage";

const LAST_DESTINATION_KEY = "lastDestination.v1";

/**
 * The Map Is the Home Screen
 * Luxury is repetition with permission, not force.
 * Users choose their destination — no forced workflows.
 */
export default function MapHomeScreen() {
  const nav = useNavigate();
  const [lastDestination, setLastDestination] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const last = readJSON(LAST_DESTINATION_KEY, null);
    setLastDestination(last);
  }, []);

  const destinations = [
    {
      id: "grocery-lab",
      label: "Grocery Lab",
      route: "/app/grocery-lab",
      icon: "🛒",
      color: "rgba(0, 217, 255, 0.15)",
      position: { top: "20%", left: "50%" },
    },
    {
      id: "meal-planner",
      label: "Meal Planning",
      route: "/app/meal-planner",
      icon: "🍽️",
      color: "rgba(255, 187, 0, 0.15)",
      position: { top: "50%", right: "15%" },
    },
    {
      id: "fitness",
      label: "Workout",
      route: "/app/fitness",
      icon: "💪",
      color: "rgba(126, 224, 255, 0.15)",
      position: { top: "50%", left: "15%" },
    },
    {
      id: "community",
      label: "Community",
      route: "/app/community",
      icon: "👥",
      color: "rgba(178, 102, 255, 0.15)",
      position: { bottom: "20%", left: "50%" },
    },
  ];

  const handleDestinationClick = (dest) => {
    setSelectedNode(dest.id);
    
    // Save as last destination
    writeJSON(LAST_DESTINATION_KEY, {
      id: dest.id,
      label: dest.label,
      route: dest.route,
      visitedAt: new Date().toISOString(),
    });

    // Small delay for visual feedback, then navigate
    setTimeout(() => {
      nav(dest.route);
    }, 400);
  };

  const handleContinue = () => {
    if (lastDestination?.route) {
      nav(lastDestination.route);
    }
  };

  return (
    <div className="map-home-screen">
      {/* Subtle top bar with profile access */}
      <div className="map-header">
        <div className="map-brand">3C Mall</div>
        <button 
          className="map-profile-btn"
          onClick={() => nav("/app/profile")}
          aria-label="Profile"
        >
          <span className="profile-icon">👤</span>
        </button>
      </div>

      {/* Main map container */}
      <div className="map-container">
        <div className="map-canvas">
          {destinations.map((dest) => (
            <button
              key={dest.id}
              className={`map-node ${selectedNode === dest.id ? "selected" : ""} ${
                lastDestination?.id === dest.id ? "last-visited" : ""
              }`}
              style={{
                ...dest.position,
                background: dest.color,
              }}
              onClick={() => handleDestinationClick(dest)}
              aria-label={`Navigate to ${dest.label}`}
            >
              <span className="map-node-icon">{dest.icon}</span>
              <span className="map-node-label">{dest.label}</span>
              {lastDestination?.id === dest.id && (
                <span className="map-node-badge">Last</span>
              )}
            </button>
          ))}

          {/* Connection lines (subtle) */}
          <svg className="map-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="50" y1="20" x2="15" y2="50" stroke="rgba(255, 215, 0, 0.1)" strokeWidth="0.5" />
            <line x1="50" y1="20" x2="85" y2="50" stroke="rgba(255, 215, 0, 0.1)" strokeWidth="0.5" />
            <line x1="50" y1="20" x2="50" y2="80" stroke="rgba(255, 215, 0, 0.1)" strokeWidth="0.5" />
            <line x1="15" y1="50" x2="50" y2="80" stroke="rgba(255, 215, 0, 0.1)" strokeWidth="0.5" />
            <line x1="85" y1="50" x2="50" y2="80" stroke="rgba(255, 215, 0, 0.1)" strokeWidth="0.5" />
          </svg>
        </div>
      </div>

      {/* Footer actions */}
      <div className="map-footer">
        {lastDestination && (
          <button
            className="map-action-btn map-continue-btn"
            onClick={handleContinue}
          >
            Continue where I left off
            <span className="action-hint">{lastDestination.label}</span>
          </button>
        )}
        
        <div className="map-tagline">Choose your destination.</div>
      </div>

      <style>{`
        .map-home-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(255, 215, 0, 0.1);
        }

        .map-brand {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gold, #ffd700);
          letter-spacing: 0.5px;
        }

        .map-profile-btn {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .map-profile-btn:hover {
          background: rgba(255, 215, 0, 0.2);
          border-color: rgba(255, 215, 0, 0.5);
          transform: scale(1.05);
        }

        .profile-icon {
          font-size: 1.25rem;
        }

        .map-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }

        .map-canvas {
          position: relative;
          width: 100%;
          max-width: 600px;
          height: 100%;
          max-height: 500px;
        }

        .map-connections {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .map-node {
          position: absolute;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          border: 2px solid rgba(255, 215, 0, 0.4);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
          z-index: 1;
          background-clip: padding-box;
        }

        .map-node:hover {
          transform: translate(-50%, -50%) scale(1.1);
          border-color: rgba(255, 215, 0, 0.7);
          box-shadow: 0 0 50px rgba(255, 215, 0, 0.4);
        }

        .map-node.selected {
          transform: translate(-50%, -50%) scale(0.95);
          border-color: rgba(255, 215, 0, 0.9);
        }

        .map-node.last-visited {
          border-width: 3px;
        }

        .map-node-icon {
          font-size: 2rem;
        }

        .map-node-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          text-align: center;
          letter-spacing: 0.3px;
        }

        .map-node-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255, 215, 0, 0.9);
          color: #0a0a0a;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 10px;
          letter-spacing: 0.5px;
        }

        .map-footer {
          padding: 1.5rem 2rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          border-top: 1px solid rgba(255, 215, 0, 0.1);
        }

        .map-action-btn {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.4);
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .map-action-btn:hover {
          background: rgba(255, 215, 0, 0.2);
          border-color: rgba(255, 215, 0, 0.6);
          transform: translateY(-2px);
        }

        .action-hint {
          font-size: 0.75rem;
          opacity: 0.7;
          font-weight: 400;
        }

        .map-tagline {
          font-size: 1.1rem;
          font-weight: 300;
          color: rgba(255, 215, 0, 0.8);
          letter-spacing: 0.5px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .map-header {
            padding: 1rem 1.5rem;
          }

          .map-brand {
            font-size: 1.1rem;
          }

          .map-canvas {
            max-width: 400px;
            max-height: 400px;
          }

          .map-node {
            width: 90px;
            height: 90px;
          }

          .map-node-icon {
            font-size: 1.5rem;
          }

          .map-node-label {
            font-size: 0.75rem;
          }

          .map-footer {
            padding: 1rem 1.5rem 1.5rem;
          }

          .map-tagline {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .map-node {
            width: 75px;
            height: 75px;
          }

          .map-node-icon {
            font-size: 1.3rem;
          }

          .map-node-label {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
}
