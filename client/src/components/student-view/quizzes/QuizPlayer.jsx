import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAccessibility } from "@/hooks/useAccessibility";

// New modular components
import QuizHeader from "./components/QuizHeader";
import QuestionRenderer from "./components/QuestionRenderer";
import InstantFeedback from "./components/InstantFeedback";
import QuizValidation from "./components/QuizValidation";
import QuestionNavigation from "./components/QuestionNavigation";
import QuizControls from "./components/QuizControls";
import QuizTimer from "./QuizTimer";

// Custom hooks
import { useQuiz } from "@/hooks/useQuiz";

// Utils
import { validateQuizSubmission } from "@/lib/quiz-utils";

function QuizPlayer({ validation }) {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { announceToScreenReader, getAriaProps } = useAccessibility();

  // Check if we're in review mode
  const urlParams = new URLSearchParams(window.location.search);
  const isReviewMode = urlParams.get('mode') === 'review';

  // Local state for UI
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Use custom hook for quiz data management
  const {
    quiz,
    attemptId,
    answers,
    loading,
    submitting,
    isResuming,
    resumeAttemptInfo,
    submitAnswer,
    submitQuiz,
    finalizeQuiz,
  } = useQuiz(quizId, validation);

  // Persistence: Save quiz progress to localStorage
  useEffect(() => {
    if (quiz && attemptId && answers && !isReviewMode) {
      const progressData = {
        quizId,
        attemptId,
        answers,
        currentQuestionIndex,
        timestamp: Date.now(),
      };
      localStorage.setItem(`quiz_progress_${quizId}_${attemptId}`, JSON.stringify(progressData));
    }
  }, [quiz, attemptId, answers, currentQuestionIndex, quizId, isReviewMode]);

  // Persistence: Restore quiz progress from localStorage
  useEffect(() => {
    if (!loading && quiz && attemptId && !isResuming && !isReviewMode) {
      const savedProgress = localStorage.getItem(`quiz_progress_${quizId}_${attemptId}`);
      if (savedProgress) {
        try {
          const progressData = JSON.parse(savedProgress);
          // Only restore if it's recent (within last hour)
          if (Date.now() - progressData.timestamp < 3600000) {
            // Restore answers and current question index
            // Note: This would need to be handled by the useQuiz hook
            console.log('Restored quiz progress:', progressData);
          } else {
            // Clear old progress
            localStorage.removeItem(`quiz_progress_${quizId}_${attemptId}`);
          }
        } catch (error) {
          console.error('Error restoring quiz progress:', error);
          localStorage.removeItem(`quiz_progress_${quizId}_${attemptId}`);
        }
      }
    }
  }, [loading, quiz, attemptId, isResuming, quizId, isReviewMode]);

  // Persistence: Clear progress on quiz completion
  useEffect(() => {
    if (quiz && attemptId) {
      return () => {
        // Clear progress when component unmounts (quiz completed or navigated away)
        localStorage.removeItem(`quiz_progress_${quizId}_${attemptId}`);
      };
    }
  }, [quizId, attemptId]);

  // Handle answer changes
  const handleAnswerChange = useCallback(async (questionId, answer) => {
    const instantFeedbackEnabled = quiz?.instantFeedbackEnabled || false;

    if (instantFeedbackEnabled) {
      const feedback = await submitAnswer(questionId, answer);
      if (feedback) {
        setCurrentFeedback(feedback);
        setShowFeedback(true);
        // Auto-advance after showing feedback
        setTimeout(() => {
          setShowFeedback(false);
          setCurrentFeedback(null);
          handleNext();
        }, 3000);
      }
    }
  }, [quiz, submitAnswer]);

  // Navigation handlers
  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Submit handlers
  const handleSubmit = async () => {
    if (isPracticeMode && instantFeedbackEnabled) {
      // Practice mode with instant feedback - finalize the quiz
      const answeredCount = Object.keys(answers).length;
      if (answeredCount !== quiz.questions.length) {
        alert("Please answer all questions before finalizing the quiz.");
        return;
      }
      await finalizeQuiz();
      navigate(`/quiz-results/${quizId}`);
    } else if (isExamMode) {
      // Exam mode - show results at end, validate all answers
      const submissionValidation = validateQuizSubmission(answers, quiz.questions);
      setValidationErrors(submissionValidation.errors);
      setValidationWarnings(submissionValidation.warnings);

      if (!submissionValidation.isValid) {
        return;
      }

      if (submissionValidation.warnings.length > 0) {
        setShowConfirmDialog(true);
        return;
      }

      await performSubmission();
    } else {
      // Fallback for other modes
      const submissionValidation = validateQuizSubmission(answers, quiz.questions);
      setValidationErrors(submissionValidation.errors);
      setValidationWarnings(submissionValidation.warnings);

      if (!submissionValidation.isValid) {
        return;
      }

      if (submissionValidation.warnings.length > 0) {
        setShowConfirmDialog(true);
        return;
      }

      await performSubmission();
    }
  };

  const performSubmission = async () => {
    const result = await submitQuiz();
    if (result) {
      navigate(`/quiz-results/${quizId}`);
    }
  };

  const handleConfirmSubmit = () => {
    performSubmission();
  };

  // Handle feedback close
  const handleFeedbackClose = () => {
    setShowFeedback(false);
    setCurrentFeedback(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="text-center py-8">Quiz not found.</div>;
  }

  if (!quiz.questions || quiz.questions.length === 0) {
    return <div className="text-center py-8">This quiz has no questions available.</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const answeredQuestionsCount = Object.keys(answers).length;

  // Determine quiz mode based on quiz type
  const isExamMode = quiz?.quizType === 'final';
  const isPracticeMode = quiz?.quizType === 'practice';
  const instantFeedbackEnabled = isPracticeMode && (quiz?.instantFeedbackEnabled || false);

  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.25),_transparent_55%)] px-4 py-6 sm:px-6 lg:px-0"
      role="main"
      aria-labelledby="quiz-title"
      aria-describedby="quiz-progress"
    >
      <div className="mx-auto max-w-5xl space-y-6 lg:space-y-8">
        {/* Quiz Header */}
        <QuizHeader
          quiz={quiz}
          currentQuestionIndex={currentQuestionIndex}
          attemptId={attemptId}
          isResuming={isResuming}
          resumeAttemptInfo={resumeAttemptInfo}
          ariaProps={{
            titleId: "quiz-title",
            progressId: "quiz-progress"
          }}
          isReviewMode={isReviewMode}
        />

        {/* Quiz Timer - Only show for timed quizzes and not in review mode */}
        {quiz?.timeLimit && !isReviewMode && (
          <div className="flex justify-center">
            <QuizTimer
              timeLimit={quiz.timeLimit}
              onTimeUp={() => {
                // Auto-submit when time is up
                handleSubmit();
              }}
              isActive={!isTimerPaused}
              onPause={() => setIsTimerPaused(true)}
              onResume={() => setIsTimerPaused(false)}
            />
          </div>
        )}

        {/* Validation Messages */}
        <QuizValidation errors={validationErrors} warnings={validationWarnings} />

        {/* Question Card */}
        <Card className="border-white/60 bg-white/85 shadow-[0_30px_70px_rgba(10,41,30,0.12)]">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-base sm:text-lg font-semibold text-foreground">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span className="rounded-full bg-[hsla(var(--brand-green)/0.12)] px-3 py-1 text-xs font-medium text-primary">
                {currentQuestion.points || 1} point{currentQuestion.points !== 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-base sm:text-lg">{currentQuestion.question}</div>

            <QuestionRenderer
              question={currentQuestion}
              answer={answers[currentQuestion._id]}
              onAnswerChange={handleAnswerChange}
              disabled={instantFeedbackEnabled && showFeedback}
              isReviewMode={isReviewMode}
              correctAnswer={isReviewMode ? currentQuestion.correctAnswer : undefined}
              explanation={isReviewMode ? currentQuestion.explanation : undefined}
            />

            {/* Instant Feedback Display */}
            <InstantFeedback
              feedback={currentFeedback}
              show={showFeedback}
              onNext={handleFeedbackClose}
            />

            {/* Final Quiz Reminder */}
            {isLastQuestion && quiz.quizType === 'final' && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">
                      Final Quiz Reminder
                    </h4>
                    <p className="text-xs sm:text-sm text-yellow-700 leading-relaxed">
                      Make sure to review all materials thoroughly before attempting the final assessment to ensure success.
                    </p>
                    <p className="text-xs sm:text-sm text-yellow-700 mt-2 font-medium">
                      Passing Score Required: {quiz.passingScore || 70}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Controls */}
        {!isReviewMode && (
          <QuizControls
            currentQuestionIndex={currentQuestionIndex}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            submitting={submitting}
            canSubmit={answeredQuestionsCount > 0}
            isLastQuestion={isLastQuestion}
            instantFeedbackEnabled={instantFeedbackEnabled}
            quizMode={isExamMode ? 'exam' : 'practice'}
          />
        )}

        {/* Review Mode Controls */}
        {isReviewMode && (
          <div className="flex justify-center">
            <Button onClick={() => navigate(-1)} variant="outline">
              Back to Results
            </Button>
          </div>
        )}

        {/* Question Navigation */}
        <QuestionNavigation
          questions={quiz.questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          onQuestionSelect={handleQuestionSelect}
        />

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="glass-effect border border-white/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                Confirm Quiz Submission
              </DialogTitle>
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

QuizPlayer.propTypes = {
  validation: PropTypes.shape({
    data: PropTypes.shape({
      resumeAttemptId: PropTypes.string,
      resumeReason: PropTypes.string,
    }),
    success: PropTypes.bool,
    canStart: PropTypes.bool,
    message: PropTypes.string,
  }),
};

export default QuizPlayer;