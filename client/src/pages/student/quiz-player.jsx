import { useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StudentContext } from "@/context/student-context";
import { checkQuizPrerequisites } from "@/lib/quiz-utils";
import { getQuizForTakingService } from "@/services";
import QuizPlayer from "@/components/student-view/quizzes/QuizPlayer";

function QuizPlayerPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { studentCurrentCourseProgress } = useContext(StudentContext);

  useEffect(() => {
    const validateQuizAccess = async () => {
      try {
        const response = await getQuizForTakingService(quizId);
        if (response?.success) {
          const quiz = response.data.quiz;
          const existingAttempts = response.data.attempts || [];

          // Check prerequisites
          const prerequisiteCheck = checkQuizPrerequisites(quiz, studentCurrentCourseProgress?.progress || [], existingAttempts, studentCurrentCourseProgress?.courseDetails);
          if (!prerequisiteCheck.canAccess) {
            alert(`Cannot access quiz: ${prerequisiteCheck.reason}`);
            navigate(-1);
            return;
          }

          // Allow multiple attempts - no restrictions
        }
      } catch (error) {
        console.error("Error validating quiz access:", error);
        navigate(-1);
      }
    };

    validateQuizAccess();
  }, [quizId, studentCurrentCourseProgress?.progress, studentCurrentCourseProgress?.courseDetails, navigate]);

  return <QuizPlayer />;
}

export default QuizPlayerPage;