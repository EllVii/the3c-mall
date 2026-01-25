// src/utils/deviceDetection.js

/**
 * Device detection utilities for PT Mode restrictions
 */

/**
 * Check if the current device is a desktop/laptop
 * @returns {boolean} True if desktop, false if mobile/tablet
 */
export function isDesktop() {
  // Check screen size (desktop typically >= 1024px)
  const isLargeScreen = window.innerWidth >= 1024;
  
  // Check for touch capability (desktops usually don't have primary touch)
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
  
  // Desktop if: large screen AND (not touch primary OR not mobile UA)
  return isLargeScreen && (!hasTouch || !isMobileUA);
}

/**
 * Get device type string
 * @returns {string} "desktop", "tablet", or "mobile"
 */
export function getDeviceType() {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('ipad') || (userAgent.includes('macintosh') && 'ontouchend' in document)) {
    return 'tablet';
  }
  
  if (width >= 1024) {
    return 'desktop';
  } else if (width >= 768) {
    return 'tablet';
  } else {
    return 'mobile';
  }
}

/**
 * Check if PT Mode should be accessible
 * @returns {boolean} True if device meets PT Mode requirements
 */
export function canAccessPTMode() {
  return isDesktop();
}

/**
 * Get PT Mode access denial reason
 * @returns {string|null} Reason for denial or null if accessible
 */
export function getPTModeRestrictionReason() {
  if (!isDesktop()) {
    const deviceType = getDeviceType();
    return `PT Mode requires a desktop computer for optimal workflow. You're currently on a ${deviceType}. Please access PT Mode from your laptop or desktop computer.`;
  }
  return null;
}
