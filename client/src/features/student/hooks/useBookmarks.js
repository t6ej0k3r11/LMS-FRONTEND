import { useState, useCallback } from 'react';
import { useApi } from './useApi';

/**
 * Custom hook for bookmarks management
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { get, post, delete: deleteApi } = useApi();

  // Fetch bookmarks
  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await get('/student/bookmarks');
      if (response.success) {
        setBookmarks(response.data);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Add bookmark
  const addBookmark = useCallback(async (bookmarkData) => {
    try {
      const response = await post('/student/bookmarks', bookmarkData);
      if (response.success) {
        setBookmarks(prev => [response.data, ...prev]);
        return response.data;
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }, [post]);

  // Remove bookmark
  const removeBookmark = useCallback(async (bookmarkId) => {
    try {
      await deleteApi(`/student/bookmarks/${bookmarkId}`);
      setBookmarks(prev => prev.filter(bookmark => bookmark._id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }, [deleteApi]);

  // Check if item is bookmarked
  const isBookmarked = useCallback((itemType, itemId) => {
    return bookmarks.some(bookmark =>
      bookmark.itemType === itemType && bookmark.itemId === itemId
    );
  }, [bookmarks]);

  // Toggle bookmark
  const toggleBookmark = useCallback(async (itemType, itemId, metadata = {}) => {
    const existingBookmark = bookmarks.find(bookmark =>
      bookmark.itemType === itemType && bookmark.itemId === itemId
    );

    if (existingBookmark) {
      await removeBookmark(existingBookmark._id);
      return false; // Removed
    } else {
      await addBookmark({ itemType, itemId, ...metadata });
      return true; // Added
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  // Get bookmarks by type
  const getBookmarksByType = useCallback((type) => {
    return bookmarks.filter(bookmark => bookmark.itemType === type);
  }, [bookmarks]);

  // Get bookmarks by course
  const getBookmarksByCourse = useCallback((courseId) => {
    return bookmarks.filter(bookmark => bookmark.courseId === courseId);
  }, [bookmarks]);

  return {
    bookmarks,
    loading,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
    getBookmarksByType,
    getBookmarksByCourse
  };
}