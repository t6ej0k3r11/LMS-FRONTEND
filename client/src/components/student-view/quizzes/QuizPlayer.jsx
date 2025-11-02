import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StudentContext } from "@/context/student-context";
import { ChevronLeft, ChevronRight, Send, AlertTriangle, Save } from "lucide-react";
import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuizTimer from "./QuizTimer";
import {
  getQuizForTakingService,
  startQuizAttemptService,
  submitQuizAttemptService,
} from "@/services";
import {
  validateQuizSubmission,
  checkQuizPrerequisites,
  canStartNewAttempt
} from "@/lib/quiz-utils";

function QuizPlayer() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentQuiz, setCurrentQuiz, setStudentQuizProgress, studentCurrentCourseProgress } = useContext(StudentContext);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [timeUp, setTimeUp] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId, fetchQuiz]);

  // Auto-save functionality
  useEffect(() => {
    if (attemptId && Object.keys(answers).length > 0) {
      const autoSaveTimer = setTimeout(() => {
        autoSaveAnswers();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [answers, attemptId, autoSaveAnswers]);

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getQuizForTakingService(quizId);
      if (response?.success) {
        const quiz = response.data.quiz;

        // Check prerequisites
        const prerequisiteCheck = checkQuizPrerequisites(quiz, studentCurrentCourseProgress?.progress || [], response.data.attempts || []);
        if (!prerequisiteCheck.canAccess) {
          alert(`Cannot access quiz: ${prerequisiteCheck.reason}`);
          navigate(-1);
          return;
        }

        setCurrentQuiz(quiz);

        // Check for existing attempts and prevent multiple simultaneous attempts
        const existingAttempts = response.data.attempts || [];
        if (!canStartNewAttempt(existingAttempts)) {
          alert("You already have an active attempt for this quiz.");
          navigate(-1);
          return;
        }

        // Check if quiz has questions
        if (!quiz.questions || quiz.questions.length === 0) {
          alert("This quiz has no questions. Please contact your instructor.");
          navigate(-1);
          return;
        }

        // Start attempt
        const attemptResponse = await startQuizAttemptService(quizId);
        if (attemptResponse?.success) {
          setAttemptId(attemptResponse.data.attemptId);
        } else {
          alert("Failed to start quiz attempt. Please try again.");
          navigate(-1);
        }
      } else {
        alert("Failed to load quiz. Please try again.");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      alert("An error occurred while loading the quiz.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [quizId, studentCurrentCourseProgress?.progress, setCurrentQuiz, navigate]);

  const autoSaveAnswers = useCallback(async () => {
    if (!attemptId) return;

    try {
      setAutoSaveStatus('saving');
      // Note: This would need a backend endpoint for saving draft answers
      // For now, we'll just update local state
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 2000);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setAutoSaveStatus('error');
    }
  }, [attemptId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // Validate submission
    const validation = validateQuizSubmission(answers, currentQuiz.questions);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);

    if (!validation.isValid) {
      return; // Don't proceed with submission if validation fails
    }

    // Show confirmation dialog if there are warnings
    if (validation.warnings.length > 0) {
      setShowConfirmDialog(true);
      return;
    }

    await performSubmission();
  };


  const performSubmission = async () => {
    try {
      setSubmitting(true);
      const response = await submitQuizAttemptService(quizId, attemptId, answers);
      if (response?.success) {
        setStudentQuizProgress(prev => ({
          ...prev,
          [quizId]: response.data
        }));
        navigate(`/student/quiz-results/${quizId}`);
      } else {
        alert("Failed to submit quiz. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("An error occurred while submitting the quiz. Please try again.");
    } finally {
      setSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleConfirmSubmit = () => {
    performSubmission();
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    // Auto-submit when time is up
    performSubmission();
  };

  const renderQuestion = (question) => {
    if (!question) return null;

    const currentAnswer = answers[question._id];

    if (question.type === 'multiple-choice') {
      return (
        <RadioGroup
          value={currentAnswer}
          onValueChange={(value) => handleAnswerChange(question._id, value)}
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    } else if (question.type === 'multiple-select') {
      return (
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`option-${index}`}
                checked={currentAnswer?.includes(option) || false}
                onCheckedChange={(checked) => {
                  const current = currentAnswer || [];
                  if (checked) {
                    handleAnswerChange(question._id, [...current, option]);
                  } else {
                    handleAnswerChange(question._id, current.filter(a => a !== option));
                  }
                }}
              />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </div>
      );
    } else if (question.type === 'true-false') {
      return (
        <RadioGroup
          value={currentAnswer}
          onValueChange={(value) => handleAnswerChange(question._id, value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="true" />
            <Label htmlFor="true">True</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="false" />
            <Label htmlFor="false">False</Label>
          </div>
        </RadioGroup>
      );
    } else if (question.type === 'broad-text') {
      return (
        <div className="space-y-2">
          <Label htmlFor={`broad-text-${question._id}`}>Your Answer</Label>
          <Textarea
            id={`broad-text-${question._id}`}
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="Write your detailed answer here..."
            rows={6}
            className="w-full"
          />
          <div className="text-sm text-gray-600">
            This question requires manual review by your instructor.
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  if (!currentQuiz) {
    return <div className="text-center py-8">Quiz not found.</div>;
  }

  if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
    return <div className="text-center py-8">This quiz has no questions available.</div>;
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;

  // Ensure currentQuestion exists
  if (!currentQuestion) {
    return <div className="text-center py-8">Question not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{currentQuiz.title}</h1>
        <div className="flex items-center space-x-4">
          {autoSaveStatus && (
            <div className="text-sm text-gray-600 flex items-center">
              <Save className="h-4 w-4 mr-1" />
              {autoSaveStatus === 'saving' && 'Saving...'}
              {autoSaveStatus === 'saved' && 'Auto-saved'}
              {autoSaveStatus === 'error' && 'Save failed'}
            </div>
          )}
          {currentQuiz.timeLimit && (
            <QuizTimer
              timeLimit={currentQuiz.timeLimit}
              onTimeUp={handleTimeUp}
              isActive={!timeUp && !submitting}
            />
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {validationWarnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
            <span className="text-sm font-normal">
              {currentQuestion.points || 1} point{currentQuestion.points !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg">{currentQuestion.question}</div>
          {renderQuestion(currentQuestion)}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting || validationErrors.length > 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Question Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {currentQuiz.questions.map((_, index) => {
              const questionId = currentQuiz.questions[index]._id;
              const isAnswered = answers[questionId];
              const isCurrent = index === currentQuestionIndex;
              return (
                <Button
                  key={index}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`h-10 w-10 ${isAnswered ? 'bg-blue-100 border-blue-300' : ''} ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <span className="inline-block w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></span>
            Answered questions
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Quiz Submission</DialogTitle>
            <DialogDescription>
              You have unanswered questions. Are you sure you want to submit the quiz?
              {validationWarnings.map((warning, index) => (
                <div key={index} className="mt-2 text-yellow-600">• {warning}</div>
              ))}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Continue Quiz
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Anyway'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuizPlayer;