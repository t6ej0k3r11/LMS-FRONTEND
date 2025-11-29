import { useState, useEffect, useCallback } from 'react';
import { useStudentContext } from './useStudentContext';

export function useContinueWatching() {
  const { courses, courseProgress, loading } = useStudentContext();
  const [continueWatching, setContinueWatching] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getLocalStorageProgress = useCallback(() => {
    const progressData = {};

    // Get all localStorage keys related to progress
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('-progress')) {
        try {
          const value = JSON.parse(localStorage.getItem(key));
          progressData[key] = value;
        } catch {
          // Invalid JSON, skip
        }
      }
    }

    return progressData;
  }, []);

  const findMostRecentPartialLecture = useCallback((localProgress, backendProgress) => {
    let mostRecent = null;
    let mostRecentTime = 0;

    // Check localStorage progress
    Object.entries(localProgress).forEach(([key, data]) => {
      const match = key.match(/course-(.+)-lecture-(.+)-progress/);
      if (match) {
        const [, courseId, lectureId] = match;
        // Handle video player format: { timestamp: seconds, lastUpdated: timestamp }
        // Convert to progress format expected by the rest of the system
        const playedSeconds = data.timestamp || 0;
        const lastUpdated = data.lastUpdated || data.timestamp || 0;

        // Find the course and lecture to calculate progress percentage
        const course = courses?.find(c => c.courseId === courseId);
        const lecture = course?.curriculum?.find(l => l._id === lectureId);

        if (lecture && lecture.duration > 0) {
          const progress = Math.min(playedSeconds / lecture.duration, 1);

          // Only consider partially watched lectures (10-95% complete)
          if (progress > 0.1 && progress < 0.95 && lastUpdated > mostRecentTime) {
            mostRecent = {
              courseId,
              lectureId,
              progress,
              timestamp: lastUpdated,
              source: 'localStorage',
            };
            mostRecentTime = lastUpdated;
          }
        }
      }
    });

    // Check backend progress for comparison
    if (backendProgress) {
      Object.entries(backendProgress).forEach(([courseId, courseData]) => {
        if (courseData?.lectures) {
          Object.entries(courseData.lectures).forEach(([lectureId, lectureData]) => {
            const progress = lectureData.progress || 0;
            const timestamp = lectureData.lastWatched || 0;

            // Only consider partially watched lectures
            if (progress > 0.1 && progress < 0.95 && timestamp > mostRecentTime) {
              mostRecent = {
                courseId,
                lectureId,
                progress,
                timestamp,
                source: 'backend',
              };
              mostRecentTime = timestamp;
            }
          });
        }
      });
    }

    return mostRecent;
  }, []);

  const getContinueWatchingData = useCallback(async () => {
    if (loading || !courses?.length) {
      setIsLoading(false);
      return;
    }

    try {
      const localProgress = getLocalStorageProgress();
      const recentLecture = findMostRecentPartialLecture(localProgress, courseProgress);

      if (recentLecture) {
        // Find the course and lecture details
        const course = courses.find(c => c.courseId === recentLecture.courseId);
        if (course) {
          const lecture = course.curriculum?.find(l => l._id === recentLecture.lectureId);

          if (lecture) {
            const remainingTime = lecture.duration
              ? Math.max(0, lecture.duration - (lecture.duration * recentLecture.progress))
              : 0;

            setContinueWatching({
              courseId: recentLecture.courseId,
              lectureId: recentLecture.lectureId,
              courseTitle: course.title,
              lectureTitle: lecture.title,
              progress: recentLecture.progress,
              remainingTime,
              thumbnail: lecture.thumbnail || course.image,
              source: recentLecture.source,
            });
          }
        }
      } else {
        setContinueWatching(null);
      }
    } catch (error) {
      console.error('Error getting continue watching data:', error);
      setContinueWatching(null);
    } finally {
      setIsLoading(false);
    }
  }, [courses, courseProgress, loading, getLocalStorageProgress, findMostRecentPartialLecture]);

  useEffect(() => {
    getContinueWatchingData();
  }, [getContinueWatchingData]);

  const updateProgress = useCallback((courseId, lectureId, progress) => {
    const key = `course-${courseId}-lecture-${lectureId}-progress`;
    const data = {
      progress,
      timestamp: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(data));

    // Refresh continue watching data
    getContinueWatchingData();
  }, [getContinueWatchingData]);

  const clearProgress = useCallback((courseId, lectureId) => {
    const key = `course-${courseId}-lecture-${lectureId}-progress`;
    localStorage.removeItem(key);

    // Refresh continue watching data
    getContinueWatchingData();
  }, [getContinueWatchingData]);

  return {
    continueWatching,
    isLoading,
    updateProgress,
    clearProgress,
    refresh: getContinueWatchingData,
  };
}