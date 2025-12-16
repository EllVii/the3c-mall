const DATE_KEY = "3c-date-format";
const TIME_KEY = "3c-time-format";

// dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
// timeFormat: "12h" | "24h"

export function getDateFormat() {
  try {
    return localStorage.getItem(DATE_KEY) || "MM/DD/YYYY";
  } catch {
    return "MM/DD/YYYY";
  }
}

export function setDateFormat(v) {
  try {
    localStorage.setItem(DATE_KEY, v);
  } catch {}
}

export function getTimeFormat() {
  try {
    return localStorage.getItem(TIME_KEY) || "12h";
  } catch {
    return "12h";
  }
}

export function setTimeFormat(v) {
  try {
    localStorage.setItem(TIME_KEY, v);
  } catch {}
}

/* Formatting helpers for display */
export function formatDateISO(isoDate, fmt) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;

  if (fmt === "MM/DD/YYYY") return `${m}/${d}/${y}`;
  if (fmt === "DD/MM/YYYY") return `${d}/${m}/${y}`;
  return `${y}-${m}-${d}`;
}

export function formatTimeValue(timeHHMM, fmt) {
  if (!timeHHMM) return "";
  const [hhStr, mm] = timeHHMM.split(":");
  const hh = Number(hhStr);
  if (Number.isNaN(hh) || !mm) return timeHHMM;

  if (fmt === "24h") return `${String(hh).padStart(2, "0")}:${mm}`;

  // 12h
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${mm} ${ampm}`;
}
