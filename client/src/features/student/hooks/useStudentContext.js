import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '@/context/auth-context';
import { StudentContext } from '@/context/student-context';
import {
  fetchStudentBoughtCoursesService,
  getCurrentCourseProgressService,
  getStudentQuizzesByCourseService
} from '@/services';

export function useStudentContext() {
  const auth = useContext(AuthContext);
  const student = useContext(StudentContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledCourseProgress, setEnrolledCourseProgress] = useState({});
  const [enrolledCourseQuizzes, setEnrolledCourseQuizzes] = useState({});
  const [dataLoading, setDataLoading] = useState(false);

  if (!auth || !student) {
    throw new Error('useStudentContext must be used within AuthProvider and StudentProvider');
  }

  const user = auth.auth.user;
  const isAuthenticated = auth.auth.authenticate;

  // Fetch enrolled courses and progress data
  const fetchEnrolledData = useCallback(async () => {
    if (!isAuthenticated || !user?._id) {
      setEnrolledCourses([]);
      setEnrolledCourseProgress({});
      setEnrolledCourseQuizzes({});
      return;
    }

    try {
      setDataLoading(true);

      const response = await fetchStudentBoughtCoursesService(user._id);
      if (response?.success) {
        setEnrolledCourses(response.data);

        // Fetch progress and quizzes for each course
        const progressPromises = response.data.map(async (course) => {
          try {
            const [progressResponse, quizzesResponse] = await Promise.all([
              getCurrentCourseProgressService(course.courseId),
              getStudentQuizzesByCourseService(course.courseId)
            ]);

            // Debug logs removed

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

        setEnrolledCourseProgress(progressMap);
        setEnrolledCourseQuizzes(quizzesMap);
      } else {
        setEnrolledCourses([]);
        setEnrolledCourseProgress({});
        setEnrolledCourseQuizzes({});
      }
    } catch (error) {
      console.error('Error fetching enrolled courses data:', error);
      setEnrolledCourses([]);
      setEnrolledCourseProgress({});
      setEnrolledCourseQuizzes({});
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    fetchEnrolledData();
  }, [fetchEnrolledData]);

  return {
    // User profile from auth
    user,
    isAuthenticated,

    // Student data - use fetched data for dashboard
    courses: enrolledCourses,
    courseDetails: student.studentViewCourseDetails,
    currentCourseId: student.currentCourseDetailsId,
    courseProgress: enrolledCourseProgress,
    courseQuizzes: enrolledCourseQuizzes,
    quizzes: student.studentQuizzes,
    currentQuiz: student.currentQuiz,
    quizProgress: student.studentQuizProgress,

    // Loading states
    loading: student.loadingState || dataLoading,

    // Setters
    setCourses: student.setStudentBoughtCoursesList,
    setCourseDetails: student.setStudentViewCourseDetails,
    setCurrentCourseId: student.setCurrentCourseDetailsId,
    setCourseProgress: student.setStudentCurrentCourseProgress,
    setQuizzes: student.setStudentQuizzes,
    setCurrentQuiz: student.setCurrentQuiz,
    setQuizProgress: student.setStudentQuizProgress,
    setLoading: student.setLoadingState,

    // Additional methods
    refetchEnrolledData: fetchEnrolledData,
  };
}