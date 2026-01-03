// src/utils/prefs.js
const PREFS_KEY = "3c.prefs.v1";
const NUDGE_KEY = "3c.nudges.v1";

export function readPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function getPrefsSafe() {
  const p = readPrefs();
  if (p && typeof p === "object") return p;

  // default: focused grocery-first, but allow explore
  const defaults = {
    focus: "grocery", // grocery | meals | workout | community | explore
    navMode: "focused", // focused | full
    lastUpdated: Date.now(),
  };
  writePrefs(defaults);
  return defaults;
}

export function setFocus(focus) {
  const p = getPrefsSafe();
  const next = { ...p, focus, lastUpdated: Date.now() };
  writePrefs(next);
  return next;
}

export function setNavMode(navMode) {
  const p = getPrefsSafe();
  const next = { ...p, navMode, lastUpdated: Date.now() };
  writePrefs(next);
  return next;
}

/**
 * Alpha "notification" = in-app nudge schedule.
 * Shows only when user opens the app.
 */
export function getNudgeState() {
  try {
    const raw = localStorage.getItem(NUDGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveNudgeState(state) {
  try {
    localStorage.setItem(NUDGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function shouldShowNudge() {
  const now = Date.now();
  const state = getNudgeState();

  // start schedule on first run
  if (!state) {
    const next = {
      startedAt: now,
      step: 0, // 0..n
      nextAt: now + 14 * 24 * 3600 * 1000, // 2 weeks
      disabled: false,
    };
    saveNudgeState(next);
    return { show: false, state: next };
  }

  if (state.disabled) return { show: false, state };
  if (now < (state.nextAt || 0)) return { show: false, state };

  return { show: true, state };
}

// Apply your schedule after user sees the nudge
export function advanceNudgeSchedule() {
  const now = Date.now();
  const state = getNudgeState();
  if (!state || state.disabled) return state;

  const startedAt = state.startedAt || now;
  const ageDays = Math.floor((now - startedAt) / (24 * 3600 * 1000));

  // Schedule logic:
  // 0-30 days: every 14 days
  // 31-90 days: every 30 days
  // 91-180 days: next in 180 days
  // 181+ days: next in 365 days
  let nextAt;

  if (ageDays <= 30) nextAt = now + 14 * 24 * 3600 * 1000;
  else if (ageDays <= 90) nextAt = now + 30 * 24 * 3600 * 1000;
  else if (ageDays <= 180) nextAt = now + 180 * 24 * 3600 * 1000;
  else nextAt = now + 365 * 24 * 3600 * 1000;

  const next = { ...state, step: (state.step || 0) + 1, nextAt };
  saveNudgeState(next);
  return next;
}

export function disableNudges() {
  const state = getNudgeState() || { startedAt: Date.now(), step: 0, nextAt: 0 };
  const next = { ...state, disabled: true };
  saveNudgeState(next);
  return next;
}
// src/utils/prefs.js
// ✅ Add these helpers (append near the bottom)

const GUIDE_KEY = "3c_guides_v1";

function readGuidesSafe() {
  try {
    const raw = localStorage.getItem(GUIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeGuides(next) {
  try {
    localStorage.setItem(GUIDE_KEY, JSON.stringify(next || {}));
  } catch {
    // ignore
  }
}

/**
 * Returns true if a guide for this page has already been shown/closed.
 * pageId example: "dashboard", "settings", "grocery-lab"
 */
export function hasSeenGuide(pageId) {
  const guides = readGuidesSafe();
  return !!guides?.[pageId];
}

/**
 * Marks a guide as seen so it won't show again.
 */
export function markGuideSeen(pageId) {
  if (!pageId) return;
  const guides = readGuidesSafe();
  guides[pageId] = Date.now();
  writeGuides(guides);
}

/**
 * Optional: allow user to reset all guides in Settings later.
 */
export function resetGuides() {
  try {
    localStorage.removeItem(GUIDE_KEY);
  } catch {
    // ignore
  }
}