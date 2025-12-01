import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useToast } from '../../../hooks/use-toast';

const StudentToastContext = createContext();

export const useStudentToast = () => {
  const context = useContext(StudentToastContext);
  if (!context) {
    throw new Error('useStudentToast must be used within StudentToastProvider');
  }
  return context;
};

export const StudentToastProvider = ({ children }) => {
  const { toast } = useToast();

  // Student-specific toast methods
  const showSuccess = (title, description) => {
    toast({
      title,
      description,
      variant: 'default',
    });
  };

  const showError = (title, description) => {
    toast({
      title: title || 'Error',
      description: description || 'Something went wrong',
      variant: 'destructive',
    });
  };

  const showInfo = (title, description) => {
    toast({
      title,
      description,
      variant: 'default',
    });
  };

  const showWarning = (title, description) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  };

  // Specific student dashboard notifications
  const showProgressUpdate = (courseTitle, progress) => {
    showSuccess(
      'Progress Updated!',
      `You've completed ${progress}% of ${courseTitle}`
    );
  };

  const showCertificateEarned = (courseTitle) => {
    showSuccess(
      '🎉 Certificate Earned!',
      `Congratulations! You've completed ${courseTitle}`
    );
  };

  const showAssignmentSubmitted = (assignmentTitle) => {
    showSuccess(
      'Assignment Submitted',
      `${assignmentTitle} has been submitted successfully`
    );
  };

  const showQuizCompleted = (quizTitle, score) => {
    showSuccess(
      'Quiz Completed!',
      `You scored ${score}% on ${quizTitle}`
    );
  };

  const showBookmarkAdded = (lectureTitle) => {
    showInfo(
      'Bookmark Added',
      `${lectureTitle} has been bookmarked`
    );
  };

  const showNoteSaved = () => {
    showSuccess(
      'Note Saved',
      'Your note has been saved successfully'
    );
  };

  const showNotificationRead = () => {
    showInfo(
      'Notification Marked as Read',
      'Notification has been marked as read'
    );
  };

  const showGamificationUpdate = (xpGained, badgeEarned = null) => {
    const title = badgeEarned ? `🏆 Badge Earned: ${badgeEarned}!` : 'XP Gained!';
    const description = badgeEarned
      ? `You earned ${xpGained} XP and unlocked the ${badgeEarned} badge!`
      : `You earned ${xpGained} XP!`;

    showSuccess(title, description);
  };

  const value = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showProgressUpdate,
    showCertificateEarned,
    showAssignmentSubmitted,
    showQuizCompleted,
    showBookmarkAdded,
    showNoteSaved,
    showNotificationRead,
    showGamificationUpdate,
  };

  return (
    <StudentToastContext.Provider value={value}>
      {children}
    </StudentToastContext.Provider>
  );
};

StudentToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};