function pad(n) {
  return String(n).padStart(2, "0");
}

export function formatDate(d, settings) {
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const yyyy = String(d.getFullYear());

  switch (settings.dateFormat) {
    case "DD/MM/YYYY":
      return `${dd}/${mm}/${yyyy}`;
    case "YYYY-MM-DD":
      return `${yyyy}-${mm}-${dd}`;
    case "MM/DD/YYYY":
    default:
      return `${mm}/${dd}/${yyyy}`;
  }
}

export function formatTime(d, settings) {
  const h24 = d.getHours();
  const m = pad(d.getMinutes());

  if (settings.timeFormat === "24h") {
    return `${pad(h24)}:${m}`;
  }

  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m} ${ampm}`;
}

export function formatNowLabel(d, settings) {
  return `${formatDate(d, settings)} · ${formatTime(d, settings)}`;
}
