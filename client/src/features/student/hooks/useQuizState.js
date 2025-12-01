import { useState, useCallback, useEffect } from 'react';

export const useQuizState = (quizData, options = {}) => {
  const {
    autoSave = true,
    autoSaveInterval = 30000, // 30 seconds
    persistToLocalStorage = true,
    localStorageKey = null,
  } = options;

  // Core quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [timeSpent, setTimeSpent] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [attemptId, setAttemptId] = useState(null);

  // Analytics state
  const [questionAnalytics, setQuestionAnalytics] = useState({});
  const [quizStartTime, setQuizStartTime] = useState(null);

  // Initialize quiz
  useEffect(() => {
    if (quizData && !startTime) {
      const now = Date.now();
      setStartTime(now);
      setQuizStartTime(now);
      setQuestionStartTime(now);

      // Load from localStorage if available
      if (persistToLocalStorage && localStorageKey) {
        const saved = localStorage.getItem(localStorageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setAnswers(parsed.answers || {});
            setFlaggedQuestions(parsed.flaggedQuestions || []);
            setTimeSpent(parsed.timeSpent || {});
            setQuestionAnalytics(parsed.questionAnalytics || {});
            setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
            setAttemptId(parsed.attemptId);
          } catch (error) {
            console.error('Error loading quiz state from localStorage:', error);
          }
        }
      }
    }
  }, [quizData, startTime, persistToLocalStorage, localStorageKey]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !persistToLocalStorage || !localStorageKey) return;

    const interval = setInterval(() => {
      saveToLocalStorage();
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, autoSaveInterval, persistToLocalStorage, localStorageKey]);

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    if (!persistToLocalStorage || !localStorageKey) return;

    const state = {
      answers,
      flaggedQuestions,
      timeSpent,
      questionAnalytics,
      currentQuestionIndex,
      attemptId,
      lastSaved: Date.now(),
    };

    localStorage.setItem(localStorageKey, JSON.stringify(state));
  }, [answers, flaggedQuestions, timeSpent, questionAnalytics, currentQuestionIndex, attemptId, persistToLocalStorage, localStorageKey]);

  // Answer management
  const updateAnswer = useCallback((questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));

    // Update analytics
    const currentTime = Date.now();
    const questionTime = questionStartTime ? (currentTime - questionStartTime) / 1000 : 0;

    setQuestionAnalytics(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        timeSpent: (prev[questionId]?.timeSpent || 0) + questionTime,
        attempts: (prev[questionId]?.attempts || 0) + 1,
        lastAnswered: currentTime,
        selectedAnswer: answer,
      },
    }));

    setTimeSpent(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + questionTime,
    }));

    // Reset question start time
    setQuestionStartTime(currentTime);
  }, [questionStartTime]);

  // Navigation
  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < (quizData?.questions?.length || 0)) {
      // Record time spent on current question
      if (questionStartTime) {
        const currentTime = Date.now();
        const questionTime = (currentTime - questionStartTime) / 1000;
        const currentQuestionId = quizData.questions[currentQuestionIndex]._id;

        setTimeSpent(prev => ({
          ...prev,
          [currentQuestionId]: (prev[currentQuestionId] || 0) + questionTime,
        }));

        setQuestionAnalytics(prev => ({
          ...prev,
          [currentQuestionId]: {
            ...prev[currentQuestionId],
            timeSpent: (prev[currentQuestionId]?.timeSpent || 0) + questionTime,
          },
        }));
      }

      setCurrentQuestionIndex(index);
      setQuestionStartTime(Date.now());
    }
  }, [quizData, currentQuestionIndex, questionStartTime]);

  const goToNext = useCallback(() => {
    goToQuestion(currentQuestionIndex + 1);
  }, [goToQuestion, currentQuestionIndex]);

  const goToPrevious = useCallback(() => {
    goToQuestion(currentQuestionIndex - 1);
  }, [goToQuestion, currentQuestionIndex]);

  // Flagging
  const toggleFlag = useCallback((questionId) => {
    setFlaggedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  }, []);

  // Completion
  const completeQuiz = useCallback(() => {
    setIsCompleted(true);
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  // Reset
  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFlaggedQuestions([]);
    setTimeSpent({});
    setQuestionAnalytics({});
    setIsCompleted(false);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());

    if (persistToLocalStorage && localStorageKey) {
      localStorage.removeItem(localStorageKey);
    }
  }, [persistToLocalStorage, localStorageKey]);

  // Computed values
  const currentQuestion = quizData?.questions?.[currentQuestionIndex];
  const totalQuestions = quizData?.questions?.length || 0;
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Analytics getters
  const getQuestionAnalytics = useCallback((questionId) => {
    return questionAnalytics[questionId] || {};
  }, [questionAnalytics]);

  const getQuizAnalytics = useCallback(() => {
    const totalTime = Object.values(timeSpent).reduce((sum, time) => sum + time, 0);
    const averageTimePerQuestion = answeredQuestions > 0 ? totalTime / answeredQuestions : 0;

    return {
      totalQuestions,
      answeredQuestions,
      progressPercentage,
      totalTimeSpent: totalTime,
      averageTimePerQuestion,
      flaggedQuestions: flaggedQuestions.length,
      questionAnalytics,
      startTime: quizStartTime,
      completionTime: isCompleted ? Date.now() : null,
    };
  }, [totalQuestions, answeredQuestions, progressPercentage, timeSpent, flaggedQuestions.length, questionAnalytics, quizStartTime, isCompleted]);

  return {
    // State
    currentQuestionIndex,
    answers,
    flaggedQuestions,
    timeSpent,
    questionAnalytics,
    isCompleted,
    attemptId,

    // Computed
    currentQuestion,
    totalQuestions,
    answeredQuestions,
    progressPercentage,
    isFirstQuestion,
    isLastQuestion,

    // Actions
    updateAnswer,
    goToQuestion,
    goToNext,
    goToPrevious,
    toggleFlag,
    completeQuiz,
    resetQuiz,
    saveToLocalStorage,

    // Analytics
    getQuestionAnalytics,
    getQuizAnalytics,
  };
};