// src/assets/components/BetaGate.jsx
import React, { useState } from "react";
import "./BetaGate.css";

export default function BetaGate({ children }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user already has beta access
    return localStorage.getItem("beta_access") === "true";
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // TODO: Replace with your actual beta codes or backend validation
    const validCodes = [
      "BETA2026",
      "3CMALL",
      "EARLYACCESS"
    ];

    if (validCodes.includes(code.toUpperCase())) {
      localStorage.setItem("beta_access", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid beta code. Please check your invitation email.");
    }
  };

  // If authenticated, show the app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise, show beta gate
  return (
    <div className="beta-gate">
      <div className="beta-gate-content">
        <div className="beta-gate-logo">
          <img src="/icons/3c-mall.png" alt="3C Mall" className="beta-logo-img" />
        </div>
        
        <h1 className="beta-gate-title">🔒 Beta Access Required</h1>
        
        <p className="beta-gate-desc">
          The 3C Mall app is currently in closed beta. Enter your beta code to continue.
        </p>

        <form onSubmit={handleSubmit} className="beta-gate-form">
          <input
            type="text"
            placeholder="Enter your beta code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="beta-gate-input"
            autoFocus
          />
          
          {error && <p className="beta-gate-error">{error}</p>}
          
          <button type="submit" className="beta-gate-btn">
            Access Beta
          </button>
        </form>

        <div className="beta-gate-footer">
          <p className="beta-gate-note">Don't have a code?</p>
          <a href="https://the3cmall.com" className="beta-gate-link">
            Join the waitlist →
          </a>
        </div>
      </div>
    </div>
  );
}
