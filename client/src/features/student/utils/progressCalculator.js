/**
 * Unified progress calculation utilities for student dashboard
 * Single source of truth for all progress-related calculations
 */

export const progressCalculator = {
  /**
   * Calculate course progress percentage
   * @param {Object} courseProgress - Progress data from backend
   * @param {Array} curriculum - Course curriculum structure
   * @returns {number} Progress percentage (0-100)
   */
  calculateCourseProgress: (courseProgress, curriculum) => {
    if (!curriculum || curriculum.length === 0) return 0;

    const totalLectures = curriculum.reduce((acc, section) => {
      return acc + (section.lectures?.length || 0);
    }, 0);

    if (totalLectures === 0) return 0;

    const completedLectures = courseProgress?.completedLectures?.length || 0;
    return Math.round((completedLectures / totalLectures) * 100);
  },

  /**
   * Calculate lecture progress within a course
   * @param {string} lectureId - Lecture ID
   * @param {Object} courseProgress - Course progress data
   * @returns {number} Lecture progress percentage (0-100)
   */
  calculateLectureProgress: (lectureId, courseProgress) => {
    if (!courseProgress?.lectureProgress) return 0;

    const lectureProgress = courseProgress.lectureProgress[lectureId];
    return lectureProgress?.progress || 0;
  },

  /**
   * Calculate time remaining for a lecture
   * @param {number} duration - Total duration in seconds
   * @param {number} watchedTime - Watched time in seconds
   * @returns {number} Time remaining in seconds
   */
  calculateTimeRemaining: (duration, watchedTime) => {
    return Math.max(0, duration - watchedTime);
  },

  /**
   * Format time remaining for display
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTimeRemaining: (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  },

  /**
   * Calculate overall student progress across all courses
   * @param {Array} courses - Array of enrolled courses with progress
   * @returns {Object} Overall progress stats
   */
  calculateOverallProgress: (courses) => {
    if (!courses || courses.length === 0) {
      return {
        totalCourses: 0,
        completedCourses: 0,
        averageProgress: 0,
        totalTimeSpent: 0,
      };
    }

    const totalCourses = courses.length;
    const completedCourses = courses.filter(course => course.progress >= 100).length;
    const averageProgress = courses.reduce((acc, course) => acc + (course.progress || 0), 0) / totalCourses;
    const totalTimeSpent = courses.reduce((acc, course) => acc + (course.timeSpent || 0), 0);

    return {
      totalCourses,
      completedCourses,
      averageProgress: Math.round(averageProgress),
      totalTimeSpent,
    };
  },

  /**
   * Get next lecture to watch (Continue Watching)
   * @param {Array} courses - Array of enrolled courses
   * @param {Object} progressData - Progress data for all courses
   * @returns {Object|null} Next lecture info or null
   */
  getNextLecture: (courses, progressData) => {
    if (!courses || !progressData) return null;

    for (const course of courses) {
      const courseProgress = progressData[course._id];
      if (!courseProgress) continue;

      // Find the first incomplete lecture
      for (const section of course.curriculum || []) {
        for (const lecture of section.lectures || []) {
          const lectureProgress = courseProgress.lectureProgress?.[lecture._id];
          if (!lectureProgress || lectureProgress.progress < 100) {
            return {
              courseId: course._id,
              courseTitle: course.title,
              lectureId: lecture._id,
              lectureTitle: lecture.title,
              progress: lectureProgress?.progress || 0,
              timeRemaining: this.calculateTimeRemaining(
                lecture.duration || 0,
                lectureProgress?.watchedTime || 0
              ),
            };
          }
        }
      }
    }

    return null;
  },

  /**
   * Calculate quiz progress
   * @param {Object} quizProgress - Quiz progress data
   * @param {Array} questions - Quiz questions
   * @returns {Object} Quiz progress stats
   */
  calculateQuizProgress: (quizProgress, questions) => {
    if (!questions || questions.length === 0) return { completed: 0, total: 0, percentage: 0 };

    const total = questions.length;
    const completed = quizProgress?.answers ? Object.keys(quizProgress.answers).length : 0;
    const percentage = Math.round((completed / total) * 100);

    return {
      completed,
      total,
      percentage,
    };
  },

  /**
   * Calculate assignment progress
   * @param {Array} assignments - Array of assignments
   * @returns {Object} Assignment progress stats
   */
  calculateAssignmentProgress: (assignments) => {
    if (!assignments || assignments.length === 0) {
      return { total: 0, submitted: 0, pending: 0, overdue: 0 };
    }

    const now = new Date();
    const total = assignments.length;
    const submitted = assignments.filter(a => a.submittedAt).length;
    const pending = total - submitted;
    const overdue = assignments.filter(a => !a.submittedAt && new Date(a.dueDate) < now).length;

    return {
      total,
      submitted,
      pending,
      overdue,
    };
  },
};