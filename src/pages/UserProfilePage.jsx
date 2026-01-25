// src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON } from "../utils/Storage";
import { formatDate, formatTime } from "../utils/formatters";

const PROFILE_KEY = "concierge.profile.v1";
const ACTIVITY_KEY = "userActivity.v1";

/**
 * User Profile Page
 * Luxury concierge structure:
 * 1. User Identity Card
 * 2. "Job Done" Box (today's completions)
 * 3. Settings (below the fold - calm, secondary)
 */
export default function UserProfilePage() {
  const nav = useNavigate();
  const [profile, setProfile] = useState(() => readJSON(PROFILE_KEY, null));
  const [activity, setActivity] = useState(() => readJSON(ACTIVITY_KEY, []));
  const [showSettings, setShowSettings] = useState(false);

  const todayCompletions = useMemo(() => {
    const today = new Date().toDateString();
    return activity.filter((item) => {
      const itemDate = new Date(item.completedAt).toDateString();
      return itemDate === today;
    });
  }, [activity]);

  const handleBack = () => {
    nav("/app");
  };

  const handleEditProfile = () => {
    nav("/app/settings");
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

        {/* 1. User Identity Card */}
        <div className="profile-identity-card">
          <div className="profile-avatar">
            <span className="profile-avatar-icon">👤</span>
          </div>
          
          <div className="profile-identity-content">
            <h1 className="profile-name">{profile.firstName}</h1>
            
            <div className="profile-preferences">
              <div className="profile-pref-item">
                <span className="pref-label">Shopping Style</span>
                <span className="pref-value">
                  {profile.shoppingMode === "best_price" ? "Best Price" : 
                   profile.shoppingMode === "loyal" ? "Store Loyal" : 
                   "Balanced"}
                </span>
              </div>
              
              {profile.defaultStoreId && profile.defaultStoreId !== "not_sure" && (
                <div className="profile-pref-item">
                  <span className="pref-label">Default Store</span>
                  <span className="pref-value">
                    {profile.defaultStoreId.charAt(0).toUpperCase() + profile.defaultStoreId.slice(1)}
                  </span>
                </div>
              )}
              
              {profile.birthMonth && (
                <div className="profile-pref-item">
                  <span className="pref-label">Birthday</span>
                  <span className="pref-value">{profile.birthMonth}</span>
                </div>
              )}
            </div>

            <div className="profile-meta">
              Member since {formatDate(profile.createdAt || new Date().toISOString())}
            </div>
          </div>
        </div>

        {/* 2. "Job Done" Box */}
        <div className="profile-job-done">
          <div className="job-done-header">
            <h2 className="job-done-title">Today's Progress</h2>
            <span className="job-done-count">{todayCompletions.length}</span>
          </div>
          
          {todayCompletions.length > 0 ? (
            <div className="job-done-list">
              {todayCompletions.map((item, idx) => (
                <div key={idx} className="job-done-item">
                  <span className="job-done-icon">✓</span>
                  <div className="job-done-content">
                    <div className="job-done-label">{item.label}</div>
                    <div className="job-done-time">
                      {formatTime(item.completedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="job-done-empty">
              <p>No completed tasks today. Start exploring!</p>
            </div>
          )}
        </div>

        {/* 3. Settings Toggle (Below the Fold) */}
        <div className="profile-settings-section">
          <button
            className="profile-settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
          >
            <span>Settings</span>
            <span className="toggle-icon">{showSettings ? "−" : "+"}</span>
          </button>

          {showSettings && (
            <div className="profile-settings-content">
              <div className="settings-group">
                <button
                  className="settings-option"
                  onClick={handleEditProfile}
                >
                  <span className="settings-option-icon">✏️</span>
                  <div className="settings-option-content">
                    <div className="settings-option-label">Edit Profile</div>
                    <div className="settings-option-hint">
                      Update name, store, preferences
                    </div>
                  </div>
                </button>

                <button
                  className="settings-option"
                  onClick={() => nav("/app/settings")}
                >
                  <span className="settings-option-icon">⚙️</span>
                  <div className="settings-option-content">
                    <div className="settings-option-label">App Settings</div>
                    <div className="settings-option-hint">
                      Theme, notifications, display
                    </div>
                  </div>
                </button>

                <button
                  className="settings-option"
                  onClick={() => {
                    localStorage.removeItem("redCarpet.seen.v1");
                    localStorage.removeItem(PROFILE_KEY);
                    nav("/app");
                    window.location.reload();
                  }}
                >
                  <span className="settings-option-icon">↻</span>
                  <div className="settings-option-content">
                    <div className="settings-option-label">Replay Intro Experience</div>
                    <div className="settings-option-hint">
                      See the Red Carpet welcome again
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
          padding: 2rem 1rem;
        }

        .profile-container {
          max-width: 700px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .profile-back-btn {
          background: transparent;
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          padding: 0.75rem 1.25rem;
          color: rgba(255, 215, 0, 0.9);
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          align-self: flex-start;
        }

        .profile-back-btn:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.5);
        }

        /* 1. Identity Card */
        .profile-identity-card {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.02) 100%);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 12px;
          padding: 2rem;
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 215, 0, 0.15);
          border: 2px solid rgba(255, 215, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .profile-avatar-icon {
          font-size: 2.5rem;
        }

        .profile-identity-content {
          flex: 1;
        }

        .profile-name {
          font-size: 2rem;
          font-weight: 700;
          color: var(--gold, #ffd700);
          margin: 0 0 1rem 0;
          letter-spacing: 0.5px;
        }

        .profile-preferences {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .profile-pref-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pref-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }

        .pref-value {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }

        .profile-meta {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 1rem;
        }

        /* 2. Job Done Box */
        .profile-job-done {
          background: rgba(0, 217, 255, 0.08);
          border: 1px solid rgba(0, 217, 255, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .job-done-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(0, 217, 255, 0.2);
        }

        .job-done-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: rgba(0, 217, 255, 0.9);
          margin: 0;
        }

        .job-done-count {
          background: rgba(0, 217, 255, 0.2);
          color: rgba(0, 217, 255, 1);
          font-size: 1.1rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .job-done-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .job-done-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(0, 217, 255, 0.05);
          border-radius: 8px;
        }

        .job-done-icon {
          font-size: 1.25rem;
          color: rgba(0, 217, 255, 0.8);
        }

        .job-done-content {
          flex: 1;
        }

        .job-done-label {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        .job-done-time {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 0.15rem;
        }

        .job-done-empty {
          text-align: center;
          padding: 2rem 1rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .job-done-empty p {
          margin: 0;
          font-size: 0.95rem;
        }

        /* 3. Settings Section */
        .profile-settings-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
        }

        .profile-settings-toggle {
          width: 100%;
          background: transparent;
          border: none;
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .profile-settings-toggle:hover {
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.9);
        }

        .toggle-icon {
          font-size: 1.5rem;
          color: rgba(255, 215, 0, 0.6);
        }

        .profile-settings-content {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1rem;
        }

        .settings-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .settings-option {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .settings-option:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 215, 0, 0.3);
        }

        .settings-option-icon {
          font-size: 1.5rem;
        }

        .settings-option-content {
          flex: 1;
        }

        .settings-option-label {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .settings-option-hint {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .profile-page {
            padding: 1.5rem 1rem;
          }

          .profile-identity-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 1.5rem;
          }

          .profile-name {
            font-size: 1.5rem;
          }

          .profile-avatar {
            width: 70px;
            height: 70px;
          }

          .profile-avatar-icon {
            font-size: 2rem;
          }

          .profile-pref-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .job-done-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
