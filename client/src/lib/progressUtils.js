/**
 * Progress Utilities - Single source of truth for all progress calculations
 * Uses localStorage pattern: course-{courseId}-lecture-{lectureId}-progress
 */

// Constants
const COMPLETION_THRESHOLD = 0.9; // 90% watched = completed
const STORAGE_KEY_PREFIX = 'course';

/**
 * Generate localStorage key for lecture progress
 * @param {string} courseId - Course ID
 * @param {string} lectureId - Lecture ID
 * @returns {string} Storage key
 */
export function getProgressStorageKey(courseId, lectureId) {
  return `${STORAGE_KEY_PREFIX}-${courseId}-lecture-${lectureId}-progress`;
}

/**
 * Calculate video progress percentage (0-100) from current time and duration
 * @param {number} currentTime - Current playback time in seconds
 * @param {number} duration - Total video duration in seconds
 * @returns {number} Progress percentage (0-100)
 */
export function calculateVideoProgress(currentTime, duration) {
  if (!duration || duration <= 0) return 0;
  if (!currentTime || currentTime < 0) return 0;
  
  const progress = (currentTime / duration) * 100;
  return Math.min(Math.round(progress * 100) / 100, 100); // Round to 2 decimal places, max 100
}

/**
 * Calculate course progress percentage from completed and total lectures
 * @param {number} completedLectures - Number of completed lectures
 * @param {number} totalLectures - Total number of lectures
 * @returns {number} Progress percentage (0-100)
 */
export function calculateCourseProgress(completedLectures, totalLectures) {
  if (!totalLectures || totalLectures <= 0) return 0;
  if (!completedLectures || completedLectures < 0) return 0;
  
  const progress = (completedLectures / totalLectures) * 100;
  return Math.min(Math.round(progress), 100);
}

/**
 * Calculate overall progress percentage for a course (legacy support)
 * @param {Array} progress - Course progress data array
 * @param {Array} curriculum - Course curriculum
 * @param {Object} currentLecture - Current lecture being viewed
 * @param {Object} realTimeProgress - Real-time progress updates (lectureId -> progressValue 0-1)
 * @returns {number} Progress percentage (0-100)
 */
export function calculateOverallProgress(progress, curriculum, currentLecture, realTimeProgress) {
  if (!curriculum || curriculum.length === 0) return 0;

  const totalLectures = curriculum.length;
  let completedLectures = 0;

  // Count completed lectures from progress data
  if (progress && Array.isArray(progress)) {
    completedLectures = progress.filter(p => p.viewed).length;
  }

  // Add current lecture progress if not already completed
  if (currentLecture && realTimeProgress) {
    const isAlreadyCompleted = progress?.find(p => p.lectureId === currentLecture._id)?.viewed;
    if (!isAlreadyCompleted) {
      const currentProgress = realTimeProgress[currentLecture._id] || 0;
      // Consider lecture completed if 90%+ watched
      if (currentProgress >= COMPLETION_THRESHOLD) {
        completedLectures += 1;
      }
    }
  }

  return calculateCourseProgress(completedLectures, totalLectures);
}

/**
 * Calculate weighted video progress across all lectures
 * @param {Array} progress - Course progress data array
 * @param {Array} curriculum - Course curriculum
 * @param {Object} currentLecture - Current lecture being viewed
 * @param {Object} realTimeProgress - Real-time progress updates (lectureId -> progressValue 0-1)
 * @returns {number} Video progress percentage (0-100)
 */
export function calculateWeightedVideoProgress(progress, curriculum, currentLecture, realTimeProgress) {
  if (!curriculum || curriculum.length === 0) return 0;

  const totalLectures = curriculum.length;
  let totalProgress = 0;

  // Sum up progress from all lectures
  curriculum.forEach(lecture => {
    const lectureId = lecture._id;
    
    // Check if lecture is completed in progress array
    const progressEntry = progress?.find(p => p.lectureId === lectureId);
    if (progressEntry?.viewed) {
      totalProgress += 1; // Completed = 100%
    } else if (realTimeProgress && realTimeProgress[lectureId]) {
      // Use real-time progress value (0-1)
      totalProgress += Math.min(realTimeProgress[lectureId], 1);
    }
  });

  return Math.min(Math.round((totalProgress / totalLectures) * 100), 100);
}

/**
 * Get completed lectures count
 * @param {Array} progress - Course progress data array
 * @param {Object} currentLecture - Current lecture being viewed
 * @param {Object} realTimeProgress - Real-time progress updates
 * @returns {number} Number of completed lectures
 */
