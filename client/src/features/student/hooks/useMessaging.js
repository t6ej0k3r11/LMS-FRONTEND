import { useState, useCallback } from 'react';
import { useApi } from './useApi';

/**
 * Custom hook for messaging functionality
 */
export function useMessaging() {
  const [activeThread, setActiveThread] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const { get, post } = useApi();

  // Fetch message threads
  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await get('/student/messages');
      if (response.success) {
        setThreads(response.data);
      }
    } catch (error) {
      console.error('Error fetching message threads:', error);
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Send message
  const sendMessage = useCallback(async (threadId, content) => {
    try {
      const response = await post(`/student/messages/${threadId}`, { content });
      if (response.success) {
        // Update thread with new message
        setThreads(prev => prev.map(thread =>
          thread._id === threadId
            ? {
                ...thread,
                lastMessage: {
                  content,
                  sender: 'currentUser', // Will be replaced by actual user ID
                  timestamp: new Date().toISOString(),
                  read: true
                },
                unreadCount: 0
              }
            : thread
        ));
        return response.data;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [post]);

  // Mark thread as read
  const markThreadAsRead = useCallback(async (threadId) => {
    try {
      await post(`/student/messages/${threadId}/read`);
      setThreads(prev => prev.map(thread =>
        thread._id === threadId
          ? { ...thread, unreadCount: 0, lastMessage: { ...thread.lastMessage, read: true } }
          : thread
      ));
    } catch (error) {
      console.error('Error marking thread as read:', error);
    }
  }, [post]);

  // Select active thread
  const selectThread = useCallback((thread) => {
    setActiveThread(thread);
    if (thread && thread.unreadCount > 0) {
      markThreadAsRead(thread._id);
    }
  }, [markThreadAsRead]);

  // Clear active thread
  const clearActiveThread = useCallback(() => {
    setActiveThread(null);
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return threads.reduce((total, thread) => total + (thread.unreadCount || 0), 0);
  }, [threads]);

  return {
    activeThread,
    threads,
    loading,
    fetchThreads,
    sendMessage,
    markThreadAsRead,
    selectThread,
    clearActiveThread,
    getUnreadCount
  };
}