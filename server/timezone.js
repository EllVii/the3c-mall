/**
 * Timezone utilities for MST (-7:00 UTC / Arizona)
 */

/**
 * Get current ISO timestamp in MST (for database storage)
 * @returns {string} ISO 8601 format in MST (-07:00)
 */
export function getMSTISOTimestamp() {
  const now = new Date();
  const mstTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Phoenix' }));
  return mstTime.toISOString().replace('Z', '-07:00');
}

/**
 * Format a timestamp for display in emails
 * @param {string} isoTimestamp - ISO timestamp
 * @returns {string} Formatted timestamp in MST
 */
export function formatMSTTimestamp(isoTimestamp) {
  const date = new Date(isoTimestamp);
  return date.toLocaleString('en-US', {
    timeZone: 'America/Phoenix',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  });
}
