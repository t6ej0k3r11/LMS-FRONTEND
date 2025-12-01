import { useState, useCallback } from 'react';
import axiosInstance from '../../../api/axiosInstance';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = useCallback(async (config) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance(config);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Student-specific API methods
  const getStudentProfile = useCallback(() => {
    return makeRequest({
      method: 'GET',
      url: '/student/profile',
    });
  }, [makeRequest]);

  const getEnrolledCourses = useCallback(() => {
    return makeRequest({
      method: 'GET',
      url: '/student/courses',
    });
  }, [makeRequest]);

  const getCourseProgress = useCallback((courseId) => {
    return makeRequest({
      method: 'GET',
      url: `/student/courses/${courseId}/progress`,
    });
  }, [makeRequest]);

  const updateProgress = useCallback((courseId, lectureId, progress) => {
    return makeRequest({
      method: 'PUT',
      url: `/student/courses/${courseId}/progress`,
      data: { lectureId, progress },
    });
  }, [makeRequest]);

  const getNotifications = useCallback(() => {
    return makeRequest({
      method: 'GET',
      url: '/student/notifications',
    });
  }, [makeRequest]);

  const markNotificationRead = useCallback((notificationId) => {
    return makeRequest({
      method: 'PUT',
      url: `/student/notifications/${notificationId}/read`,
    });
  }, [makeRequest]);

  const getMessages = useCallback((threadId = null) => {
    const url = threadId ? `/student/messages/${threadId}` : '/student/messages';
    return makeRequest({
      method: 'GET',
      url,
    });
  }, [makeRequest]);

  const sendMessage = useCallback((data) => {
    return makeRequest({
      method: 'POST',
      url: '/student/messages',
      data,
    });
  }, [makeRequest]);

  const getAssignments = useCallback((courseId = null) => {
    const url = courseId ? `/student/assignments?courseId=${courseId}` : '/student/assignments';
    return makeRequest({
      method: 'GET',
      url,
    });
  }, [makeRequest]);

  const submitAssignment = useCallback((assignmentId, formData) => {
    return makeRequest({
      method: 'POST',
      url: `/student/assignments/${assignmentId}/submit`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }, [makeRequest]);

  const getResources = useCallback((courseId = null) => {
    const url = courseId ? `/student/resources?courseId=${courseId}` : '/student/resources';
    return makeRequest({
      method: 'GET',
      url,
    });
  }, [makeRequest]);

  const getNotes = useCallback((courseId = null) => {
    const url = courseId ? `/student/notes?courseId=${courseId}` : '/student/notes';
    return makeRequest({
      method: 'GET',
      url,
    });
  }, [makeRequest]);

  const saveNote = useCallback((courseId, lectureId, content) => {
    return makeRequest({
      method: 'POST',
      url: '/student/notes',
      data: { courseId, lectureId, content },
    });
  }, [makeRequest]);

  const getBookmarks = useCallback(() => {
    return makeRequest({
      method: 'GET',
      url: '/student/bookmarks',
    });
  }, [makeRequest]);

  const addBookmark = useCallback((courseId, lectureId) => {
    return makeRequest({
      method: 'POST',
      url: '/student/bookmarks',
      data: { courseId, lectureId },
    });
  }, [makeRequest]);

  const getGamificationData = useCallback(() => {
    return makeRequest({
      method: 'GET',
      url: '/student/gamification',
    });
  }, [makeRequest]);

  const getLeaderboard = useCallback((courseId = null) => {
    const url = courseId ? `/student/leaderboard?courseId=${courseId}` : '/student/leaderboard';
    return makeRequest({
      method: 'GET',
      url,
    });
  }, [makeRequest]);

  const getCalendarEvents = useCallback(() => {
    return makeRequest({
      method: 'GET',
      url: '/student/calendar',
    });
  }, [makeRequest]);

  return {
    loading,
    error,
    makeRequest,
    // Student API methods
    getStudentProfile,
    getEnrolledCourses,
    getCourseProgress,
    updateProgress,
    getNotifications,
    markNotificationRead,
    getMessages,
    sendMessage,
    getAssignments,
    submitAssignment,
    getResources,
    getNotes,
    saveNote,
    getBookmarks,
    addBookmark,
    getGamificationData,
    getLeaderboard,
    getCalendarEvents,
  };
};