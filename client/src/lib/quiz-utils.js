/**
 * Validates quiz submission before allowing it to proceed
 * @param {Object} answers - Object containing questionId -> answer mappings
 * @param {Array} questions - Array of question objects
 * @returns {Object} Validation result with errors and warnings
 */
export function validateQuizSubmission(answers, questions) {
  const errors = [];
  const warnings = [];

  if (!answers || typeof answers !== 'object') {
    errors.push("Invalid answers format");
    return { isValid: false, errors, warnings };
  }

  if (!questions || !Array.isArray(questions)) {
    errors.push("Invalid questions format");
    return { isValid: false, errors, warnings };
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  // Check if all questions are answered
  if (answeredCount < totalQuestions) {
    const unansweredCount = totalQuestions - answeredCount;
    warnings.push(`You have ${unansweredCount} unanswered question${unansweredCount !== 1 ? 's' : ''}`);
  }

  // Validate answer formats for each question type
  questions.forEach((question, index) => {
    const answer = answers[question._id];

    if (answer === undefined || answer === null || answer === '') {
      // Already counted in unanswered questions
      return;
    }

    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        if (typeof answer !== 'string') {
          errors.push(`Question ${index + 1}: Invalid answer format`);
        }
        break;

      case 'multiple-select':
        if (!Array.isArray(answer)) {
          errors.push(`Question ${index + 1}: Multiple selection answers must be an array`);
        } else if (answer.length === 0) {
          warnings.push(`Question ${index + 1}: No options selected`);
        }
        break;

      case 'broad-text':
        if (typeof answer !== 'string') {
          errors.push(`Question ${index + 1}: Text answer must be a string`);
        } else if (answer.trim().length < 10) {
          warnings.push(`Question ${index + 1}: Answer seems too short (minimum 10 characters recommended)`);
        }
        break;

      default:
        errors.push(`Question ${index + 1}: Unknown question type`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculates quiz progress percentage
 * @param {Object} answers - Object containing questionId -> answer mappings
 * @param {Array} questions - Array of question objects
 * @returns {number} Progress percentage (0-100)
 */
export function calculateQuizProgress(answers, questions) {
  if (!questions || questions.length === 0) return 0;

  const answeredCount = Object.keys(answers || {}).length;
  return Math.round((answeredCount / questions.length) * 100);
}

/**
 * Gets quiz statistics
 * @param {Object} answers - Object containing questionId -> answer mappings
 * @param {Array} questions - Array of question objects
 * @returns {Object} Statistics object
 */
export function getQuizStatistics(answers, questions) {
  const totalQuestions = questions?.length || 0;
  const answeredQuestions = Object.keys(answers || {}).length;
  const progressPercentage = calculateQuizProgress(answers, questions);

  return {
    totalQuestions,
    answeredQuestions,
    unansweredQuestions: totalQuestions - answeredQuestions,
    progressPercentage,
    isComplete: answeredQuestions === totalQuestions
  };
}
