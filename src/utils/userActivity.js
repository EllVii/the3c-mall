// src/utils/userActivity.js
/**
 * User Activity Tracking
 * Tracks user completions for the "Job Done" box in Profile
 */

import { readJSON, writeJSON } from "./Storage";

const ACTIVITY_KEY = "userActivity.v1";

/**
 * Log a completed activity
 * @param {string} label - The activity label (e.g., "Created meal plan", "Saved $15.20 on groceries")
 * @param {string} type - Activity type (grocery, meal, workout, community, etc.)
 */
export function logActivity(label, type = "general") {
  const activities = readJSON(ACTIVITY_KEY, []);
  
  const newActivity = {
    label,
    type,
    completedAt: new Date().toISOString(),
  };
  
  // Keep last 50 activities
  const updated = [newActivity, ...activities].slice(0, 50);
  
  writeJSON(ACTIVITY_KEY, updated);
}

/**
 * Get all activities
 */
export function getAllActivities() {
  return readJSON(ACTIVITY_KEY, []);
}

/**
 * Get today's activities
 */
export function getTodayActivities() {
  const activities = readJSON(ACTIVITY_KEY, []);
  const today = new Date().toDateString();
  
  return activities.filter((item) => {
    const itemDate = new Date(item.completedAt).toDateString();
    return itemDate === today;
  });
}

/**
 * Clear all activities (for testing/reset)
 */
export function clearActivities() {
  writeJSON(ACTIVITY_KEY, []);
}

/**
 * Get activity count for a specific date
 */
export function getActivityCountForDate(dateString) {
  const activities = readJSON(ACTIVITY_KEY, []);
  const targetDate = new Date(dateString).toDateString();
  
  return activities.filter((item) => {
    const itemDate = new Date(item.completedAt).toDateString();
    return itemDate === targetDate;
  }).length;
}
