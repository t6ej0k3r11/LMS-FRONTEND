import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  fetchStudentViewCourseDetailsService,
  getStudentQuizzesByCourseService,
  createPaymentService,
  checkCoursePurchaseInfoService,
} from "@/services";
import { sanitizeUserInput } from "@/lib/sanitizer";
import { CheckCircle, Globe, Lock, PlayCircle, BookOpen } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState({ enrolled: false, completed: false });
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const handleSetFreePreview = (getCurrentVideoInfo) => {
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.videoUrl);
  };

  const handleFreeEnrollment = async () => {
    if (isEnrolling) return; // Prevent multiple clicks

    setIsEnrolling(true);
    try {
      const response = await createPaymentService({ courseId: studentViewCourseDetails?._id });
      if (response?.success) {
        setEnrollmentSuccess(true);
        setEnrollmentStatus({ enrolled: true, completed: false });
        toast({
          title: "Success",
          description: "Enrollment successful!",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: response?.message || "Enrollment failed.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Enrollment failed.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCreatePayment = async () => {
    try {
      const response = await createPaymentService({ courseId: studentViewCourseDetails?._id, paymentConfirmed: true });
      if (response?.success) {
        if (response?.data?.approveUrl) {
          window.location.href = response.data.approveUrl;
        } else {
          // Simulated payment, enrollment successful
          toast({
            title: "Success",
            description: "Enrollment successful!",
            variant: "default",
          });
          // Perhaps refresh or navigate to course
        }
      } else {
        toast({
          title: "Error",
          description: response?.message || "Payment creation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Payment failed.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) setShowFreePreviewDialog(true);
  }, [displayCurrentVideoFreePreview]);

  useEffect(() => {
    if (currentCourseDetailsId !== null) {
      const fetchStudentViewCourseDetails = async () => {
        const response = await fetchStudentViewCourseDetailsService(
          currentCourseDetailsId
        );

        if (response?.success) {
          setStudentViewCourseDetails(response?.data);
          setLoadingState(false);
        } else {
          setStudentViewCourseDetails(null);
          setLoadingState(false);
        }
      };

      const fetchCourseQuizzes = async () => {
        if (!currentCourseDetailsId) return;
        try {
          const response = await getStudentQuizzesByCourseService(currentCourseDetailsId);
          if (response?.success) {
            setCourseQuizzes(response.data);
          }
        } catch (error) {
          console.log("Failed to fetch quizzes:", error);
          // If 403 Forbidden, user hasn't purchased the course, so don't show quizzes
          if (error.response?.status === 403) {
            setCourseQuizzes([]);
          }
        }
      };

      const checkEnrollment = async () => {
        if (!auth?.user?._id || !currentCourseDetailsId) return;
        const response = await checkCoursePurchaseInfoService(currentCourseDetailsId, auth.user._id);
        if (response?.success) {
          setEnrollmentStatus(response.data);
        }
      };

      fetchStudentViewCourseDetails();
      fetchCourseQuizzes();
      if (auth?.authenticate) {
        checkEnrollment();
      }
    }
  }, [currentCourseDetailsId, setLoadingState, setStudentViewCourseDetails, auth?.authenticate, auth.user._id]);

  useEffect(() => {
    if (id) setCurrentCourseDetailsId(id);
  }, [id, setCurrentCourseDetailsId]);

  useEffect(() => {
    if (!location.pathname.includes("course/details")) {
      setStudentViewCourseDetails(null);
      setCurrentCourseDetailsId(null);
    }
  }, [location.pathname, setStudentViewCourseDetails, setCurrentCourseDetailsId]);

  if (loadingState) return <Skeleton />;

  const getIndexOfFreePreviewUrl =
    studentViewCourseDetails !== null
      ? studentViewCourseDetails?.curriculum?.findIndex(
          (item) => item.freePreview
        )
      : -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-8 lg:p-12 rounded-b-3xl shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            {sanitizeUserInput(studentViewCourseDetails?.title)}
          </h1>
          <p className="text-xl lg:text-2xl mb-6 text-blue-100 leading-relaxed">
            {sanitizeUserInput(studentViewCourseDetails?.subtitle)}
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm lg:text-base">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-medium">Created By</span>
              <span className="text-blue-100">{sanitizeUserInput(studentViewCourseDetails?.instructorName)}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-medium">Created On</span>
              <span className="text-blue-100">{studentViewCourseDetails?.date ? new Date(studentViewCourseDetails.date).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Globe className="h-4 w-4 text-blue-200" />
              <span className="text-blue-100">{sanitizeUserInput(studentViewCourseDetails?.primaryLanguage)}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-medium">Students</span>
              <span className="text-blue-100">
                {studentViewCourseDetails?.students.length}{" "}
                {studentViewCourseDetails?.students.length <= 1 ? "Student" : "Students"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <main className="flex-grow">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What you&apos;ll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {studentViewCourseDetails?.objectives
                  .split(",")
                  .map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{sanitizeUserInput(objective)}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="glass-effect hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span>Course Description</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeUserInput(studentViewCourseDetails?.description, true) }} />
            </CardContent>
          </Card>
          <Card className="glass-effect hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <PlayCircle className="h-5 w-5 text-white" />
                </div>
                <span>Course Curriculum</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentViewCourseDetails?.curriculum?.map(
                (curriculumItem) => (
                  <div key={curriculumItem._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white">
                    <div
                      className={`${
                        curriculumItem?.freePreview
                          ? "cursor-pointer hover:bg-blue-50"
                          : "cursor-not-allowed"
                      } flex items-center space-x-3 mb-3 p-2 rounded-lg transition-colors duration-200`}
                      onClick={
                        curriculumItem?.freePreview
                          ? () => handleSetFreePreview(curriculumItem)
                          : null
                      }
                    >
                      {curriculumItem?.freePreview ? (
                        <PlayCircle className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="font-semibold text-gray-800">{sanitizeUserInput(curriculumItem?.title)}</span>
                      {curriculumItem?.freePreview && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Free Preview</span>
                      )}
                    </div>
                    {/* Show quizzes for this lecture */}
                    {courseQuizzes
                      .filter((quiz) => quiz.lectureId === curriculumItem._id)
                      .map((quiz) => (
                        <div key={quiz._id} className="ml-8 flex items-center space-x-3 text-sm bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-700 font-medium">Quiz: {sanitizeUserInput(quiz.title)}</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">({quiz.questions?.length || 0} questions)</span>
                        </div>
                      ))}
                  </div>
                )
              )}
              {/* Show final quizzes */}
              {courseQuizzes
                .filter((quiz) => !quiz.lectureId)
                .map((quiz) => (
                  <div key={quiz._id} className="border-2 border-purple-200 rounded-xl p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <span className="font-bold text-gray-800">Final Quiz: {sanitizeUserInput(quiz.title)}</span>
                      <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full font-medium">({quiz.questions?.length || 0} questions)</span>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </main>
          <aside className="w-full lg:w-[500px]">
            <Card className="sticky top-4 glass-effect hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-6 space-y-6">
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200">
                  <VideoPlayer
                    url={
                      getIndexOfFreePreviewUrl !== -1
                        ? studentViewCourseDetails?.curriculum[
                            getIndexOfFreePreviewUrl
                          ].videoUrl
                        : ""
                    }
                    width="100%"
                    height="200px"
                  />
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                    {studentViewCourseDetails?.courseType === "free" || studentViewCourseDetails?.pricing === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span className="text-blue-600">${studentViewCourseDetails?.pricing}</span>
                    )}
                  </div>
                  {studentViewCourseDetails?.courseType === "free" || studentViewCourseDetails?.pricing === 0 ? (
                    <p className="text-green-600 font-medium">No payment required</p>
                  ) : (
                    <p className="text-gray-600">One-time payment</p>
                  )}
                </div>

                <div className="space-y-3">
                  {auth?.authenticate ? (
                    enrollmentStatus.enrolled ? (
                      <Button
                        onClick={() => navigate(`/course-progress/${id}`)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        Continue Course
                      </Button>
                    ) : enrollmentSuccess ? (
                      <Button
                        disabled
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg cursor-not-allowed"
                      >
                        ✓ Enrolled Successfully
                      </Button>
                    ) : (
                      <Button
                        onClick={studentViewCourseDetails?.courseType === "free" || studentViewCourseDetails?.pricing === 0 ? handleFreeEnrollment : handleCreatePayment}
                        disabled={isEnrolling}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                      >
                        {isEnrolling ? "Enrolling..." : (studentViewCourseDetails?.courseType === "free" || studentViewCourseDetails?.pricing === 0 ? "Enroll Now" : "Buy Now")}
                      </Button>
                    )
                  ) : (
                    <Button
                      onClick={() => navigate("/auth")}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Login to Enroll
                    </Button>
                  )}
                </div>

                {(enrollmentStatus.enrolled || enrollmentSuccess) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 glass-effect">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Successfully Enrolled</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">Welcome to your learning journey!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
      </div>
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent className="w-[800px]">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg flex items-center justify-center">
            <VideoPlayer
              url={displayCurrentVideoFreePreview}
              width="450px"
              height="200px"
            />
          </div>
          <div className="flex flex-col gap-2">
            {studentViewCourseDetails?.curriculum
              ?.filter((item) => item.freePreview)
              .map((filteredItem) => (
                <p
                  key={filteredItem._id}
                  onClick={() => handleSetFreePreview(filteredItem)}
                  className="cursor-pointer text-[16px] font-medium"
                >
                  {sanitizeUserInput(filteredItem?.title)}
                </p>
              ))}
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="btn-secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseDetailsPage;
