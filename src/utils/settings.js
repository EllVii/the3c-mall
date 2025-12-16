// src/utils/Storage.js

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota/security errors in MVP
  }
}

export function safeId(input) {
  // React key helper, stable enough for animations
  return String(input).replace(/\s+/g, "-").toLowerCase();
}
