import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AuthContext } from "@/context/auth-context";
import { Lock, AlertCircle } from "lucide-react";
import { useContext, useEffect, useState, useCallback } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";

// New refactored components
import CourseSidebar from "./components/CourseSidebar";
import CourseTopBar from "./components/CourseTopBar";
import FloatingNav from "./components/FloatingNav";
import VideoPlayerSection from "./components/VideoPlayerSection";

import CourseContentTabs from "./components/CourseContentTabs";

// Custom hooks
import { useCourseProgress } from "@/hooks/useCourseProgress";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { id } = useParams();

  // State for breadcrumbs - will be updated after course details load
  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Courses", href: "/student-courses" },
  ]);

  const [currentLecture, setCurrentLecture] = useState(null);
  const [realTimeProgress, setRealTimeProgress] = useState({});
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Use the custom hook for course progress
  const {
    courseDetails,
    progress,
    userProgress,
    courseQuizzes,
    loading,
    error,
    lockCourse,
    updateLectureProgress,
    markLectureAsViewed,
    resetProgress,
  } = useCourseProgress(id);

  // Update breadcrumbs when course details are available
  useEffect(() => {
    const items = [
      { label: "Home", href: "/" },
    ];

    // Add course title if available
    if (courseDetails?.title) {
      items.push({
        label: courseDetails.title,
        href: `/course/details/${id}`,
      });
    }

    // Add lecture title if current lecture exists
    if (currentLecture?.title) {
      items.push({
        label: currentLecture.title,
      });
    }

    setBreadcrumbs(items);
  }, [courseDetails, currentLecture, id]);

  // Set initial lecture when course loads
  useEffect(() => {
    if (courseDetails?.curriculum && !currentLecture) {
      if (userProgress?.isCompleted) {
        setCurrentLecture(courseDetails.curriculum[0]);
        setShowCourseCompleteDialog(true);
        setShowConfetti(true);
      } else if (progress?.length === 0) {
        setCurrentLecture(courseDetails.curriculum[0]);
      } else {
        // Find next lecture to watch
        const lastViewedIndex = progress.reduceRight((acc, obj, index) => {
          return acc === -1 && obj.viewed ? index : acc;
        }, -1);

        const nextLectureIndex = lastViewedIndex + 1;
        const nextLecture = courseDetails.curriculum[nextLectureIndex];

        if (!nextLecture) {
          setCurrentLecture(courseDetails.curriculum[courseDetails.curriculum.length - 1]);
        } else {
          setCurrentLecture(nextLecture);
        }

        // Initialize real-time progress
        const progressMap = {};
        progress.forEach(p => {
          progressMap[p.lectureId] = p.progressValue || (p.viewed ? 1 : 0);
        });
        setRealTimeProgress(progressMap);
      }
    }
  }, [courseDetails, progress, userProgress, currentLecture]);

  // Handle progress updates from video player
  const handleProgressUpdate = useCallback(async (progressData) => {
    if (!currentLecture) return;

    setCurrentLecture(prev => ({
      ...prev,
      ...progressData
    }));

    setRealTimeProgress(prev => ({
      ...prev,
      [currentLecture._id]: progressData.progressValue
    }));

    // Save progress to database
    await updateLectureProgress(currentLecture._id, progressData.progressValue);

    // Mark as viewed if 90%+ complete
    if (progressData.progressValue >= 0.9) {
      await markLectureAsViewed(currentLecture._id);
    }
  }, [currentLecture, updateLectureProgress, markLectureAsViewed]);

  // Handle video ended event
  const handleVideoEnded = useCallback(async () => {
    if (!currentLecture) return;

    // Ensure lecture is marked as complete
    await markLectureAsViewed(currentLecture._id);

    // Optionally auto-advance to next lecture
    const currentIndex = courseDetails?.curriculum?.findIndex(
      lecture => lecture._id === currentLecture?._id
    );
    if (currentIndex !== -1 && currentIndex < courseDetails?.curriculum?.length - 1) {
      const nextLecture = courseDetails.curriculum[currentIndex + 1];
      setCurrentLecture(nextLecture);
    }
  }, [currentLecture, courseDetails, markLectureAsViewed]);



  // Navigation functions
  const navigateToPrevious = () => {
    const currentIndex = courseDetails?.curriculum?.findIndex(
      lecture => lecture._id === currentLecture?._id
    );
    if (currentIndex > 0) {
      const prevLecture = courseDetails.curriculum[currentIndex - 1];
      setCurrentLecture(prevLecture);
    }
  };

  const navigateToNext = () => {
    const currentIndex = courseDetails?.curriculum?.findIndex(
      lecture => lecture._id === currentLecture?._id
    );
    if (currentIndex < courseDetails?.curriculum?.length - 1) {
      const nextLecture = courseDetails.curriculum[currentIndex + 1];
      setCurrentLecture(nextLecture);
    }
  };

  const isFirstLecture = courseDetails?.curriculum?.findIndex(
    lecture => lecture._id === currentLecture?._id
  ) === 0;

  const isLastLecture = courseDetails?.curriculum?.findIndex(
    lecture => lecture._id === currentLecture?._id
  ) === courseDetails?.curriculum?.length - 1;

  // Handle course completion
  const handleRewatchCourse = async () => {
    await resetProgress();
    setCurrentLecture(courseDetails?.curriculum[0]);
    setShowConfetti(false);
    setShowCourseCompleteDialog(false);
  };

  // Keyboard shortcuts for lecture navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (!isFirstLecture) {
            navigateToPrevious();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (!isLastLecture) {
            navigateToNext();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFirstLecture, isLastLecture, navigateToPrevious, navigateToNext]);

  // Authentication check
  if (!auth?.authenticate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access your course progress.</p>
          <Button onClick={() => navigate("/auth")} className="bg-blue-600 hover:bg-blue-700">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !courseDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Course Progress</h2>
          <p className="text-gray-600">Please wait while we fetch your progress data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !courseDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Progress</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {showConfetti && <Confetti />}

      {/* Course Top Bar */}
      <CourseTopBar
        courseTitle={courseDetails?.title}
        overallProgress={userProgress?.overallProgressPercentage || 0}
        videoProgress={userProgress?.videoProgressPercentage || 0}
        completedLectures={userProgress?.completedLessons?.length || 0}
        totalLectures={courseDetails?.curriculum?.length || 0}
        onBack={() => navigate("/student-courses")}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex pt-8">
        {/* Course Sidebar */}
        <CourseSidebar
          curriculum={courseDetails?.curriculum || []}
          currentLecture={currentLecture}
          completedLessons={userProgress?.completedLessons || []}
          onLectureSelect={setCurrentLecture}
          collapsed={sidebarCollapsed}
          courseQuizzes={courseQuizzes}
          completedQuizzes={userProgress?.completedQuizzes || []}
          courseId={id}
          realTimeProgress={realTimeProgress}
        />

        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'}`}>
          {/* Breadcrumb Navigation */}
          <div className="px-4 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 overflow-hidden">
            <Breadcrumb items={breadcrumbs} />
          </div>

          <div className="max-w-7xl mx-auto p-4 space-y-4">
            {/* Video Player Section */}
            <VideoPlayerSection
              currentLecture={currentLecture}
              courseId={id}
              onProgressUpdate={handleProgressUpdate}
              onVideoEnded={handleVideoEnded}
              progressData={{}}
            />

            {/* Course Content Tabs */}
            <CourseContentTabs
              courseDetails={courseDetails}
              currentLecture={currentLecture}
              userProgress={userProgress}
              progress={progress}
              realTimeProgress={realTimeProgress}
              courseId={id}
              user={auth?.user}
            />
          </div>
        </div>
      </div>

      {/* Floating Navigation */}
      <FloatingNav
        onPrevious={navigateToPrevious}
        onNext={navigateToNext}
        hasPrevious={!isFirstLecture}
        hasNext={!isLastLecture}
      />

      {/* Course Lock Dialog */}
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>You cannot view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Course Completion Dialog */}
      <Dialog open={showCourseCompleteDialog} modal={false}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>Congratulations! 🎉</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <div>You have completed the course</div>
              <div className="flex flex-row gap-3">
                <Button onClick={() => navigate("/student-courses")} className="bg-green-600 hover:bg-green-700">
                  My Courses Page
                </Button>
                <Button onClick={handleRewatchCourse} variant="outline">
                  Rewatch Course
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;
