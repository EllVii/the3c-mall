// src/assets/components/VideoIntro.jsx
import React, { useState, useEffect } from "react";

const VIDEO_INTRO_SEEN_KEY = "videoIntro.seen.v1";

/**
 * Video Intro Experience
 * Plays the main intro MP4 video on first launch (PRE-AUTH)
 * Clean and professional entry point before login/signup
 */
export default function VideoIntro({ open, onComplete }) {
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const baseUrl = import.meta.env.BASE_URL || "/";
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const videoSources = [
    `${normalizedBaseUrl}brand/RUIDb230dc15b18c43e88c3dd4db8d70a06f.mp4`,
    `${normalizedBaseUrl}RUIDb230dc15b18c43e88c3dd4db8d70a06f.mp4`,
  ];

  useEffect(() => {
    if (!open) return;

    setVideoEnded(false);
    setLoading(true);
    setVideoError(false);
    
    // Show skip button after 5 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 5000);
    
    return () => clearTimeout(skipTimer);
  }, [open]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    localStorage.setItem(VIDEO_INTRO_SEEN_KEY, JSON.stringify({ 
      seenAt: new Date().toISOString() 
    }));
    // Auto-complete after video ends
    setTimeout(() => {
      onComplete?.();
    }, 500);
  };
  
  const handleVideoError = (e) => {
    console.error('Video failed to load:', e);
    setVideoError(true);
    setLoading(false);
    // Auto-skip after 3 seconds if video fails
    setTimeout(() => {
      localStorage.setItem(VIDEO_INTRO_SEEN_KEY, JSON.stringify({ 
        seenAt: new Date().toISOString(),
        skipped: true,
        reason: 'error'
      }));
      onComplete?.();
    }, 3000);
  };
  
  const handleSkip = () => {
    localStorage.setItem(VIDEO_INTRO_SEEN_KEY, JSON.stringify({ 
      seenAt: new Date().toISOString(),
      skipped: true,
      reason: 'user-skip'
    }));
    onComplete?.();
  };

  if (!open) return null;

  return (
    <div className="video-intro-overlay">
      {/* Loading Indicator */}
      {loading && !videoError && (
        <div className="video-loading">
          <div className="spinner"></div>
          <p>Loading experience...</p>
        </div>
      )}
      
      {/* Error Message */}
      {videoError && (
        <div className="video-error">
          <p>⚠️ Video couldn't load</p>
          <p>Continuing to app...</p>
        </div>
      )}
      
      {/* Skip Button */}
      {showSkip && !videoEnded && !videoError && (
        <button className="video-skip-btn" onClick={handleSkip}>
          Skip Intro →
        </button>
      )}
      
      {/* Main Video */}
      <video 
        className="video-intro-player"
        autoPlay 
        muted 
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        onLoadedData={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 9999,
          opacity: loading ? 0.3 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {videoSources.map((src) => (
          <source key={src} src={src} type="video/mp4" />
        ))}
        Your browser does not support the video tag.
      </video>

      <style>{`
        .video-intro-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #000;
          z-index: 9998;
          overflow: hidden;
          pointer-events: auto;
        }

        .video-intro-player {
          width: 100%;
          height: 100%;
          display: block;
        }
        
        .video-loading {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10000;
          text-align: center;
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .video-error {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10000;
          text-align: center;
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 18px;
        }
        
        .video-error p {
          margin: 10px 0;
        }
        
        .video-skip-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10001;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.5);
          color: white;
          font-size: 16px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        .video-skip-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: white;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

export { VIDEO_INTRO_SEEN_KEY };
