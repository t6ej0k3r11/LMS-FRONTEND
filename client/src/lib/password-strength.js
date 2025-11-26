// Password strength evaluation utility
export const evaluatePasswordStrength = (password) => {
  let score = 0;
  const feedback = [];

  // Length checks
  if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Consider using at least 8 characters for better security");
  }

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(
    Boolean
  ).length;
  score += varietyCount;

  if (varietyCount < 4) {
    feedback.push(
      "Include uppercase, lowercase, digits, and special characters"
    );
  }

  // Avoid common patterns
  const repeatedChars = /(.)\1{2,}/.test(password);
  const sequentialChars =
    /(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
      password
    );

  if (repeatedChars) {
    score -= 1;
    feedback.push("Avoid repeated characters");
  }

  if (sequentialChars) {
    score -= 1;
    feedback.push("Avoid sequential characters");
  }

  // Basic dictionary word check (simple implementation)
  const commonWords = [
    "password",
    "123456",
    "qwerty",
    "admin",
    "user",
    "login",
  ];
  const lowerPassword = password.toLowerCase();
  const hasCommonWord = commonWords.some((word) =>
    lowerPassword.includes(word)
  );

  if (hasCommonWord) {
    score -= 1;
    feedback.push("Avoid common words or patterns");
  }

  // Determine strength level
  let strength = "weak";
  if (score >= 5) {
    strength = "strong";
  } else if (score >= 3) {
    strength = "medium";
  }

  return {
    strength,
    score,
    feedback,
    checks: {
      length: password.length >= 8,
      variety: varietyCount >= 4,
      noRepeated: !repeatedChars,
      noSequential: !sequentialChars,
      noCommonWords: !hasCommonWord,
    },
  };
};
