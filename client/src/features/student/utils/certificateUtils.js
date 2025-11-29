/**
 * Certificate utility functions
 */

/**
 * Generate a unique certificate ID
 * Format: CERT-{YEAR}{MONTH}{DAY}-{USER_ID_LAST_6}-{COURSE_ID_LAST_6}-{RANDOM_4}
 */
export function generateCertificateId(userId, courseId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const userIdLast6 = userId.slice(-6).toUpperCase();
  const courseIdLast6 = courseId.slice(-6).toUpperCase();
  const random4 = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `CERT-${year}${month}${day}-${userIdLast6}-${courseIdLast6}-${random4}`;
}

/**
 * Format certificate date for display
 */
export function formatCertificateDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

/**
 * Check if student is eligible for certificate
 */
export function isEligibleForCertificate(completionPercentage, hasPassedFinalQuiz = true, hasSubmittedRequiredAssignments = true) {
  return (
    completionPercentage >= 80 &&
    hasPassedFinalQuiz &&
    hasSubmittedRequiredAssignments
  );
}

/**
 * Get certificate eligibility status
 */
export function getCertificateEligibility(completionPercentage, hasPassedFinalQuiz = true, hasSubmittedRequiredAssignments = true) {
  if (!isEligibleForCertificate(completionPercentage, hasPassedFinalQuiz, hasSubmittedRequiredAssignments)) {
    const reasons = [];

    if (completionPercentage < 80) {
      reasons.push(`Complete ${80 - completionPercentage}% more of the course`);
    }

    if (!hasPassedFinalQuiz) {
      reasons.push('Pass the final assessment');
    }

    if (!hasSubmittedRequiredAssignments) {
      reasons.push('Submit all required assignments');
    }

    return {
      eligible: false,
      reasons
    };
  }

  return {
    eligible: true,
    reasons: []
  };
}

/**
 * Certificate template data structure
 */
export function createCertificateData(user, course, certificateId, completionDate) {
  return {
    certificateId,
    studentName: user.userName || `${user.firstName} ${user.lastName}`,
    studentEmail: user.email,
    courseTitle: course.title,
    courseDescription: course.description,
    instructorName: course.instructorName,
    completionDate: formatCertificateDate(completionDate),
    completionPercentage: course.completionPercentage || 100,
    issuedDate: formatCertificateDate(new Date()),
    // Additional metadata for PDF generation
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0',
      template: 'professional-certificate'
    }
  };
}