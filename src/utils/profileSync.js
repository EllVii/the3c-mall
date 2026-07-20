import { loadProfileValue, saveProfileValue } from "../lib/apiClient.js";

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
  try {
    const result = await loadProfileValue(key);
    if (result?.value !== null && result?.value !== undefined) {
      setLocal(key, result.value);
    }
    return result?.value ?? null;
  } catch (error) {
    console.warn(`Cloud profile load failed for ${key}; local data remains available.`, error);
    return null;
  }
}

export async function saveToCloud(_userId, key, value) {
  try {
    await saveProfileValue(key, value);
    return true;
  } catch (error) {
    console.warn(`Cloud profile save failed for ${key}; local data remains available.`, error);
    return false;
  }
}

export async function syncCloudToLocal(keys = []) {
  const results = await Promise.allSettled(keys.map((key) => loadFromCloud(null, key)));
  return results.map((result, index) => ({
    key: keys[index],
    ok: result.status === "fulfilled",
    value: result.status === "fulfilled" ? result.value : null,
  }));
}

/**
 * Local-first sync pattern:
 * 1. Local storage keeps the interface responsive.
 * 2. Authenticated updates are mirrored to Cloudflare D1.
 * 3. Login can pull selected cloud keys back to the device.
 * 4. Current conflict policy is last successful write wins; Phase I testing
 *    must document whether a stronger merge policy is needed.
 */
