/**
 * Progress Calculation Utilities
 * 
 * This module contains utility functions for calculating various types of progress
 * in the LMS system including lecture progress, course progress, and certificate eligibility.
 */

/**
 * Calculate lecture progress percentage
 * @param {number} currentTime - Current playback time in seconds
 * @param {number} duration - Total video duration in seconds
 * @returns {number} Progress percentage (0-100)
 */
export const calculateLectureProgress = (currentTime, duration) => {
  if (!duration || duration <= 0) return 0;
  if (!currentTime || currentTime <= 0) return 0;
  
  const progress = Math.min((currentTime / duration) * 100, 100);
  return Math.round(progress * 100) / 100; // Round to 2 decimal places
};

/**
 * Check if lecture is completed (90% threshold)
 * @param {number} progressPercent - Progress percentage
 * @returns {boolean} True if lecture is considered completed
 */
export const isLectureCompleted = (progressPercent) => {
  return progressPercent >= 90;
};

/**
 * Calculate overall course progress from lectures and quizzes
 * @param {Array} lectures - Array of lecture progress objects
 * @param {Array} quizzes - Array of quiz progress objects
 * @param {Object} courseData - Course metadata (total counts)
 * @returns {Object} Course progress calculation
 */
export const calculateCourseProgress = (lectures, quizzes, courseData) => {
  const { totalLectures = 0, totalQuizzes = 0 } = courseData || {};
  
  // Calculate lecture progress
  const lectureProgress = lectures.reduce((sum, lecture) => {
    return sum + (lecture.progressPercent || 0);
  }, 0);
  
  const completedLectures = lectures.filter(lecture => 
    isLectureCompleted(lecture.progressPercent || 0)
  ).length;
  
  // Calculate quiz progress
  const quizProgress = quizzes.reduce((sum, quiz) => {
    return sum + (quiz.completed ? 100 : 0);
  }, 0);
  
  const completedQuizzes = quizzes.filter(quiz => quiz.completed).length;
  
  // Overall progress calculation
  const totalItems = totalLectures + totalQuizzes;
  
  const overallProgressPercent = totalItems > 0 ? 
    Math.round(((lectureProgress + quizProgress) / totalItems) * 100) / 100 : 0;
  
  // Video progress (lectures only)
  const videoProgressPercent = totalLectures > 0 ? 
    Math.round((lectureProgress / totalLectures) * 100) / 100 : 0;
  
  // Quiz progress
  const quizProgressPercent = totalQuizzes > 0 ? 
    Math.round((quizProgress / totalQuizzes) * 100) / 100 : 0;
  
  // Certificate eligibility (90% of lectures completed)
  const certificateProgressPercent = totalLectures > 0 ? 
    Math.round((completedLectures / totalLectures) * 100) : 0;
  
  return {
    overallProgressPercent: Math.min(overallProgressPercent, 100),
    videoProgressPercent: Math.min(videoProgressPercent, 100),
    quizProgressPercent: Math.min(quizProgressPercent, 100),
    completedLecturesCount: completedLectures,
    totalLecturesCount: totalLectures,
    completedQuizzesCount: completedQuizzes,
    totalQuizzesCount: totalQuizzes,
    certificateEligible: certificateProgressPercent >= 90,
    certificateProgressPercent: Math.min(certificateProgressPercent, 100),
    isCompleted: overallProgressPercent === 100,
  };
};

/**
 * Calculate remaining time for completion
 * @param {Object} progress - Progress object with current stats
 * @returns {Object} Remaining time information
 */
export const calculateRemainingTime = (progress) => {
  const {
    totalLecturesCount = 0,
    completedLecturesCount = 0,
    totalQuizzesCount = 0,
    completedQuizzesCount = 0,
  } = progress;
  
  const remainingLectures = totalLecturesCount - completedLecturesCount;
  const remainingQuizzes = totalQuizzesCount - completedQuizzesCount;
  const totalRemaining = remainingLectures + remainingQuizzes;
  
  return {
    remainingLectures,
    remainingQuizzes,
    totalRemaining,
    completionPercentage: totalLecturesCount + totalQuizzesCount > 0 ? 
      Math.round(((completedLecturesCount + completedQuizzesCount) / 
        (totalLecturesCount + totalQuizzesCount)) * 100) : 0,
  };
};

/**
 * Calculate estimated time to completion
 * @param {Object} progress - Current progress object
 * @param {number} avgLectureTime - Average lecture duration in minutes
 * @param {number} avgQuizTime - Average quiz time in minutes
 * @returns {Object} Time estimation
 */
export const estimateCompletionTime = (progress, avgLectureTime = 30, avgQuizTime = 15) => {
  const { remainingLectures, remainingQuizzes } = calculateRemainingTime(progress);
  
  const estimatedMinutes = (remainingLectures * avgLectureTime) + (remainingQuizzes * avgQuizTime);
  
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;
  
  return {
    estimatedMinutes,
    estimatedHours: hours,
    estimatedDisplay: hours > 0 ? 
      `${hours}h ${minutes}m` : 
      `${minutes}m`,
    isEstimatable: estimatedMinutes > 0,
  };
};

