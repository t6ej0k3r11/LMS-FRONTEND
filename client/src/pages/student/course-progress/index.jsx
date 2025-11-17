import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  getCurrentCourseProgressService,
  getStudentQuizzesByCourseService,
  markLectureAsViewedService,
  resetCourseProgressService,
  updateLectureProgressService,
} from "@/services";
import { Check, ChevronLeft, ChevronRight, Play, BookOpen, Lock, List, Trophy, Info } from "lucide-react";
import { useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";

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
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const { id } = useParams();

  // Calculate real-time overall progress percentage and lecture count
  const { overallProgressPercentage, completedLecturesCount } = useMemo(() => {
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
      completedLecturesCount: finalCompletedCount
    };
  }, [studentCurrentCourseProgress, currentLecture, realTimeProgress]);

  const handleProgressUpdate = useCallback(async (progressData) => {
    if (!currentLecture) return;
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
        await updateLectureProgressService(
          auth?.user?._id,
          studentCurrentCourseProgress?.courseDetails?._id,
          currentLecture._id,
          progressData.progressValue
        );
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }
  }, [currentLecture, auth?.user?._id, studentCurrentCourseProgress?.courseDetails?._id]);

  const fetchCurrentCourseProgress = useCallback(async () => {
    const response = await getCurrentCourseProgressService(auth?.user?._id, id);
    if (response?.success) {
      if (!response?.data?.isPurchased) {
        setLockCourse(true);
      } else {
        setStudentCurrentCourseProgress({
          courseDetails: response?.data?.courseDetails,
          progress: response?.data?.progress,
          quizzesProgress: response?.data?.quizzesProgress || [],
        });

        if (response?.data?.completed) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);

          return;
        }

        // Check if course should be marked as completed based on current progress
        const allLecturesCompleted = response?.data?.progress?.every(p => p.viewed && p.progressValue >= 1);
        const allQuizzesCompleted = response?.data?.quizzesProgress?.every(q => q.completed);

        if (allLecturesCompleted && allQuizzesCompleted && !response?.data?.completed) {
          // Trigger course completion check by marking the last lecture as viewed
          const lastLecture = response?.data?.courseDetails?.curriculum[response?.data?.courseDetails?.curriculum.length - 1];
          if (lastLecture) {
            await markLectureAsViewedService(auth?.user?._id, id, lastLecture._id, false);
            // Refresh progress to get updated completion status
            const updatedResponse = await getCurrentCourseProgressService(auth?.user?._id, id);
            if (updatedResponse?.success && updatedResponse?.data?.completed) {
              setStudentCurrentCourseProgress({
                courseDetails: updatedResponse?.data?.courseDetails,
                progress: updatedResponse?.data?.progress,
                quizzesProgress: updatedResponse?.data?.quizzesProgress || [],
              });
              setShowCourseCompleteDialog(true);
              setShowConfetti(true);
              return;
            }
          }
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
    }
  }, [auth?.user?._id, id, setStudentCurrentCourseProgress]);

  const fetchCourseQuizzes = useCallback(async () => {
    const response = await getStudentQuizzesByCourseService(id);
    if (response?.success) {
      setCourseQuizzes(response.data || []);
    }
  }, [id]);

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
        auth.user._id,
        studentCurrentCourseProgress.courseDetails._id,
        currentLecture._id,
        isRewatch
      );

      if (response?.success) {
        // Update context without fetching the entire progress
        setStudentCurrentCourseProgress(prev => {
          if (!prev?.progress) return prev;
          
          const progressExists = prev.progress.some(p => p.lectureId === currentLecture._id);
          
          if (progressExists) {
            return {
              ...prev,
              progress: prev.progress.map(p => 
                p.lectureId === currentLecture._id 
                  ? { ...p, viewed: true }
                  : p
              )
            };
          } else {
            return {
              ...prev,
              progress: [...prev.progress, { lectureId: currentLecture._id, viewed: true }]
            };
          }
        });
        
        setLectureProgress(prev => ({
          ...prev,
          [currentLecture._id]: 1
        }));
      }
    } catch (error) {
      console.error("Error updating course progress:", error);
      // Reset the flag if the request failed
      markedAsViewedRef.current[currentLecture._id] = false;
    }
  }, [currentLecture, auth?.user?._id, studentCurrentCourseProgress?.courseDetails?._id, studentCurrentCourseProgress?.progress, setStudentCurrentCourseProgress]);

  async function handleRewatchCourse() {
    const response = await resetCourseProgressService(
      auth?.user?._id,
      studentCurrentCourseProgress?.courseDetails?._id
    );

    if (response?.success) {
      setCurrentLecture(null);
      setShowConfetti(false);
      setShowCourseCompleteDialog(false);
      fetchCurrentCourseProgress();
    }
  }

  useEffect(() => {
    fetchCurrentCourseProgress();
    fetchCourseQuizzes();
  }, [id, fetchCurrentCourseProgress, fetchCourseQuizzes]);

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

  console.log(currentLecture, "currentLecture");

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#1c1d1f] to-[#252629] text-white overflow-hidden">
      {showConfetti && <Confetti />}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1c1d1f] to-[#2a2b2d] border-b border-gray-700 shadow-lg">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-white hover:bg-gray-700 border border-gray-600 hidden md:flex"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Button>
          <div className="items-center space-x-4 hidden lg:flex">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
              <h1 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {studentCurrentCourseProgress?.courseDetails?.title}
              </h1>
            </div>
            <div className="flex items-center space-x-6 text-sm bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-600/50 shadow-inner">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-blue-500/20 rounded-lg">
                  <Play className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Lectures</span>
                  <span className="font-semibold text-white">{completedLecturesCount || 0}/{studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-green-500/20 rounded-lg">
                  <BookOpen className="h-4 w-4 text-green-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Quizzes</span>
                  <span className="font-semibold text-white">{studentCurrentCourseProgress?.quizzesProgress?.filter(q => q.completed).length || 0}/{courseQuizzes?.length || 0}</span>
                </div>
              </div>
              {(() => {
                const allLecturesCompleted = studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length === studentCurrentCourseProgress?.courseDetails?.curriculum?.length;
                const allQuizzesCompleted = studentCurrentCourseProgress?.quizzesProgress?.filter(q => q.completed).length === courseQuizzes?.length;
                const isCourseCompleted = allLecturesCompleted && allQuizzesCompleted;
                return isCourseCompleted ? (
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-yellow-500/20 rounded-lg">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">Status</span>
                      <span className="font-semibold text-yellow-400">Completed</span>
                    </div>
                  </div>
                ) : null;
              })()}
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-purple-500/20 rounded-lg">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">Progress</span>
                  <span className="font-semibold text-white">{overallProgressPercentage}%</span>
                </div>
              </div>
              {(() => {
                const finalQuizzes = courseQuizzes?.filter(quiz => !quiz.lectureId) || [];
                const completedFinalQuizzes = finalQuizzes.filter(quiz =>
                  studentCurrentCourseProgress?.quizzesProgress?.find(qp => qp.quizId === quiz._id && qp.completed)
                ).length;
                return finalQuizzes.length > 0 ? (
                  <div className={`flex items-center space-x-2 ${completedFinalQuizzes === finalQuizzes.length ? 'text-green-400' : 'text-yellow-400'}`}>
                    <div className="p-1 bg-green-500/20 rounded-lg">
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">Final Quiz</span>
                      <span className="font-semibold">{completedFinalQuizzes}/{finalQuizzes.length}</span>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsSideBarOpen(!isSideBarOpen)}
            className="text-white hover:bg-gray-700 border border-gray-600 transition-all duration-200 md:flex hidden"
            variant="ghost"
          >
            {isSideBarOpen ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
          <div className="md:hidden">
            <Button
              onClick={() => navigate("/student-courses")}
              className="text-white hover:bg-gray-700 border border-gray-600"
              variant="ghost"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 ${
            isSideBarOpen ? "mr-[400px]" : ""
          } transition-all duration-300 md:mr-0`}
        >
          <div className="relative">
            {currentLecture?.videoUrl ? (
              <div className="relative group">
                <VideoPlayer
                  width="100%"
                  height="500px"
                  url={currentLecture.videoUrl}
                  onProgressUpdate={handleProgressUpdate}
                  progressData={currentLecture}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] bg-gradient-to-br from-gray-800 to-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <g fill="none" fillRule="evenodd">
                      <g fill="#9C92AC" fillOpacity="0.1">
                        <circle cx="30" cy="30" r="4"/>
                      </g>
                    </g>
                  </svg>
                </div>
                <div className="text-center z-10">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-xl font-semibold mb-2 text-gray-300">Video not available</p>
                  <p className="text-sm text-gray-500">The video for this lecture is currently being processed or not uploaded.</p>
                </div>
              </div>
            )}
          </div>
          <div className="p-6 bg-gradient-to-r from-[#1c1d1f]/80 to-[#252629]/80 backdrop-blur-sm border-t border-gray-700/50 shadow-inner">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Now Playing</h2>
            </div>
            <h3 className="text-xl font-semibold text-gray-200 mb-3 leading-tight">{currentLecture?.title}</h3>
            {currentLecture?.videoUrl && (
              <div className="flex items-center justify-between mt-4 p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-600/30">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-300">Video Playing</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">
                      {Math.round((realTimeProgress[currentLecture._id] || lectureProgress[currentLecture._id] || 0) * 100)}%
                    </div>
                    <div className="text-xs text-gray-400">Progress</div>
                  </div>
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((realTimeProgress[currentLecture._id] || lectureProgress[currentLecture._id] || 0) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {!currentLecture?.videoUrl && (
              <div className="flex items-center space-x-3 mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-400">Video not available</span>
              </div>
            )}
          </div>
        </div>
        <div
          className={`fixed top-[64px] right-0 bottom-0 w-[400px] bg-gradient-to-b from-[#1c1d1f] to-[#252629] border-l border-gray-700/50 shadow-2xl transition-all duration-300 md:block hidden ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid bg-gradient-to-r from-[#1c1d1f] to-[#252629] w-full grid-cols-3 p-0 h-16 border-b border-gray-700/50">
              <TabsTrigger
                value="content"
                className="text-white rounded-none h-full flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <List className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="quizzes"
                className="text-white rounded-none h-full flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <Trophy className="h-4 w-4" />
                <span>Quizzes</span>
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="text-white rounded-none h-full flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <Info className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {studentCurrentCourseProgress?.courseDetails?.curriculum.map(
                    (item) => (
                      <div key={item._id}>
                        <div
                          className={`flex items-center space-x-3 text-sm font-medium cursor-pointer p-3 rounded-xl transition-all duration-300 border ${
                            currentLecture?._id === item._id
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl border-blue-500/50 scale-105'
                              : 'text-white hover:bg-gray-700/50 border-transparent hover:border-gray-600/50 hover:shadow-md'
                          }`}
                          onClick={() => setCurrentLecture(item)}
                        >
                          <div className={`p-2 rounded-lg ${
                            studentCurrentCourseProgress?.progress?.find(
                              (progressItem) => progressItem.lectureId === item._id
                            )?.viewed
                              ? 'bg-green-500/20'
                              : 'bg-blue-500/20'
                          }`}>
                            {studentCurrentCourseProgress?.progress?.find(
                              (progressItem) => progressItem.lectureId === item._id
                            )?.viewed ? (
                              <Check className="h-5 w-5 text-green-400" />
                            ) : (
                              <Play className="h-5 w-5 text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block truncate font-semibold">{item?.title}</span>
                            <span className="text-xs opacity-75">Lecture {studentCurrentCourseProgress?.courseDetails?.curriculum.indexOf(item) + 1}</span>
                          </div>
                          {studentCurrentCourseProgress?.completed && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-white/30 text-white hover:bg-white/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentLecture(item);
                              }}
                            >
                              Rewatch
                            </Button>
                          )}
                          {currentLecture?._id === item._id && (
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
                          )}
                        </div>
                        {/* Show quizzes after each lecture - now always available */}
                        {courseQuizzes
                          .filter((quiz) => quiz.lectureId === item._id)
                          .map((quiz) => {
                            const quizProgress = studentCurrentCourseProgress?.quizzesProgress?.find(
                              (qp) => qp.quizId === quiz._id
                            );
                            const isQuizCompleted = quizProgress?.completed;

                            return (
                              <div
                                key={quiz._id}
                                className="flex items-center space-x-3 text-sm ml-8 mt-3 p-2 rounded-lg border transition-all duration-200 cursor-pointer bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50 hover:border-gray-500/50"
                                onClick={() => navigate(`/quiz-player/${quiz._id}`)}
                              >
                                <div className={`p-1.5 rounded-md ${
                                  isQuizCompleted
                                    ? 'bg-green-500/20'
                                    : 'bg-blue-500/20'
                                }`}>
                                  {isQuizCompleted ? (
                                    <Check className="h-4 w-4 text-green-400" />
                                  ) : (
                                    <BookOpen className="h-4 w-4 text-blue-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="block truncate font-medium text-white">
                                    Quiz: {quiz?.title}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {isQuizCompleted ? 'Completed' : 'Available anytime'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )
                  )}
                  {/* Show final quizzes */}
                  {courseQuizzes
                    .filter((quiz) => !quiz.lectureId)
                    .map((quiz) => {
                      const quizProgress = studentCurrentCourseProgress?.quizzesProgress?.find(
                        (qp) => qp.quizId === quiz._id
                      );
                      // Final quizzes are now always available after enrollment
                      const isQuizAvailable = true;
                      const isQuizCompleted = quizProgress?.completed;

                      return (
                        <div
                          key={quiz._id}
                          className={`flex items-center space-x-3 text-sm mt-6 p-3 rounded-xl border-2 transition-all duration-300 ${
                            isQuizAvailable
                              ? 'cursor-pointer bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-500/30 hover:border-purple-400/50 hover:shadow-lg'
                              : 'bg-gray-900/50 border-gray-700/50'
                          }`}
                          onClick={() => isQuizAvailable && navigate(`/quiz-player/${quiz._id}`)}
                        >
                          <div className={`p-2 rounded-lg ${
                            isQuizCompleted
                              ? 'bg-green-500/20'
                              : isQuizAvailable
                                ? 'bg-purple-500/20'
                                : 'bg-gray-500/20'
                          }`}>
                            {isQuizCompleted ? (
                              <Check className="h-5 w-5 text-green-400" />
                            ) : isQuizAvailable ? (
                              <BookOpen className="h-5 w-5 text-purple-400" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`block font-semibold text-base ${
                              isQuizAvailable ? 'text-white' : 'text-gray-500'
                            }`}>
                              Final Quiz: {quiz?.title}
                            </span>
                            <span className="text-xs text-gray-400">
                              {isQuizCompleted ? 'Completed' : 'Available anytime'}
                            </span>
                          </div>
                          {isQuizCompleted && (
                            <div className="px-2 py-1 bg-green-500/20 rounded-full">
                              <span className="text-xs font-medium text-green-400">Completed</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="quizzes" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h2 className="text-xl font-bold mb-4">Course Quizzes</h2>
                  {courseQuizzes.length > 0 ? (
                    courseQuizzes.map((quiz) => {
                      const quizProgress = studentCurrentCourseProgress?.quizzesProgress?.find(
                        (qp) => qp.quizId === quiz._id
                      );
                      const isQuizCompleted = quizProgress?.completed;
                      const isLectureQuiz = quiz.lectureId;

                      let isQuizAvailable = false;
                      if (isLectureQuiz) {
                        const lecture = studentCurrentCourseProgress?.courseDetails?.curriculum.find(
                          (lec) => lec._id === quiz.lectureId
                        );
                        isQuizAvailable = studentCurrentCourseProgress?.progress?.find(
                          (progressItem) => progressItem.lectureId === lecture?._id
                        )?.viewed;
                      } else {
                        // Final quiz - available after all lectures are viewed
                        isQuizAvailable = studentCurrentCourseProgress?.courseDetails?.curriculum.every(
                          (lecture) => studentCurrentCourseProgress?.progress?.find(
                            (progressItem) => progressItem.lectureId === lecture._id
                          )?.viewed
                        );
                      }

                      return (
                        <div
                          key={quiz._id}
                          className={`p-5 border-2 rounded-xl transition-all duration-300 hover:shadow-lg ${
                            isQuizAvailable
                              ? 'border-gray-600/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 hover:border-gray-500/50'
                              : 'border-gray-700/50 bg-gradient-to-br from-gray-900/50 to-gray-950/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className={`p-3 rounded-xl ${
                                isQuizCompleted
                                  ? 'bg-green-500/20 border border-green-500/30'
                                  : isQuizAvailable
                                    ? 'bg-blue-500/20 border border-blue-500/30'
                                    : 'bg-gray-500/20 border border-gray-500/30'
                              }`}>
                                {isQuizCompleted ? (
                                  <Check className="h-6 w-6 text-green-400" />
                                ) : isQuizAvailable ? (
                                  <BookOpen className="h-6 w-6 text-blue-400" />
                                ) : (
                                  <Lock className="h-6 w-6 text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-lg mb-1 ${
                                  isQuizAvailable ? 'text-white' : 'text-gray-400'
                                }`}>
                                  {quiz.title}
                                </h3>
                                <p className={`text-sm mb-2 ${
                                  isQuizAvailable ? 'text-gray-300' : 'text-gray-500'
                                }`}>
                                  {quiz.description}
                                </p>
                                <div className="flex items-center space-x-4 text-xs">
                                  <span className={`px-2 py-1 rounded-full ${
                                    isLectureQuiz
                                      ? 'bg-blue-500/20 text-blue-300'
                                      : 'bg-purple-500/20 text-purple-300'
                                  }`}>
                                    {isLectureQuiz ? 'Lecture Quiz' : 'Final Quiz'}
                                  </span>
                                  <span className="text-gray-400">
                                    {quiz.questions?.length || 0} questions
                                  </span>
                                  <span className="text-gray-400">
                                    Passing: {quiz.passingScore}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4">
                              <Button
                                onClick={() => isQuizAvailable && navigate(`/quiz-player/${quiz._id}`)}
                                disabled={!isQuizAvailable}
                                variant={isQuizCompleted ? "secondary" : "default"}
                                size="sm"
                                className={`transition-all duration-200 ${
                                  isQuizCompleted
                                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-500'
                                    : isQuizAvailable
                                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {isQuizCompleted ? 'View Results' : 'Take Quiz'}
                              </Button>
                            </div>
                          </div>
                          {!isQuizAvailable && (
                            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                              <p className="text-xs text-yellow-400">
                                {isLectureQuiz ? 'Complete the associated lecture to unlock this quiz' : 'Complete all lectures to unlock this final quiz'}
                              </p>
                            </div>
                          )}
                          {isQuizCompleted && (
                            <div className="mt-4 flex items-center space-x-2">
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full w-full"></div>
                              </div>
                              <span className="text-xs text-green-400 font-medium">100%</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-400">No quizzes available for this course.</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      About this course
                    </h2>
                    <div className="p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-600/30">
                      <p className="text-gray-300 leading-relaxed">
                        {studentCurrentCourseProgress?.courseDetails?.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                      <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Course Completion Requirements
                      </span>
                    </h3>
                    <div className="space-y-4">
                      <div className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                        studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length === studentCurrentCourseProgress?.courseDetails?.curriculum?.length
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-gray-800/50 border-gray-600/30'
                      }`}>
                        <div className={`p-2 rounded-lg ${
                          studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length === studentCurrentCourseProgress?.courseDetails?.curriculum?.length
                            ? 'bg-green-500/20'
                            : 'bg-blue-500/20'
                        }`}>
                          {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length === studentCurrentCourseProgress?.courseDetails?.curriculum?.length ? (
                            <Check className="h-6 w-6 text-green-400" />
                          ) : (
                            <Play className="h-6 w-6 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-white">Complete all lectures</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${overallProgressPercentage}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-300">
                              {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0}/{studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                        studentCurrentCourseProgress?.quizzesProgress?.filter(q => q.completed).length === courseQuizzes?.length
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-gray-800/50 border-gray-600/30'
                      }`}>
                        <div className={`p-2 rounded-lg ${
                          studentCurrentCourseProgress?.quizzesProgress?.filter(q => q.completed).length === courseQuizzes?.length
                            ? 'bg-green-500/20'
                            : 'bg-purple-500/20'
                        }`}>
                          {studentCurrentCourseProgress?.quizzesProgress?.filter(q => q.completed).length === courseQuizzes?.length ? (
                            <Check className="h-6 w-6 text-green-400" />
                          ) : (
                            <BookOpen className="h-6 w-6 text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-white">Pass all quizzes</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${courseQuizzes?.length > 0 ? (studentCurrentCourseProgress?.quizzesProgress?.filter(q => q.completed).length / courseQuizzes.length) * 100 : 0}%`
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-300">
                              {studentCurrentCourseProgress?.quizzesProgress?.filter(q => q.completed).length || 0}/{courseQuizzes?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {(() => {
                        const finalQuizzes = courseQuizzes?.filter(quiz => !quiz.lectureId) || [];
                        const completedFinalQuizzes = finalQuizzes.filter(quiz =>
                          studentCurrentCourseProgress?.quizzesProgress?.find(qp => qp.quizId === quiz._id && qp.completed)
                        ).length;
                        return finalQuizzes.length > 0 ? (
                          <div className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                            completedFinalQuizzes === finalQuizzes.length
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-gray-800/50 border-gray-600/30'
                          }`}>
                            <div className={`p-2 rounded-lg ${
                              completedFinalQuizzes === finalQuizzes.length
                                ? 'bg-green-500/20'
                                : 'bg-purple-500/20'
                            }`}>
                              {completedFinalQuizzes === finalQuizzes.length ? (
                                <Check className="h-6 w-6 text-green-400" />
                              ) : (
                                <BookOpen className="h-6 w-6 text-purple-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="font-semibold text-white">Pass final quiz with 80% minimum</span>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex-1 bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${finalQuizzes.length > 0 ? (completedFinalQuizzes / finalQuizzes.length) * 100 : 0}%`
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-300">
                                  {completedFinalQuizzes}/{finalQuizzes.length}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Info className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">Important Note</h4>
                        <p className="text-sm text-gray-300 leading-relaxed mb-2">
                          Course completion requires both watching all lectures in full and passing all quizzes (including lesson quizzes and final quiz).
                        </p>
                        <p className="text-sm text-yellow-400 leading-relaxed">
                          Make sure to review all materials thoroughly before attempting the final assessment to ensure success.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>You cant view this page</DialogTitle>
            <DialogDescription>
              Please purchase this course to get access
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={showCourseCompleteDialog} modal={false}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <Label>You have completed the course</Label>
              <div className="flex flex-row gap-3">
                <Button onClick={() => navigate("/student-courses")}>
                  My Courses Page
                </Button>
                <Button onClick={handleRewatchCourse}>Rewatch Course</Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;
