// attemptStorage.js - localStorage helpers for quiz attempts
const STORAGE_PREFIX = 'quiz-attempt';

/**
 * Generate storage key for quiz attempt
 * @param {string} userId - User ID
 * @param {string} quizId - Quiz ID
 * @returns {string} Storage key
 */
export const getAttemptKey = (userId, quizId) => {
  return `${STORAGE_PREFIX}-${userId}-${quizId}`;
};

/**
 * Save attempt snapshot to localStorage
 * @param {Object} snapshot - Attempt snapshot
 * @param {string} snapshot.attemptId - Attempt ID (optional)
 * @param {string} snapshot.mode - 'exam' or 'practice'
 * @param {string} snapshot.quizId - Quiz ID
 * @param {string} snapshot.userId - User ID
 * @param {number} snapshot.currentQuestionIndex - Current question index
 * @param {Array} snapshot.answers - Array of answer objects
 * @param {Date} snapshot.startedAt - Start timestamp
 * @param {Date} snapshot.lastSavedAt - Last save timestamp
 * @param {Object} snapshot.timerState - Timer state
 * @param {Array} snapshot.questionAnalytics - Per-question analytics
 */
export const saveAttemptSnapshot = (snapshot) => {
  try {
    const key = getAttemptKey(snapshot.userId, snapshot.quizId);
    const dataToStore = {
      ...snapshot,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(dataToStore));
  } catch (error) {
    console.warn('Failed to save quiz attempt snapshot:', error);
  }
};

/**
 * Load attempt snapshot from localStorage
 * @param {string} userId - User ID
 * @param {string} quizId - Quiz ID
 * @returns {Object|null} Attempt snapshot or null if not found
 */
export const loadAttemptSnapshot = (userId, quizId) => {
  try {
    const key = getAttemptKey(userId, quizId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load quiz attempt snapshot:', error);
    return null;
  }
};

/**
 * Delete attempt snapshot from localStorage
 * @param {string} userId - User ID
 * @param {string} quizId - Quiz ID
 */
export const deleteAttemptSnapshot = (userId, quizId) => {
  try {
    const key = getAttemptKey(userId, quizId);
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to delete quiz attempt snapshot:', error);
  }
};

/**
 * Check if attempt snapshot exists
 * @param {string} userId - User ID
 * @param {string} quizId - Quiz ID
 * @returns {boolean} True if snapshot exists
 */
export const hasAttemptSnapshot = (userId, quizId) => {
  const snapshot = loadAttemptSnapshot(userId, quizId);
  return snapshot !== null;
};

/**
 * Get all attempt snapshots for a user
 * @param {string} userId - User ID
 * @returns {Array} Array of attempt snapshots
 */
export const getAllUserAttempts = (userId) => {
  const attempts = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_PREFIX}-${userId}-`)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          attempts.push(JSON.parse(stored));
        }
      }
    }
  } catch (error) {
    console.warn('Failed to get user attempts:', error);
  }
  return attempts;
};