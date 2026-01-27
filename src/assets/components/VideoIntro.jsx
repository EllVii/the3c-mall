// src/assets/components/VideoIntro.jsx
import React, { useState, useEffect } from "react";

const VIDEO_INTRO_SEEN_KEY = "videoIntro.seen.v1";

/**
 * Video Intro Experience
 * Plays the main intro MP4 video on first launch
 * Clean and professional entry point to the app
 */
export default function VideoIntro({ open, onComplete }) {
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    if (!open) return;

    setVideoEnded(false);
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

  if (!open) return null;

  return (
    <div className="video-intro-overlay">
      {/* Main Video */}
      <video 
        className="video-intro-player"
        autoPlay 
        muted 
        playsInline
        onEnded={handleVideoEnd}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 9999,
        }}
      >
        <source src="/RUIDb230dc15b18c43e88c3dd4db8d70a06f.mp4" type="video/mp4" />
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
      `}</style>
    </div>
  );
}

export { VIDEO_INTRO_SEEN_KEY };
