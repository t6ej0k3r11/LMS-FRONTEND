import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizForTakingService } from "@/services";
import { QuizPlayer } from "../../features/quiz/components/QuizPlayer";
import { useToast } from "@/hooks/use-toast";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";

function QuizPlayerPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { auth } = useContext(AuthContext);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const response = await getQuizForTakingService(quizId);
        if (response?.success) {
          setQuizData(response.data.quiz);
        } else {
          toast({
            title: "Cannot load quiz",
            description: response?.message || "Failed to load quiz data.",
            variant: "destructive",
          });
          navigate(-1);
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        const errorMessage = error.response?.data?.message || "Cannot load quiz.";
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

    if (quizId && auth?.user?._id) {
      loadQuiz();
    }
  }, [quizId, auth?.user?._id, navigate, toast]);

  if (loading) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  if (!quizData) {
    return <div className="text-center py-8">Quiz not found.</div>;
  }

  return (
    <QuizPlayer
      quizId={quizId}
      userId={auth?.user?._id}
      quizData={quizData}
      onComplete={(results) => {
        toast({
          title: "Quiz Completed",
          description: `You scored ${results.score}%`,
        });
        navigate(`/quiz-results/${quizId}`);
      }}
      onExit={() => navigate(-1)}
    />
  );
}

export default QuizPlayerPage;