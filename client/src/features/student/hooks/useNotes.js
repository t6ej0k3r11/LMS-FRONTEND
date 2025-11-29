import { useState, useCallback } from 'react';
import { useApi } from './useApi';

/**
 * Custom hook for notes management
 */
export function useNotes(courseId = null) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { get, post, put, delete: deleteApi } = useApi();

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (courseId) params.append('courseId', courseId);

      const response = await get(`/student/notes?${params}`);
      if (response.success) {
        setNotes(response.data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, get]);

  // Create note
  const createNote = useCallback(async (noteData) => {
    try {
      const response = await post('/student/notes', noteData);
      if (response.success) {
        setNotes(prev => [response.data, ...prev]);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }, [post]);

  // Update note
  const updateNote = useCallback(async (noteId, noteData) => {
    try {
      const response = await put(`/student/notes/${noteId}`, noteData);
      if (response.success) {
        setNotes(prev => prev.map(note =>
          note._id === noteId ? response.data : note
        ));
        return response.data;
      }
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }, [put]);

  // Delete note
  const deleteNote = useCallback(async (noteId) => {
    try {
      await deleteApi(`/student/notes/${noteId}`);
      setNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }, [deleteApi]);

  // Export notes
  const exportNotes = useCallback((filteredNotes = notes) => {
    const exportData = filteredNotes.map(note => ({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      course: note.courseTitle,
      created: new Date(note.createdAt).toLocaleDateString(),
      updated: new Date(note.updatedAt).toLocaleDateString()
    }));

    const textContent = exportData.map(note =>
      `Title: ${note.title}\nContent:\n${note.content}\nTags: ${note.tags}\nCourse: ${note.course}\nCreated: ${note.created}\nUpdated: ${note.updated}\n\n---\n\n`
    ).join('');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notes-export-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  return {
    notes,
    loading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    exportNotes
  };
}