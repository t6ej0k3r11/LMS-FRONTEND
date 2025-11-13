import { Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth";
import RouteGuard from "./components/route-guard";
import ErrorBoundary from "./components/ErrorBoundary";
import { useContext } from "react";
import { AuthContext } from "./context/auth-context";
import InstructorDashboardpage from "./pages/instructor";
import StudentViewCommonLayout from "./components/student-view/common-layout";
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
        path="/instructor"
        element={
          <RouteGuard
            element={<InstructorDashboardpage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/admin"
        element={
          <RouteGuard
            element={<AdminDashboard />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
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
        <Route path="payment-return" element={<PaypalPaymentReturnPage />} />
        <Route path="student-courses" element={<StudentCoursesPage />} />
        <Route
          path="course-progress/:id"
          element={<StudentViewCourseProgressPage />}
        />
        <Route path="quiz-player/:quizId" element={<QuizPlayerPage />} />
        <Route path="quiz-results/:quizId" element={<StudentQuizResults />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </ErrorBoundary>
  );
}

export default App;
