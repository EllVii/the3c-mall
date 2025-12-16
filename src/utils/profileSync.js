// src/utils/profileSync.js
// MVP: local-only. Beta: connect these functions to Supabase (or Firebase).
// Goal: local-first + cloud sync when user is authenticated.

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

// --- Future: replace these with real DB calls ---
export async function loadFromCloud(userId, key) {
  // Example later (Supabase):
  // return supabase.from("profiles").select(key).eq("id", userId).single()
  return null;
}

export async function saveToCloud(userId, key, value) {
  // Example later (Supabase):
  // return supabase.from("profiles").upsert({ id: userId, [key]: value, updated_at: new Date().toISOString() })
  return true;
}

/**
 * Sync pattern:
 * 1) On login: cloud → local
 * 2) On updates: local → cloud (debounced)
 * 3) Conflict: compare updated_at timestamps; last-write-wins
 */
