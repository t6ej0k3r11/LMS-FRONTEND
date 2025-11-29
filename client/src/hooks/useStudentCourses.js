import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  fetchStudentBoughtCoursesService,
  getCurrentCourseProgressService,
  getStudentQuizzesByCourseService
} from "@/services";

// Cache configuration
const CACHE_KEY = 'studentCoursesCache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data if still valid
 */
function getCachedData(studentId) {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${studentId}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(`${CACHE_KEY}_${studentId}`);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Error reading course cache:', error);
    return null;
  }
}

/**
 * Set cached data with timestamp
 */
function setCachedData(studentId, data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(`${CACHE_KEY}_${studentId}`, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error writing course cache:', error);
  }
}

/**
 * Custom hook for managing student courses data with stale-while-revalidate caching
 * @param {string} studentId - Student user ID
 * @returns {Object} Hook state and functions
 */
export function useStudentCourses(studentId) {
  const [courses, setCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [courseQuizzes, setCourseQuizzes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const { toast } = useToast();

  const fetchCourses = useCallback(async (forceRefresh = false) => {
    if (!studentId) return;

    // Try to load from cache first (stale-while-revalidate)
    const cachedData = getCachedData(studentId);
    if (cachedData && !forceRefresh) {
      setCourses(cachedData.courses);
      setCourseProgress(cachedData.courseProgress);
      setCourseQuizzes(cachedData.courseQuizzes);
      setIsStale(true); // Mark as stale, will refresh in background
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetchStudentBoughtCoursesService(studentId);
      if (response?.success) {
        setCourses(response.data);

        // Fetch progress and quizzes for each course
        const progressPromises = response.data.map(async (course) => {
          try {
            const [progressResponse, quizzesResponse] = await Promise.all([
              getCurrentCourseProgressService(course.courseId),
              getStudentQuizzesByCourseService(course.courseId)
            ]);

            return {
              courseId: course.courseId,
              progress: progressResponse?.success ? progressResponse.data : null,
              quizzes: quizzesResponse?.success ? quizzesResponse.data : []
            };
          } catch (error) {
            console.error(`Error fetching progress/quizzes for course ${course.courseId}:`, error);
            return {
              courseId: course.courseId,
              progress: null,
              quizzes: []
            };
          }
        });

        const progressResults = await Promise.all(progressPromises);
        const progressMap = {};
        const quizzesMap = {};
        progressResults.forEach(result => {
          progressMap[result.courseId] = result.progress;
          quizzesMap[result.courseId] = result.quizzes;
        });

        setCourseProgress(progressMap);
        setCourseQuizzes(quizzesMap);
        setIsStale(false);

        // Cache the fresh data
        setCachedData(studentId, {
          courses: response.data,
          courseProgress: progressMap,
          courseQuizzes: quizzesMap
        });
      } else {
        const errorMessage = response?.message || "Failed to load courses";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching student courses:", error);
      const errorMessage = "Failed to load courses. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [studentId, toast]);

  const refetch = useCallback(() => {
    fetchCourses(true); // Force refresh
  }, [fetchCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Background refresh when data becomes stale
  useEffect(() => {
    if (isStale) {
      const timeoutId = setTimeout(() => {
        fetchCourses(true);
      }, 100); // Small delay to avoid immediate re-fetch

      return () => clearTimeout(timeoutId);
    }
  }, [isStale, fetchCourses]);

  return {
    courses,
    courseProgress,
    courseQuizzes,
    loading,
    error,
    isStale,
    refetch
  };
}