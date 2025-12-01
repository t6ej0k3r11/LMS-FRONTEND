// useQuizState.js - Central hook for managing quiz state
import { useState, useEffect, useCallback, useRef } from 'react';
import { saveAttemptSnapshot, loadAttemptSnapshot, deleteAttemptSnapshot } from '../utils/attemptStorage';
import { calculateQuizScore, calculateQuestionAnalytics, calculateTimeSpent } from '../utils/quizCalculator';
import { useTimer } from './useTimer';

export const useQuizState = ({
  quizId,
  userId,
  initialQuizData = null,
  initialMode = null,
  onQuizComplete,
  onTimeUp,
  autoSaveInterval = 5000, // 5 seconds
} = {}) => {
  // Core state
  const [quiz, setQuiz] = useState(null);
  const [mode, setMode] = useState(initialMode); // 'exam' or 'practice'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Analytics state
  const [questionAnalytics, setQuestionAnalytics] = useState({});
  const [questionTimers, setQuestionTimers] = useState({});
  const [startTime, setStartTime] = useState(null);

  // UI state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);

  // Refs
  const autoSaveRef = useRef(null);
  const hasUnsavedChanges = useRef(false);

  // Timer setup
  const timerDuration = quiz?.timeLimit ? quiz.timeLimit * 60 : null; // Convert minutes to seconds
  const timer = useTimer({
    duration: timerDuration,
    onTimeUp: handleTimeUp,
    onTick: handleTimerTick,
    autoStart: false,
  });

  // Load attempt snapshot on mount or initialize with provided data
  useEffect(() => {
    if (initialQuizData && !quiz) {
      // If initial quiz data is provided and we don't have a quiz yet, set it
      setQuiz(initialQuizData);
    } else if (userId && quizId) {
      const snapshot = loadAttemptSnapshot(userId, quizId);
      if (snapshot) {
        restoreFromSnapshot(snapshot);
      }
    }
  }, [userId, quizId, initialQuizData, quiz]);

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges.current && mode && quiz) {
      autoSaveRef.current = setTimeout(() => {
        saveSnapshot();
        hasUnsavedChanges.current = false;
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [answers, currentQuestionIndex, questionAnalytics, mode, quiz, autoSaveInterval]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChanges.current) {
        saveSnapshot();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasUnsavedChanges.current) {
        saveSnapshot();
        hasUnsavedChanges.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Helper functions
  const restoreFromSnapshot = useCallback((snapshot) => {
    setMode(snapshot.mode);
    setCurrentQuestionIndex(snapshot.currentQuestionIndex || 0);
    setAnswers(snapshot.answers || {});
    setAttemptId(snapshot.attemptId);
    setQuestionAnalytics(snapshot.questionAnalytics || {});
    setStartTime(snapshot.startedAt ? new Date(snapshot.startedAt) : new Date());

    // Restore timer state if available
    if (snapshot.timerState) {
      timer.setDuration(snapshot.timerState.timeLeft);
      if (snapshot.timerState.isRunning) {
        timer.resume();
      }
    }
  }, [timer]);

  const saveSnapshot = useCallback(() => {
    if (!userId || !quizId || !mode) return;

    const snapshot = {
      attemptId,
      mode,
      quizId,
      userId,
      currentQuestionIndex,
      answers,
      startedAt: startTime?.toISOString(),
      lastSavedAt: new Date().toISOString(),
      timerState: {
        timeLeft: timer.timeLeft,
        elapsed: timer.elapsed,
        isRunning: timer.isRunning,
        isPaused: timer.isPaused,
      },
      questionAnalytics,
    };

    saveAttemptSnapshot(snapshot);
  }, [userId, quizId, mode, attemptId, currentQuestionIndex, answers, startTime, timer, questionAnalytics]);

  const markUnsavedChanges = useCallback(() => {
    hasUnsavedChanges.current = true;
  }, []);

  // Event handlers
  function handleTimeUp() {
    if (mode === 'exam') {
      // Auto-submit for exam mode
      handleSubmitQuiz();
    }
    onTimeUp?.();
  }

  function handleTimerTick() {
    // Update question timers
    const updates = calculateTimeSpent(questionTimers, getCurrentQuestionId());
    if (Object.keys(updates).length > 0) {
      setQuestionAnalytics(prev => {
        const newAnalytics = { ...prev };
        Object.entries(updates).forEach(([qId, timeSpent]) => {
          if (newAnalytics[qId]) {
            newAnalytics[qId].timeSpent = timeSpent;
          }
        });
        return newAnalytics;
      });
    }
  }

  // Actions
  const initializeQuiz = useCallback((quizData, selectedMode, existingAttemptId = null) => {
    setQuiz(quizData);
    setMode(selectedMode);
    setAttemptId(existingAttemptId);
    setStartTime(new Date());
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuestionAnalytics({});
    setQuestionTimers({});
    setFlaggedQuestions([]);
    setError(null);

    // Start timer for timed quizzes
    if (quizData.timeLimit && selectedMode === 'exam') {
      timer.reset();
      timer.start();
    }

    markUnsavedChanges();
  }, [timer, markUnsavedChanges]);

  const answerQuestion = useCallback((questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    // Update analytics
    setQuestionAnalytics(prev => {
      const updated = calculateQuestionAnalytics(
        quiz?.questions || [],
        { ...answers, [questionId]: answer },
        prev
      );
      return updated;
    });

    // Start tracking time for this question
    setQuestionTimers(prev => ({
      ...prev,
      [questionId]: Date.now(),
    }));

    markUnsavedChanges();

    // Show feedback in practice mode
    if (mode === 'practice') {
      const question = quiz.questions.find(q => q._id === questionId);
      if (question) {
        const scoreResult = calculateQuizScore([question], { [questionId]: answer });
        const isCorrect = scoreResult.questionResults[0]?.isCorrect;
        const correctAnswer = question.correctAnswer;
        const explanation = question.explanation;


        // Fallback feedback if correct answer is not available
        const feedbackData = {
          isCorrect: correctAnswer ? isCorrect : null, // null means cannot determine
          correctAnswer: correctAnswer || 'Not available',
          explanation: explanation || 'No explanation available',
          pointsEarned: scoreResult.questionResults[0]?.pointsEarned || 0,
          currentScore: scoreResult.scorePercentage,
          selectedAnswer: answer,
          answeredQuestions: Object.keys(answers).length + 1,
          totalQuestions: quiz.questions.length,
        };

        setFeedbackData(feedbackData);
        setShowFeedback(true);
      } else {
        console.error('Question not found for feedback:', questionId);
      }
    }
  }, [quiz, answers, mode, markUnsavedChanges]);

  const navigateToQuestion = useCallback((index) => {
    if (index >= 0 && index < (quiz?.questions?.length || 0)) {
      setCurrentQuestionIndex(index);
      markUnsavedChanges();
    }
  }, [quiz, markUnsavedChanges]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < (quiz?.questions?.length || 0) - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, quiz, navigateToQuestion]);

  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      navigateToQuestion(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex, navigateToQuestion]);

  const toggleFlagQuestion = useCallback((questionId) => {
    setFlaggedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
    markUnsavedChanges();
  }, [markUnsavedChanges]);

  const handleSubmitQuiz = useCallback(async () => {
    if (!quiz || !answers) return;

    setIsLoading(true);
    try {
      const scoreResult = calculateQuizScore(quiz.questions, answers);
      const finalAnalytics = calculateQuestionAnalytics(quiz.questions, answers, questionAnalytics);

      // Call completion callback
      await onQuizComplete?.({
        score: scoreResult.scorePercentage,
        answers,
        analytics: finalAnalytics,
        timeSpent: timer.elapsed,
        passed: scoreResult.scorePercentage >= (quiz.passingScore || 0),
      });

      // Clear snapshot
      deleteAttemptSnapshot(userId, quizId);

      // Stop timer
      timer.reset();

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [quiz, answers, mode, questionAnalytics, timer, onQuizComplete, userId, quizId]);

  const resetQuiz = useCallback(() => {
    setQuiz(null);
    setMode(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setAttemptId(null);
    setQuestionAnalytics({});
    setQuestionTimers({});
    setStartTime(null);
    setShowFeedback(false);
    setFeedbackData(null);
    setIsReviewMode(false);
    setFlaggedQuestions([]);
    setError(null);
    timer.reset();
    deleteAttemptSnapshot(userId, quizId);
  }, [timer, userId, quizId]);

  // Computed values
  const getCurrentQuestion = useCallback(() => {
    return quiz?.questions?.[currentQuestionIndex] || null;
  }, [quiz, currentQuestionIndex]);

  const getCurrentQuestionId = useCallback(() => {
    return getCurrentQuestion()?._id;
  }, [getCurrentQuestion]);

  const getProgress = useCallback(() => {
    if (!quiz?.questions) return 0;
    const answered = Object.keys(answers).length;
    return Math.round((answered / quiz.questions.length) * 100);
  }, [quiz, answers]);

  const isComplete = useCallback(() => {
    if (!quiz?.questions) return false;
    return Object.keys(answers).length === quiz.questions.length;
  }, [quiz, answers]);

  return {
    // State
    quiz,
    mode,
    currentQuestionIndex,
    answers,
    attemptId,
    isLoading,
    error,
    questionAnalytics,
    showFeedback,
    feedbackData,
    isReviewMode,
    flaggedQuestions,

    // Timer
    timer,

    // Computed
    currentQuestion: getCurrentQuestion(),
    progress: getProgress(),
    isComplete: isComplete(),

    // Actions
    initializeQuiz,
    answerQuestion,
    navigateToQuestion,
    nextQuestion,
    previousQuestion,
    toggleFlagQuestion,
    submitQuiz: handleSubmitQuiz,
    resetQuiz,
    saveSnapshot,

    // Utilities
    setError,
    setShowFeedback,
    setIsReviewMode,
  };
};