import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

/**
 * Custom hook for managing detailed course progress
 * @param {string} courseId - Course ID
 * @returns {Object} Hook state and functions
 */
export function useDetailedCourseProgress(courseId) {
  const [courseProgress, setCourseProgress] = useState({
    overallProgressPercent: 0,
    videoProgressPercent: 0,
    quizProgressPercent: 0,
    completedLecturesCount: 0,
    totalLecturesCount: 0,
    completedQuizzesCount: 0,
    totalQuizzesCount: 0,
    isCompleted: false,
    completionDate: null,
    certificateEligible: false,
    certificateProgressPercent: 0,
    lastAccessedAt: null,
  });

  const [detailedProgress, setDetailedProgress] = useState({
    lectures: [],
    quizzes: [],
  });

  const [courseDetails, setCourseDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lockCourse, setLockCourse] = useState(false);
  const { toast } = useToast();

  // Load course progress from backend
  const fetchCourseProgress = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/progress/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setCourseDetails(result.data?.courseDetails);
        setCourseProgress(result.data?.progress);
        setDetailedProgress(result.data?.detailedProgress);
        
        if (!result.data?.progress) {
          setLockCourse(true);
        }
      } else {
        const errorMessage = result.message || "Failed to load course progress";
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

  // Get certificate progress
  const fetchCertificateProgress = useCallback(async () => {
    if (!courseId) return;

    try {
      const response = await fetch(`/api/progress/certificate/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setCourseProgress(prev => ({
          ...prev,
          certificateEligible: result.data.certificateEligible,
          certificateProgressPercent: result.data.certificateProgressPercent,
        }));
      }
    } catch (error) {
      console.error("Error fetching certificate progress:", error);
    }
  }, [courseId]);

  // Merge localStorage progress with backend
  const mergeLocalProgress = useCallback(async () => {
    try {
      // Collect localStorage progress for this course
      const localLectures = [];
      const localQuizzes = [];
      
      // Get all localStorage keys for this course
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`lecture_progress_${courseId}_`)) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data && data.lectureId && data.progressPercent !== undefined) {
              localLectures.push({
                lectureId: data.lectureId,
                progressPercent: data.progressPercent,
                lastTimestamp: data.lastTimestamp || 0,
                duration: data.duration || 0,
              });
            }
          } catch (error) {
            console.error('Error parsing local progress:', error);
          }
        }
      }

      if (localLectures.length === 0) return; // No local progress to merge

      const response = await fetch('/api/progress/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          courseId,
          localProgress: {
            lectures: localLectures,
            quizzes: localQuizzes,
          },
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state with merged progress
        setCourseProgress(prev => ({
          ...prev,
          ...result.data.mergedProgress,
        }));
        
        toast({
          title: "Progress Synced! 🔄",
          description: "Your local progress has been merged with the server.",
          variant: "default",
        });
        
        // Clear localStorage after successful merge
        localLectures.forEach(lecture => {
          localStorage.removeItem(`lecture_progress_${courseId}_${lecture.lectureId}`);
        });
      }
    } catch (error) {
      console.error('Error merging local progress:', error);
    }
  }, [courseId, toast]);

  // Update specific lecture progress
  const updateLectureProgress = useCallback(async (lectureId, progressData) => {
    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          courseId,
          lectureId,
          ...progressData,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setCourseProgress(prev => ({
          ...prev,
          ...result.data.courseProgress,
        }));

        // Update detailed progress
        setDetailedProgress(prev => {
          const updatedLectures = prev.lectures.map(lecture =>
            lecture.lectureId === lectureId
              ? { ...lecture, ...result.data.lectureProgress }
              : lecture
          );

          // Add new lecture if not exists
          if (!updatedLectures.find(l => l.lectureId === lectureId)) {
            updatedLectures.push({
              lectureId,
              ...result.data.lectureProgress,
            });
          }

          return {
            ...prev,
            lectures: updatedLectures,
          };
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating lecture progress:', error);
      return false;
    }
  }, [courseId]);

  // Update quiz progress
  const updateQuizProgress = useCallback(async (quizId, progressData) => {
    try {
      const response = await fetch('/api/progress/quiz/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          courseId,
          quizId,
          ...progressData,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setCourseProgress(prev => ({
          ...prev,
          ...result.data.courseProgress,
        }));

        // Update detailed progress
        setDetailedProgress(prev => {
          const updatedQuizzes = prev.quizzes.map(quiz =>
            quiz.quizId === quizId
              ? { ...quiz, ...result.data.quizProgress }
              : quiz
          );

          // Add new quiz if not exists
          if (!updatedQuizzes.find(q => q.quizId === quizId)) {
            updatedQuizzes.push({
              quizId,
              ...result.data.quizProgress,
            });
          }

          return {
            ...prev,
            quizzes: updatedQuizzes,
          };
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating quiz progress:', error);
      return false;
    }
  }, [courseId]);

  // Reset course progress
  const resetCourseProgress = useCallback(async () => {
    try {
      // This would need to be implemented in backend
      // For now, we'll just reset local state and show a message
      setCourseProgress({
        overallProgressPercent: 0,
        videoProgressPercent: 0,
        quizProgressPercent: 0,
        completedLecturesCount: 0,
        totalLecturesCount: courseProgress.totalLecturesCount,
        completedQuizzesCount: 0,
        totalQuizzesCount: courseProgress.totalQuizzesCount,
        isCompleted: false,
        completionDate: null,
        certificateEligible: false,
        certificateProgressPercent: 0,
        lastAccessedAt: null,
      });

      setDetailedProgress({
        lectures: [],
        quizzes: [],
      });

      // Clear localStorage for this course
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`lecture_progress_${courseId}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      toast({
        title: "Progress Reset",
        description: "Course progress has been reset locally. Contact support to reset server data.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error resetting course progress:', error);
    }
  }, [courseId, courseProgress.totalLecturesCount, courseProgress.totalQuizzesCount, toast]);

  // Get lecture progress
  const getLectureProgress = useCallback((lectureId) => {
    return detailedProgress.lectures.find(l => l.lectureId === lectureId);
  }, [detailedProgress.lectures]);

  // Get quiz progress
  const getQuizProgress = useCallback((quizId) => {
    return detailedProgress.quizzes.find(q => q.quizId === quizId);
  }, [detailedProgress.quizzes]);

  // Get overall completion percentage
  const getCompletionPercentage = useCallback(() => {
    return courseProgress.overallProgressPercent || 0;
  }, [courseProgress.overallProgressPercent]);

  // Check if course is eligible for certificate
  const isCertificateEligible = useCallback(() => {
    return courseProgress.certificateEligible || false;
  }, [courseProgress.certificateEligible]);

  // Get next uncompleted lecture
  const getNextUncompletedLecture = useCallback(() => {
    return detailedProgress.lectures.find(lecture => !lecture.completed);
  }, [detailedProgress.lectures]);

  // Get completed lectures count
  const getCompletedLecturesCount = useCallback(() => {
    return courseProgress.completedLecturesCount || 0;
  }, [courseProgress.completedLecturesCount]);

  // Get total lectures count
  const getTotalLecturesCount = useCallback(() => {
    return courseProgress.totalLecturesCount || 0;
  }, [courseProgress.totalLecturesCount]);

  // Refresh all data
  const refetch = useCallback(() => {
    fetchCourseProgress();
    fetchCertificateProgress();
  }, [fetchCourseProgress, fetchCertificateProgress]);

  // Initialize on mount
  useEffect(() => {
    fetchCourseProgress();
    fetchCertificateProgress();
    
    // Merge local progress on mount
    mergeLocalProgress();
  }, [fetchCourseProgress, fetchCertificateProgress, mergeLocalProgress]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCourseProgress();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCourseProgress]);

  return {
    // State
    courseProgress,
    detailedProgress,
    courseDetails,
    loading,
    error,
    lockCourse,

    // Actions
    fetchCourseProgress,
    fetchCertificateProgress,
    mergeLocalProgress,
    updateLectureProgress,
    updateQuizProgress,
    resetCourseProgress,
    refetch,

    // Computed getters
    getLectureProgress,
    getQuizProgress,
    getCompletionPercentage,
    isCertificateEligible,
    getNextUncompletedLecture,
    getCompletedLecturesCount,
    getTotalLecturesCount,

    // Convenience getters
    overallProgress: courseProgress.overallProgressPercent,
    videoProgress: courseProgress.videoProgressPercent,
    quizProgress: courseProgress.quizProgressPercent,
    completedLectures: courseProgress.completedLecturesCount,
    totalLectures: courseProgress.totalLecturesCount,
    completedQuizzes: courseProgress.completedQuizzesCount,
    totalQuizzes: courseProgress.totalQuizzesCount,
    isCompleted: courseProgress.isCompleted,
    certificateProgress: courseProgress.certificateProgressPercent,
    lastAccessed: courseProgress.lastAccessedAt,
  };
}