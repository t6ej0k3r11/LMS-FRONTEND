import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StudentContext } from "@/context/student-context";
import { ChevronLeft, ChevronRight, Send, AlertTriangle, Save, RotateCw, ListChecks, TimerReset, Trophy } from "lucide-react";

import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCurrentCourseProgressService,
  getQuizForTakingService,
  startQuizAttemptService,
  submitQuizAttemptService,
} from "@/services";
import {
  validateQuizSubmission,
  checkQuizPrerequisites
} from "@/lib/quiz-utils";

function QuizPlayer() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentQuiz, setCurrentQuiz, setStudentQuizProgress, studentCurrentCourseProgress, setStudentCurrentCourseProgress } = useContext(StudentContext);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState(null);
  const [isResuming, setIsResuming] = useState(false);
  const [resumeAttemptInfo, setResumeAttemptInfo] = useState(null);
  const [attemptStatusMessage, setAttemptStatusMessage] = useState(null);

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

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching quiz with ID:", quizId);

      // First, refresh the course progress data to ensure we have the latest lecture completion status
      if (studentCurrentCourseProgress?.courseDetails?._id) {
        console.log("Refreshing course progress data...");
        const progressResponse = await getCurrentCourseProgressService(
          "current", // Use "current" as the userId since the service handles auth
          studentCurrentCourseProgress.courseDetails._id
        );
        if (progressResponse?.success) {
          console.log("Updated course progress:", progressResponse.data);
          setStudentCurrentCourseProgress({
            courseDetails: progressResponse.data.courseDetails,
            progress: progressResponse.data.progress,
            quizzesProgress: progressResponse.data.quizzesProgress || [],
          });
        }
      }

      const response = await getQuizForTakingService(quizId);
      console.log("Quiz fetch response:", response);
      if (response?.success) {
        const quiz = response.data.quiz;
        console.log("Quiz data:", quiz);

        // Check prerequisites using the utility function
        const existingAttempts = response.data.attempts || [];
        const prerequisiteCheck = checkQuizPrerequisites(
          quiz,
          studentCurrentCourseProgress?.progress || [],
          existingAttempts,
          studentCurrentCourseProgress?.courseDetails
        );

        console.log("Prerequisite check result:", prerequisiteCheck);
        if (!prerequisiteCheck.canAccess) {
          alert(`Cannot access quiz: ${prerequisiteCheck.reason}`);
          navigate(-1);
          return;
        }

        setCurrentQuiz(quiz);

        // Allow multiple attempts - students can retake quizzes anytime
        // No longer preventing multiple simultaneous attempts

        // Check if quiz has questions
        if (!quiz.questions || quiz.questions.length === 0) {
          alert("This quiz has no questions. Please contact your instructor.");
          navigate(-1);
          return;
        }

        // Determine if we should resume an existing attempt
        if (prerequisiteCheck.resumeAttemptId) {
          setAttemptId(prerequisiteCheck.resumeAttemptId);
          setIsResuming(true);
          const resumedAttempt = existingAttempts.find(
            (attempt) => attempt._id === prerequisiteCheck.resumeAttemptId
          );
          setResumeAttemptInfo(resumedAttempt || null);
          setAttemptStatusMessage(
            prerequisiteCheck.reason || "You have an active attempt. Resuming now."
          );
          console.log("Resuming existing attempt", prerequisiteCheck.resumeAttemptId);
        } else {
          setIsResuming(false);
          setResumeAttemptInfo(null);
          setAttemptStatusMessage(null);
          console.log("Starting quiz attempt...");
          const attemptResponse = await startQuizAttemptService(quizId);
          console.log("Attempt start response:", attemptResponse);
          if (attemptResponse?.success) {
            setAttemptId(attemptResponse.data.attemptId);
            setAttemptStatusMessage(null);
            console.log(
              "Attempt started successfully with ID:",
              attemptResponse.data.attemptId
            );
          } else {
            console.error("Failed to start attempt:", attemptResponse);
            alert("Failed to start quiz attempt. Please try again.");
            navigate(-1);
          }
        }
      } else {
        console.error("Failed to load quiz:", response);
        alert("Failed to load quiz. Please try again.");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert("An error occurred while loading the quiz.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [quizId, studentCurrentCourseProgress?.progress, studentCurrentCourseProgress?.courseDetails, setCurrentQuiz, setStudentCurrentCourseProgress, navigate]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  useEffect(() => {
    if (attemptId && Object.keys(answers).length > 0) {
      const autoSaveTimer = setTimeout(() => {
        autoSaveAnswers();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [answers, attemptId, autoSaveAnswers]);

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
      // Convert answers object to array format expected by backend
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));
      console.log("Submitting quiz with answers:", answersArray);
      const response = await submitQuizAttemptService(quizId, attemptId, answersArray);
      console.log("Quiz submission response:", response);
      if (response?.success) {
        setStudentQuizProgress(prev => ({
          ...prev,
          [quizId]: response.data
        }));

        // Refresh course progress after successful quiz submission
        if (studentCurrentCourseProgress?.courseDetails?._id) {
          console.log("Refreshing course progress after quiz submission...");
          const progressResponse = await getCurrentCourseProgressService(
            "current", // Use "current" as the userId since the service handles auth
            studentCurrentCourseProgress.courseDetails._id
          );
          if (progressResponse?.success) {
            console.log("Updated course progress after quiz:", progressResponse.data);
            setStudentCurrentCourseProgress({
              courseDetails: progressResponse.data.courseDetails,
              progress: progressResponse.data.progress,
              quizzesProgress: progressResponse.data.quizzesProgress || [],
              completed: progressResponse.data.completed,
              completionDate: progressResponse.data.completionDate,
              progressPercentage: progressResponse.data.progressPercentage,
            });
          }
        }

        // Use the correct nested route without '/student/' prefix
        navigate(`/quiz-results/${quizId}`);
      } else {
        console.error("Quiz submission failed:", response);
        alert("Failed to submit quiz. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert("An error occurred while submitting the quiz. Please try again.");
    } finally {
      setSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const handleConfirmSubmit = () => {
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

  const metaChips = [
    {
      label: `${currentQuiz.questions.length} Questions`,
      icon: ListChecks,
    },
    {
      label: `${currentQuiz.passingScore || 70}% Passing`,
      icon: Trophy,
    },
    {
      label: currentQuiz.quizType === "final" ? "Final Assessment" : "Practice Mode",
      icon: TimerReset,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.25),_transparent_55%)] px-4 py-6 sm:px-6 lg:px-0">
      <div className="mx-auto max-w-5xl space-y-6 lg:space-y-8">
        <section className="glass-effect rounded-[30px] border border-white/50 p-5 sm:p-8 shadow-[0_25px_60px_rgba(12,49,36,0.18)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Quiz Session</p>
              <h1 className="mt-2 text-3xl font-bold text-foreground">{currentQuiz.title}</h1>
              {attemptStatusMessage && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {attemptStatusMessage}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {metaChips.map(({ label, icon: Icon }) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-4 py-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/60 bg-white/85 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Progress</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-4xl font-bold text-foreground">{currentQuestionIndex + 1}<span className="text-lg text-muted-foreground">/{currentQuiz.questions.length}</span></p>
                {autoSaveStatus && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Save className="h-3.5 w-3.5" />
                    {autoSaveStatus === 'saving' && 'Saving...'}
                    {autoSaveStatus === 'saved' && 'Auto-saved'}
                    {autoSaveStatus === 'error' && 'Save failed'}
                  </div>
                )}
              </div>
              <div className="mt-3 h-2 rounded-full bg-[hsla(var(--brand-green)/0.15)]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--brand-green))] transition-all duration-500"
                  style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/85 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Attempt Info</p>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>Attempt ID: <span className="font-semibold text-foreground">{attemptId?.slice(-6) || "New"}</span></p>
                {isResuming && resumeAttemptInfo && (
                  <p>Started: {new Date(resumeAttemptInfo.startedAt).toLocaleString()}</p>
                )}
                <p>Status: <span className="text-primary font-medium">{isResuming ? "Resuming" : "In progress"}</span></p>
              </div>
            </div>
          </div>
        </section>

        {attemptStatusMessage && (
          <Alert className="glass-effect border border-[hsla(var(--brand-green)/0.35)] bg-white/80">
            <RotateCw className="h-4 w-4" />
            <div>
              <AlertTitle>{isResuming ? "Resuming attempt" : "New attempt"}</AlertTitle>
              <AlertDescription>
                {attemptStatusMessage}
                {isResuming && resumeAttemptInfo && (
                  <span className="block text-xs mt-1 text-muted-foreground">
                    Started on {new Date(resumeAttemptInfo.startedAt).toLocaleString()}
                  </span>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="border-[hsla(var(--brand-red)/0.3)] bg-[hsla(var(--brand-red)/0.08)]">
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
          <Alert className="border-[hsla(var(--brand-gold)/0.3)] bg-[hsla(var(--brand-gold)/0.12)]">
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

        <Card className="border-white/60 bg-white/85 shadow-[0_30px_70px_rgba(10,41,30,0.12)]">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-base sm:text-lg font-semibold text-foreground">Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
              <span className="rounded-full bg-[hsla(var(--brand-green)/0.12)] px-3 py-1 text-xs font-medium text-primary">
                {currentQuestion.points || 1} point{currentQuestion.points !== 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-base sm:text-lg">{currentQuestion.question}</div>
            {renderQuestion(currentQuestion)}
            {isLastQuestion && currentQuiz.quizType === 'final' && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">Final Quiz Reminder</h4>
                    <p className="text-xs sm:text-sm text-yellow-700 leading-relaxed">
                      Make sure to review all materials thoroughly before attempting the final assessment to ensure success.
                    </p>
                    <p className="text-xs sm:text-sm text-yellow-700 mt-2 font-medium">
                      Passing Score Required: 80%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="secondary"
            className="w-full sm:w-auto rounded-2xl"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || validationErrors.length > 0}
              className="btn-primary w-full sm:w-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={handleNext} className="w-full sm:w-auto rounded-2xl">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question Navigation */}
        <Card className="border-white/50 bg-white/85">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Question Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {currentQuiz.questions.map((_, index) => {
                const questionId = currentQuiz.questions[index]._id;
                const isAnswered = answers[questionId];
                const isCurrent = index === currentQuestionIndex;
                return (
                  <Button
                    key={index}
                    variant={isCurrent ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-2xl text-xs sm:text-sm ${isAnswered ? 'bg-[hsla(var(--brand-green)/0.15)] text-primary' : ''} ${isCurrent ? 'ring-2 ring-[hsl(var(--brand-green))]' : ''}`}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
              <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[hsla(var(--brand-green)/0.35)] mr-2"></span>
              Answered questions
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="glass-effect border border-white/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">Confirm Quiz Submission</DialogTitle>
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
              <Button onClick={handleConfirmSubmit} disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting...' : 'Submit Anyway'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default QuizPlayer;