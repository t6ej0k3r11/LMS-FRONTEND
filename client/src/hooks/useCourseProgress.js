import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import {
  getCurrentCourseProgressService,
  getUserCourseProgressService,
  getStudentQuizzesByCourseService,
  markLectureAsViewedService,
  updateLectureProgressService,
  resetCourseProgressService,
} from "@/services";

/**
 * Custom hook for managing course progress data and operations
 * @param {string} courseId - Course ID
 * @returns {Object} Hook state and functions
 */
export function useCourseProgress(courseId) {
  const [courseDetails, setCourseDetails] = useState(null);
  const [progress, setProgress] = useState([]);
  const [quizzesProgress, setQuizzesProgress] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lockCourse, setLockCourse] = useState(false);
  const { toast } = useToast();

  const fetchCourseProgress = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getCurrentCourseProgressService(courseId);
      if (response?.success) {
        if (!response?.data?.isPurchased) {
          setLockCourse(true);
        } else {
          setCourseDetails(response?.data?.courseDetails);
          setProgress(response?.data?.progress || []);
          setQuizzesProgress(response?.data?.quizzesProgress || []);
        }
      } else {
        const errorMessage = response?.message || "Failed to load course progress";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching course progress:", error);
      const errorMessage = "Failed to load course progress. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  const fetchUserProgress = useCallback(async () => {
    if (!courseId) return;

    try {
      const response = await getUserCourseProgressService(courseId);
      if (response?.success) {
        setUserProgress(response?.data);
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  }, [courseId]);

  const fetchCourseQuizzes = useCallback(async () => {
    if (!courseId) return;

    try {
      const response = await getStudentQuizzesByCourseService(courseId);
      if (response?.success) {
        setCourseQuizzes(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching course quizzes:", error);
    }
  }, [courseId]);

  const updateLectureProgress = useCallback(async (lectureId, progressValue) => {
    try {
      const response = await updateLectureProgressService(courseId, lectureId, progressValue);
      if (response?.success) {
        await fetchUserProgress(); // Refresh user progress
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating lecture progress:", error);
      return false;
    }
  }, [courseId, fetchUserProgress]);

  const markLectureAsViewed = useCallback(async (lectureId, isRewatch = false) => {
    try {
      const response = await markLectureAsViewedService(courseId, lectureId, isRewatch);
      if (response?.success) {
        await fetchUserProgress(); // Refresh user progress
        toast({
          title: "Lecture Completed! 🎉",
          description: "Your progress has been updated.",
          variant: "default",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to update progress",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error marking lecture as viewed:", error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
      return false;
    }
  }, [courseId, fetchUserProgress, toast]);

  const resetProgress = useCallback(async () => {
    try {
      const response = await resetCourseProgressService(courseId);
      if (response?.success) {
        // Reset all local state
        setUserProgress({
          completedLessons: [],
          completedQuizzes: [],
          videoProgressPercentage: 0,
          overallProgressPercentage: 0,
          isCompleted: false,
          completionDate: null,
          lastUpdated: new Date().toISOString(),
        });
        await fetchCourseProgress();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error resetting course progress:", error);
      return false;
    }
  }, [courseId, fetchCourseProgress]);

  const refetch = useCallback(() => {
    fetchCourseProgress();
    fetchUserProgress();
    fetchCourseQuizzes();
  }, [fetchCourseProgress, fetchUserProgress, fetchCourseQuizzes]);

  useEffect(() => {
    fetchCourseProgress();
    fetchUserProgress();
    fetchCourseQuizzes();
  }, [fetchCourseProgress, fetchUserProgress, fetchCourseQuizzes]);

  return {
    courseDetails,
    progress,
    quizzesProgress,
    userProgress,
    courseQuizzes,
    loading,
    error,
    lockCourse,
    updateLectureProgress,
    markLectureAsViewed,
    resetProgress,
    refetch,
  };
}