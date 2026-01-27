// src/assets/components/MapHomeScreen.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON } from "../../utils/Storage";

const LAST_DESTINATION_KEY = "lastDestination.v1";

/**
 * The Map Is the Home Screen
 * Luxury mall directory kiosk interface
 * Users choose their destination — no forced workflows.
 */
export default function MapHomeScreen() {
  const nav = useNavigate();
  const [lastDestination, setLastDestination] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const last = readJSON(LAST_DESTINATION_KEY, null);
    setLastDestination(last);
  }, []);

  // Mall zones with their locations and destinations
  const zones = [
    {
      id: "north-wing",
      name: "North Wing",
      section: "NORTH",
      stores: [
        { id: "grocery-lab", label: "Grocery Stores", icon: "🛒", route: "/app/grocery-lab" },
      ],
    },
    {
      id: "east-wing",
      name: "East Wing",
      section: "EAST",
      stores: [
        { id: "meal-planner", label: "Meal Planning", icon: "🍽️", route: "/app/meal-planner" },
      ],
    },
    {
      id: "west-wing",
      name: "West Wing",
      section: "WEST",
      stores: [
        { id: "fitness", label: "Fitness Zone", icon: "💪", route: "/app/fitness" },
      ],
    },
    {
      id: "south-wing",
      name: "South Wing",
      section: "SOUTH",
      stores: [
        { id: "community", label: "Community", icon: "👥", route: "/app/community" },
      ],
    },
  ];

  // Flatten all stores for quick access
  const allStores = zones.flatMap(zone => 
    zone.stores.map(store => ({ ...store, zone: zone.id, zoneName: zone.name }))
  );

  const handleStoreClick = (store) => {
    setSelectedZone(store.id);
    
    // Save as last destination
    writeJSON(LAST_DESTINATION_KEY, {
      id: store.id,
      label: store.label,
      route: store.route,
      visitedAt: new Date().toISOString(),
    });

    // Small delay for visual feedback, then navigate
    setTimeout(() => {
      nav(store.route);
    }, 400);
  };

  const handleZoneClick = (zone) => {
    // If zone has only one store, go directly there
    if (zone.stores.length === 1) {
      handleStoreClick(zone.stores[0]);
    }
  };

  const handleContinue = () => {
    if (lastDestination?.route) {
      nav(lastDestination.route);
    }
  };

  const isStoreLastVisited = (storeId) => {
    return lastDestination?.id === storeId;
  };

  return (
    <div className="map-home-screen">
      {/* Subtle top bar with profile access */}
      <div className="map-header">
        <div className="map-brand">3C MALL</div>
        <button 
          className="map-profile-btn"
          onClick={() => nav("/app/profile")}
          aria-label="Profile"
        >
          <span className="profile-icon">👤</span>
        </button>
      </div>

      {/* Main mall directory container */}
      <div className="map-container">
        <div className="directory-kiosk">
          {/* Directory Header */}
          <div className="directory-header">
            <div className="directory-title">DIRECTORY</div>
          </div>

          {/* Mall Floor Plan (3D isometric style) */}
          <div className="directory-display" style={{
            backgroundImage: imageLoaded ? 'url(/RUIDd533a251cbb24608833e7205326c34bd.png)' : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative'
          }}>
            {/* Preload image */}
            <img 
              src="/RUIDd533a251cbb24608833e7205326c34bd.png" 
              alt=""
              onLoad={() => setImageLoaded(true)}
              style={{ display: 'none' }}
            />
            
            {/* Overlay for better text readability */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.85) 0%, rgba(26, 26, 26, 0.75) 100%)',
              zIndex: 0
            }} />
            
            <div className="floor-plan">
              {/* North Wing - Top */}
              <div 
                className={`floor-wing floor-north ${hoveredZone === 'north-wing' ? 'hovered' : ''}`}
                onClick={() => handleZoneClick(zones[0])}
                onMouseEnter={() => setHoveredZone('north-wing')}
                onMouseLeave={() => setHoveredZone(null)}
              >
                <div className="wing-zone-label">GROCERY STORES</div>
                <div className="wing-icon">🛒</div>
                {isStoreLastVisited('grocery-lab') && <div className="wing-indicator">●</div>}
              </div>

              {/* West Wing - Left */}
              <div 
                className={`floor-wing floor-west ${hoveredZone === 'west-wing' ? 'hovered' : ''}`}
                onClick={() => handleZoneClick(zones[2])}
                onMouseEnter={() => setHoveredZone('west-wing')}
                onMouseLeave={() => setHoveredZone(null)}
              >
                <div className="wing-zone-label">FITNESS ZONE</div>
                <div className="wing-icon">💪</div>
                {isStoreLastVisited('fitness') && <div className="wing-indicator">●</div>}
              </div>

              {/* Center Atrium */}
              <div className="floor-center">
                <div className="center-icon">✦</div>
                <div className="center-label">YOU ARE HERE</div>
              </div>

              {/* East Wing - Right */}
              <div 
                className={`floor-wing floor-east ${hoveredZone === 'east-wing' ? 'hovered' : ''}`}
                onClick={() => handleZoneClick(zones[1])}
                onMouseEnter={() => setHoveredZone('east-wing')}
                onMouseLeave={() => setHoveredZone(null)}
              >
                <div className="wing-zone-label">MEAL PLANNING</div>
                <div className="wing-icon">🍽️</div>
                {isStoreLastVisited('meal-planner') && <div className="wing-indicator">●</div>}
              </div>

              {/* South Wing - Bottom */}
              <div 
                className={`floor-wing floor-south ${hoveredZone === 'south-wing' ? 'hovered' : ''}`}
                onClick={() => handleZoneClick(zones[3])}
                onMouseEnter={() => setHoveredZone('south-wing')}
                onMouseLeave={() => setHoveredZone(null)}
              >
                <div className="wing-zone-label">COMMUNITY</div>
                <div className="wing-icon">👥</div>
                {isStoreLastVisited('community') && <div className="wing-indicator">●</div>}
              </div>
            </div>
          </div>

          {/* Directory Navigation Buttons */}
          <div className="directory-nav">
            {allStores.map((store) => (
              <button
                key={store.id}
                className={`directory-btn ${isStoreLastVisited(store.id) ? 'active' : ''} ${selectedZone === store.id ? 'selected' : ''}`}
                onClick={() => handleStoreClick(store)}
              >
                <span className="btn-icon">{store.icon}</span>
                <span className="btn-label">{store.label}</span>
                {isStoreLastVisited(store.id) && <span className="btn-indicator">●</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="map-footer">
        {lastDestination && (
          <button
            className="map-action-btn"
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
          background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(0, 0, 0, 0.85);
          border-bottom: 2px solid #d4af37;
        }

        .map-brand {
          font-size: 1.25rem;
          font-weight: 700;
          color: #d4af37;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .map-profile-btn {
          background: rgba(212, 175, 55, 0.15);
          border: 2px solid #d4af37;
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
          background: rgba(212, 175, 55, 0.3);
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
          overflow-y: auto;
        }

        /* Directory Kiosk */
        .directory-kiosk {
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
          border: 4px solid #d4af37;
          border-radius: 16px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(212, 175, 55, 0.5);
          max-width: 800px;
          width: 100%;
          overflow: hidden;
        }

        .directory-header {
          background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
          border-bottom: 3px solid #d4af37;
          padding: 1.5rem;
          text-align: center;
          position: relative;
        }

        .directory-header::before,
        .directory-header::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 30px;
          height: 30px;
          border: 2px solid #d4af37;
          border-radius: 50%;
          transform: translateY(-50%);
        }

        .directory-header::before {
          left: 2rem;
        }

        .directory-header::after {
          right: 2rem;
        }

        .directory-title {
          font-size: 2rem;
          font-weight: 900;
          color: #d4af37;
          letter-spacing: 4px;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        /* Display Area */
        .directory-display {
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
          padding: 2.5rem;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 2px solid rgba(212, 175, 55, 0.3);
        }

        /* Floor Plan (3D isometric style) */
        .floor-plan {
          position: relative;
          display: grid;
          grid-template-columns: 140px 180px 140px;
          grid-template-rows: 100px 180px 100px;
          gap: 15px;
          perspective: 1000px;
        }

        .floor-wing {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
          border: 2px solid rgba(212, 175, 55, 0.4);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          transform-style: preserve-3d;
        }

        .floor-wing::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(212, 175, 55, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .floor-wing:hover::before {
          opacity: 1;
        }

        .floor-wing:hover {
          border-color: #d4af37;
          transform: translateY(-4px) scale(1.02);
          box-shadow: 
            0 8px 24px rgba(212, 175, 55, 0.4),
            inset 0 0 30px rgba(212, 175, 55, 0.1);
        }

        .floor-wing.hovered {
          border-width: 3px;
          border-color: #d4af37;
        }

        .floor-north { grid-column: 2; grid-row: 1; }
        .floor-west { grid-column: 1; grid-row: 2; }
        .floor-center { 
          grid-column: 2; 
          grid-row: 2;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%);
          border: 2px solid rgba(212, 175, 55, 0.5);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          pointer-events: none;
          box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
        }
        .floor-east { grid-column: 3; grid-row: 2; }
        .floor-south { grid-column: 2; grid-row: 3; }

        .wing-zone-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #d4af37;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-align: center;
          margin-bottom: 0.25rem;
          z-index: 1;
        }

        .wing-icon {
          font-size: 1.5rem;
          z-index: 1;
        }

        .wing-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          color: #d4af37;
          font-size: 1.2rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .center-icon {
          font-size: 2rem;
          color: #d4af37;
        }

        .center-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: rgba(212, 175, 55, 0.8);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Directory Navigation Buttons */
        .directory-nav {
          background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
          padding: 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
        }

        .directory-btn {
          background: rgba(212, 175, 55, 0.05);
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .directory-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(212, 175, 55, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .directory-btn:hover::before {
          opacity: 1;
        }

        .directory-btn:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.6);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .directory-btn.active {
          background: rgba(212, 175, 55, 0.2);
          border-color: #d4af37;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
        }

        .directory-btn.selected {
          transform: scale(0.98);
        }

        .btn-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
          z-index: 1;
        }

        .btn-label {
          flex: 1;
          font-size: 0.95rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          text-align: left;
          z-index: 1;
        }

        .btn-indicator {
          color: #d4af37;
          font-size: 1.2rem;
          animation: pulse 2s ease-in-out infinite;
          z-index: 1;
        }

        /* Footer */
        .map-footer {
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          background: rgba(0, 0, 0, 0.85);
          border-top: 2px solid #d4af37;
        }

        .map-action-btn {
          background: rgba(212, 175, 55, 0.15);
          border: 2px solid #d4af37;
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
          background: rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
        }

        .action-hint {
          font-size: 0.75rem;
          opacity: 0.7;
          font-weight: 400;
        }

        .map-tagline {
          font-size: 1.1rem;
          font-weight: 300;
          color: #d4af37;
          letter-spacing: 1px;
          text-align: center;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 1024px) {
          .directory-kiosk {
            max-width: 600px;
          }

          .floor-plan {
            grid-template-columns: 110px 150px 110px;
            grid-template-rows: 85px 150px 85px;
            gap: 12px;
          }
        }

        @media (max-width: 768px) {
          .map-header {
            padding: 1rem 1.5rem;
          }

          .map-brand {
            font-size: 1rem;
          }

          .map-container {
            padding: 1rem;
          }

          .directory-title {
            font-size: 1.5rem;
            letter-spacing: 3px;
          }

          .directory-header::before,
          .directory-header::after {
            width: 24px;
            height: 24px;
          }

          .directory-header::before { left: 1rem; }
          .directory-header::after { right: 1rem; }

          .directory-display {
            padding: 1.5rem;
            min-height: 320px;
          }

          .floor-plan {
            grid-template-columns: 90px 130px 90px;
            grid-template-rows: 75px 130px 75px;
            gap: 10px;
          }

          .wing-zone-label {
            font-size: 0.6rem;
          }

          .wing-icon {
            font-size: 1.25rem;
          }

          .center-icon {
            font-size: 1.5rem;
          }

          .center-label {
            font-size: 0.55rem;
          }

          .directory-nav {
            grid-template-columns: 1fr;
            padding: 1rem;
          }

          .map-footer {
            padding: 1rem 1.5rem;
          }

          .map-tagline {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .directory-title {
            font-size: 1.2rem;
            letter-spacing: 2px;
          }

          .directory-header::before,
          .directory-header::after {
            width: 20px;
            height: 20px;
          }

          .floor-plan {
            grid-template-columns: 75px 110px 75px;
            grid-template-rows: 65px 110px 65px;
            gap: 8px;
          }

          .wing-zone-label {
            font-size: 0.5rem;
          }

          .wing-icon {
            font-size: 1rem;
          }

          .directory-btn {
            padding: 0.75rem;
          }

          .btn-icon {
            font-size: 1.25rem;
          }

          .btn-label {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}
