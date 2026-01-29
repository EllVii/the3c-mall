// src/context/TutorialContext.jsx
/**
 * TutorialContext
 * Manages the Quick Tutorial state (first-time display + re-run from Settings)
 */

import React, { createContext, useContext, useState, useEffect } from "react";

const TutorialContext = createContext();

export const TUTORIAL_SEEN_KEY = "tutorial.quickstart.seen.v1";

export function TutorialProvider({ children }) {
  const [showTutorial, setShowTutorial] = useState(false);

  // Initialize: check if user has seen tutorial
  useEffect(() => {
    const hasSeen = localStorage.getItem(TUTORIAL_SEEN_KEY);
    if (!hasSeen) {
      // First time - show after a small delay (let app settle first)
      setTimeout(() => setShowTutorial(true), 1200);
    }
  }, []);

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const completeTutorial = () => {
    localStorage.setItem(
      TUTORIAL_SEEN_KEY,
      JSON.stringify({
        completedAt: new Date().toISOString(),
        count: (JSON.parse(localStorage.getItem(TUTORIAL_SEEN_KEY) || '{}')?.count || 0) + 1,
      })
    );
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_SEEN_KEY);
    setShowTutorial(true);
  };

  return (
    <TutorialContext.Provider value={{ showTutorial, startTutorial, completeTutorial, resetTutorial }}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within TutorialProvider");
  }
  return context;
}
