const KEY = "3c-settings";

const DEFAULTS = {
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  theme: "midnight",
};

export function getSettings(forceDefaults = false) {
  if (forceDefaults) return { ...DEFAULTS };

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export function setSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function applyThemeToDom(theme) {
  try {
    document.documentElement.setAttribute("data-theme", theme || "midnight");
  } catch {
    // ignore
  }}