export function getCompletedLecturesCount(progress, currentLecture, realTimeProgress) {
  let completedCount = 0;
  
  if (progress && Array.isArray(progress)) {
    completedCount = progress.filter(p => p.viewed).length;
  }

  // Add current lecture if completed via real-time progress
  if (currentLecture && realTimeProgress) {
    const isAlreadyCompleted = progress?.find(p => p.lectureId === currentLecture._id)?.viewed;
    if (!isAlreadyCompleted) {
      const currentProgress = realTimeProgress[currentLecture._id] || 0;
      if (currentProgress >= COMPLETION_THRESHOLD) {
        completedCount += 1;
      }
    }
  }

  return completedCount;
}

/**
 * Check if a lecture is completed
 * @param {string} lectureId - Lecture ID
 * @param {Array} progress - Course progress data array
 * @param {Object} realTimeProgress - Real-time progress updates
 * @returns {boolean} Whether lecture is completed
 */
export function isLectureCompleted(lectureId, progress, realTimeProgress) {
  // Check in progress array first
  const progressEntry = progress?.find(p => p.lectureId === lectureId);
  if (progressEntry?.viewed) return true;
  
  // Check real-time progress
  if (realTimeProgress && realTimeProgress[lectureId] >= COMPLETION_THRESHOLD) {
    return true;
  }
  
  return false;
}

/**
 * Check if course is completed
 * @param {Array} progress - Course progress data array
 * @param {Array} curriculum - Course curriculum
 * @param {Object} currentLecture - Current lecture being viewed
 * @param {Object} realTimeProgress - Real-time progress updates
 * @returns {boolean} Whether course is completed
 */
export function isCourseCompleted(progress, curriculum, currentLecture, realTimeProgress) {
  const progressPercentage = calculateOverallProgress(progress, curriculum, currentLecture, realTimeProgress);
  return progressPercentage >= 100;
}

/**
 * Format progress percentage for display
 * @param {number} percentage - Progress percentage
 * @returns {string} Formatted percentage string
 */
export function formatProgressPercentage(percentage) {
  return `${Math.round(percentage)}%`;
}

/**
 * Get progress status text
 * @param {number} percentage - Progress percentage
 * @returns {string} Status text
 */
export function getProgressStatusText(percentage) {
  if (percentage === 0) return "Not started";
  if (percentage < 25) return "Just started";
  if (percentage < 50) return "Making progress";
  if (percentage < 75) return "Halfway there";
  if (percentage < 100) return "Almost done";
  return "Completed";
}

/**
 * Save lecture progress to localStorage
 * @param {string} courseId - Course ID
 * @param {string} lectureId - Lecture ID
 * @param {number} currentTime - Current playback time in seconds
 * @param {number} duration - Total video duration in seconds
 * @param {boolean} completed - Whether lecture is completed
 */
export function saveLectureProgress(courseId, lectureId, currentTime, duration, completed = false) {
  if (!courseId || !lectureId) return;
  
  const storageKey = getProgressStorageKey(courseId, lectureId);
  const progressData = {
    currentTime,
    duration,
    progressValue: duration > 0 ? currentTime / duration : 0,
    progressPercentage: calculateVideoProgress(currentTime, duration),
    completed,
    lastUpdated: Date.now()
  };
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(progressData));
  } catch (error) {
    console.warn('Error saving lecture progress to localStorage:', error);
  }
}

/**
 * Load lecture progress from localStorage
 * @param {string} courseId - Course ID
 * @param {string} lectureId - Lecture ID
 * @returns {Object|null} Progress data or null
 */
export function loadLectureProgress(courseId, lectureId) {
  if (!courseId || !lectureId) return null;
  
  const storageKey = getProgressStorageKey(courseId, lectureId);
  
  try {
    const data = localStorage.getItem(storageKey);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Error loading lecture progress from localStorage:', error);
  }
  
  return null;
}

/**
 * Clear lecture progress from localStorage
 * @param {string} courseId - Course ID
 * @param {string} lectureId - Lecture ID
 */
export function clearLectureProgress(courseId, lectureId) {
  if (!courseId || !lectureId) return;
  
  const storageKey = getProgressStorageKey(courseId, lectureId);
  
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn('Error clearing lecture progress from localStorage:', error);
  }
}

/**
 * Clear all progress for a course from localStorage
 * @param {string} courseId - Course ID
 */
export function clearCourseProgress(courseId) {
  if (!courseId) return;
  
  const prefix = `${STORAGE_KEY_PREFIX}-${courseId}-lecture-`;
  
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Error clearing course progress from localStorage:', error);
  }
}

// Export completion threshold for use in other modules
export const LECTURE_COMPLETION_THRESHOLD = COMPLETION_THRESHOLD;