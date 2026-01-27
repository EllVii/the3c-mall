// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON } from "../utils/Storage";
import "../styles/ProfilePage.css";

const PROFILE_KEY = "concierge.profile.v1";
const CONCIERGE_HIDDEN_KEY = "concierge.hidden.v1";

export default function ProfilePage() {
  const nav = useNavigate();
  const [profile, setProfile] = useState(() => readJSON(PROFILE_KEY, null));
  const [conciergeHidden, setConciergeHidden] = useState(() => 
    readJSON(CONCIERGE_HIDDEN_KEY, false)
  );

  const handleBack = () => {
    nav("/app/map");
  };

  const handleSettings = () => {
    nav("/app/settings");
  };

  const toggleConciergeVisibility = () => {
    const newState = !conciergeHidden;
    setConciergeHidden(newState);
    writeJSON(CONCIERGE_HIDDEN_KEY, newState);
  };

  if (!profile) {
    return (
      <div className="page profile-page">
        <div className="profile-container">
          <div className="card glass">
            <h2>Profile Not Found</h2>
            <p>Please complete onboarding to create your profile.</p>
            <button className="btn btn-primary" onClick={() => nav("/app")}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <div className="profile-container">
        {/* Back button */}
        <button className="profile-back-btn" onClick={handleBack}>
          ← Back to Map
        </button>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="profile-avatar-icon">👤</span>
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">{profile.firstName}</h1>
            <p className="profile-email">Member Account</p>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="profile-actions-grid">
          {/* Settings Button */}
          <button className="profile-action-card" onClick={handleSettings}>
            <div className="profile-action-icon">⚙️</div>
            <div className="profile-action-content">
              <div className="profile-action-title">Settings</div>
              <div className="profile-action-desc">Theme, preferences, and more</div>
            </div>
          </button>

          {/* Concierge Hide/Show Toggle */}
          <button className="profile-action-card" onClick={toggleConciergeVisibility}>
            <div className="profile-action-icon">
              {conciergeHidden ? "👁️" : "🙈"}
            </div>
            <div className="profile-action-content">
              <div className="profile-action-title">
                {conciergeHidden ? "Show Concierge" : "Hide Concierge"}
              </div>
              <div className="profile-action-desc">
                {conciergeHidden 
                  ? "Enable floating concierge assistant" 
                  : "Disable floating concierge assistant"}
              </div>
            </div>
          </button>
        </div>

        {/* Profile Details */}
        <div className="profile-details">
          <h2 className="profile-section-title">Your Preferences</h2>
          
          <div className="profile-detail-item">
            <span className="profile-detail-label">Shopping Style</span>
            <span className="profile-detail-value">
              {profile.shoppingMode === "best_price" ? "Best Price" : 
               profile.shoppingMode === "loyal" ? "Store Loyal" : 
               "Balanced"}
            </span>
          </div>
          
          {profile.defaultStoreId && profile.defaultStoreId !== "not_sure" && (
            <div className="profile-detail-item">
              <span className="profile-detail-label">Default Store</span>
              <span className="profile-detail-value">
                {profile.defaultStoreId.charAt(0).toUpperCase() + profile.defaultStoreId.slice(1)}
              </span>
            </div>
          )}
          
          {profile.birthMonth && (
            <div className="profile-detail-item">
              <span className="profile-detail-label">Birthday</span>
              <span className="profile-detail-value">{profile.birthMonth}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
