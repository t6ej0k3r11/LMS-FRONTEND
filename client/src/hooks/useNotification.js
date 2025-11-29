import { useToast } from './use-toast';
import { useState, useCallback } from 'react';

/**
 * Enhanced notification hook that provides unified notification management
 * Supports toast, modal, and inline notifications
 */
export function useNotification() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);

  // Toast notifications (existing functionality)
  const showToast = useCallback((options) => {
    return toast(options);
  }, [toast]);

  // Success toast
  const showSuccess = useCallback((title, description) => {
    return showToast({
      title,
      description,
      variant: 'default',
    });
  }, [showToast]);

  // Error toast
  const showError = useCallback((title, description) => {
    return showToast({
      title: title || 'Error',
      description,
      variant: 'destructive',
    });
  }, [showToast]);

  // Warning toast
  const showWarning = useCallback((title, description) => {
    return showToast({
      title: title || 'Warning',
      description,
      variant: 'default',
    });
  }, [showToast]);

  // Info toast
  const showInfo = useCallback((title, description) => {
    return showToast({
      title: title || 'Information',
      description,
      variant: 'default',
    });
  }, [showToast]);

  // Inline notifications (for displaying in components)
  const addInlineNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: 'info',
      title: '',
      message: '',
      autoClose: true,
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeInlineNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeInlineNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearInlineNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Modal notifications (for confirm dialogs, etc.)
  const showConfirmDialog = useCallback((options) => {
    return new Promise((resolve) => {
      // This would integrate with a modal context or state management
      // For now, we'll use a simple approach
      const confirmed = window.confirm(options.message || options.title);
      resolve(confirmed);
    });
  }, []);

  // Loading state notifications
  const showLoading = useCallback((message = 'Loading...') => {
    const id = addInlineNotification({
      type: 'loading',
      message,
      autoClose: false,
    });
    return id;
  }, [addInlineNotification]);

  const hideLoading = useCallback((id) => {
    removeInlineNotification(id);
  }, [removeInlineNotification]);

  // Progress notifications
  const showProgress = useCallback((title, progress, total = 100) => {
    const percentage = Math.round((progress / total) * 100);
    return addInlineNotification({
      type: 'progress',
      title,
      message: `${percentage}% complete`,
      progress,
      total,
      autoClose: false,
    });
  }, [addInlineNotification]);

  // Batch operations
  const showBatchSuccess = useCallback((count, operation = 'operations') => {
    return showSuccess(
      'Success',
      `Successfully completed ${count} ${operation}`
    );
  }, [showSuccess]);

  const showBatchError = useCallback((count, operation = 'operations') => {
    return showError(
      'Error',
      `Failed to complete ${count} ${operation}. Please try again.`
    );
  }, [showError]);

  return {
    // Toast notifications
    toast: showToast,
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,

    // Inline notifications
    notifications,
    addNotification: addInlineNotification,
    removeNotification: removeInlineNotification,
    clearNotifications: clearInlineNotifications,

    // Modal notifications
    confirm: showConfirmDialog,

    // Special notifications
    loading: showLoading,
    hideLoading,
    progress: showProgress,

    // Batch operations
    batchSuccess: showBatchSuccess,
    batchError: showBatchError,
  };
}