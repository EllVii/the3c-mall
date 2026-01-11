// src/utils/Storage.js

export function safeId(input) {
  // React key helper, stable enough for animations
  return String(input).replace(/\s+/g, "-").toLowerCase();
}

export function nowISO() {
  try {
    return new Date().toISOString();
  } catch {
    return String(Date.now());
  }
}

export function readJSON(key, fallback = null) {
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
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
