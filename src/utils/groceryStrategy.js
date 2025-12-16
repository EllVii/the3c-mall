// src/utils/groceryStrategy.js
export function loadStrategy() {
  try {
    return JSON.parse(localStorage.getItem("groceryStrategy"));
  } catch {
    return null;
  }
}

export function saveStrategy(strategy) {
  localStorage.setItem("groceryStrategy", JSON.stringify(strategy));
}

export function clearStrategy() {
  localStorage.removeItem("groceryStrategy");
}
