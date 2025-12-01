import { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/auth-context';
import { StudentContext } from '../../../context/student-context';
import {
  fetchStudentBoughtCoursesService,
  getCurrentCourseProgressService,
  getStudentQuizzesByCourseService
} from '../../../services';
import { useToast } from '../../../hooks/use-toast';
import { useStudentContext as useStudentDashboardContext } from '../hooks/useStudentContext';
import { useCourseCache } from '../hooks/useCourseCache';
import { CourseGrid } from './CourseGrid';
import StudentErrorBoundary from '../components/ErrorBoundary';

export default function StudentCourses() {
  const { auth } = useContext(AuthContext);
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } = useContext(StudentContext);
  const { refreshCourses } = useStudentDashboardContext();
  const { getCachedData, setCachedData, clearCache } = useCourseCache();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [courseProgress, setCourseProgress] = useState({});
  const [courseQuizzes, setCourseQuizzes] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStudentBoughtCourses = useCallback(async (forceRefresh = false) => {
    if (!auth?.user?._id) return;

    // Try to load from cache first (stale-while-revalidate)
    const cachedData = getCachedData();
    if (cachedData && !forceRefresh) {
      setStudentBoughtCoursesList(cachedData.courses);
      setCourseProgress(cachedData.progress);
      setCourseQuizzes(cachedData.quizzes);
      setLoading(false);

      // Fetch fresh data in background
      fetchFreshData();
      return;
    }

    setLoading(true);
    await fetchFreshData();
  }, [auth?.user?._id, setStudentBoughtCoursesList, toast, getCachedData]);

  const fetchFreshData = useCallback(async () => {
    try {
      const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
      if (response?.success) {
        setStudentBoughtCoursesList(response?.data);

        // Fetch progress and quizzes for each course
        const progressPromises = response.data.map(async (course) => {
          try {
            const progressResponse = await getCurrentCourseProgressService(course.courseId);
            const quizzesResponse = await getStudentQuizzesByCourseService(course.courseId);
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

        // Cache the fresh data
        setCachedData({
          courses: response.data,
          progress: progressMap,
          quizzes: quizzesMap,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load your courses. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching student courses:", error);
      toast({
        title: "Error",
        description: "Failed to load your courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [auth?.user?._id, setStudentBoughtCoursesList, toast, setCachedData]);

  useEffect(() => {
    fetchStudentBoughtCourses();
  }, [fetchStudentBoughtCourses]);

  const handleRefresh = () => {
    clearCache();
    fetchStudentBoughtCourses(true); // Force refresh
    refreshCourses?.();
  };

  return (
    <StudentErrorBoundary>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Continue your learning journey and track your progress
          </p>
        </div>

        <CourseGrid
          courses={studentBoughtCoursesList || []}
          courseProgress={courseProgress}
          courseQuizzes={courseQuizzes}
          loading={loading}
          onRefresh={handleRefresh}
          onNavigateToCourse={(courseId) => navigate(`/course-progress/${courseId}`)}
          onBrowseCourses={() => navigate('/courses')}
        />
      </div>
    </StudentErrorBoundary>
  );
}