import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { BookOpen, CreditCard, MessageCircle } from "lucide-react";
import ChatPage from "@/pages/chat";
import { useContext, useState } from "react";
import PaymentDetailsModal from "@/components/student-view/payment/PaymentDetailsModal";
import CourseGrid from "./components/CourseGrid";
import PaymentHistory from "./components/PaymentHistory";
import { useStudentCourses } from "@/hooks/useStudentCourses";
import { usePaymentHistory } from "@/hooks/usePaymentHistory";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Use custom hooks for data fetching
  const {
    courses: studentBoughtCoursesList,
    courseProgress,
    courseQuizzes,
    loading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses
  } = useStudentCourses(auth?.user?._id);

  const {
    payments,
    loading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments
  } = usePaymentHistory();

  const handleViewPaymentDetails = (paymentId) => {
    setSelectedPaymentId(paymentId);
    setPaymentModalOpen(true);
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
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            My Payments
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <CourseGrid
            courses={studentBoughtCoursesList}
            courseProgress={courseProgress}
            courseQuizzes={courseQuizzes}
            loading={coursesLoading}
            error={coursesError}
            onRetry={refetchCourses}
          />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentHistory
            payments={payments}
            loading={paymentsLoading}
            error={paymentsError}
            onRetry={refetchPayments}
            onViewDetails={handleViewPaymentDetails}
          />
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
