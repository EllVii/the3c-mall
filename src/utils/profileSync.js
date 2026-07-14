import { apiGet, apiPut } from "../lib/apiClient.js";

export function getLocal(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function loadFromCloud(_userId, key) {
  const data = await apiGet(`/api/profile/preferences/${encodeURIComponent(key)}`);
  return data.value;
}

export async function saveToCloud(_userId, key, value) {
  return apiPut(`/api/profile/preferences/${encodeURIComponent(key)}`, { value });
}

/**
 * Sync pattern:
 * 1) On login: D1 -> local
 * 2) On updates: local -> D1 (debounced by the caller)
 * 3) Conflict handling: compare updatedAt timestamps; latest write wins
 */
