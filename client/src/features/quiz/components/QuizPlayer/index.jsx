import { useState, useEffect } from 'react';
import { ModeChooser } from '../ModeChooser';
import { QuestionRenderer } from '../QuestionRenderer';
import { Timer } from '../Timer';
import { NavigationBar } from '../NavigationBar';
import { QuestionSidebar } from '../QuestionSidebar';
import { FeedbackSystem } from '../FeedbackSystem';
import { ResultsReport } from '../ResultsReport';
import { ResumeBanner } from '../ResumeBanner';
import { useQuizState } from '../../hooks/useQuizState';
import { hasAttemptSnapshot } from '../../utils/attemptStorage';
import PropTypes from 'prop-types';

export const QuizPlayer = ({
  quizId,
  userId,
  quizData,
  onComplete,
  onExit,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [finalResults, setFinalResults] = useState(null);

  const quizState = useQuizState({
    quizId,
    userId,
    initialQuizData: quizData,
    onQuizComplete: (results) => {
      setFinalResults(results);
      onComplete?.(results);
    },
    onTimeUp: () => {
      // Auto-submit when time is up
      if (quizState.mode === 'exam') {
        quizState.submitQuiz();
      }
    }
  });

  // Check for existing attempt on mount
  useEffect(() => {
    if (userId && quizId && hasAttemptSnapshot(userId, quizId)) {
      // ResumeBanner will be shown by the component logic
    }
  }, [userId, quizId]);

  // Handle mode selection
  const handleModeSelect = (mode) => {
    quizState.initializeQuiz(quizData, mode);
  };

  // Handle resume
  const handleResume = () => {
    // The useQuizState hook will automatically load the snapshot
    // and restore the state
  };

  // Handle start over
  const handleStartOver = () => {
    quizState.resetQuiz();
  };

  // Show resume banner if there's an incomplete attempt
  const showResumeBanner = hasAttemptSnapshot(userId, quizId) && !quizState.quiz;

  // Show mode chooser if no mode selected
  if (!quizState.mode && !showResumeBanner) {
    return (
      <ModeChooser
        quiz={quizData}
        onModeSelect={handleModeSelect}
        className={className}
      />
    );
  }

  // Show resume banner
  if (showResumeBanner) {
    return (
      <ResumeBanner
        onResume={handleResume}
        onStartOver={handleStartOver}
        onDismiss={() => {}}
        className={className}
      />
    );
  }

  // Show results if quiz is complete (exam mode only)
  if (finalResults && quizState.mode === 'exam') {
    return (
      <ResultsReport
        quiz={quizState.quiz}
        results={{
          score: finalResults.score,
          passed: finalResults.passed,
          answers: Object.values(finalResults.answers || {}),
          attempts: [] // This would come from attempt history
        }}
        onRetry={() => {
          setFinalResults(null);
          quizState.resetQuiz();
        }}
        onReview={() => {}}
        onExit={onExit}
        className={className}
      />
    );
  }

  // Main quiz interface
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Navigation Bar */}
      <NavigationBar
        quiz={quizState.quiz}
        currentQuestionIndex={quizState.currentQuestionIndex}
        totalQuestions={quizState.quiz?.questions?.length || 0}
        progress={quizState.progress}
        timer={quizState.timer}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onExit={onExit}
      />

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Timer */}
            {quizState.quiz?.timeLimit && quizState.mode === 'exam' && (
              <div className="mb-6">
                <Timer
                  duration={quizState.quiz.timeLimit * 60}
                  timeLeft={quizState.timer.timeLeft}
                  isRunning={quizState.timer.isRunning}
                  isPaused={quizState.timer.isPaused}
                  onPause={quizState.timer.pause}
                  onResume={quizState.timer.resume}
                  onTimeUp={() => quizState.timer.reset()}
                />
              </div>
            )}

            {/* Current Question */}
            {quizState.currentQuestion && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <QuestionRenderer
                  question={quizState.currentQuestion}
                  answer={quizState.answers[quizState.currentQuestion._id]}
                  onAnswerChange={(questionId, answer) => {
                    quizState.answerQuestion(questionId, answer);
                  }}
                  mode={quizState.mode}
                  showCorrect={quizState.mode === 'practice' && quizState.showFeedback}
                  disabled={quizState.isLoading}
                />
              </div>
            )}

            {/* Feedback System (Practice Mode) */}
            {quizState.mode === 'practice' && quizState.showFeedback && quizState.feedbackData && (
              <FeedbackSystem
                feedback={quizState.feedbackData}
                onContinue={() => {
                  quizState.setShowFeedback(false);
                  if (quizState.currentQuestionIndex < (quizState.quiz?.questions?.length || 0) - 1) {
                    quizState.nextQuestion();
                  } else {
                    // Quiz complete - practice mode completion
                    onComplete?.({
                      score: 100, // Practice mode doesn't need final scoring
                      answers: quizState.answers,
                      analytics: quizState.questionAnalytics,
                      timeSpent: quizState.timer.elapsed,
                      passed: true, // Practice mode is always "passed"
                      mode: 'practice'
                    });
                  }
                }}
                autoAdvance={true}
                autoAdvanceDelay={3000}
                showExplanation={true}
                className="mb-6"
              />
            )}

            {/* Navigation Controls */}
            <div className="flex justify-between items-center">
              <button
                onClick={quizState.previousQuestion}
                disabled={quizState.currentQuestionIndex === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="text-sm text-gray-600">
                Question {quizState.currentQuestionIndex + 1} of {quizState.quiz?.questions?.length || 0}
              </div>

              {quizState.currentQuestionIndex < (quizState.quiz?.questions?.length || 0) - 1 ? (
                <button
                  onClick={quizState.nextQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => quizState.submitQuiz()}
                  disabled={quizState.isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {quizState.isLoading ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <QuestionSidebar
          questions={quizState.quiz?.questions || []}
          currentQuestionIndex={quizState.currentQuestionIndex}
          answers={quizState.answers}
          flaggedQuestions={quizState.flaggedQuestions}
          onQuestionSelect={quizState.navigateToQuestion}
          onToggleFlag={quizState.toggleFlagQuestion}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          showCorrect={quizState.mode === 'practice'}
        />
      </div>
    </div>
  );
};

QuizPlayer.propTypes = {
  quizId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  quizData: PropTypes.object,
  onComplete: PropTypes.func,
  onExit: PropTypes.func,
  className: PropTypes.string,
};