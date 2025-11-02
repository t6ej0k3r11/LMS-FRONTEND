/**
 * Validates username against server-side rules
 * @param {string} username - The username to validate
 * @returns {object} - Validation result with isValid, errors, and suggestions
 */
export function validateUsername(username) {
  const errors = [];
  const suggestions = [];

  // Check if empty (but allow real-time feedback)
  if (!username.trim()) {
    return {
      isValid: false,
      errors: [],
      suggestions: ["Enter a username to get started"],
    };
  }

  // Length validation
  if (username.length < 3) {
    errors.push("Username must be at least 3 characters long");
    suggestions.push("Add more characters to meet the minimum length");
  } else if (username.length > 50) {
    errors.push("Username must be no more than 50 characters long");
    suggestions.push("Remove some characters to meet the maximum length");
  }

  // Character validation
  const validPattern = /^[a-zA-Z0-9_]+$/;
  if (!validPattern.test(username)) {
    errors.push("Username can only contain letters, numbers, and underscores");
    const invalidChars = username.replace(/[a-zA-Z0-9_]/g, "");
    if (invalidChars) {
      suggestions.push(
        `Remove invalid characters: ${[...new Set(invalidChars)].join(", ")}`
      );
    }
    suggestions.push(
      "Use only letters (a-z, A-Z), numbers (0-9), and underscores (_)"
    );
  }

  // Additional suggestions for better UX
  if (
    username.length >= 3 &&
    username.length <= 50 &&
    validPattern.test(username)
  ) {
    if (username.length < 6) {
      suggestions.push("Consider a longer username for better uniqueness");
    }
    if (!/[a-z]/.test(username)) {
      suggestions.push("Consider adding lowercase letters for readability");
    }
    if (!/[A-Z]/.test(username)) {
      suggestions.push("Consider adding uppercase letters for style");
    }
  }

  // Examples of valid usernames
  if (errors.length > 0) {
    suggestions.push("Examples: user123, my_username, JohnDoe");
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions,
  };
}

/**
 * Gets real-time feedback for username input
 * @param {string} username - Current username value
 * @returns {object} - Feedback with status, message, and color
 */
export function getUsernameFeedback(username) {
  const validation = validateUsername(username);

  if (!username.trim()) {
    return {
      status: "neutral",
      message: "Enter your desired username",
      color: "text-gray-500",
    };
  }

  if (validation.isValid) {
    return {
      status: "valid",
      message: "Username looks good!",
      color: "text-green-600",
    };
  }

  // Prioritize length errors
  if (username.length < 3) {
    return {
      status: "error",
      message: "Too short - minimum 3 characters",
      color: "text-red-500",
    };
  }

  if (username.length > 50) {
    return {
      status: "error",
      message: "Too long - maximum 50 characters",
      color: "text-red-500",
    };
  }

  // Then character errors
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      status: "error",
      message: "Contains invalid characters",
      color: "text-red-500",
    };
  }

  return {
    status: "neutral",
    message: "Checking username...",
    color: "text-gray-500",
  };
}
