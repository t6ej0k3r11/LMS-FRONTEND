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
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const handleSetFreePreview = (getCurrentVideoInfo) => {
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.videoUrl);
  };

  const handleFreeEnrollment = async () => {
    const paymentPayload = {
      userId: auth?.user?._id,
      userName: auth?.user?.userName,
      userEmail: auth?.user?.userEmail,
      orderStatus: "pending",
      paymentMethod: "free",
      paymentStatus: "pending",
      orderDate: new Date(),
      paymentId: "",
      payerId: "",
      instructorId: studentViewCourseDetails?.instructorId,
      instructorName: studentViewCourseDetails?.instructorName,
      courseImage: studentViewCourseDetails?.image,
      courseTitle: studentViewCourseDetails?.title,
      courseId: studentViewCourseDetails?._id,
      coursePricing: 0,
    };

    const response = await createPaymentService(paymentPayload);
    if (response?.success) {
      // Handle success - maybe redirect to course or show success message
      console.log("Free enrollment successful");
    } else {
      console.log("Free enrollment failed");
    }
  };

  const handleCreatePayment = async () => {
    const paymentPayload = {
      userId: auth?.user?._id,
      userName: auth?.user?.userName,
      userEmail: auth?.user?.userEmail,
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "initiated",
      orderDate: new Date(),
      paymentId: "",
      payerId: "",
      instructorId: studentViewCourseDetails?.instructorId,
      instructorName: studentViewCourseDetails?.instructorName,
      courseImage: studentViewCourseDetails?.image,
      courseTitle: studentViewCourseDetails?.title,
      courseId: studentViewCourseDetails?._id,
      coursePricing: studentViewCourseDetails?.pricing,
    };

    const response = await createPaymentService(paymentPayload);
    if (response?.success) {
      if (response?.data?.approveUrl) {
        window.location.href = response.data.approveUrl;
      } else {
        // Simulated payment, enrollment successful
        console.log("Enrollment successful:", response.message);
        // Perhaps refresh or navigate to course
      }
    } else {
      console.log("Payment creation failed");
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
        const response = await getStudentQuizzesByCourseService(currentCourseDetailsId);
        if (response?.success) {
          setCourseQuizzes(response.data);
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
    <div className=" mx-auto p-4">
      <div className="bg-gray-900 text-white p-8 rounded-t-lg">
        <h1 className="text-3xl font-bold mb-4">
          {sanitizeUserInput(studentViewCourseDetails?.title)}
        </h1>
        <p className="text-xl mb-4">{sanitizeUserInput(studentViewCourseDetails?.subtitle)}</p>
        <div className="flex items-center space-x-4 mt-2 text-sm">
          <span>Created By {sanitizeUserInput(studentViewCourseDetails?.instructorName)}</span>
          <span>Created On {studentViewCourseDetails?.date.split("T")[0]}</span>
          <span className="flex items-center">
            <Globe className="mr-1 h-4 w-4" />
            {sanitizeUserInput(studentViewCourseDetails?.primaryLanguage)}
          </span>
          <span>
            {studentViewCourseDetails?.students.length}{" "}
            {studentViewCourseDetails?.students.length <= 1
              ? "Student"
              : "Students"}
          </span>
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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent dangerouslySetInnerHTML={{ __html: sanitizeUserInput(studentViewCourseDetails?.description, true) }} />
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {studentViewCourseDetails?.curriculum?.map(
                (curriculumItem) => (
                  <div key={curriculumItem._id} className="mb-6">
                    <li
                      className={`${
                        curriculumItem?.freePreview
                          ? "cursor-pointer"
                          : "cursor-not-allowed"
                      } flex items-center mb-2`}
                      onClick={
                        curriculumItem?.freePreview
                          ? () => handleSetFreePreview(curriculumItem)
                          : null
                      }
                    >
                      {curriculumItem?.freePreview ? (
                        <PlayCircle className="mr-2 h-4 w-4" />
                      ) : (
                        <Lock className="mr-2 h-4 w-4" />
                      )}
                      <span>{sanitizeUserInput(curriculumItem?.title)}</span>
                    </li>
                    {/* Show quizzes for this lecture */}
                    {courseQuizzes
                      .filter((quiz) => quiz.lectureId === curriculumItem._id)
                      .map((quiz) => (
                        <div key={quiz._id} className="ml-6 flex items-center text-sm text-gray-600 mb-1">
                          <BookOpen className="mr-2 h-3 w-3" />
                          <span>Quiz: {sanitizeUserInput(quiz.title)} ({quiz.questions?.length || 0} questions)</span>
                        </div>
                      ))}
                  </div>
                )
              )}
              {/* Show final quizzes */}
              {courseQuizzes
                .filter((quiz) => !quiz.lectureId)
                .map((quiz) => (
                  <div key={quiz._id} className="ml-4 flex items-center text-sm text-gray-600 mb-2">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Final Quiz: {sanitizeUserInput(quiz.title)} ({quiz.questions?.length || 0} questions)</span>
                  </div>
                ))}
            </CardContent>
          </Card>
        </main>
        <aside className="w-full md:w-[500px]">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="aspect-video mb-4 rounded-lg flex items-center justify-center">
                <VideoPlayer
                  url={
                    getIndexOfFreePreviewUrl !== -1
                      ? studentViewCourseDetails?.curriculum[
                          getIndexOfFreePreviewUrl
                        ].videoUrl
                      : ""
                  }
                  width="450px"
                  height="200px"
                />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  {studentViewCourseDetails?.courseType === "free" || studentViewCourseDetails?.pricing === 0 ? "Free" : `$${studentViewCourseDetails?.pricing}`}
                </span>
              </div>
              {auth?.authenticate ? (
                enrollmentStatus.enrolled ? (
                  <Button
                    onClick={() => navigate(`/course-progress/${id}`)}
                    className="w-full"
                  >
                    Continue Course
                  </Button>
                ) : (
                  <Button
                    onClick={studentViewCourseDetails?.courseType === "free" || studentViewCourseDetails?.pricing === 0 ? handleFreeEnrollment : handleCreatePayment}
                    className="w-full"
                  >
                    {studentViewCourseDetails?.courseType === "free" || studentViewCourseDetails?.pricing === 0 ? "Enroll Now" : "Buy Now"}
                  </Button>
                )
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full"
                >
                  Login to Enroll
                </Button>
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
              <Button type="button" variant="secondary">
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
