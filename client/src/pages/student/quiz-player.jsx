import { useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StudentContext } from "@/context/student-context";
import { checkQuizPrerequisites, canStartNewAttempt } from "@/lib/quiz-utils";
import { getQuizForTakingService } from "@/services";
import QuizPlayer from "@/components/student-view/quizzes/QuizPlayer";

function QuizPlayerPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { studentCurrentCourseProgress } = useContext(StudentContext);

  console.log("🔍 DEBUG: QuizPlayerPage mounted with quizId:", quizId);
  console.log("🔍 DEBUG: Current location:", window.location.pathname);
  console.log("🔍 DEBUG: studentCurrentCourseProgress:", !!studentCurrentCourseProgress);

  useEffect(() => {
    const validateQuizAccess = async () => {
      console.log("🔍 DEBUG: validateQuizAccess starting for quizId:", quizId);
      try {
        const response = await getQuizForTakingService(quizId);
        console.log("🔍 DEBUG: getQuizForTakingService response:", response?.success);
        
        if (response?.success) {
          const quiz = response.data.quiz;
          const existingAttempts = response.data.attempts || [];
          console.log("🔍 DEBUG: Quiz data loaded:", quiz?.title);

          // Check prerequisites
          const prerequisiteCheck = checkQuizPrerequisites(quiz, studentCurrentCourseProgress?.progress || [], existingAttempts, studentCurrentCourseProgress?.courseDetails);
          if (!prerequisiteCheck.canAccess) {
            alert(`Cannot access quiz: ${prerequisiteCheck.reason}`);
            navigate(-1);
            return;
          }

          // Check for multiple simultaneous attempts
          if (!canStartNewAttempt(existingAttempts, quizId)) {
            alert("You already have an active attempt for this quiz.");
            navigate(-1);
            return;
          }
        }
      } catch (error) {
        console.error("Error validating quiz access:", error);
        navigate(-1);
      }
    };

    validateQuizAccess();
  }, [quizId, studentCurrentCourseProgress?.progress, studentCurrentCourseProgress?.courseDetails, navigate]);

  return (
    <div>
      <div style={{ display: 'none' }}>
        Debug info:
        Quiz ID: {quizId}
        Path: {window.location.pathname}
        Progress: {JSON.stringify(studentCurrentCourseProgress?.progress)}
      </div>
      <QuizPlayer />
    </div>
  );
}

export default QuizPlayerPage;