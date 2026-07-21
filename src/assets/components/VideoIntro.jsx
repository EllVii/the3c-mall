// src/assets/components/VideoIntro.jsx
import React, { useEffect, useMemo, useState } from "react";

const VIDEO_INTRO_SEEN_KEY = "videoIntro.seen.v1";

function shouldSkipHeavyIntro() {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  return Boolean(
    connection?.saveData ||
      ["slow-2g", "2g"].includes(connection?.effectiveType),
  );
}

/**
 * Video Intro Experience
 * Plays the main intro MP4 video on first launch (PRE-AUTH).
 * The browser receives metadata first instead of downloading the full file
 * before the rest of the interface can render.
 */
export default function VideoIntro({ open, onComplete }) {
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const baseUrl = import.meta.env.BASE_URL || "/";
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const videoSources = useMemo(
    () => [
      `${normalizedBaseUrl}brand/RUIDb230dc15b18c43e88c3dd4db8d70a06f.mp4`,
      `${normalizedBaseUrl}RUIDb230dc15b18c43e88c3dd4db8d70a06f.mp4`,
    ],
    [normalizedBaseUrl],
  );

  useEffect(() => {
    if (!open) return undefined;

    if (shouldSkipHeavyIntro()) {
      localStorage.setItem(
        VIDEO_INTRO_SEEN_KEY,
        JSON.stringify({
          seenAt: new Date().toISOString(),
          skipped: true,
          reason: "low-data",
        }),
      );
      onComplete?.();
      return undefined;
    }

    setVideoEnded(false);
    setLoading(true);
    setVideoError(false);
    setShowSkip(false);

    // Prevent the page beneath the intro from moving on mobile.
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Make the skip option available quickly on slower devices.
    const skipTimer = window.setTimeout(() => setShowSkip(true), 1500);

    return () => {
      window.clearTimeout(skipTimer);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open, onComplete]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    localStorage.setItem(
      VIDEO_INTRO_SEEN_KEY,
      JSON.stringify({ seenAt: new Date().toISOString() }),
    );

    window.setTimeout(() => {
      onComplete?.();
    }, 300);
  };

  const handleVideoError = (event) => {
    console.error("Video failed to load:", event);
    setVideoError(true);
    setLoading(false);

    window.setTimeout(() => {
      localStorage.setItem(
        VIDEO_INTRO_SEEN_KEY,
        JSON.stringify({
          seenAt: new Date().toISOString(),
          skipped: true,
          reason: "error",
        }),
      );
      onComplete?.();
    }, 1000);
  };

  const handleSkip = () => {
    localStorage.setItem(
      VIDEO_INTRO_SEEN_KEY,
      JSON.stringify({
        seenAt: new Date().toISOString(),
        skipped: true,
        reason: "user-skip",
      }),
    );
    onComplete?.();
  };

  if (!open) return null;

  return (
    <div
      className="video-intro-overlay"
      role="dialog"
      aria-label="3C Mall introduction"
    >
      {showSkip && !videoEnded && !videoError && (
        <button
          className="video-skip-btn"
          type="button"
          onClick={handleSkip}
          aria-label="Skip introduction video"
        >
          Skip Intro →
        </button>
      )}

      <video
        className="video-intro-player"
        autoPlay
        muted
        playsInline
        preload="metadata"
        poster="/brand/3c-mall-entrance.jpg"
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        onLoadedData={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        style={{ opacity: loading ? 0.35 : 1 }}
      >
        {videoSources.map((src) => (
          <source key={src} src={src} type="video/mp4" />
        ))}
        Your browser does not support the video tag.
      </video>

      <style>{`
        .video-intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 9998;
          display: flex;
          width: 100%;
          height: 100vh;
          height: 100svh;
          height: 100dvh;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #000;
          isolation: isolate;
          pointer-events: auto;
        }

        .video-intro-player {
          position: absolute;
          inset: 0;
          z-index: 1;
          display: block;
          width: 100%;
          height: 100%;
          max-width: 100vw;
          max-height: 100vh;
          max-height: 100dvh;
          border: 0;
          background: #000;
          object-fit: contain;
          object-position: center center;
          transition: opacity 0.3s ease;
        }

        .video-skip-btn {
          position: fixed;
          top: max(12px, env(safe-area-inset-top));
          right: max(12px, env(safe-area-inset-right));
          z-index: 2;
          min-height: 44px;
          padding: 10px 18px;
          border: 1px solid rgba(255, 255, 255, 0.65);
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.48);
          color: #fff;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: clamp(0.875rem, 1.5vw, 1rem);
          font-weight: 600;
          line-height: 1;
          cursor: pointer;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          touch-action: manipulation;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .video-skip-btn:hover,
        .video-skip-btn:focus-visible {
          border-color: #fff;
          background: rgba(0, 0, 0, 0.72);
          transform: translateY(-1px);
          outline: none;
        }

        @media (max-width: 768px) {
          .video-intro-player {
            width: 100vw;
            height: 100svh;
            height: 100dvh;
          }

          .video-skip-btn {
            padding: 10px 15px;
          }
        }

        @media (orientation: landscape) and (max-height: 520px) {
          .video-skip-btn {
            top: max(8px, env(safe-area-inset-top));
            right: max(8px, env(safe-area-inset-right));
            min-height: 40px;
            padding: 8px 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .video-intro-player,
          .video-skip-btn {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

export { VIDEO_INTRO_SEEN_KEY };
