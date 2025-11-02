import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InstructorContext } from "@/context/instructor-context";
import { Delete, Edit, Eye, Plus } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getQuizzesByCourseService, deleteQuizService } from "@/services";

function QuizList({ courseId }) {
  QuizList.propTypes = {
    courseId: PropTypes.string,
  };
  const navigate = useNavigate();
  const { instructorQuizzes, setInstructorQuizzes } = useContext(InstructorContext);
  const [loading, setLoading] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    if (!courseId) {
      // No course selected, don't fetch anything
      setInstructorQuizzes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getQuizzesByCourseService(courseId);
      if (response?.success) {
        setInstructorQuizzes(response.data);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId, setInstructorQuizzes]);

  useEffect(() => {
    fetchQuizzes();
  }, [courseId, fetchQuizzes]);

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        const response = await deleteQuizService(quizId);
        if (response?.success) {
          setInstructorQuizzes(prev => prev.filter(quiz => quiz._id !== quizId));
        }
      } catch (error) {
        console.error("Error deleting quiz:", error);
      }
    }
  };

  const handleViewResults = (quizId) => {
    navigate(`/instructor/quiz-results/${quizId}`);
  };

  return (
    <Card>
      <CardHeader className="flex justify-between flex-row items-center">
        <CardTitle className="text-3xl font-extrabold">Quizzes</CardTitle>
        <Button
          onClick={() => navigate(`/instructor/create-quiz/${courseId}`)}
          className="p-6"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Quiz
        </Button>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructorQuizzes && instructorQuizzes.length > 0
                  ? instructorQuizzes.map((quiz) => (
                      <TableRow key={quiz._id}>
                        <TableCell className="font-medium">
                          {quiz?.title}
                        </TableCell>
                        <TableCell>{quiz?.description}</TableCell>
                        <TableCell>{quiz?.questions?.length || 0}</TableCell>
                        <TableCell>{quiz?.passingScore}%</TableCell>
                        <TableCell>{quiz?.timeLimit ? `${quiz.timeLimit} min` : 'No limit'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => navigate(`/instructor/edit-quiz/${quiz._id}`)}
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="h-6 w-6" />
                          </Button>
                          <Button
                            onClick={() => handleViewResults(quiz._id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="h-6 w-6" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteQuiz(quiz._id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Delete className="h-6 w-6" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {courseId === "general"
                          ? "Select a course from the sidebar to manage quizzes."
                          : "No quizzes found. Create your first quiz!"
                        }
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