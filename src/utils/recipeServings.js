/** Scale ingredient amounts from the recipe's original yield. */
export function validServings(value, fallback = 1) {
  const count = Number(value);
  return Number.isInteger(count) && count >= 1 && count <= 24 ? count : fallback;
}
export function scaledAmount(amount, originalServings, requestedServings) {
  const base = Number(amount);
  if (!Number.isFinite(base) || base < 0) return 0;
  const from = validServings(originalServings);
  const to = validServings(requestedServings, from);
  return Math.round((base * to / from) * 1000) / 1000;
}
export function displayAmount(amount) {
  return Number(Number(amount).toFixed(2)).toLocaleString("en-US", { maximumFractionDigits: 2 });
}
