import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InstructorContext } from "@/context/instructor-context";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import QuestionBuilder from "./QuestionBuilder";
import { createQuizService, updateQuizService, getQuizByIdService, fetchInstructorCourseListService } from "@/services";
import QuestionBankModal from "@/components/instructor-view/quizzes/QuestionBankModal";

function QuizForm() {
  const navigate = useNavigate();
  const { courseId: paramCourseId, quizId } = useParams();
  const [searchParams] = useSearchParams();
  const { instructorCoursesList, setInstructorCoursesList } = useContext(InstructorContext);
  const [loading, setLoading] = useState(false);
  const [lectures, setLectures] = useState([]);
  const [courseId, setCourseId] = useState(paramCourseId);
  const [showQuestionBank, setShowQuestionBank] = useState(false);

  console.log("QuizForm: lectures state =", lectures);
  console.log("QuizForm: component mounted with courseId =", courseId);
  console.log("QuizForm: component mounted with quizId =", quizId);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quizType: "lesson",
    lectureId: searchParams.get('lectureId') || "",
    passingScore: 70,
    timeLimit: "",
    attemptsAllowed: 1,
    questions: [],
  });

  const isEditing = !!quizId;

  useEffect(() => {
    console.log("QuizForm: courseId =", courseId);
    console.log("QuizForm: instructorCoursesList =", instructorCoursesList);
    console.log("QuizForm: instructorCoursesList length =", instructorCoursesList?.length);
    if (courseId) {
      const course = instructorCoursesList.find(c => c._id === courseId);
      console.log("QuizForm: found course =", course);
      console.log("QuizForm: course._id =", course?._id);
      console.log("QuizForm: courseId from params =", courseId);
      console.log("QuizForm: course title =", course?.title);
      if (course && course.curriculum) {
        console.log("QuizForm: course curriculum =", course.curriculum);
        console.log("QuizForm: curriculum length =", course.curriculum.length);
        setLectures(course.curriculum);
      } else {
        console.log("QuizForm: no curriculum found for course");
        console.log("QuizForm: course exists =", !!course);
        console.log("QuizForm: course.curriculum =", course?.curriculum);
        setLectures([]);
      }
    } else {
      console.log("QuizForm: no courseId provided");
      setLectures([]);
    }
  }, [courseId, instructorCoursesList]);

  useEffect(() => {
    if (isEditing) {
      const fetchQuizData = async () => {
        try {
          setLoading(true);
          const response = await getQuizByIdService(quizId);
          if (response?.success) {
            const quiz = response.data;
            setCourseId(quiz.courseId);
            setFormData({
              title: quiz.title,
              description: quiz.description || "",
              quizType: quiz.quizType || "lesson",
              lectureId: quiz.lectureId || "",
              passingScore: quiz.passingScore,
              timeLimit: quiz.timeLimit || "",
              attemptsAllowed: quiz.attemptsAllowed,
              questions: quiz.questions,
            });

            // If instructorCoursesList is empty, fetch courses to populate lectures
            if (!instructorCoursesList || instructorCoursesList.length === 0) {
              const coursesResponse = await fetchInstructorCourseListService();
              if (coursesResponse?.success) {
                setInstructorCoursesList(coursesResponse.data);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching quiz:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchQuizData();
    }
  }, [isEditing, quizId, instructorCoursesList, setInstructorCoursesList]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddQuestionFromBank = (question) => {
    setFormData(prev => {
      const isEssayType = ["broad-text", "short-answer", "essay"].includes(question.type);
      const newQuestion = {
        type: question.type,
        question: question.question,
        options:
          question.type === "multiple-choice"
            ? (question.options && question.options.length > 0
                ? question.options
                : ["", "", "", ""])
            : question.options || [],
        correctAnswer: question.correctAnswer || "",
        correctAnswerIndex:
          question.type === "multiple-choice" && question.options?.length
            ? question.options.findIndex((opt) => opt === question.correctAnswer)
            : null,
        points: question.points || 1,
        requiresReview: isEssayType,
      };
      return {
        ...prev,
        questions: [...prev.questions, newQuestion],
      };
    });
    setShowQuestionBank(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a quiz title");
      return;
    }

    if (formData.questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    if (formData.quizType === "lesson" && !formData.lectureId) {
      alert("Please select a lecture for the lesson quiz");
      return;
    }

    // Validate questions
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      if (!question.question.trim()) {
        alert(`Please enter question text for question ${i + 1}`);
        return;
      }
      // Only multiple-choice and true-false questions require correctAnswer
      if ((question.type === "multiple-choice" || question.type === "true-false") && !question.correctAnswer.trim()) {
        alert(`Please provide a correct answer for question ${i + 1}`);
        return;
      }
      if (question.type === "multiple-choice" && question.options.some(opt => !opt.trim())) {
        alert(`Please fill all options for question ${i + 1}`);
        return;
      }
      // Validate points
      if (!question.points || question.points < 1) {
        alert(`Please assign at least 1 point to question ${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);
      const quizData = {
        courseId: courseId,
        lectureId: formData.quizType === "lesson" ? formData.lectureId : null,
        quizType: formData.quizType,
        title: formData.title,
        description: formData.description,
        questions: formData.questions.map(question => ({
          ...question,
          // Keep original types - backend handles the mapping
        })),
        passingScore: parseInt(formData.passingScore),
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
        attemptsAllowed: parseInt(formData.attemptsAllowed),
      };

      let response;
      if (isEditing) {
        response = await updateQuizService(quizId, quizData);
      } else {
        response = await createQuizService(quizData);
      }

      if (response?.success) {
        navigate(`/instructor/quiz-management`);
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Failed to save quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditing ? "Edit Quiz" : "Create New Quiz"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quizType">Quiz Type *</Label>
                <Select
                  value={formData.quizType}
                  onValueChange={(value) => handleInputChange("quizType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quiz type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson">Lesson Quiz</SelectItem>
                    <SelectItem value="final">Final Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.quizType === "lesson" && (
              <div className="space-y-2">
                <Label htmlFor="lectureId">Lecture *</Label>
                <Select
                  value={formData.lectureId}
                  onValueChange={(value) => handleInputChange("lectureId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lecture" />
                  </SelectTrigger>
                  <SelectContent>
                    {lectures.length > 0 ? (
                      lectures.map((lecture, index) => (
                        <SelectItem key={lecture._id} value={lecture._id}>
                          Lecture {index + 1}: {lecture.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No lectures available. Please add lectures to your course first.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) => handleInputChange("passingScore", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="0"
                  value={formData.timeLimit}
                  onChange={(e) => handleInputChange("timeLimit", e.target.value)}
                  placeholder="Leave empty for no limit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attemptsAllowed">Attempts Allowed</Label>
                <Input
                  id="attemptsAllowed"
                  type="number"
                  min="1"
                  value={formData.attemptsAllowed}
                  onChange={(e) => handleInputChange("attemptsAllowed", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-foreground">Questions</h3>
              <Button type="button" variant="secondary" className="rounded-full" onClick={() => setShowQuestionBank(true)}>
                Browse Question Bank
              </Button>
            </div>

            <QuestionBuilder
              questions={formData.questions}
              setQuestions={(questions) => handleInputChange("questions", questions)}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/instructor/quiz-management`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (isEditing ? "Update Quiz" : "Create Quiz")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <QuestionBankModal
        open={showQuestionBank}
        onOpenChange={setShowQuestionBank}
        onSelectQuestion={handleAddQuestionFromBank}
      />
    </div>
  );
}

export default QuizForm;