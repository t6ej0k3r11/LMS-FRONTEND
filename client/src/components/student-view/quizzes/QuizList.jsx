import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StudentContext } from "@/context/student-context";
import { Play, Eye, Clock } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getStudentQuizzesByCourseService } from "@/services";
import { checkQuizPrerequisites, canStartNewAttempt, getQuizStatus } from "@/lib/quiz-utils";

function QuizList({ courseId }) {
  QuizList.propTypes = {
    courseId: PropTypes.string.isRequired,
  };
  const navigate = useNavigate();
  const { studentQuizzes, setStudentQuizzes, studentCurrentCourseProgress } = useContext(StudentContext);
  const [loading, setLoading] = useState(false);
  const courseDetails = studentCurrentCourseProgress?.courseDetails;

  const fetchQuizzes = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const response = await getStudentQuizzesByCourseService(courseId);
      if (response?.success) {
        setStudentQuizzes(response.data);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId, setStudentQuizzes]);

  useEffect(() => {
    fetchQuizzes();
  }, [courseId, fetchQuizzes]);

  const handleStartQuiz = (quiz) => {
    // Validate prerequisites before allowing quiz start
    const prerequisiteCheck = checkQuizPrerequisites(quiz, studentCurrentCourseProgress, quiz.attempts || [], courseDetails);
    if (!prerequisiteCheck.canAccess) {
      alert(`Cannot start quiz: ${prerequisiteCheck.reason}`);
      return;
    }

    // Check for multiple simultaneous attempts
    if (!canStartNewAttempt(quiz.attempts || [])) {
      alert("You already have an active attempt for this quiz.");
      return;
    }

    navigate(`/student/quiz-player/${quiz._id}`);
  };

  const handleViewResults = (quizId) => {
    navigate(`/student/quiz-results/${quizId}`);
  };

  const getStatusBadge = (quiz) => {
    const status = getQuizStatus(quiz, quiz.attempts || []);

    switch (status) {
      case 'not_started':
        return <Badge variant="secondary">Not Started</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">In Progress</Badge>;
      case 'passed':
        return <Badge variant="default" className="bg-green-600">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const canStartQuiz = (quiz) => {
    const prerequisiteCheck = checkQuizPrerequisites(quiz, studentCurrentCourseProgress, quiz.attempts || [], courseDetails);
    const canStart = canStartNewAttempt(quiz.attempts || []);
    return prerequisiteCheck.canAccess && canStart;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-extrabold">Course Quizzes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading quizzes...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Passing Score</TableHead>
                  <TableHead>Time Limit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentQuizzes && studentQuizzes.length > 0
                  ? studentQuizzes.map((quiz) => (
                      <TableRow key={quiz._id}>
                        <TableCell className="font-medium">
                          {quiz?.title}
                        </TableCell>
                        <TableCell>{quiz?.description}</TableCell>
                        <TableCell>{quiz?.questions?.length || 0}</TableCell>
                        <TableCell>{quiz?.passingScore}%</TableCell>
                        <TableCell>
                          {quiz?.timeLimit ? (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {quiz.timeLimit} min
                            </div>
                          ) : (
                            'No limit'
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(quiz)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleStartQuiz(quiz)}
                            variant="ghost"
                            size="sm"
                            className="mr-2"
                            disabled={!canStartQuiz(quiz)}
                            title={!canStartQuiz(quiz) ? "Prerequisites not met or quiz unavailable" : "Start quiz"}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleViewResults(quiz._id)}
                            variant="ghost"
                            size="sm"
                            disabled={!quiz.attempts || quiz.attempts.length === 0}
                            title={!quiz.attempts || quiz.attempts.length === 0 ? "No attempts yet" : "View results"}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No quizzes available for this course.
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QuizList;