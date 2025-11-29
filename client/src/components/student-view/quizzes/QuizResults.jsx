import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentContext } from "@/context/student-context";
import { CheckCircle, XCircle, RotateCcw, Eye } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuizResultsService } from "@/services";

function QuizResults() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { studentQuizProgress } = useContext(StudentContext);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // First check if we have results in context
        if (studentQuizProgress[quizId]) {
          setResults(studentQuizProgress[quizId]);
        } else {
          // Otherwise fetch from server
          const response = await getQuizResultsService(quizId);
          if (response?.success) {
            setResults(response.data);
          }
        }
      } catch (error) {
        console.error("Error fetching quiz results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId, studentQuizProgress]);

  // Get courseId from results or context
  const courseId = results?.courseId || results?.quiz?.courseId;

  const handleRetakeQuiz = () => {
    navigate(`/student/quiz-player/${quizId}`);
  };

  const handleReviewQuiz = () => {
    navigate(`/student/quiz-player/${quizId}?mode=review`);
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

      {/* Analytics Summary */}
      {answers && answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quiz Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {answers.filter(a => a.timeSpent).reduce((sum, a) => sum + (a.timeSpent || 0), 0) ?
                    `${Math.round(answers.filter(a => a.timeSpent).reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 1000)}s` :
                    'N/A'}
                </div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {answers.filter(a => a.timeSpent).length > 0 ?
                    `${Math.round(answers.filter(a => a.timeSpent).reduce((sum, a) => sum + (a.timeSpent || 0), 0) / answers.filter(a => a.timeSpent).length / 1000)}s` :
                    'N/A'}
                </div>
                <div className="text-sm text-gray-600">Avg per Question</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {answers.filter(a => a.isCorrect === true).length}
                </div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {answers.filter(a => a.needsReview).length}
                </div>
                <div className="text-sm text-gray-600">Need Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {answers && answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Question Review</CardTitle>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div className="text-sm">
                    <span className="font-medium">Your answer:</span> {answer.userAnswer || "Not answered"}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Time spent:</span> {answer.timeSpent ? `${Math.round(answer.timeSpent / 1000)}s` : "N/A"}
                  </div>
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
                {answer.explanation && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    <span className="font-medium">Explanation:</span> {answer.explanation}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <div className="flex gap-4">
          <Button onClick={handleReviewQuiz} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Review Quiz
          </Button>
          <Button onClick={handleRetakeQuiz} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        </div>
        <Button onClick={handleBackToCourse}>
          Back to Course
        </Button>
      </div>
    </div>
  );
}

export default QuizResults;