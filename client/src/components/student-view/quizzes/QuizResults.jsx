import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuizResultsService } from "@/services";

function QuizResults() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // Always fetch from server to get complete results
        const response = await getQuizResultsService(quizId);
        if (response?.success) {
          setResults(response.data);
        }
      } catch (error) {
        console.error("Error fetching quiz results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  // Get courseId from results or context
  const courseId = results?.courseId || results?.quiz?.courseId;

  const handleRetakeQuiz = () => {
    navigate(`/student/quiz-player/${quizId}`);
  };

  const handleBackToCourse = () => {
    if (courseId) {
      navigate(`/course-progress/${courseId}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  if (!results) {
    return <div className="text-center py-8">No results found.</div>;
  }

  const { score, passed, answers, quiz } = results || {};

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Results</CardTitle>
          <div className="text-lg text-gray-600">{quiz?.title}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center items-center space-x-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{score}%</div>
              <div className="text-sm text-gray-600">Your Score</div>
            </div>
            <div className="text-center">
              {passed ? (
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600 mx-auto" />
              )}
              <Badge variant={passed ? "default" : "destructive"} className="mt-2">
                {passed ? "Passed" : "Failed"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{quiz?.passingScore}%</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {answers?.filter(a => a.isCorrect === true).length || 0} / {answers?.filter(a => a.isCorrect !== null).length || 0}
              </div>
              <div className="text-sm text-gray-600">Auto-Graded Correct</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {answers && answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {answers.map((answer, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <Badge
                    variant={
                      answer.needsReview
                        ? "secondary"
                        : answer.isCorrect
                        ? "default"
                        : "destructive"
                    }
                  >
                    {answer.needsReview
                      ? "Pending Review"
                      : answer.isCorrect
                      ? "Correct"
                      : "Incorrect"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  {answer.question}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Your answer:</span> {answer.userAnswer || "Not answered"}
                </div>
                {answer.needsReview ? (
                  <div className="text-sm text-orange-600">
                    <span className="font-medium">Status:</span> Awaiting instructor review
                  </div>
                ) : !answer.isCorrect ? (
                  <div className="text-sm text-green-600">
                    <span className="font-medium">Correct answer:</span> {answer.correctAnswer}
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center space-x-4">
        <Button onClick={handleRetakeQuiz} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Retake Quiz
        </Button>
        <Button onClick={handleBackToCourse}>
          Back to Course
        </Button>
      </div>
    </div>
  );
}

export default QuizResults;