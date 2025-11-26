import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentBoughtCoursesService, getCurrentCourseProgressService, getStudentQuizzesByCourseService, getStudentPaymentsService } from "@/services";
import { Watch, BookOpen, CheckCircle, AlertCircle, CreditCard, Eye, MessageCircle } from "lucide-react";
import ChatPage from "@/pages/chat";
import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PaymentDetailsModal from "@/components/student-view/payment/PaymentDetailsModal";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } =
    useContext(StudentContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courseProgress, setCourseProgress] = useState({});
  const [courseQuizzes, setCourseQuizzes] = useState({});
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchStudentBoughtCourses = useCallback(async () => {
    if (!auth?.user?._id) return;

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
    }
  }, [auth?.user?._id, setStudentBoughtCoursesList, toast]);

  const fetchStudentPayments = useCallback(async () => {
    if (!auth?.user?._id) return;

    setPaymentsLoading(true);
    try {
      const response = await getStudentPaymentsService();
      if (response?.success) {
        setPayments(response.data.payments || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load your payments. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching student payments:", error);
      toast({
        title: "Error",
        description: "Failed to load your payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPaymentsLoading(false);
    }
  }, [auth?.user?._id, toast]);

  useEffect(() => {
    fetchStudentBoughtCourses();
  }, [fetchStudentBoughtCourses]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      verified: { variant: "default", label: "Approved" },
      failed: { variant: "destructive", label: "Rejected" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Manage your courses, communications and payments</p>
      </div>
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            My Courses
          </TabsTrigger>
          <TabsTrigger value="payments" onClick={fetchStudentPayments} className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            My Payments
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          studentBoughtCoursesList.map((course) => {
            const progress = courseProgress[course.courseId];
            const quizzes = courseQuizzes[course.courseId] || [];
            const finalQuizzes = quizzes.filter(quiz => !quiz.lectureId);
            const completedFinalQuizzes = finalQuizzes.filter(quiz =>
              progress?.quizzesProgress?.find(qp => qp.quizId === quiz._id && qp.completed)
            ).length;

            const isCompleted = progress?.completed || progress?.isCompleted;
            const lecturesViewed = progress?.progress?.filter(p => p.viewed).length || 0;
            const totalLectures = progress?.courseDetails?.curriculum?.length || 0;

            return (
              <Card key={course.courseId} className="flex flex-col card-hover shadow-sm border-0 bg-white fade-in-up">
                <CardContent className="p-0 flex-grow">
                  <img
                    src={course?.courseImage}
                    alt={course?.title}
                    className="h-32 sm:h-40 lg:h-48 w-full object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"
                  />
                  <div className="p-3 sm:p-4 lg:p-6">
                    <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 line-clamp-2">{course?.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      by {course?.instructorName}
                    </p>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center">
                          <Watch className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-500" />
                          Lectures: {lecturesViewed}/{totalLectures}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-500" />
                          Quizzes: {progress?.quizzesProgress?.filter(q => q.completed).length || 0}/{quizzes.length}
                        </span>
                      </div>
                      {finalQuizzes.length > 0 && (
                        <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                          {completedFinalQuizzes === finalQuizzes.length ? (
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                          )}
                          <span className={completedFinalQuizzes === finalQuizzes.length ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                            Final Quiz: {completedFinalQuizzes}/{finalQuizzes.length}
                          </span>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-green-600 font-semibold bg-green-50 px-2 sm:px-3 py-1 rounded-full">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Course Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 sm:p-4 lg:p-6 pt-0">
                  <Button
                    onClick={() =>
                      navigate(`/course-progress/${course?.courseId}`)
                    }
                    className="w-full btn-primary text-sm sm:text-base"
                  >
                    <Watch className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {isCompleted ? 'Review Course' : 'Continue Learning'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Courses Yet</h2>
            <p className="text-gray-600 mb-6">Start your learning journey by exploring our course catalog</p>
            <Button onClick={() => navigate('/courses')} className="btn-primary">
              Browse Courses
            </Button>
          </div>
        )}
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>My Payment History</CardTitle>
              <p className="text-sm text-muted-foreground">View all your payment submissions and their status</p>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-2">Loading payments...</span>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No Payments Yet</h2>
                  <p className="text-gray-600 mb-6">Your payment history will appear here once you make a purchase</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Additional Notes</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell className="font-mono text-sm">{payment._id.slice(-8)}</TableCell>
                          <TableCell className="max-w-xs truncate">{payment.courseId?.title}</TableCell>
                          <TableCell>৳{payment.amount.toLocaleString()}</TableCell>
                          <TableCell className="capitalize">{payment.method.replace('_', ' ')}</TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {payment.referenceNote || "—"}
                          </TableCell>
                          <TableCell>{formatDate(payment.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPaymentId(payment._id);
                                setPaymentModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <ChatPage />
        </TabsContent>
      </Tabs>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        paymentId={selectedPaymentId}
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedPaymentId(null);
        }}
      />
    </div>
  );
}

export default StudentCoursesPage;
