/**
 * Quiz utility functions for validation, scoring, and formatting
 */

/**
 * Validates quiz submission before sending to server
 * @param {Object} answers - User's answers object
 * @param {Array} questions - Quiz questions array
 * @returns {Object} - { isValid: boolean, errors: Array, warnings: Array }
 */
export function validateQuizSubmission(answers, questions) {
  const errors = [];
  const warnings = [];

  // Check for unanswered questions
  const unansweredQuestions = questions.filter((q) => !answers[q._id]);
  if (unansweredQuestions.length > 0) {
    warnings.push(
      `You have ${unansweredQuestions.length} unanswered question(s).`
    );
  }

  // Validate answer formats
  questions.forEach((question) => {
    const answer = answers[question._id];

    if (question.type === "multiple-choice") {
      if (answer && !question.options.includes(answer)) {
        errors.push(`Invalid answer format for question: ${question.question}`);
      }
    } else if (question.type === "multiple-select") {
      if (
        answer &&
        (!Array.isArray(answer) ||
          answer.some((a) => !question.options.includes(a)))
      ) {
        errors.push(`Invalid answer format for question: ${question.question}`);
      }
    } else if (question.type === "true-false") {
      if (answer && !["true", "false"].includes(answer)) {
        errors.push(`Invalid answer format for question: ${question.question}`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculates quiz score based on answers and correct answers
 * @param {Object} answers - User's answers object
 * @param {Array} questions - Quiz questions array
 * @returns {Object} - { totalScore: number, maxScore: number, percentage: number, questionResults: Array }
 */
export function calculateScore(answers, questions) {
  let totalScore = 0;
  let maxScore = 0;
  const questionResults = [];

  questions.forEach((question) => {
    const userAnswer = answers[question._id];
    const points = question.points || 1;
    maxScore += points;

    let isCorrect = false;
    let earnedPoints = 0;

    if (question.type === "multiple-choice" || question.type === "true-false") {
      isCorrect = userAnswer === question.correctAnswer;
      earnedPoints = isCorrect ? points : 0;
    } else if (question.type === "multiple-select") {
      // For multiple select, check if arrays match exactly
      const correctAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
      isCorrect =
        correctAnswers.length === userAnswers.length &&
        correctAnswers.every((ans) => userAnswers.includes(ans)) &&
        userAnswers.every((ans) => correctAnswers.includes(ans));
      earnedPoints = isCorrect ? points : 0;
    }

    totalScore += earnedPoints;
    questionResults.push({
      questionId: question._id,
      isCorrect,
      earnedPoints,
      maxPoints: points,
      userAnswer,
      correctAnswer: question.correctAnswer,
    });
  });

  const percentage =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    totalScore,
    maxScore,
    percentage,
    questionResults,
  };
}

/**
 * Formats time in seconds to readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export function formatQuizTime(seconds) {
  if (!seconds || seconds < 0) return "00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Checks if student can access the quiz based on prerequisites
 * @param {Object} quiz - Quiz object
 * @param {Object} courseProgress - Student's course progress
 * @param {Array} previousAttempts - Array of previous quiz attempts
 * @param {Object} courseDetails - Course details including curriculum
 * @returns {Object} - { canAccess: boolean, reason: string }
 */
export function checkQuizPrerequisites(
  quiz,
  courseProgress,
  previousAttempts = [],
  courseDetails = null
) {
  // Check if quiz has lectureId (lesson quiz)
  if (quiz.lectureId) {
    // Find the lecture in course curriculum
    const lecture = courseDetails?.curriculum?.find(
      (lec) => lec._id === quiz.lectureId
    );

    if (lecture) {
      // Check if lecture is completed
      const lectureCompleted = courseProgress?.progress?.find(
        (progressItem) => progressItem.lectureId === lecture._id
      )?.viewed;

      if (!lectureCompleted) {
        return {
          canAccess: false,
          reason: `You must complete the lecture "${lecture.title}" before taking this quiz.`,
        };
      }
    }
  } else {
    // Final quiz - check if all lectures are completed
    const allLecturesCompleted = courseDetails?.curriculum?.every(
      (lecture) =>
        courseProgress?.progress?.find(
          (progressItem) => progressItem.lectureId === lecture._id
        )?.viewed
    );

    if (!allLecturesCompleted) {
      return {
        canAccess: false,
        reason: `You must complete all lectures before taking the final quiz.`,
      };
    }
  }

  // Check if quiz has prerequisites
  if (quiz.prerequisites && quiz.prerequisites.length > 0) {
    for (const prerequisite of quiz.prerequisites) {
      if (prerequisite.type === "lecture") {
        // Check if prerequisite lecture is completed
        const lectureCompleted = courseProgress?.progress?.find(
          (progressItem) => progressItem.lectureId === prerequisite.id
        )?.viewed;
        if (!lectureCompleted) {
          return {
            canAccess: false,
            reason: `You must complete the lecture "${prerequisite.title}" before taking this quiz.`,
          };
        }
      } else if (prerequisite.type === "quiz") {
        // Check if prerequisite quiz is passed
        const prerequisiteAttempt = previousAttempts.find(
          (attempt) => attempt.quizId === prerequisite.id
        );
        if (
          !prerequisiteAttempt ||
          prerequisiteAttempt.score < prerequisite.minScore
        ) {
          return {
            canAccess: false,
            reason: `You must pass the quiz "${prerequisite.title}" with at least ${prerequisite.minScore}% before taking this quiz.`,
          };
        }
      }
    }
  }

  // Check attempt limits
  if (quiz.attemptsAllowed && previousAttempts.length >= quiz.attemptsAllowed) {
    return {
      canAccess: false,
      reason: `You have reached the maximum number of attempts (${quiz.attemptsAllowed}) for this quiz.`,
    };
  }

  // Check if quiz is currently available
  const now = new Date();
  if (quiz.startDate && new Date(quiz.startDate) > now) {
    return {
      canAccess: false,
      reason: `This quiz will be available starting ${new Date(
        quiz.startDate
      ).toLocaleDateString()}.`,
    };
  }

  if (quiz.endDate && new Date(quiz.endDate) < now) {
    return {
      canAccess: false,
      reason: `This quiz was due on ${new Date(
        quiz.endDate
      ).toLocaleDateString()}.`,
    };
  }

  return { canAccess: true };
}

/**
 * Checks if student can start a new quiz attempt (prevents multiple simultaneous attempts)
 * @param {Array} attempts - Array of quiz attempts
 * @returns {boolean} - True if can start new attempt
 */
export function canStartNewAttempt(attempts) {
  return !attempts.some((attempt) => attempt.status === "in_progress");
}

/**
 * Gets quiz status based on attempts and time
 * @param {Object} quiz - Quiz object
 * @param {Array} attempts - Array of attempts
 * @returns {string} - 'not_started', 'in_progress', 'completed', 'failed'
 */
export function getQuizStatus(quiz, attempts) {
  if (!attempts || attempts.length === 0) return "not_started";

  const latestAttempt = attempts[attempts.length - 1];

  if (latestAttempt.status === "in_progress") return "in_progress";
  if (latestAttempt.status === "completed") {
    // Check if passed based on passing score
    const passingScore = quiz.passingScore || 70;
    return latestAttempt.score >= passingScore ? "passed" : "failed";
  }

  return "not_started";
}