/**
 * Merge local and backend progress data
 * @param {Array} localProgress - Local progress data
 * @param {Array} backendProgress - Backend progress data
 * @returns {Array} Merged progress data
 */
export const mergeLocalAndBackendProgress = (localProgress, backendProgress) => {
  const merged = [...backendProgress];
  
  localProgress.forEach(localItem => {
    const existingIndex = merged.findIndex(item => 
      item.lectureId === localItem.lectureId || item.quizId === localItem.quizId
    );
    
    if (existingIndex >= 0) {
      // Use the higher progress value
      const existing = merged[existingIndex];
      const localProgress = localItem.progressPercent || 0;
      const backendProgress = existing.progressPercent || 0;
      
      if (localProgress > backendProgress) {
        merged[existingIndex] = { ...existing, ...localItem };
      }
    } else {
      // Add new local item
      merged.push(localItem);
    }
  });
  
  return merged;
};

/**
 * Calculate progress streak (consecutive days of activity)
 * @param {Array} activityDates - Array of activity timestamps
 * @returns {Object} Streak information
 */
export const calculateProgressStreak = (activityDates) => {
  if (!activityDates || activityDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null };
  }
  
  const sortedDates = activityDates
    .map(date => new Date(date).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
    .sort((a, b) => new Date(b) - new Date(a));
  
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;
  
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  // Check if user was active today or yesterday (streak breaker)
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    currentStreak = 0;
  }
  
  // Calculate streaks
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const previousDate = new Date(sortedDates[i - 1]);
    const diffDays = Math.floor((previousDate - currentDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 1;
    }
  }
  
  return {
    currentStreak,
    longestStreak,
    lastActivityDate: sortedDates[0],
    totalActiveDays: sortedDates.length,
  };
};

/**
 * Format progress percentage for display
 * @param {number} percent - Progress percentage
 * @param {boolean} showPercentSymbol - Whether to show % symbol
 * @returns {string} Formatted percentage
 */
export const formatProgressPercent = (percent, showPercentSymbol = true) => {
  const rounded = Math.round(percent * 100) / 100;
  return showPercentSymbol ? `${rounded}%` : rounded.toString();
};

/**
 * Get progress color based on percentage
 * @param {number} percent - Progress percentage
 * @returns {string} Tailwind color class
 */
export const getProgressColor = (percent) => {
  if (percent >= 90) return 'bg-green-500';
  if (percent >= 70) return 'bg-blue-500';
  if (percent >= 50) return 'bg-yellow-500';
  if (percent >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};

/**
 * Get progress status text
 * @param {number} percent - Progress percentage
 * @returns {string} Status text
 */
export const getProgressStatus = (percent) => {
  if (percent >= 90) return 'Excellent';
  if (percent >= 70) return 'Good';
  if (percent >= 50) return 'In Progress';
  if (percent >= 25) return 'Getting Started';
  if (percent > 0) return 'Just Started';
  return 'Not Started';
};

/**
 * Validate progress data integrity
 * @param {Object} progress - Progress object to validate
 * @returns {Object} Validation result
 */
export const validateProgressData = (progress) => {
  const errors = [];
  
  // Check if progress percentages are within valid range
  if (progress.overallProgressPercent < 0 || progress.overallProgressPercent > 100) {
    errors.push('Overall progress percentage is out of range');
  }
  
  if (progress.videoProgressPercent < 0 || progress.videoProgressPercent > 100) {
    errors.push('Video progress percentage is out of range');
  }
  
  // Check if completed counts don't exceed total counts
  if (progress.completedLecturesCount > progress.totalLecturesCount) {
    errors.push('Completed lectures count exceeds total lectures count');
  }
  
  if (progress.completedQuizzesCount > progress.totalQuizzesCount) {
    errors.push('Completed quizzes count exceeds total quizzes count');
  }
  
  // Check if certificate eligibility is consistent
  if (progress.certificateEligible && progress.certificateProgressPercent < 90) {
    errors.push('Certificate eligible but progress is below 90%');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate learning velocity (progress per day)
 * @param {Object} progress - Current progress
 * @param {Date} startDate - Course start date
 * @param {Date} endDate - Expected end date
 * @returns {Object} Velocity calculation
 */
export const calculateLearningVelocity = (progress, startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  
  const currentVelocity = elapsedDays > 0 ? progress.overallProgressPercent / elapsedDays : 0;
  const requiredVelocity = remainingDays > 0 ? 
    (100 - progress.overallProgressPercent) / remainingDays : 0;
  
  return {
    currentVelocity: Math.round(currentVelocity * 100) / 100,
    requiredVelocity: Math.round(requiredVelocity * 100) / 100,
    isOnTrack: currentVelocity >= requiredVelocity,
    totalDays,
    elapsedDays,
    remainingDays,
  };
};