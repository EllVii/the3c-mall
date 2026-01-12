// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardPage.css";

import FeedbackPanel from "../assets/components/FeedbackPanel.jsx";
import ConciergeOverlay from "../assets/components/ConciergeOverlay.jsx";
import GuidedAssistOverlay from "../assets/components/GuidedAssistOverlay.jsx";
import SettingsModal from "../assets/components/SettingsModal.jsx";
import OnboardingGate from "../assets/components/OnboardingGate.jsx";
import ConciergeIntro from "../assets/components/ConciergeIntro.jsx";
import { readJSON } from "../utils/Storage";

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

const ZONES = [
  { id: "grocery", title: "Save money on groceries", desc: "Build a cart optimized automatically.", route: "/app/grocery-lab" },
  { id: "meals", title: "Plan meals fast", desc: "Choose a date → time → meal. Snacks included.", route: "/app/meal-plans" },
  { id: "workout", title: "Training & performance", desc: "Strength goals + recovery pacing (Alpha preview).", route: "/app/coming-soon" },
  { id: "community", title: "Community support", desc: "Encouragement without pressure (Alpha preview).", route: "/app/community" },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function DashboardPage() {
  const nav = useNavigate();

  const [prefs, setPrefsState] = useState(() => getPrefsSafe());
  const [nudge, setNudge] = useState({ show: false });

  // Track if user has completed at least one shop (trust metric)
  const hasShoppedBefore = useMemo(() => {
    const history = readJSON("grocery.savingsHistory.v1", []);
    return Array.isArray(history) && history.length > 0;
  }, []);

  // Concierge overlay — OPEN BY DEFAULT
  const [ccOpen, setCcOpen] = useState(true);
  const [ccMin, setCcMin] = useState(false);

  // Concierge Intro on first run
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

    // Start the 30s timer ONLY after concierge is dismissed
    // (because concierge is your primary entry point)
    if (ccOpen) return;

    let timer = setTimeout(() => {
      setGaOpen(true);
    }, 30000);

    // Any interaction restarts timer (prevents interrupting active users)
    const restart = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setGaOpen(true), 30000);
    };

    window.addEventListener("pointerdown", restart, { passive: true });
    window.addEventListener("keydown", restart);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", restart);
      window.removeEventListener("keydown", restart);
    };
  }, [ccOpen]);

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
      {/* ONBOARDING GATE (first time only) */}
      <OnboardingGate open={isFirstTime} onClose={() => {}} />

      {/* CONCIERGE INTRO (deprecated, kept for legacy) */}
      {introOpen && !isFirstTime ? <ConciergeIntro open={introOpen} onClose={() => setIntroOpen(false)} /> : null}
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
      />

      {/* GUIDED ASSIST OVERLAY */}
      <GuidedAssistOverlay
        open={gaOpen}
        title="Need a hand?"
        message="Most people start with Groceries. Want me to take you there?"
        primaryLabel="Start with Groceries"
        secondaryLabel="Not now"
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
              >
                Show me more
              </button>
              <button className="btn btn-secondary" onClick={handleNudgeSeen}>
                Not now
              </button>
              <button className="btn btn-ghost" onClick={handleDisableNudges}>
                Don’t remind me
              </button>
            </div>
          </div>
        )}

        <div className="fit-grid">
          {visibleZones.map((z) => (
            <div key={z.id} className="tile">
              <div className="tile-title">{z.title}</div>
              <div className="tile-desc">{z.desc}</div>

              <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".5rem" }}>
                <button className="btn btn-primary" onClick={() => nav(z.route)}>
                  Open
                </button>
                {hasShoppedBefore && (
                  <>
                    <button className="btn btn-secondary" onClick={() => chooseFocus(z.id)}>
                      Set default
                    </button>
                    <button className="btn btn-ghost" onClick={() => setFeedbackOpen(true)}>
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
        title="3C Mall — Alpha Feedback"
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
