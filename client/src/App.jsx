import { Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import RouteGuard from "./components/route-guard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { useContext } from "react";
import { AuthContext } from "./context/auth-context";
import InstructorDashboardpage from "./pages/instructor";
import InstructorCoursesPage from "./pages/instructor/courses";
import InstructorStudentsPage from "./pages/instructor/students";
import InstructorEarningsPage from "./pages/instructor/earnings";
import InstructorAnalyticsPage from "./pages/instructor/analytics";
import InstructorSettingsPage from "./pages/instructor/settings";
import StudentSettingsPage from "./pages/student/settings";
import AdminSettingsPage from "./pages/admin/settings";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import DashboardLayout from "./components/common/dashboard-layout";
import StudentHomePage from "./pages/student/home";
import NotFoundPage from "./pages/not-found";
import AddNewCoursePage from "./pages/instructor/add-new-course";
import StudentViewCoursesPage from "./pages/student/courses";
import StudentViewCourseDetailsPage from "./pages/student/course-details";
import PaypalPaymentReturnPage from "./pages/student/payment-return";
import StudentCoursesPage from "./pages/student/student-courses";
import StudentViewCourseProgressPage from "./pages/student/course-progress";
import QuizManagementPage from "./pages/instructor/quiz-management";
import QuizForm from "./components/instructor-view/quizzes/QuizForm";
import QuizResults from "./components/instructor-view/quizzes/QuizResults";
import QuizPlayerPage from "./pages/student/quiz-player";
import StudentQuizResults from "./components/student-view/quizzes/QuizResults";
import AdminDashboard from "./pages/admin";
import ChatPage from "./pages/chat";
import NotificationsPage from "./pages/notifications";
import ViewProfilePage from "./pages/view-profile";
import EditProfilePage from "./pages/edit-profile";
import Footer from "./components/Footer";

// Payment pages
import PaymentSelectionPage from "./pages/student/payment";
import OnlinePaymentPage from "./pages/student/payment/online";
import OfflinePaymentPage from "./pages/student/payment/offline";
import PaymentSuccessPage from "./pages/student/payment/success";
import PaymentFailPage from "./pages/student/payment/fail";
import PaymentCancelPage from "./pages/student/payment/cancel";

// Temporary simple component to test rendering
// function TestComponent() {
//   return (
//     <div style={{ padding: '20px', backgroundColor: '#e0f7e0', border: '2px solid green', margin: '20px' }}>
//       <h1 style={{ color: 'green' }}>✅ SUCCESS: App Component Rendered!</h1>
//       <p>The circular dependency issue has been resolved.</p>
//       <p>You can now remove this test component and restore your normal routes.</p>
//     </div>
//   );
// }

function App() {
  const { auth } = useContext(AuthContext);

  return (
    <ErrorBoundary>
      {/* <TestComponent /> */}
      <Routes>
      <Route
        path="/auth"
        element={
          <RouteGuard
            element={<AuthPage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          <RouteGuard
            element={<ForgotPassword />}
            authenticated={false}
            user={null}
          />
        }
      />
      <Route
        path="/auth/reset-password"
        element={
          <RouteGuard
            element={<ResetPassword />}
            authenticated={false}
            user={null}
          />
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedAdminRoute>
            <DashboardLayout userRole="admin" />
          </ProtectedAdminRoute>
        }
      >
        <Route path="" element={<AdminDashboard />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="profile" element={<ViewProfilePage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />
      </Route>
      <Route
        path="/instructor/*"
        element={
          <RouteGuard
            element={<DashboardLayout userRole="instructor" />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      >
        <Route path="" element={<InstructorDashboardpage />} />
        <Route path="courses" element={<InstructorCoursesPage />} />
        <Route path="students" element={<InstructorStudentsPage />} />
        <Route path="earnings" element={<InstructorEarningsPage />} />
        <Route path="analytics" element={<InstructorAnalyticsPage />} />
        <Route path="settings" element={<InstructorSettingsPage />} />
        <Route path="profile" element={<ViewProfilePage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />
      </Route>
      <Route
        path="/instructor/create-new-course"
        element={
          <RouteGuard
            element={<AddNewCoursePage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/edit-course/:courseId"
        element={
          <RouteGuard
            element={<AddNewCoursePage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/quiz-management/:courseId"
        element={
          <RouteGuard
            element={<QuizManagementPage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/quiz-management"
        element={
          <RouteGuard
            element={<QuizManagementPage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/create-quiz/:courseId?"
        element={
          <RouteGuard
            element={<QuizForm />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/edit-quiz/:quizId"
        element={
          <RouteGuard
            element={<QuizForm />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/instructor/quiz-results/:quizId"
        element={
          <RouteGuard
            element={<QuizResults />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/"
        element={
          <RouteGuard
            element={<StudentViewCommonLayout />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      >
        <Route path="" element={<StudentHomePage />} />
        <Route path="home" element={<StudentHomePage />} />
        <Route path="courses" element={<StudentViewCoursesPage />} />
        <Route
          path="course/details/:id"
          element={<StudentViewCourseDetailsPage />}
        />
        <Route path="payment" element={<PaymentSelectionPage />} />
        <Route path="payment/online" element={<OnlinePaymentPage />} />
        <Route path="payment/offline" element={<OfflinePaymentPage />} />
        <Route path="payment/success" element={<PaymentSuccessPage />} />
        <Route path="payment/fail" element={<PaymentFailPage />} />
        <Route path="payment/cancel" element={<PaymentCancelPage />} />
        <Route path="payment-return" element={<PaypalPaymentReturnPage />} />
        <Route path="student-courses" element={<StudentCoursesPage />} />
        <Route
          path="course-progress/:id"
          element={<StudentViewCourseProgressPage />}
        />
        <Route path="quiz-player/:quizId" element={<QuizPlayerPage />} />
        <Route path="quiz-results/:quizId" element={<StudentQuizResults />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<StudentSettingsPage />} />
        <Route path="profile" element={<ViewProfilePage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <Footer />
    </ErrorBoundary>
  );
}

export default App;
