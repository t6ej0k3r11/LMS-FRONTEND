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
} from "@/services";
import { Check, ChevronLeft, ChevronRight, Play, BookOpen, Lock } from "lucide-react";
import { useContext, useEffect, useState, useCallback } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [lectureProgress, setLectureProgress] = useState({});
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const { id } = useParams();

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

  const updateCourseProgress = useCallback(async () => {
    if (currentLecture) {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        currentLecture._id
      );

      if (response?.success) {
        fetchCurrentCourseProgress();
        // Update local progress state
        setLectureProgress(prev => ({
          ...prev,
          [currentLecture._id]: 1
        }));
      }
    }
  }, [currentLecture, auth?.user?._id, studentCurrentCourseProgress?.courseDetails?._id, fetchCurrentCourseProgress]);

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

  useEffect(() => {
    if (currentLecture?.progressValue === 1) {
      updateCourseProgress();
    }
  }, [currentLecture, updateCourseProgress]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  console.log(currentLecture, "currentLecture");

  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}
      <div className="flex items-center justify-between p-4 bg-[#1c1d1f] border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-black"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to My Courses Page
          </Button>
          <div className="flex items-center space-x-4 hidden md:flex">
            <h1 className="text-lg font-bold">
              {studentCurrentCourseProgress?.courseDetails?.title}
            </h1>
            <div className="flex items-center space-x-2 text-sm">
              <span>Lectures: {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0}/{studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0}</span>
              <span>Quizzes: {studentCurrentCourseProgress?.quizzesProgress?.filter(q => q.completed).length || 0}/{courseQuizzes?.length || 0}</span>
              <span>Progress: {Math.round((studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0) / (studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 1) * 100)}%</span>
              {(() => {
                const finalQuizzes = courseQuizzes?.filter(quiz => !quiz.lectureId) || [];
                const completedFinalQuizzes = finalQuizzes.filter(quiz =>
                  studentCurrentCourseProgress?.quizzesProgress?.find(qp => qp.quizId === quiz._id && qp.completed)
                ).length;
                return finalQuizzes.length > 0 ? (
                  <span className={completedFinalQuizzes === finalQuizzes.length ? 'text-green-500' : 'text-yellow-500'}>
                    Final Quiz: {completedFinalQuizzes}/{finalQuizzes.length}
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        </div>
        <Button onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
          {isSideBarOpen ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 ${
            isSideBarOpen ? "mr-[400px]" : ""
          } transition-all duration-300`}
        >
          {currentLecture?.videoUrl ? (
            <VideoPlayer
              width="100%"
              height="500px"
              url={currentLecture.videoUrl}
              onProgressUpdate={(progressData) => {
                setCurrentLecture(progressData);
                setLectureProgress(prev => ({
                  ...prev,
                  [currentLecture._id]: progressData.progressValue
                }));
              }}
              progressData={currentLecture}
            />
          ) : (
            <div className="flex items-center justify-center h-[500px] bg-gray-800 text-white">
              <div className="text-center">
                <p className="text-lg mb-2">Video not available</p>
                <p className="text-sm text-gray-400">The video for this lecture is currently being processed or not uploaded.</p>
              </div>
            </div>
          )}
          <div className="p-6 bg-[#1c1d1f]">
            <h2 className="text-2xl font-bold mb-2">{currentLecture?.title}</h2>
            {currentLecture?.videoUrl && (
              <div className="text-sm text-gray-400 mt-2">
                Progress: {Math.round((lectureProgress[currentLecture._id] || 0) * 100)}%
              </div>
            )}
          </div>
        </div>
        <div
          className={`fixed top-[64px] right-0 bottom-0 w-[400px] bg-[#1c1d1f] border-l border-gray-700 transition-all duration-300 ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid bg-[#1c1d1f] w-full grid-cols-3 p-0 h-14">
              <TabsTrigger
                value="content"
                className=" text-black rounded-none h-full"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="quizzes"
                className=" text-black rounded-none h-full"
              >
                Quizzes
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className=" text-black rounded-none h-full"
              >
                Overview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {studentCurrentCourseProgress?.courseDetails?.curriculum.map(
                    (item) => (
                      <div key={item._id}>
                        <div
                          className="flex items-center space-x-2 text-sm text-white font-bold cursor-pointer"
                          onClick={() => setCurrentLecture(item)}
                        >
                          {studentCurrentCourseProgress?.progress?.find(
                            (progressItem) => progressItem.lectureId === item._id
                          )?.viewed ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Play className="h-4 w-4 " />
                          )}
                          <span>{item?.title}</span>
                        </div>
                        {/* Show quizzes after each lecture */}
                        {courseQuizzes
                          .filter((quiz) => quiz.lectureId === item._id)
                          .map((quiz) => {
                            const quizProgress = studentCurrentCourseProgress?.quizzesProgress?.find(
                              (qp) => qp.quizId === quiz._id
                            );
                            const isLectureViewed = studentCurrentCourseProgress?.progress?.find(
                              (progressItem) => progressItem.lectureId === item._id
                            )?.viewed;
                            const isQuizAvailable = isLectureViewed;
                            const isQuizCompleted = quizProgress?.completed;

                            return (
                              <div
                                key={quiz._id}
                                className={`flex items-center space-x-2 text-sm ml-6 mt-2 ${
                                  isQuizAvailable ? 'cursor-pointer text-white' : 'text-gray-500'
                                }`}
                                onClick={() => isQuizAvailable && navigate(`/student/quiz-player/${quiz._id}`)}
                              >
                                {isQuizCompleted ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : isQuizAvailable ? (
                                  <BookOpen className="h-4 w-4 text-blue-400" />
                                ) : (
                                  <Lock className="h-4 w-4 text-gray-500" />
                                )}
                                <span>Quiz: {quiz?.title}</span>
                                {!isQuizAvailable && <span className="text-xs">(Complete lecture first)</span>}
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
                      const allLecturesViewed = studentCurrentCourseProgress?.courseDetails?.curriculum.every(
                        (lecture) => studentCurrentCourseProgress?.progress?.find(
                          (progressItem) => progressItem.lectureId === lecture._id
                        )?.viewed
                      );
                      const isQuizAvailable = allLecturesViewed;
                      const isQuizCompleted = quizProgress?.completed;

                      return (
                        <div
                          key={quiz._id}
                          className={`flex items-center space-x-2 text-sm mt-4 ${
                            isQuizAvailable ? 'cursor-pointer text-white' : 'text-gray-500'
                          }`}
                          onClick={() => isQuizAvailable && navigate(`/student/quiz-player/${quiz._id}`)}
                        >
                          {isQuizCompleted ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : isQuizAvailable ? (
                            <BookOpen className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-500" />
                          )}
                          <span>Final Quiz: {quiz?.title}</span>
                          {!isQuizAvailable && <span className="text-xs">(Complete all lectures first)</span>}
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
                          className={`p-4 border rounded-lg ${
                            isQuizAvailable ? 'border-gray-600 bg-gray-800' : 'border-gray-700 bg-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {isQuizCompleted ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : isQuizAvailable ? (
                                <BookOpen className="h-5 w-5 text-blue-400" />
                              ) : (
                                <Lock className="h-5 w-5 text-gray-500" />
                              )}
                              <div>
                                <h3 className="font-semibold text-white">{quiz.title}</h3>
                                <p className="text-sm text-gray-400">{quiz.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {isLectureQuiz ? 'Lecture Quiz' : 'Final Quiz'} • {quiz.questions?.length || 0} questions • Passing Score: {quiz.passingScore}%
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => isQuizAvailable && navigate(`/student/quiz-player/${quiz._id}`)}
                              disabled={!isQuizAvailable}
                              variant={isQuizCompleted ? "secondary" : "default"}
                              size="sm"
                            >
                              {isQuizCompleted ? 'View Results' : 'Take Quiz'}
                            </Button>
                          </div>
                          {!isQuizAvailable && (
                            <p className="text-xs text-gray-500 mt-2">
                              {isLectureQuiz ? 'Complete the associated lecture to unlock this quiz' : 'Complete all lectures to unlock this final quiz'}
                            </p>
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
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">About this course</h2>
                  <p className="text-gray-400 mb-6">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>

                  <h3 className="text-lg font-semibold mb-3">Course Completion Requirements</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length === studentCurrentCourseProgress?.courseDetails?.curriculum?.length ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 border border-gray-500 rounded-full"></div>
                      )}
                      <span className="text-sm">Complete all lectures ({studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0}/{studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0})</span>
                    </div>

                    {(() => {
                      const finalQuizzes = courseQuizzes?.filter(quiz => !quiz.lectureId) || [];
                      const completedFinalQuizzes = finalQuizzes.filter(quiz =>
                        studentCurrentCourseProgress?.quizzesProgress?.find(qp => qp.quizId === quiz._id && qp.completed)
                      ).length;
                      return finalQuizzes.length > 0 ? (
                        <div className="flex items-center space-x-2">
                          {completedFinalQuizzes === finalQuizzes.length ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <div className="h-5 w-5 border border-gray-500 rounded-full"></div>
                          )}
                          <span className="text-sm">Pass final quiz ({completedFinalQuizzes}/{finalQuizzes.length})</span>
                        </div>
                      ) : null;
                    })()}

                    <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-300">
                        <strong>Note:</strong> Course completion requires both watching all lectures and passing the final quiz with the required score.
                      </p>
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
      <Dialog open={showCourseCompleteDialog}>
        <DialogContent showOverlay={false} className="sm:w-[425px]">
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
