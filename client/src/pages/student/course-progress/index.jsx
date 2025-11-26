import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  getCurrentCourseProgressService,
  getUserCourseProgressService,
  getStudentQuizzesByCourseService,
  markLectureAsViewedService,
  resetCourseProgressService,
  updateLectureProgressService,
} from "@/services";
import {
  Play,
  Info,
  MessageSquare,
  Bell,
  Edit3,
  Lock,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// New Udemy-style components
import CourseSidebar from "./components/CourseSidebar";
import CourseTopBar from "./components/CourseTopBar";
import FloatingNav from "./components/FloatingNav";
import NotesSystem from "./components/NotesSystem";
import QnASection from "./components/QnASection";
import Announcements from "./components/Announcements";
import ResourcesBox from "./components/ResourcesBox";
import CertificateButton from "./components/CertificateButton";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);
  const markedAsViewedRef = useRef({});
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [lectureProgress, setLectureProgress] = useState({});
  const [realTimeProgress, setRealTimeProgress] = useState({});
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const { id } = useParams();

  // New state for Udemy-style features
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Loading and error states
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState(null);

  // Use backend progress data instead of calculating locally
  const { overallProgressPercentage, videoProgressPercentage, completedLecturesCount } = useMemo(() => {
    // Use the simplified progress from backend if available
    if (studentCurrentCourseProgress?.userProgress) {
      return {
        overallProgressPercentage: studentCurrentCourseProgress.userProgress.overallProgressPercentage || 0,
        videoProgressPercentage: studentCurrentCourseProgress.userProgress.videoProgressPercentage || 0,
        completedLecturesCount: studentCurrentCourseProgress.userProgress.completedLessons.length
      };
    }

    // Fallback to legacy calculation
    const totalLectures = studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 1;
    const completedLectures = studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0;

    // Add current lecture's progress if it's not already completed
    let currentLectureContribution = 0;
    let isCurrentLectureCompleted = false;

    if (currentLecture && !studentCurrentCourseProgress?.progress?.find(p => p.lectureId === currentLecture._id)?.viewed) {
      const currentProgress = realTimeProgress[currentLecture._id] || 0;
      currentLectureContribution = currentProgress / totalLectures;

      // If current lecture is 90%+ complete, count it as completed
      if (currentProgress >= 0.9) {
        isCurrentLectureCompleted = true;
      }
    }

    const totalProgress = (completedLectures + currentLectureContribution) / totalLectures * 100;
    const finalCompletedCount = completedLectures + (isCurrentLectureCompleted ? 1 : 0);

    return {
      overallProgressPercentage: Math.min(Math.round(totalProgress), 100),
      videoProgressPercentage: Math.min(Math.round(totalProgress), 100), // Fallback same as overall
      completedLecturesCount: finalCompletedCount
    };
  }, [studentCurrentCourseProgress, currentLecture, realTimeProgress]);

  const fetchUserProgress = useCallback(async () => {
    if (!auth?.authenticate) {
      setProgressError("Authentication required");
      return;
    }

    try {
      const response = await getUserCourseProgressService(id);
      if (response?.success) {
        // Update progress in context with the simplified data
        setStudentCurrentCourseProgress(prev => ({
          ...prev,
          userProgress: {
            completedLessons: response?.data?.completedLessons || [],
            completedQuizzes: response?.data?.completedQuizzes || [],
            videoProgressPercentage: response?.data?.videoProgressPercentage || 0,
            overallProgressPercentage: response?.data?.overallProgressPercentage || 0,
            isCompleted: response?.data?.isCompleted || false,
            completionDate: response?.data?.completionDate,
            lastUpdated: response?.data?.lastUpdated,
          }
        }));
        setProgressError(null);
      } else {
        setProgressError(response?.message || "Failed to fetch user progress");
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
      setProgressError(error.message || "Failed to fetch user progress");
    }
  }, [id, setStudentCurrentCourseProgress, auth?.authenticate]);

  const fetchCourseQuizzes = useCallback(async () => {
    const response = await getStudentQuizzesByCourseService(id);
    if (response?.success) {
      setCourseQuizzes(response.data || []);
    }
  }, [id]);

  const handleProgressUpdate = useCallback(async (progressData) => {
    if (!currentLecture || !auth?.authenticate) return;

    // Debounce progress updates to prevent excessive state updates
    if (Math.abs((currentLecture?.progressValue || 0) - progressData.progressValue) > 0.01) {
      console.log("Progress update received:", progressData.progressValue);
      setCurrentLecture(prev => ({
        ...prev,
        ...progressData
      }));
      setLectureProgress(prev => ({
        ...prev,
        [currentLecture._id]: progressData.progressValue
      }));
      setRealTimeProgress(prev => ({
        ...prev,
        [currentLecture._id]: progressData.progressValue
      }));

      // Save progress to database
      try {
        const response = await updateLectureProgressService(
          studentCurrentCourseProgress?.courseDetails?._id,
          currentLecture._id,
          progressData.progressValue
        );

        if (response?.success) {
          // Refetch progress data for real-time updates
          await fetchUserProgress();
        }
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }
  }, [currentLecture, studentCurrentCourseProgress?.courseDetails?._id, auth?.authenticate, fetchUserProgress]);

  const fetchCurrentCourseProgress = useCallback(async () => {
    if (!auth?.authenticate) {
      setProgressError("Authentication required");
      return;
    }

    setProgressLoading(true);
    setProgressError(null);

    try {
      const response = await getCurrentCourseProgressService(id);
      if (response?.success) {
        if (!response?.data?.isPurchased) {
          setLockCourse(true);
        } else {
          setStudentCurrentCourseProgress({
            courseDetails: response?.data?.courseDetails,
            progress: response?.data?.progress,
            quizzesProgress: response?.data?.quizzesProgress || [],
          });

        // Fetch quizzes since course is purchased
        await fetchCourseQuizzes();

        if (response?.data?.completed) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);

            return;
          }

          if (response?.data?.progress?.length === 0) {
            setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          } else {
            const lastIndexOfViewedAsTrue = response?.data?.progress.reduceRight(
              (acc, obj, index) => {
                return acc === -1 && obj.viewed ? index : acc;
              },
              -1
            );

            const nextLectureIndex = lastIndexOfViewedAsTrue + 1;
            const nextLecture = response?.data?.courseDetails?.curriculum[nextLectureIndex];

            // If all lectures are viewed, show the last lecture
            if (!nextLecture) {
              setCurrentLecture(response?.data?.courseDetails?.curriculum[response?.data?.courseDetails?.curriculum.length - 1]);
            } else {
              setCurrentLecture(nextLecture);
            }

            // Initialize real-time progress from database
            const progressMap = {};
            response?.data?.progress.forEach(p => {
              progressMap[p.lectureId] = p.progressValue || (p.viewed ? 1 : 0);
            });
            setRealTimeProgress(progressMap);
          }
        }
      } else {
        setProgressError(response?.message || "Failed to fetch course progress");
        toast({
          title: "Error",
          description: response?.message || "Failed to fetch course progress",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching course progress:", error);
      setProgressError(error.message || "Failed to fetch course progress");
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch course progress",
        variant: "destructive",
      });
    } finally {
      setProgressLoading(false);
    }
  }, [id, setStudentCurrentCourseProgress, fetchCourseQuizzes, auth?.authenticate]);

  const fetchCourseQuizzes = useCallback(async () => {
    if (!auth?.authenticate) {
      return;
    }

    try {
      const response = await getStudentQuizzesByCourseService(id);
      if (response?.success) {
        setCourseQuizzes(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching course quizzes:", error);
      // Don't show toast for quizzes as they might be optional
    }
  }, [id, auth?.authenticate]);

  const updateCourseProgress = useCallback(async (isRewatch = false) => {
    if (!currentLecture || !auth?.user?._id || !studentCurrentCourseProgress?.courseDetails?._id) return;

    // Check if lecture is already marked as viewed in the context
    const isAlreadyViewed = studentCurrentCourseProgress?.progress?.some(
      p => p.lectureId === currentLecture._id && p.viewed
    );

    // Don't update if already viewed and not rewatching
    if (isAlreadyViewed && !isRewatch) return;

    // Check if we've already sent a request for this lecture
    if (markedAsViewedRef.current[currentLecture._id]) return;
    markedAsViewedRef.current[currentLecture._id] = true;

    try {
      console.log(isRewatch ? "Marking lecture as rewatch:" : "Marking lecture as viewed:", currentLecture._id);
      const response = await markLectureAsViewedService(
        studentCurrentCourseProgress.courseDetails._id,
        currentLecture._id,
        isRewatch
      );

      if (response?.success) {
        // Refetch progress data for real-time updates
        await fetchUserProgress();

        setLectureProgress(prev => ({
          ...prev,
          [currentLecture._id]: 1
        }));

        // Show success toast for lecture completion
        toast({
          title: "Lecture Completed! 🎉",
          description: `"${currentLecture.title}" has been marked as completed.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to update progress",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating course progress:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update progress",
        variant: "destructive",
      });
      // Reset the flag if the request failed
      markedAsViewedRef.current[currentLecture._id] = false;
    }
  }, [currentLecture, auth?.user?._id, studentCurrentCourseProgress?.courseDetails?._id, studentCurrentCourseProgress?.progress, fetchUserProgress]);

  async function handleRewatchCourse() {
    const response = await resetCourseProgressService(
      studentCurrentCourseProgress?.courseDetails?._id
    );

    if (response?.success) {
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);

      // Reset userProgress in context
      setStudentCurrentCourseProgress(prev => ({
        ...prev,
        userProgress: {
          completedLessons: [],
          completedQuizzes: [],
          videoProgressPercentage: 0,
          overallProgressPercentage: 0,
          isCompleted: false,
          completionDate: null,
          lastUpdated: new Date().toISOString(),
        }
      }));

      fetchCurrentCourseProgress();
      fetchUserProgress();
    }
  }

  useEffect(() => {
    fetchCurrentCourseProgress();
    fetchUserProgress();
    fetchCourseQuizzes();
  }, [id, fetchCurrentCourseProgress, fetchUserProgress, fetchCourseQuizzes]);

  // Track real-time progress updates
  const [lastProgressUpdate, setLastProgressUpdate] = useState(null);

  useEffect(() => {
    if (!currentLecture?.progressValue || !currentLecture?._id) return;

    // Only update if progress has changed significantly (to avoid excessive updates)
    if (Math.abs((lastProgressUpdate?.progressValue || 0) - currentLecture.progressValue) > 0.01) {
      setLastProgressUpdate(currentLecture);

      // Update progress in real-time when video is completed
      if (currentLecture.progressValue >= 0.9 && // Consider 90% as completed
          !lectureProgress[currentLecture._id] &&
          !markedAsViewedRef.current[currentLecture._id] &&
          !studentCurrentCourseProgress?.progress?.find(p => p.lectureId === currentLecture._id)?.viewed) {
        const isCompleted = studentCurrentCourseProgress?.completed;
        updateCourseProgress(isCompleted);
      }
    }
  }, [
    currentLecture,
    updateCourseProgress,
    studentCurrentCourseProgress?.progress,
    studentCurrentCourseProgress?.completed,
    lectureProgress,
    lastProgressUpdate,
    setLastProgressUpdate
  ]);

  // Lecture completion no longer triggers automatic quiz redirection
  // Students can access quizzes anytime from the sidebar

  // Reset states when changing lectures
  useEffect(() => {
    if (currentLecture?._id) {
      // Only reset the current lecture's marked state
      const newMarkedState = { ...markedAsViewedRef.current };
      delete newMarkedState[currentLecture._id];
      markedAsViewedRef.current = newMarkedState;

      // Reset last progress update
      setLastProgressUpdate(null);
    }
  }, [currentLecture?._id]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  // Navigation functions for floating nav
  const navigateToPrevious = () => {
    const currentIndex = studentCurrentCourseProgress?.courseDetails?.curriculum?.findIndex(
      lecture => lecture._id === currentLecture?._id
    );
    if (currentIndex > 0) {
      const prevLecture = studentCurrentCourseProgress.courseDetails.curriculum[currentIndex - 1];
      setCurrentLecture(prevLecture);
    }
  };

  const navigateToNext = () => {
    const currentIndex = studentCurrentCourseProgress?.courseDetails?.curriculum?.findIndex(
      lecture => lecture._id === currentLecture?._id
    );
    if (currentIndex < studentCurrentCourseProgress?.courseDetails?.curriculum?.length - 1) {
      const nextLecture = studentCurrentCourseProgress.courseDetails.curriculum[currentIndex + 1];
      setCurrentLecture(nextLecture);
    }
  };

  const isFirstLecture = studentCurrentCourseProgress?.courseDetails?.curriculum?.findIndex(
    lecture => lecture._id === currentLecture?._id
  ) === 0;

  const isLastLecture = studentCurrentCourseProgress?.courseDetails?.curriculum?.findIndex(
    lecture => lecture._id === currentLecture?._id
  ) === studentCurrentCourseProgress?.courseDetails?.curriculum?.length - 1;

  console.log(currentLecture, "currentLecture");

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

  // Show loading state
  if (progressLoading && !studentCurrentCourseProgress?.courseDetails) {
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

  // Show error state
  if (progressError && !studentCurrentCourseProgress?.courseDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Progress</h2>
          <p className="text-gray-600 mb-4">{progressError}</p>
          <Button onClick={fetchCurrentCourseProgress} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {showConfetti && <Confetti />}

      {/* Udemy-style sticky top bar */}
      <CourseTopBar
        courseTitle={studentCurrentCourseProgress?.courseDetails?.title}
        overallProgress={overallProgressPercentage}
        videoProgress={videoProgressPercentage}
        completedLectures={completedLecturesCount}
        totalLectures={studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0}
        onBack={() => navigate("/student-courses")}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div className="flex pt-16"> {/* Account for sticky top bar */}
        {/* Fixed left sidebar */}
        <CourseSidebar
          curriculum={studentCurrentCourseProgress?.courseDetails?.curriculum || []}
          currentLecture={currentLecture}
          completedLessons={studentCurrentCourseProgress?.userProgress?.completedLessons || []}
          onLectureSelect={setCurrentLecture}
          collapsed={sidebarCollapsed}
          courseQuizzes={courseQuizzes}
          completedQuizzes={studentCurrentCourseProgress?.userProgress?.completedQuizzes || []}
        />

        {/* Main content area */}
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-80'}`}>
          <div className="max-w-7xl mx-auto p-6">
            {/* Video player section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
              {currentLecture?.videoUrl ? (
                <div className="relative">
                  <VideoPlayer
                    width="100%"
                    height="500px"
                    url={currentLecture.videoUrl}
                    onProgressUpdate={handleProgressUpdate}
                    progressData={currentLecture}
                    lectureId={currentLecture._id}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="h-10 w-10 text-green-600" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">Video not available</p>
                    <p className="text-gray-500">The video for this lecture is currently being processed.</p>
                  </div>
                </div>
              )}

              {/* Resources box below video */}
              <ResourcesBox
                lecture={currentLecture}
                courseId={studentCurrentCourseProgress?.courseDetails?._id}
              />
            </div>

            {/* Tabs section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 h-14">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:border-b-3 data-[state=active]:border-green-500 data-[state=active]:shadow-sm transition-all duration-200 rounded-none"
                  >
                    <Info className="h-4 w-4" />
                    <span className="font-medium">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="notes"
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:border-b-3 data-[state=active]:border-green-500 data-[state=active]:shadow-sm transition-all duration-200 rounded-none"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span className="font-medium">Notes</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="qna"
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:border-b-3 data-[state=active]:border-green-500 data-[state=active]:shadow-sm transition-all duration-200 rounded-none"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">Q&A</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="announcements"
                    className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:border-b-3 data-[state=active]:border-green-500 data-[state=active]:shadow-sm transition-all duration-200 rounded-none"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="font-medium">Announcements</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">About this course</h2>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {studentCurrentCourseProgress?.courseDetails?.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Overall Progress</span>
                            <span className="text-sm font-medium text-gray-900">
                              {overallProgressPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${overallProgressPercentage}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Video Progress</span>
                            <span className="text-sm font-medium text-gray-900">
                              {videoProgressPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${videoProgressPercentage}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Lectures Completed</span>
                            <span className="text-sm font-medium text-gray-900">
                              {completedLecturesCount}/{studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0}
                            </span>
                          </div>

                          {studentCurrentCourseProgress?.userProgress?.lastUpdated && (
                            <div className="text-xs text-gray-500">
                              Last updated: {new Date(studentCurrentCourseProgress.userProgress.lastUpdated).toLocaleString()}
                            </div>
                          )}

                          {studentCurrentCourseProgress?.userProgress?.isCompleted && studentCurrentCourseProgress?.userProgress?.completionDate && (
                            <div className="text-xs text-green-600 font-medium">
                              Completed on: {new Date(studentCurrentCourseProgress.userProgress.completionDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Status</h3>
                        <div className="space-y-3">
                          {studentCurrentCourseProgress?.courseDetails?.curriculum?.map((lecture, index) => {
                            const isCompleted = studentCurrentCourseProgress?.userProgress?.completedLessons?.includes(lecture._id);
                            return (
                              <div key={lecture._id} className="flex items-center justify-between p-2 rounded border">
                                <div className="flex items-center space-x-2">
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                                  )}
                                  <span className={`text-sm ${isCompleted ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                                    Module {index + 1}: {lecture.title}
                                  </span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {isCompleted ? 'Completed' : 'Pending'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate</h3>
                      <CertificateButton
                        courseId={studentCurrentCourseProgress?.courseDetails?._id}
                        isCompleted={studentCurrentCourseProgress?.userProgress?.isCompleted}
                        overallProgress={overallProgressPercentage}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="p-6">
                  <NotesSystem
                    lectureId={currentLecture?._id}
                    courseId={studentCurrentCourseProgress?.courseDetails?._id}
                    lectureTitle={currentLecture?.title}
                  />
                </TabsContent>

                <TabsContent value="qna" className="p-6">
                  <QnASection
                    courseId={studentCurrentCourseProgress?.courseDetails?._id}
                    lectureId={currentLecture?._id}
                    user={auth?.user}
                  />
                </TabsContent>

                <TabsContent value="announcements" className="p-6">
                  <Announcements
                    courseId={studentCurrentCourseProgress?.courseDetails?._id}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Floating navigation buttons */}
      <FloatingNav
        onPrevious={navigateToPrevious}
        onNext={navigateToNext}
        hasPrevious={!isFirstLecture}
        hasNext={!isLastLecture}
      />

      {/* Course completion dialog */}
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

      <Dialog open={showCourseCompleteDialog} modal={false}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>Congratulations! 🎉</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <Label>You have completed the course</Label>
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
