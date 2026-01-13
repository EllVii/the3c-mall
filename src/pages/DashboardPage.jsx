// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardPage.css";

import FeedbackPanel from "../assets/components/FeedbackPanel.jsx";
import ConciergeOverlay from "../assets/components/ConciergeOverlay.jsx";
import GuidedAssistOverlay from "../assets/components/GuidedAssistOverlay.jsx";
import SettingsModal from "../assets/components/SettingsModal.jsx";
import OnboardingGate from "../assets/components/OnboardingGate.jsx";
import OnboardingTutorial, { TUTORIAL_SEEN_KEY } from "../assets/components/OnboardingTutorial.jsx";
import OnboardingTour from "../assets/components/OnboardingTour.jsx";
import ConciergeIntro from "../assets/components/ConciergeIntro.jsx";
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
  hasCompletedOnboarding,
  markOnboardingComplete,
} from "../utils/prefs";

const ZONES = [
  { id: "grocery", title: "Save money on groceries", desc: "Build a cart optimized automatically.", route: "/app/grocery-lab" },
  { id: "meals", title: "Plan meals fast", desc: "Choose a date → time → meal. Snacks included.", route: "/app/meal-plans" },
  { id: "workout", title: "Training & performance", desc: "Strength goals + recovery pacing (Beta preview).", route: "/app/coming-soon" },
  { id: "community", title: "Community support", desc: "Encouragement without pressure (Beta preview).", route: "/app/community" },
];

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function DashboardPage() {
  const nav = useNavigate();

  const [prefs, setPrefsState] = useState(() => getPrefsSafe());
  const [nudge, setNudge] = useState({ show: false });

  // Load user name from profile
  const userName = useMemo(() => {
    const profile = readJSON("concierge.profile.v1", null);
    return profile?.firstName || null;
  }, []);

  // Track if user has completed at least one shop (trust metric)
  const hasShoppedBefore = useMemo(() => {
    const history = readJSON("grocery.savingsHistory.v1", []);
    return Array.isArray(history) && history.length > 0;
  }, []);

  // Concierge overlay — OPEN BY DEFAULT
  const [ccOpen, setCcOpen] = useState(true);
  const [ccMin, setCcMin] = useState(false);

  // Onboarding Tutorial (mall + amenities + concierge intro) - shows ONCE on first visit
  const [showTutorial, setShowTutorial] = useState(() => {
    const hasSeen = readJSON(TUTORIAL_SEEN_KEY, null);
    const profile = readJSON("concierge.profile.v1", null);
    // Show tutorial if first time AND haven't seen tutorial yet
    return !profile && !hasSeen;
  });

  // NEW: Premium Onboarding Tour (replaces old gate) - shows ONCE, then never again
  const [onboardingOpen, setOnboardingOpen] = useState(() => !hasCompletedOnboarding());

  // Concierge Intro on first run (after tutorial)
  const [introOpen, setIntroOpen] = useState(() => {
    const profile = readJSON("concierge.profile.v1", null);
    return !profile;
  });

  // Onboarding gate (NEW: simpler first-time experience)
  const isFirstTime = !readJSON("concierge.profile.v1", null);

  // Guided Assist
  const [gaOpen, setGaOpen] = useState(false);

  // Feedback
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Settings Pop-out (modal)
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setPrefsState(getPrefsSafe());
    setNudge(shouldShowNudge());
  }, []);

  // ======= DEV ONLY: Reset Onboarding (Shift+R, only after 30 min) =======
  useEffect(() => {
    const isDev = import.meta.env.MODE === 'development';
    if (!isDev) return;

    const LAST_RESET_KEY = "dev.lastOnboardingReset";
    const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

    const handleDevReset = (e) => {
      if (e.key?.toLowerCase() === "r" && e.shiftKey) {
        const lastReset = parseInt(localStorage.getItem(LAST_RESET_KEY) || "0", 10);
        const now = Date.now();
        const timeSinceReset = now - lastReset;

        if (timeSinceReset < COOLDOWN_MS) {
          const minutesLeft = Math.ceil((COOLDOWN_MS - timeSinceReset) / 60000);
          alert(`DEV: Onboarding reset is on cooldown. Wait ${minutesLeft} more minute(s).`);
          return;
        }

        const confirm = window.confirm("DEV MODE: Reset onboarding and clear profile?\n\nThis will:\n- Clear your name and preferences\n- Show the welcome screen again\n- Allow re-entering all info\n\nCooldown: 30 minutes");
        
        if (confirm) {
          localStorage.removeItem("concierge.profile.v1");
          localStorage.removeItem("grocery.strategy.v1");
          localStorage.setItem(LAST_RESET_KEY, now.toString());
          window.location.reload();
        }
      }
    };

    window.addEventListener("keydown", handleDevReset);
    return () => window.removeEventListener("keydown", handleDevReset);
  }, []);

  // ======= Guided Assist: reliable test + timer =======
  useEffect(() => {
    const pageId = "dashboard";

    // Keyboard test: press "g" to force show guide (dev/test)
    const onKey = (e) => {
      if (e.key?.toLowerCase() === "g") {
        setGaOpen(true);
      }
      // Shift+G = reset and show again
      if (e.key?.toLowerCase() === "g" && e.shiftKey) {
        // don’t require resetGuides; just allow re-show by not marking seen yet
        setGaOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const pageId = "dashboard";
    if (hasSeenGuide(pageId)) return;

    // Show guided assist immediately after intro closes (user completed onboarding)
    if (introOpen === false && !ccOpen && !isFirstTime) {
      const timer = setTimeout(() => {
        setGaOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }

    // Fallback: if user is idle for 30 seconds, show guide
    if (isFirstTime || introOpen || ccOpen) return;

    let idleTimer = setTimeout(() => {
      if (!hasSeenGuide(pageId)) {
        setGaOpen(true);
      }
    }, 30000);

    // Reset timer on interaction
    const restart = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!hasSeenGuide(pageId)) {
          setGaOpen(true);
        }
      }, 30000);
    };

    window.addEventListener("pointerdown", restart, { passive: true });
    window.addEventListener("keydown", restart);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("pointerdown", restart);
      window.removeEventListener("keydown", restart);
    };
  }, [introOpen, ccOpen, isFirstTime]);

  // ======= Focus logic =======
  const focusedZone = useMemo(() => {
    if (!prefs?.focus || prefs.focus === "explore") return null;
    return ZONES.find((z) => z.id === prefs.focus) || null;
  }, [prefs]);

  const visibleZones = useMemo(() => {
    if (prefs?.navMode === "full") return ZONES;
    const grocery = ZONES.find((z) => z.id === "grocery");
    return [focusedZone || grocery].filter(Boolean);
  }, [prefs, focusedZone]);

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

  const explorePick = useMemo(() => pickRandom(ZONES), []);

  const conciergeOptions = useMemo(
    () => [
      { id: "grocery", label: "Groceries only", hint: "Best value cart strategy", route: "/app/grocery-lab" },
      { id: "meals", label: "Meal planning", hint: "Fast meal + snack flow", route: "/app/meal-plans" },
      { id: "workout", label: "Training", hint: "Strength + recovery", route: "/app/coming-soon" },
      { id: "community", label: "Community", hint: "Support without pressure", route: "/app/community" },
      { id: "settings", label: "Settings", hint: "Theme + navigation", route: "__modal__" },
      { id: "explore", label: "Surprise me 🎲", hint: "Explore one zone", route: explorePick.route },
    ],
    [explorePick.route]
  );

  function onConciergePick(x) {
    if (x.id === "settings") {
      setSettingsOpen(true);
      return;
    }

    if (x.id === "explore") {
      chooseFocus(explorePick.id);
      nav(explorePick.route);
    } else {
      if (["grocery", "meals", "workout", "community"].includes(x.id)) chooseFocus(x.id);
      nav(x.route);
    }
    setCcOpen(false);
  }

  return (
    <section className="page db-shell">
      {/* ONBOARDING TUTORIAL - shows once on first visit (explains mall + amenities + concierge) */}
      <OnboardingTutorial
        open={showTutorial}
        onComplete={() => {
          setShowTutorial(false);
          // Proceed to name entry (OnboardingGate will show because isFirstTime is still true)
        }}
      />

      {/* PREMIUM ONBOARDING TOUR - full walkthrough + profile capture (shows once, never again) */}
      <OnboardingTour
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={(profile) => {
          // Save the onboarding data
          markOnboardingComplete(profile);
          setOnboardingOpen(false);

          // Save profile name to concierge profile so it displays everywhere
          if (profile?.name) {
            const existingProfile = readJSON("concierge.profile.v1", {});
            writeJSON("concierge.profile.v1", {
              ...existingProfile,
              firstName: profile.name,
              shopMode: profile.shopMode,
              homeStore: profile.homeStore,
              birthday: profile.birthday,
            });
          }
        }}
      />

      {/* ONBOARDING GATE - force name entry on first use */}
      <OnboardingGate
        open={isFirstTime && !showTutorial}
        onClose={() => {
          // After onboarding gate, trigger ConciergeIntro
          setIntroOpen(true);
        }}
      />

      {/* CONCIERGE INTRO - fill out preferences after name */}
      <ConciergeIntro
        open={introOpen && !isFirstTime}
        onClose={() => setIntroOpen(false)}
      />

      {/* CONCIERGE OVERLAY */}
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
        title="Concierge"
        subtitle="Groceries • Meals • Strategy"
        options={conciergeOptions}
        userName={userName}
      />

      {/* GUIDED ASSIST OVERLAY */}
      <GuidedAssistOverlay
        open={gaOpen}
        title={`Ready to explore, ${userName || "friend"}?`}
        message="Start with Groceries to see how I can help you save money on your shopping trips."
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

      {/* SETTINGS POP-OUT MODAL */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        prefs={prefs}
        onChange={(nextPrefs) => setPrefsState(nextPrefs)}
      />

      {/* CONTENT */}
      <div className="page-content">
        {/* TIME-BASED GREETING */}
        <div style={{ marginBottom: "1rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--gold)", marginBottom: ".25rem" }}>
            {getTimeBasedGreeting()}{userName ? `, ${userName}` : ""}
          </h1>
          <p style={{ margin: 0, fontSize: ".95rem", opacity: 0.85 }}>
            Pick a zone below to save money, plan meals, or track your health — or use the Concierge menu above.
          </p>
        </div>

        {nudge.show && (
          <div className="tile tile-hero" style={{ borderColor: "rgba(246,220,138,.35)" }}>
            <div className="kicker">Quick Tip</div>
            <div className="tile-title">Want the other wins too?</div>
            <div className="small">3C can plan meals and support consistency. Ignore forever if you want.</div>

            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginTop: ".6rem" }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleNudgeSeen();
                  setPrefsState(setNavMode("full"));
                }}
                title="Show all zones (Groceries, Meals, Training, Community)"
              >
                Show me more
              </button>
              <button className="btn btn-secondary" onClick={handleNudgeSeen} title="Hide this message">
                Not now
              </button>
              <button className="btn btn-ghost" onClick={handleDisableNudges} title="Don't show this tip again">
                Don’t remind me
              </button>
            </div>
          </div>
        )}

        <div className="fit-grid">
          {visibleZones.map((z) => (
            <div key={z.id} className="tile" title={`${z.title}. ${z.desc}`}>
              <div className="tile-title">{z.title}</div>
              <div className="tile-desc">{z.desc}</div>

              <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".5rem" }}>
                <button className="btn btn-primary" onClick={() => nav(z.route)} title={`Open ${z.title}`}>
                  Open
                </button>
                {hasShoppedBefore && (
                  <>
                    <button className="btn btn-secondary" onClick={() => chooseFocus(z.id)} title={`Make ${z.title} your default starting zone`}>
                      Set default
                    </button>
                    <button className="btn btn-ghost" onClick={() => setFeedbackOpen(true)} title="Share feedback about this zone">
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
