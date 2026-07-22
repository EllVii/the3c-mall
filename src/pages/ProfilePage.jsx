// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { readJSON, writeJSON } from "../utils/Storage";
import { useAuth } from "../context/AuthContext.jsx";
import VideoIntro, { VIDEO_INTRO_SEEN_KEY } from "../assets/components/VideoIntro.jsx";
import "../styles/ProfilePage.css";

const PROFILE_KEY = "concierge.profile.v1";
const CONCIERGE_HIDDEN_KEY = "concierge.hidden.v1";
const ACTIVITY_KEY = "userActivity.v1";
const PROFILE_IMAGE_KEY = "profile.image.v1";

const AVATAR_PRESETS = {
  female: ['👩', '👩‍🦰', '👱‍♀️', '👩‍🦱', '🧑‍🦰'],
  male: ['👨', '👨‍🦰', '👱‍♂️', '👨‍🦱', '🧔'],
  girl: ['👧', '👧🏻', '👧🏽'],
  boy: ['👦', '👦🏻', '👦🏽']
};

function ProfileIcon({ name }) {
  const props = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    camera: <><path d="M14.5 5 13 3h-2L9.5 5H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3h-3.5Z" /><circle cx="12" cy="12.5" r="4" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    flame: <path d="M12 22c4.4 0 7-3.2 7-7.2 0-3.1-1.8-6-5.3-9.4.1 2.2-.7 3.8-2 4.8.2-2.8-1.3-5.4-4.1-8.2.1 4.3-2.6 6.5-2.6 10.6C5 18 8 22 12 22Z" />,
    chart: <><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>,
    cart: <><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20 8H6" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></>,
    meal: <><path d="M7 3v8" /><path d="M4.5 3v5A2.5 2.5 0 0 0 7 10.5 2.5 2.5 0 0 0 9.5 8V3" /><path d="M7 10.5V21" /><path d="M16 3v18" /><path d="M16 3c3 2 4 5 4 8h-4" /></>,
    book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z" /></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5V3h6v1.5" /><path d="M9 10h6M9 14h6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    eyeOff: <><path d="m3 3 18 18" /><path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a15.2 15.2 0 0 1-2.2 2.9M6.2 6.2C3.5 8 2 12 2 12s3.5 6 10 6a10 10 0 0 0 3-.4" /></>,
    video: <><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-2v8l-4-2" /></>,
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M9 20v-6h6v6" /></>,
    logout: <><path d="M10 5V3H4v18h6v-2" /><path d="M13 8l4 4-4 4" /><path d="M17 12H8" /></>,
  };

  return <svg {...props}>{paths[name] || paths.clipboard}</svg>;
}

