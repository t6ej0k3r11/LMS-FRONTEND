import { useState, useEffect, useCallback } from 'react';
import { progressCalculator } from '../utils/progressCalculator';
import { useStudentContext } from './useStudentContext';
import { useApi } from './useApi';

export const useContinueWatching = () => {
  const { enrolledCourses } = useStudentContext();
  const { getCourseProgress } = useApi();
  const [continueWatchingData, setContinueWatchingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get continue watching data from localStorage and backend
  const getContinueWatchingData = useCallback(async () => {
    if (!enrolledCourses || enrolledCourses.length === 0) {
      setContinueWatchingData(null);
      setLoading(false);
      return;
    }

    try {
      // Get progress data for all courses
      const progressPromises = enrolledCourses.map(course =>
        getCourseProgress(course._id).catch(() => null)
      );

      const progressResults = await Promise.all(progressPromises);
      const progressData = {};

      progressResults.forEach((progress, index) => {
        if (progress) {
          progressData[enrolledCourses[index]._id] = progress;
        }
      });

      // Find the next lecture to watch
      const nextLecture = progressCalculator.getNextLecture(enrolledCourses, progressData);

      if (nextLecture) {
        // Get localStorage data for this lecture
        const localStorageKey = `course-${nextLecture.courseId}-lecture-${nextLecture.lectureId}-progress`;
        const localProgress = JSON.parse(localStorage.getItem(localStorageKey) || '{}');

        setContinueWatchingData({
          ...nextLecture,
          watchedTime: localProgress.watchedTime || 0,
          lastWatchedAt: localProgress.lastWatchedAt,
        });
      } else {
        setContinueWatchingData(null);
      }
    } catch (error) {
      console.error('Error getting continue watching data:', error);
      setContinueWatchingData(null);
    } finally {
      setLoading(false);
    }
  }, [enrolledCourses, getCourseProgress]);

  // Update progress in localStorage
  const updateProgress = useCallback((courseId, lectureId, progress, watchedTime) => {
    const localStorageKey = `course-${courseId}-lecture-${lectureId}-progress`;
    const progressData = {
      progress,
      watchedTime,
      lastWatchedAt: new Date().toISOString(),
    };

    localStorage.setItem(localStorageKey, JSON.stringify(progressData));

    // Update continue watching data if this is the current lecture
    if (continueWatchingData &&
        continueWatchingData.courseId === courseId &&
        continueWatchingData.lectureId === lectureId) {
      setContinueWatchingData(prev => ({
        ...prev,
        progress,
        watchedTime,
        lastWatchedAt: progressData.lastWatchedAt,
      }));
    }
  }, [continueWatchingData]);

  // Clear progress for a specific lecture
  const clearProgress = useCallback((courseId, lectureId) => {
    const localStorageKey = `course-${courseId}-lecture-${lectureId}-progress`;
    localStorage.removeItem(localStorageKey);

    // Refresh continue watching data
    getContinueWatchingData();
  }, [getContinueWatchingData]);

  useEffect(() => {
    getContinueWatchingData();
  }, [getContinueWatchingData]);

  return {
    continueWatchingData,
    loading,
    updateProgress,
    clearProgress,
    refresh: getContinueWatchingData,
  };
};