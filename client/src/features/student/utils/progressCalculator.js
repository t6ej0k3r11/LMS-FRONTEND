import {
  calculateOverallProgress,
  calculateVideoProgress as calculateVideoProgressFromTime,
  calculateWeightedVideoProgress,
  calculateCourseProgress as calculateCourseProgressFromCounts,
  getCompletedLecturesCount,
  isLectureCompleted,
  isCourseCompleted,
  formatProgressPercentage,
  getProgressStatusText,
  saveLectureProgress,
  loadLectureProgress,
  clearLectureProgress,
  clearCourseProgress,
  getProgressStorageKey,
  LECTURE_COMPLETION_THRESHOLD,
} from '@/lib/progressUtils';

/**
 * Unified progress calculator - single source of truth for all progress calculations
 */
export class ProgressCalculator {
  /**
   * Calculate video progress from current time and duration
   * @param {number} currentTime - Current playback time in seconds
   * @param {number} duration - Total video duration in seconds
   * @returns {number} Progress percentage (0-100)
   */
  static calculateVideoProgress(currentTime, duration) {
    return calculateVideoProgressFromTime(currentTime, duration);
  }

  /**
   * Calculate course progress from completed and total lectures
   * @param {number} completedLectures - Number of completed lectures
   * @param {number} totalLectures - Total number of lectures
   * @returns {number} Progress percentage (0-100)
   */
  static calculateCourseProgress(progress, curriculum, currentLecture, realTimeProgress) {
    // If called with just two numbers (completedLectures, totalLectures)
    if (typeof progress === 'number' && typeof curriculum === 'number') {
      return calculateCourseProgressFromCounts(progress, curriculum);
    }
    // Legacy support: called with progress array, curriculum, etc.
    return calculateOverallProgress(progress, curriculum, currentLecture, realTimeProgress);
  }

  /**
   * Calculate weighted video progress across all lectures
   */
  static calculateWeightedVideoProgress(progress, curriculum, currentLecture, realTimeProgress) {
    return calculateWeightedVideoProgress(progress, curriculum, currentLecture, realTimeProgress);
  }

  /**
   * Get completed lectures count
   */
  static getCompletedLectures(progress, currentLecture, realTimeProgress) {
    return getCompletedLecturesCount(progress, currentLecture, realTimeProgress);
  }

  /**
   * Check if a specific lecture is completed
   */
  static isLectureCompleted(lectureId, progress, realTimeProgress) {
    return isLectureCompleted(lectureId, progress, realTimeProgress);
  }

  /**
   * Check if course is completed
   */
  static isCompleted(progress, curriculum, currentLecture, realTimeProgress) {
    return isCourseCompleted(progress, curriculum, currentLecture, realTimeProgress);
  }

  /**
   * Format progress for display
   */
  static formatProgress(percentage) {
    return formatProgressPercentage(percentage);
  }

  /**
   * Get progress status text
   */
  static getStatusText(percentage) {
    return getProgressStatusText(percentage);
  }

  /**
   * Save lecture progress to localStorage
   */
  static saveLectureProgress(courseId, lectureId, currentTime, duration, completed = false) {
    saveLectureProgress(courseId, lectureId, currentTime, duration, completed);
  }

  /**
   * Load lecture progress from localStorage
   */
  static loadLectureProgress(courseId, lectureId) {
    return loadLectureProgress(courseId, lectureId);
  }

  /**
   * Clear lecture progress from localStorage
   */
  static clearLectureProgress(courseId, lectureId) {
    clearLectureProgress(courseId, lectureId);
  }

  /**
   * Clear all progress for a course from localStorage
   */
  static clearCourseProgress(courseId) {
    clearCourseProgress(courseId);
  }

  /**
   * Get localStorage key for lecture progress
   */
  static getProgressStorageKey(courseId, lectureId) {
    return getProgressStorageKey(courseId, lectureId);
  }

  /**
   * Get completion threshold
   */
  static get COMPLETION_THRESHOLD() {
    return LECTURE_COMPLETION_THRESHOLD;
  }

  /**
   * Calculate time spent on course (placeholder - would need backend data)
   */
  static calculateTimeSpent() {
    // Placeholder implementation
    // In real implementation, this would aggregate time from progress records
    return 0;
  }

  /**
   * Calculate XP earned from course progress
   */
  static calculateXP(progress, curriculum) {
    const completedLectures = progress ? progress.filter(p => p.viewed).length : 0;
    const totalLectures = curriculum ? curriculum.length : 0;
    const xpPerLecture = 10; // Configurable
    const completionBonus = totalLectures * 5; // Bonus for completing course

    let xp = completedLectures * xpPerLecture;
    if (completedLectures === totalLectures && totalLectures > 0) {
      xp += completionBonus;
    }

    return xp;
  }

  /**
   * Calculate streak days (placeholder)
   */
  static calculateStreak() {
    // Placeholder - would need daily activity data
    return 0;
  }
}

// Export individual functions for convenience
export {
  calculateOverallProgress,
  calculateVideoProgressFromTime as calculateVideoProgress,
  calculateWeightedVideoProgress,
  calculateCourseProgressFromCounts,
  getCompletedLecturesCount,
  isLectureCompleted,
  isCourseCompleted,
  formatProgressPercentage,
  getProgressStatusText,
  saveLectureProgress,
  loadLectureProgress,
  clearLectureProgress,
  clearCourseProgress,
  getProgressStorageKey,
  LECTURE_COMPLETION_THRESHOLD,
};