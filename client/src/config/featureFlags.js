/**
 * Feature flags for the Student Dashboard
 * Centralized configuration to toggle new features
 */

// Environment-based feature flags
const isDevelopment = import.meta.env.DEV;

// Feature flag configuration
export const featureFlags = {
  // Dashboard features
  DASHBOARD_OVERVIEW: true,
  CONTINUE_WATCHING: true,
  RECOMMENDED_COURSES: true,

  // Course features
  COURSE_PROGRESS_TRACKING: true,
  VIDEO_PLAYER_ENHANCED: true,
  NOTES_SYSTEM: true,
  RESOURCES_BOX: true,
  QNA_SECTION: true,
  FLOATING_NAV: true,

  // Quiz features
  QUIZ_PLAYER_MODULAR: true,
  QUIZ_PRACTICE_MODE: true,
  QUIZ_EXAM_MODE: true,
  QUIZ_INSTANT_FEEDBACK: true,
  QUIZ_PROGRESS_PERSISTENCE: true,

  // Assignment features
  ASSIGNMENTS_LIST: true,
  ASSIGNMENT_SUBMISSION: true,
  ASSIGNMENT_FILE_UPLOAD: true,

  // Certificate features
  CERTIFICATES_GENERATION: false, // Set to true when backend endpoint is ready
  CERTIFICATES_DOWNLOAD: false, // Set to true when backend endpoint is ready

  // Communication features
  MESSAGING_SYSTEM: true,
  NOTIFICATIONS_CENTER: true,
  ANNOUNCEMENTS: true,

  // Resource features
  RESOURCES_MANAGEMENT: true,
  NOTES_TAGGING: true,
  NOTES_SEARCH: true,
  BOOKMARKS_SYSTEM: true,

  // Gamification features
  GAMIFICATION_XP: true,
  GAMIFICATION_BADGES: true,
  LEADERBOARD_BASIC: true,

  // Calendar features
  CALENDAR_VIEW: true,
  LIVE_SESSIONS_DISPLAY: true,
  CALENDAR_ICS_EXPORT: false, // Requires additional implementation

  // Development features (only in dev mode)
  DEBUG_MODE: isDevelopment,
  SKELETON_LOADERS: true,
  ERROR_BOUNDARIES: true,

  // Performance features
  LAZY_LOADING: true,
  CODE_SPLITTING: true,
  PROGRESS_DEBOUNCE: true,

  // Accessibility features
  ARIA_LABELS: true,
  KEYBOARD_NAVIGATION: true,
  FOCUS_MANAGEMENT: true,
  HIGH_CONTRAST: true,
};

/**
 * Check if a feature is enabled
 * @param {string} featureName - The feature flag name
 * @returns {boolean} Whether the feature is enabled
 */
export const isFeatureEnabled = (featureName) => {
  return featureFlags[featureName] === true;
};

/**
 * Get all enabled features
 * @returns {string[]} Array of enabled feature names
 */
export const getEnabledFeatures = () => {
  return Object.keys(featureFlags).filter(key => featureFlags[key] === true);
};

/**
 * Get all disabled features
 * @returns {string[]} Array of disabled feature names
 */
export const getDisabledFeatures = () => {
  return Object.keys(featureFlags).filter(key => featureFlags[key] === false);
};