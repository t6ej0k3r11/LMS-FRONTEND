// quizCalculator.js - scoring and analytics calculation functions

/**
 * Calculate score for a single question
 * @param {Object} question - Question object
 * @param {string|Array} answer - User's answer
 * @returns {Object} Score result
 */
export const calculateQuestionScore = (question, answer) => {
  const { type, correctAnswer, points = 1 } = question;

  let isCorrect = false;
  let pointsEarned = 0;
  let partialCredit = 0;

  switch (type) {
    case 'multiple-choice':
    case 'true-false':
      isCorrect = answer === correctAnswer;
      pointsEarned = isCorrect ? points : 0;
      break;

    case 'multiple-select': {
      // Handle correctAnswer as string (JSON) or array
      let correctAnswers = correctAnswer;
      if (typeof correctAnswer === 'string') {
        try {
          correctAnswers = JSON.parse(correctAnswer);
        } catch {
          // If not JSON, treat as comma-separated string
          correctAnswers = correctAnswer.split(',').map(s => s.trim());
        }
      }

      if (Array.isArray(answer) && Array.isArray(correctAnswers)) {
        const correctSelected = answer.filter(a => correctAnswers.includes(a)).length;
        const incorrectSelected = answer.filter(a => !correctAnswers.includes(a)).length;
        const totalCorrect = correctAnswers.length;

        // Partial scoring: (# correct selected / # correct options) - (# incorrect selected / # options)
        const totalOptions = question.options?.length || 1;
        partialCredit = Math.max(0, (correctSelected / totalCorrect) - (incorrectSelected / totalOptions));
        pointsEarned = Math.round(partialCredit * points);
        isCorrect = partialCredit === 1;
      }
      break;
    }

    case 'short-text':
    case 'broad-text':
      // For text answers, scoring is typically done server-side
      // Client-side can do basic checks or leave for manual review
      isCorrect = null; // Manual review needed
      pointsEarned = 0;
      break;

    case 'code-snippet':
      // Code snippets typically need manual review
      isCorrect = null;
      pointsEarned = 0;
      break;

    default:
      isCorrect = false;
      pointsEarned = 0;
  }

  return {
    isCorrect,
    pointsEarned,
    partialCredit,
    needsReview: type === 'broad-text' || type === 'code-snippet' || type === 'short-text',
  };
};

/**
 * Calculate overall quiz score
 * @param {Array} questions - Array of question objects
 * @param {Object} answers - Object with questionId -> answer mappings
 * @returns {Object} Overall score result
 */
export const calculateQuizScore = (questions, answers) => {
  let totalPointsEarned = 0;
  let totalPossiblePoints = 0;
  let autoGradablePoints = 0;
  let autoGradableEarned = 0;
  const questionResults = [];

  questions.forEach(question => {
    const answer = answers[question._id];
    const result = calculateQuestionScore(question, answer);

    totalPossiblePoints += question.points || 1;
    totalPointsEarned += result.pointsEarned;

    if (!result.needsReview) {
      autoGradablePoints += question.points || 1;
      autoGradableEarned += result.pointsEarned;
    }

    questionResults.push({
      questionId: question._id,
      ...result,
    });
  });

  // Calculate percentage based on auto-gradable questions only
  // (since manual review questions don't contribute to immediate score)
  const scorePercentage = autoGradablePoints > 0
    ? Math.round((autoGradableEarned / autoGradablePoints) * 100)
    : 0;

  return {
    scorePercentage,
    totalPointsEarned,
    totalPossiblePoints,
    autoGradableEarned,
    autoGradablePoints,
    questionResults,
    hasUnreviewedQuestions: questionResults.some(r => r.needsReview),
  };
};

/**
 * Calculate question analytics
 * @param {Array} questions - Array of questions
 * @param {Object} answers - Answers object
 * @param {Object} questionAnalytics - Existing analytics
 * @returns {Object} Updated analytics
 */
export const calculateQuestionAnalytics = (questions, answers, questionAnalytics = {}) => {
  const analytics = { ...questionAnalytics };

  questions.forEach(question => {
    const questionId = question._id;
    const answer = answers[questionId];

    if (!analytics[questionId]) {
      analytics[questionId] = {
        timeSpent: 0,
        attempts: 0,
        chosenOptions: [],
        correctness: null,
        firstAnsweredAt: null,
        lastAnsweredAt: null,
      };
    }

    const analytic = analytics[questionId];

    // Track attempts (changes in answer)
    if (answer !== undefined && answer !== null) {
      analytic.attempts += 1;

      // Track chosen options
      if (Array.isArray(answer)) {
        analytic.chosenOptions = [...new Set([...analytic.chosenOptions, ...answer])];
      } else {
        if (!analytic.chosenOptions.includes(answer)) {
          analytic.chosenOptions.push(answer);
        }
      }

      // Track timestamps
      const now = new Date().toISOString();
      if (!analytic.firstAnsweredAt) {
        analytic.firstAnsweredAt = now;
      }
      analytic.lastAnsweredAt = now;

      // Calculate correctness
      const scoreResult = calculateQuestionScore(question, answer);
      analytic.correctness = scoreResult.isCorrect;
    }
  });

  return analytics;
};

/**
 * Calculate time spent on questions
 * @param {Object} questionTimers - Object with questionId -> startTime mappings
 * @param {string} currentQuestionId - Current question ID
 * @returns {Object} Time spent updates
 */
export const calculateTimeSpent = (questionTimers, currentQuestionId) => {
  const updates = {};
  const now = Date.now();

  Object.entries(questionTimers).forEach(([questionId, startTime]) => {
    if (startTime && questionId !== currentQuestionId) {
      const timeSpent = Math.floor((now - startTime) / 1000); // in seconds
      updates[questionId] = timeSpent;
    }
  });

  return updates;
};

/**
 * Format time duration
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTimeSpent = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

/**
 * Check if quiz is passed based on score and passing criteria
 * @param {number} score - Score percentage
 * @param {number} passingScore - Required passing score
 * @param {boolean} hasUnreviewedQuestions - Whether there are questions needing review
 * @returns {boolean} Pass status
 */
export const isQuizPassed = (score, passingScore, hasUnreviewedQuestions) => {
  // If there are unreviewed questions, don't mark as passed until reviewed
  if (hasUnreviewedQuestions) return false;
  return score >= passingScore;
};