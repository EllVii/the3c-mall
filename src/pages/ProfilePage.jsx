// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON } from "../utils/Storage";
import VideoIntro, { VIDEO_INTRO_SEEN_KEY } from "../assets/components/VideoIntro.jsx";
import "../styles/ProfilePage.css";

const PROFILE_KEY = "concierge.profile.v1";
const CONCIERGE_HIDDEN_KEY = "concierge.hidden.v1";
const ACTIVITY_KEY = "userActivity.v1";

export default function ProfilePage() {
  const nav = useNavigate();
  const [profile, setProfile] = useState(() => readJSON(PROFILE_KEY, null));
  const [conciergeHidden, setConciergeHidden] = useState(() => 
    readJSON(CONCIERGE_HIDDEN_KEY, false)
  );
  const [activity, setActivity] = useState(() => readJSON(ACTIVITY_KEY, []));
  const [activeTab, setActiveTab] = useState("overview");

  // Video Intro - shows on first visit to /app/profile
  const [showVideoIntro, setShowVideoIntro] = useState(() => {
    const hasSeenIntro = readJSON(VIDEO_INTRO_SEEN_KEY, null);
    return !hasSeenIntro; // Show if never seen
  });

  // Compute stats from activity
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayActivities = (activity || []).filter((item) => {
      try {
        const itemDate = new Date(item?.completedAt).toDateString();
        return itemDate === today;
      } catch {
        return false;
      }
    });
    
    return {
      todayTasks: todayActivities.length,
      totalTasks: (activity || []).length,
      streak: calculateStreak(activity || []),
      memberSince: profile?.createdAt ? formatMemberSince(profile.createdAt) : "Today"
    };
  }, [activity, profile]);

  // Calculate consecutive days streak
  function calculateStreak(activities) {
    if (!activities || activities.length === 0) return 0;
    
    try {
      const dates = activities
        .map(a => new Date(a?.completedAt).toDateString())
        .filter((date, idx, arr) => arr.indexOf(date) === idx)
        .sort((a, b) => new Date(b) - new Date(a));
      
      let streak = 0;
      const today = new Date().toDateString();
      
      for (let i = 0; i < dates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        if (dates[i] === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    } catch {
      return 0;
    }
  }

  function formatMemberSince(dateStr) {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''}`;
      return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) !== 1 ? 's' : ''}`;
    } catch {
      return "Today";
    }
  }

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

  const formatShoppingMode = (mode) => {
    if (!mode) return "Not Set";
    switch (mode) {
      case "best_price": return "Best Price 💰";
      case "loyal": return "Store Loyal 🏪";
      case "balanced": return "Balanced ⚖️";
      default: return "Not Set";
    }
  };

  const formatStoreName = (storeId) => {
    if (!storeId || storeId === "not_sure") return null;
    return storeId.charAt(0).toUpperCase() + storeId.slice(1);
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
      {/* VIDEO INTRO - shows on first visit to /app/profile */}
      {showVideoIntro && (
        <VideoIntro
          open={showVideoIntro}
          onComplete={() => {
            setShowVideoIntro(false);
            writeJSON(VIDEO_INTRO_SEEN_KEY, true);
          }}
        />
      )}

      <div className="profile-container">
        {/* Back button */}
        <button className="profile-back-btn" onClick={handleBack}>
          ← Back to Map
        </button>

        {/* Profile Header with Enhanced Design */}
        <div className="profile-header">
          <div className="profile-header-main">
            <div className="profile-avatar">
              <span className="profile-avatar-icon">👤</span>
              <div className="profile-avatar-ring"></div>
            </div>
            
            <div className="profile-info">
              <h1 className="profile-name">{profile?.firstName || "Guest"}</h1>
              <p className="profile-subtitle">Premium Member</p>
              <p className="profile-member-since">Member for {stats.memberSince}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.todayTasks}</div>
                <div className="stat-label">Today</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <div className="stat-value">{stats.streak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalTasks}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button 
            className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
          <button 
            className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="profile-tab-content">
            {/* Profile Details */}
            <div className="profile-details">
              <h2 className="profile-section-title">Your Preferences</h2>
              
              <div className="profile-detail-item">
                <span className="profile-detail-label">Shopping Style</span>
                <span className="profile-detail-value">
                  {formatShoppingMode(profile?.shoppingMode)}
                </span>
              </div>
              
              {formatStoreName(profile?.defaultStoreId) && (
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Default Store</span>
                  <span className="profile-detail-value">
                    🏪 {formatStoreName(profile.defaultStoreId)}
                  </span>
                </div>
              )}
              
              {profile?.birthMonth && (
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Birthday</span>
                  <span className="profile-detail-value">🎂 {profile.birthMonth}</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="profile-quick-actions">
              <h2 className="profile-section-title">Quick Actions</h2>
              <div className="profile-actions-grid">
                <button className="profile-action-card" onClick={() => nav('/app/grocery-lab')}>
                  <div className="profile-action-icon">🛒</div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Grocery Lab</div>
                    <div className="profile-action-desc">Start shopping</div>
                  </div>
                </button>

                <button className="profile-action-card" onClick={() => nav('/app/meal-planner')}>
                  <div className="profile-action-icon">🍽️</div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Meal Planner</div>
                    <div className="profile-action-desc">Plan your meals</div>
                  </div>
                </button>

                <button className="profile-action-card" onClick={() => nav('/app/recipes')}>
                  <div className="profile-action-icon">📖</div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Recipes</div>
                    <div className="profile-action-desc">Browse recipes</div>
                  </div>
                </button>

                <button className="profile-action-card" onClick={() => nav('/app/store-locator')}>
                  <div className="profile-action-icon">📍</div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Store Locator</div>
                    <div className="profile-action-desc">Find nearby stores</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="profile-tab-content">
            <div className="profile-activity">
              <h2 className="profile-section-title">Recent Activity</h2>
              
              {activity && activity.length > 0 ? (
                <div className="activity-list">
                  {activity.slice(0, 10).map((item, idx) => {
                    try {
                      const date = new Date(item?.completedAt);
                      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      
                      return (
                        <div key={idx} className="activity-item">
                          <div className="activity-icon">✓</div>
                          <div className="activity-content">
                            <div className="activity-label">{item?.label || 'Task completed'}</div>
                            <div className="activity-time">{dateStr} at {timeStr}</div>
                          </div>
                        </div>
                      );
                    } catch {
                      return null;
                    }
                  }).filter(Boolean)}
                </div>
              ) : (
                <div className="activity-empty">
                  <div className="empty-icon">📋</div>
                  <p>No activity yet. Start exploring to see your history here!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="profile-tab-content">
            {/* Profile Actions */}
            <div className="profile-settings">
              <h2 className="profile-section-title">Account Settings</h2>
              
              <div className="profile-actions-grid">
                <button className="profile-action-card" onClick={handleSettings}>
                  <div className="profile-action-icon">⚙️</div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">App Settings</div>
                    <div className="profile-action-desc">Theme, preferences, and more</div>
                  </div>
                </button>

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
                        ? "Enable floating assistant" 
                        : "Disable floating assistant"}
                    </div>
                  </div>
                </button>

                <button className="profile-action-card" onClick={() => nav('/app')}>
                  <div className="profile-action-icon">🏠</div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Dashboard</div>
                    <div className="profile-action-desc">Return to main dashboard</div>
                  </div>
                </button>

                <button 
                  className="profile-action-card profile-action-danger" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to sign out?')) {
                      localStorage.clear();
                      nav('/login');
                    }
                  }}
                >
                  <div className="profile-action-icon">🚪</div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Sign Out</div>
                    <div className="profile-action-desc">Exit your account</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