export default function ProfilePage() {
  const nav = useNavigate();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState(() => readJSON(PROFILE_KEY, null));
  const [conciergeHidden, setConciergeHidden] = useState(() => 
    readJSON(CONCIERGE_HIDDEN_KEY, false)
  );
  const [activity, setActivity] = useState(() => readJSON(ACTIVITY_KEY, []));
  const [activeTab, setActiveTab] = useState("overview");
  const [profileImage, setProfileImage] = useState(() => readJSON(PROFILE_IMAGE_KEY, null));
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadMode, setUploadMode] = useState('avatar'); // 'avatar' or 'upload'

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
        .map(a => {
          try {
            const d = new Date(a?.completedAt);
            if (!(d instanceof Date) || isNaN(d.getTime())) {
              return null;
            }
            return d.toDateString();
          } catch {
            return null;
          }
        })
        .filter((date, idx, arr) => date && arr.indexOf(date) === idx)
        .sort((a, b) => {
          try {
            return new Date(b) - new Date(a);
          } catch {
            return 0;
          }
        });
      
      let streak = 0;
      const today = new Date().toDateString();
      
      for (let i = 0; i < dates.length; i++) {
        try {
          const expectedDate = new Date();
          if (!(expectedDate instanceof Date) || isNaN(expectedDate.getTime())) {
            break;
          }
          expectedDate.setDate(expectedDate.getDate() - i);
          if (dates[i] === expectedDate.toDateString()) {
            streak++;
          } else {
            break;
          }
        } catch {
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
      
      // Validate both dates
      if (!(date instanceof Date) || isNaN(date.getTime()) || 
          !(now instanceof Date) || isNaN(now.getTime())) {
        return "Today";
      }
      
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
    nav("/app");
  };

  const handleSettings = () => {
    setActiveTab('settings');
  };

  const handleProfileUpdate = (updates) => {
    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    setProfile(updatedProfile);
    writeJSON(PROFILE_KEY, updatedProfile);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB for better quality)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProfileImage(base64String);
      writeJSON(PROFILE_IMAGE_KEY, base64String);
      handleProfileUpdate({ profileImage: base64String });
      setShowImageUpload(false);
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (window.confirm('Remove profile picture?')) {
      setProfileImage(null);
      writeJSON(PROFILE_IMAGE_KEY, null);
      handleProfileUpdate({ profileImage: null });
    }
  };

  const handleSelectAvatar = (emoji) => {
    const avatarData = `avatar:${emoji}`;
    setProfileImage(avatarData);
    writeJSON(PROFILE_IMAGE_KEY, avatarData);
    handleProfileUpdate({ profileImage: avatarData });
    setShowImageUpload(false);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        // Sign out from Supabase
        await signOut();
        
        // Clear all localStorage data
        localStorage.clear();
        
        // Redirect to login
        nav('/login', { replace: true });
      } catch (error) {
        console.error('Logout error:', error);
        // Even if Supabase logout fails, clear local data and redirect
        localStorage.clear();
        nav('/login', { replace: true });
      }
    }
  };

  const handleRewatchIntro = () => {
    setShowVideoIntro(true);
  };

  const toggleConciergeVisibility = () => {
    const newState = !conciergeHidden;
    setConciergeHidden(newState);
    writeJSON(CONCIERGE_HIDDEN_KEY, newState);
  };

  const formatShoppingMode = (mode) => {
    if (!mode) return "Not Set";
    switch (mode) {
      case "best_price": return "Best Price";
      case "loyal": return "Store Loyal";
      case "balanced": return "Balanced";
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
              Go Home
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
          ← Back to Home
        </button>

        {/* Profile Header with Enhanced Design */}
        <div className="profile-header">
          <div className="profile-header-main">
            <div className="profile-avatar" style={{ position: 'relative' }}>
              {profileImage ? (
                profileImage.startsWith('avatar:') ? (
                  <span className="profile-avatar-icon" style={{ fontSize: '3.5rem' }}>
                    {profileImage.replace('avatar:', '')}
                  </span>
                ) : (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                )
              ) : (
                <span className="profile-avatar-initial" aria-label={`${profile?.firstName || "Guest"} profile`}>
                  {(profile?.firstName || "G").charAt(0).toUpperCase()}
                </span>
              )}
              <div className="profile-avatar-ring"></div>
              <button
                className="profile-camera-button"
                type="button"
                onClick={() => setShowImageUpload(true)}
                aria-label="Change profile picture"
                title="Change profile picture"
              >
                <ProfileIcon name="camera" />
              </button>
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
              <div className="stat-icon"><ProfileIcon name="check" /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.todayTasks}</div>
                <div className="stat-label">Today</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><ProfileIcon name="flame" /></div>
              <div className="stat-content">
                <div className="stat-value">{stats.streak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><ProfileIcon name="chart" /></div>
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
                  <span className="profile-detail-value">{formatStoreName(profile.defaultStoreId)}</span>
                </div>
              )}
              
              {profile?.birthMonth && (
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Birthday</span>
                  <span className="profile-detail-value">{profile.birthMonth}</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="profile-quick-actions">
              <h2 className="profile-section-title">Quick Actions</h2>
              <div className="profile-actions-grid">
                <button className="profile-action-card" onClick={() => nav('/app/grocery-lab')}>
                  <div className="profile-action-icon"><ProfileIcon name="cart" /></div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Grocery Lab</div>
                    <div className="profile-action-desc">Start shopping</div>
                  </div>
                </button>

                <button className="profile-action-card" onClick={() => nav('/app/meal-planner')}>
                  <div className="profile-action-icon"><ProfileIcon name="meal" /></div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Meal Planner</div>
                    <div className="profile-action-desc">Plan your meals</div>
                  </div>
                </button>

                <button className="profile-action-card" onClick={() => nav('/app/recipes')}>
                  <div className="profile-action-icon"><ProfileIcon name="book" /></div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Recipes</div>
                    <div className="profile-action-desc">Search & browse recipes</div>
                  </div>
                </button>

                <button className="profile-action-card" onClick={() => nav('/app/stores')}>
                  <div className="profile-action-icon"><ProfileIcon name="pin" /></div>
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
                  <div className="empty-icon"><ProfileIcon name="clipboard" /></div>
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
                  <div className="profile-action-icon"><ProfileIcon name="settings" /></div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">App Settings</div>
                    <div className="profile-action-desc">Theme, preferences, and more</div>
                  </div>
                </button>

                <button className="profile-action-card" onClick={toggleConciergeVisibility}>
                  <div className="profile-action-icon">
                    <ProfileIcon name={conciergeHidden ? "eye" : "eyeOff"} />
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

                <button className="profile-action-card" onClick={handleRewatchIntro}>
                  <div className="profile-action-icon"><ProfileIcon name="video" /></div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Rewatch Intro Video</div>
                    <div className="profile-action-desc">Watch the welcome video again</div>
                  </div>
                </button>

                <button className="profile-action-card" onClick={() => nav('/app')}>
                  <div className="profile-action-icon"><ProfileIcon name="home" /></div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Home</div>
                    <div className="profile-action-desc">Return to your 3C Mall home</div>
                  </div>
                </button>

                <button 
                  className="profile-action-card profile-action-danger" 
                  onClick={handleLogout}
                >
                  <div className="profile-action-icon"><ProfileIcon name="logout" /></div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Sign Out</div>
                    <div className="profile-action-desc">Exit your account</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload Modal */}
        {showImageUpload && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            overflowY: 'auto'
          }}>
            <div style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              margin: '2rem auto'
            }}>
              <h2 style={{ margin: 0, marginBottom: '1rem', color: 'var(--gold)' }}>
                Profile Picture
              </h2>
              
              {/* Current Picture Preview */}
              {profileImage && (
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.8 }}>
                    Current Picture:
                  </div>
                  {profileImage.startsWith('avatar:') ? (
                    <div style={{
                      width: '120px',
                      height: '120px',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '5rem',
                      background: 'rgba(255, 215, 0, 0.1)',
                      borderRadius: '50%',
                      border: '2px solid rgba(255, 215, 0, 0.3)'
                    }}>
                      {profileImage.replace('avatar:', '')}
                    </div>
                  ) : (
                    <img 
                      src={profileImage} 
                      alt="Current profile" 
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '2px solid rgba(255, 215, 0, 0.3)'
                      }}
                    />
                  )}
                </div>
              )}
              
              {/* Mode Selection Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button 
                  className={`btn ${uploadMode === 'avatar' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUploadMode('avatar')}
                >
                  Choose Avatar
                </button>
                <button 
                  className={`btn ${uploadMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUploadMode('upload')}
                >
                  Upload Image
                </button>
              </div>
              
              {/* Avatar Selection */}
              {uploadMode === 'avatar' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  {/* Female Avatars */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--gold)' }}>
                      Women
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '0.75rem' }}>
                      {AVATAR_PRESETS.female.map((emoji, idx) => (
                        <button
                          key={`female-${idx}`}
                          onClick={() => handleSelectAvatar(emoji)}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            fontSize: '2.5rem',
                            background: profileImage === `avatar:${emoji}` ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 215, 0, 0.05)',
                            border: profileImage === `avatar:${emoji}` ? '2px solid rgba(255, 215, 0, 0.6)' : '1px solid rgba(255, 215, 0, 0.2)',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Male Avatars */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--gold)' }}>
                      Men
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '0.75rem' }}>
                      {AVATAR_PRESETS.male.map((emoji, idx) => (
                        <button
                          key={`male-${idx}`}
                          onClick={() => handleSelectAvatar(emoji)}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            fontSize: '2.5rem',
                            background: profileImage === `avatar:${emoji}` ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 215, 0, 0.05)',
                            border: profileImage === `avatar:${emoji}` ? '2px solid rgba(255, 215, 0, 0.6)' : '1px solid rgba(255, 215, 0, 0.2)',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Girl Avatars */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--gold)' }}>
                      Girls
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '0.75rem' }}>
                      {AVATAR_PRESETS.girl.map((emoji, idx) => (
                        <button
                          key={`girl-${idx}`}
                          onClick={() => handleSelectAvatar(emoji)}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            fontSize: '2.5rem',
                            background: profileImage === `avatar:${emoji}` ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 215, 0, 0.05)',
                            border: profileImage === `avatar:${emoji}` ? '2px solid rgba(255, 215, 0, 0.6)' : '1px solid rgba(255, 215, 0, 0.2)',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Boy Avatars */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--gold)' }}>
                      Boys
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '0.75rem' }}>
                      {AVATAR_PRESETS.boy.map((emoji, idx) => (
                        <button
                          key={`boy-${idx}`}
                          onClick={() => handleSelectAvatar(emoji)}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            fontSize: '2.5rem',
                            background: profileImage === `avatar:${emoji}` ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 215, 0, 0.05)',
                            border: profileImage === `avatar:${emoji}` ? '2px solid rgba(255, 215, 0, 0.6)' : '1px solid rgba(255, 215, 0, 0.2)',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Image Upload */}
              {uploadMode === 'upload' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label 
                    htmlFor="profile-image-input"
                    className="btn btn-primary"
                    style={{ display: 'inline-block', cursor: 'pointer' }}
                  >
                    Choose Image File
                  </label>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <p className="small" style={{ marginTop: '0.5rem', opacity: 0.7 }}>
                    Max 2MB • JPG, PNG, GIF
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 215, 0, 0.2)', paddingTop: '1.5rem' }}>
                {profileImage && (
                  <button 
                    className="btn btn-secondary"
                    onClick={handleRemoveImage}
                  >
                    Remove Picture
                  </button>
                )}
                <button 
                  className="btn btn-ghost"
                  onClick={() => setShowImageUpload(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
