export const THEMES = [
  {
    id: "midnight-lux",
    name: "Midnight Lux",
    desc: "Black + gold + blue. Signature luxury."
  },
  {
    id: "velocity-red",
    name: "Velocity Red",
    desc: "Fast red car energy. Calm but moving."
  },
  {
    id: "pearl-luxe",
    name: "Pearl Luxe",
    desc: "Pearl + silver + champagne. High-end light luxury."
  },
  {
    id: "retro-fusion",
    name: "Retro Fusion",
    desc: "Tasteful retro neon—80s/90s/2020s blend."
  },
];

const KEY = "3c-theme";

export function getThemeId() {
  try {
    return localStorage.getItem(KEY) || "midnight-lux";
  } catch {
    return "midnight-lux";
  }
}

export function setThemeId(id) {
  try {
    localStorage.setItem(KEY, id);
  } catch {}
}

export function applyTheme(id) {
  document.documentElement.setAttribute("data-theme", id);
}
