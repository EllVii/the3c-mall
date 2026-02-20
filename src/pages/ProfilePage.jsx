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
    nav("/app/directory");
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
                <span className="profile-avatar-icon">👤</span>
              )}
              <div className="profile-avatar-ring"></div>
              <button
                onClick={() => setShowImageUpload(true)}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 215, 0, 0.9)',
                  border: '2px solid #0a0a0a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                title="Change profile picture"
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 215, 0, 1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 215, 0, 0.9)'}
              >
                📷
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
                    <div className="profile-action-desc">Search & browse recipes</div>
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

                <button className="profile-action-card" onClick={handleRewatchIntro}>
                  <div className="profile-action-icon">🎬</div>
                  <div className="profile-action-content">
                    <div className="profile-action-title">Rewatch Intro Video</div>
                    <div className="profile-action-desc">Watch the welcome video again</div>
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
                  onClick={handleLogout}
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
