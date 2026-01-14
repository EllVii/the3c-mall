// src/assets/components/BetaGate.jsx
import React, { useState } from "react";
import { reportBetaCodeUsage } from "../../utils/reportingService";
import "./BetaGate.css";

export default function BetaGate({ children }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user already has beta access
    return localStorage.getItem("beta_access") === "true";
  });

  const isCodeFormatValid = (value) => {
    const trimmed = value.trim();
    if (trimmed.length < 6 || trimmed.length > 10) return false;
    if (!/^[A-Za-z0-9]+$/.test(trimmed)) return false;
    return /[A-Za-z]/.test(trimmed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const envCodes = import.meta.env.VITE_BETA_CODES;
    const validCodes = envCodes
      ? envCodes.split(",").map((entry) => entry.trim().toUpperCase()).filter(Boolean)
      : ["BETA2026", "3CMALL", "EARLYACCESS"];
    const trimmed = code.trim();
    const normalized = trimmed.toUpperCase();

    if (!isCodeFormatValid(trimmed)) {
      setError("Invalid code format. Use the 6–10 character code from your invite.");
      return;
    }

    const isValid = validCodes.includes(normalized);

    // Report the attempt (if enabled)
    if (import.meta.env.VITE_REPORT_BETA_CODES === "true") {
      await reportBetaCodeUsage(code, isValid);
    }

    if (isValid) {
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
          The 3C Mall app is currently in closed beta for invited testers only. Join the waitlist on
          the public site if you need access.
        </p>

        <form onSubmit={handleSubmit} className="beta-gate-form">
          <input
            type="text"
            placeholder="Enter your beta code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
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
