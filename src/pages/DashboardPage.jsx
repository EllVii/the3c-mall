// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardPage.css";

import FeedbackPanel from "../assets/components/FeedbackPanel.jsx";
import ConciergeOverlay from "../assets/components/ConciergeOverlay.jsx";
import GuidedAssistOverlay from "../assets/components/GuidedAssistOverlay.jsx";
import OnboardingGate from "../assets/components/OnboardingGate.jsx";
import VideoIntro, { VIDEO_INTRO_SEEN_KEY } from "../assets/components/VideoIntro.jsx";
import { readJSON, writeJSON } from "../utils/Storage";

import {
  getPrefsSafe,
  setFocus,
  setNavMode,
  shouldShowNudge,
  advanceNudgeSchedule,
  disableNudges,
  hasSeenGuide,
  markGuideSeen,
} from "../utils/prefs";

const PROFILE_KEY = "concierge.profile.v1";

const ZONES = [
  {
    id: "grocery",
    title: "Save money on groceries",
    desc: "Build a cart optimized automatically.",
    route: "/app/grocery-lab",
  },
  {
    id: "meals",
    title: "Plan meals fast",
    desc: "Choose a date → time → meal. Snacks included.",
    route: "/app/meal-plans",
  },
  {
    id: "community",
    title: "Community support",
    desc: "Encouragement without pressure (Beta preview).",
    route: "/app/community",
  },
];

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export default function DashboardPage() {
  const nav = useNavigate();
  const hadProfileOnMount = useRef(Boolean(readJSON(PROFILE_KEY, null)));

  const [hasProfile, setHasProfile] = useState(hadProfileOnMount.current);
  const [userName, setUserName] = useState(() => {
    const profile = readJSON(PROFILE_KEY, null);
    return profile?.firstName || null;
  });
  const [prefs, setPrefsState] = useState(() => getPrefsSafe());
  const [nudge, setNudge] = useState({ show: false });
  const [showVideoIntro, setShowVideoIntro] = useState(() => {
    return !readJSON(VIDEO_INTRO_SEEN_KEY, null);
  });

  // The Concierge should be available, but it should never cover first-time setup.
  const [ccOpen, setCcOpen] = useState(false);
  const [ccMin, setCcMin] = useState(false);
  const [gaOpen, setGaOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const isFirstTime = !hasProfile;

  const hasShoppedBefore = useMemo(() => {
    const history = readJSON("grocery.savingsHistory.v1", []);
    return Array.isArray(history) && history.length > 0;
  }, []);

  useEffect(() => {
    setPrefsState(getPrefsSafe());
    setNudge(shouldShowNudge());
  }, []);

  // Returning customers do not need to see this transition page.
  useEffect(() => {
    if (hadProfileOnMount.current) {
      nav("/app/directory", { replace: true });
    }
  }, [nav]);

  // ======= DEV ONLY: Reset Onboarding (Shift+R, only after 30 min) =======
  useEffect(() => {
    const isDev = import.meta.env.MODE === "development";
    if (!isDev) return undefined;

    const LAST_RESET_KEY = "dev.lastOnboardingReset";
    const COOLDOWN_MS = 30 * 60 * 1000;

    const handleDevReset = (event) => {
      if (event.key?.toLowerCase() !== "r" || !event.shiftKey) return;

      const lastReset = Number.parseInt(localStorage.getItem(LAST_RESET_KEY) || "0", 10);
      const now = Date.now();
      const timeSinceReset = now - lastReset;

      if (timeSinceReset < COOLDOWN_MS) {
        const minutesLeft = Math.ceil((COOLDOWN_MS - timeSinceReset) / 60000);
        window.alert(`DEV: Onboarding reset is on cooldown. Wait ${minutesLeft} more minute(s).`);
        return;
      }

      const confirmed = window.confirm(
        "DEV MODE: Reset onboarding and clear profile?\n\nThis will clear your name and preferences and show the welcome screen again.",
      );

      if (confirmed) {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem("grocery.strategy.v1");
        localStorage.setItem(LAST_RESET_KEY, now.toString());
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handleDevReset);
    return () => window.removeEventListener("keydown", handleDevReset);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key?.toLowerCase() === "g") {
        setGaOpen(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const pageId = "dashboard";
    if (hasSeenGuide(pageId) || isFirstTime || showVideoIntro || ccOpen) return undefined;

    let idleTimer = window.setTimeout(() => {
      if (!hasSeenGuide(pageId)) setGaOpen(true);
    }, 30000);

    const restart = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (!hasSeenGuide(pageId)) setGaOpen(true);
      }, 30000);
    };

    window.addEventListener("pointerdown", restart, { passive: true });
    window.addEventListener("keydown", restart);

    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointerdown", restart);
      window.removeEventListener("keydown", restart);
    };
  }, [ccOpen, isFirstTime, showVideoIntro]);

  const focusedZone = useMemo(() => {
    if (!prefs?.focus || prefs.focus === "explore") return null;
    return ZONES.find((zone) => zone.id === prefs.focus) || null;
  }, [prefs]);

  const visibleZones = useMemo(() => {
    if (prefs?.navMode === "full") return ZONES;
    const grocery = ZONES.find((zone) => zone.id === "grocery");
    return [focusedZone || grocery].filter(Boolean);
  }, [prefs, focusedZone]);

  const explorePick = useMemo(() => pickRandom(ZONES), []);

  const conciergeOptions = useMemo(
    () => [
      { id: "grocery", label: "Groceries", hint: "Build a better-value shopping strategy", route: "/app/grocery-lab" },
      { id: "meals", label: "Meal planning", hint: "Plan meals and snacks around real life", route: "/app/meal-plans" },
      { id: "community", label: "Community", hint: "Find support without pressure", route: "/app/community" },
      { id: "explore", label: "Surprise me 🎲", hint: "Open one useful zone", route: explorePick.route },
    ],
    [explorePick.route],
  );

  function chooseFocus(id) {
    const next = setFocus(id);
    setPrefsState(next);
  }

  function handleNudgeSeen() {
    advanceNudgeSchedule();
    setNudge(shouldShowNudge());
  }

  function handleDisableNudges() {
    disableNudges();
    setNudge(shouldShowNudge());
  }

  function onConciergePick(option) {
    const destination = option.id === "explore" ? explorePick.route : option.route;
    const focusId = option.id === "explore" ? explorePick.id : option.id;

    if (["grocery", "meals", "community"].includes(focusId)) {
      chooseFocus(focusId);
    }

    setCcOpen(false);
    setCcMin(false);
    nav(destination);
  }

  function handleOnboardingComplete(destination = "/app/directory") {
    const profile = readJSON(PROFILE_KEY, null);
    setHasProfile(Boolean(profile));
    setUserName(profile?.firstName || null);
    setCcOpen(false);
    setCcMin(false);
    nav(destination, { replace: true });
  }

  return (
    <section className="page db-shell">
      {showVideoIntro && (
        <VideoIntro
          open={showVideoIntro}
          onComplete={() => {
            writeJSON(VIDEO_INTRO_SEEN_KEY, true);
            setShowVideoIntro(false);
          }}
        />
      )}

      <OnboardingGate
        open={isFirstTime && !showVideoIntro}
        onClose={handleOnboardingComplete}
      />

      {hasProfile && !showVideoIntro && (
        <ConciergeOverlay
          open={ccOpen}
          minimized={ccMin}
          onMinimize={() => {
            setCcMin(true);
            setCcOpen(true);
          }}
          onOpen={() => {
            setCcMin(false);
            setCcOpen(true);
          }}
          onClose={() => {
            setCcOpen(false);
            setCcMin(false);
          }}
          onPick={onConciergePick}
          title="What can I help with?"
          subtitle="Concierge · Cost · Community"
          options={conciergeOptions}
          userName={userName}
        />
      )}

      <GuidedAssistOverlay
        open={gaOpen && hasProfile && !showVideoIntro}
        title={`Ready to explore, ${userName || "friend"}?`}
        message="Start with Groceries to see how 3C Mall can help organize your shopping strategy."
        primaryLabel="Start with Groceries"
        secondaryLabel="Explore later"
        onPrimary={() => {
          markGuideSeen("dashboard");
          setGaOpen(false);
          chooseFocus("grocery");
          nav("/app/grocery-lab");
        }}
        onSecondary={() => {
          markGuideSeen("dashboard");
          setGaOpen(false);
        }}
        onClose={() => {
          markGuideSeen("dashboard");
          setGaOpen(false);
        }}
        iconText="3C"
      />

      <div className="page-content">
        <div style={{ marginBottom: "1rem" }}>
          <h1
            style={{
              margin: 0,
              marginBottom: ".25rem",
              color: "var(--gold)",
              fontSize: "1.5rem",
              fontWeight: 800,
            }}
          >
            {getTimeBasedGreeting()}{userName ? `, ${userName}` : ""}
          </h1>
          <p style={{ margin: 0, fontSize: ".95rem", opacity: 0.85 }}>
            Pick a zone to save money, plan meals, or find support.
          </p>
        </div>

        {nudge.show && (
          <div className="tile tile-hero" style={{ borderColor: "rgba(246,220,138,.35)" }}>
            <div className="kicker">Quick Tip</div>
            <div className="tile-title">Want to see the other zones?</div>
            <div className="small">Open the full mall whenever you are ready.</div>

            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: ".6rem" }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleNudgeSeen();
                  setPrefsState(setNavMode("full"));
                }}
                type="button"
              >
                Show all zones
              </button>
              <button className="btn btn-secondary" onClick={handleNudgeSeen} type="button">
                Not now
              </button>
              <button className="btn btn-ghost" onClick={handleDisableNudges} type="button">
                Don’t remind me
              </button>
            </div>
          </div>
        )}

        <div className="fit-grid">
          {visibleZones.map((zone) => (
            <div key={zone.id} className="tile" title={`${zone.title}. ${zone.desc}`}>
              <div className="tile-title">{zone.title}</div>
              <div className="tile-desc">{zone.desc}</div>

              <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".5rem" }}>
                <button className="btn btn-primary" onClick={() => nav(zone.route)} type="button">
                  Open
                </button>
                {hasShoppedBefore && (
                  <>
                    <button className="btn btn-secondary" onClick={() => chooseFocus(zone.id)} type="button">
                      Set default
                    </button>
                    <button className="btn btn-ghost" onClick={() => setFeedbackOpen(true)} type="button">
                      Feedback
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <FeedbackPanel
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="3C Mall — Beta Feedback"
        formUrl="https://forms.gle/bdWFtAEAABbJnb8n7"
        context={{
          page: "Dashboard",
          buildUrl: window.location.href,
          deviceLabel: navigator.userAgent,
        }}
      />
    </section>
  );
}
