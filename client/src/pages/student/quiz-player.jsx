import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { validateQuizAccessService } from "@/services";
import QuizPlayer from "@/components/student-view/quizzes/QuizPlayer";
import { useToast } from "@/hooks/use-toast";

function QuizPlayerPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizValidation, setQuizValidation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateQuiz = async () => {
      try {
        setLoading(true);
        const response = await validateQuizAccessService(quizId);
        setQuizValidation(response);
        if (!response?.success || !response?.canStart) {
          toast({
            title: "Cannot access quiz",
            description: response?.message || "Quiz validation failed.",
            variant: "destructive",
          });
          navigate(-1);
        }
      } catch (error) {
        console.error("Error validating quiz access:", error);
        const errorMessage = error.response?.data?.message || "Cannot load quiz.";
        setQuizValidation({ success: false, canStart: false, message: errorMessage });
        toast({
          title: "Cannot load quiz",
          description: errorMessage,
          variant: "destructive",
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    validateQuiz();
  }, [quizId, navigate, toast]);

  if (loading) {
    return <div className="text-center py-8">Validating quiz access...</div>;
  }

  if (!quizValidation?.canStart) {
    return <div className="text-center py-8">Quiz access denied.</div>;
  }

  return <QuizPlayer validation={quizValidation} />;
}

export default QuizPlayerPage;