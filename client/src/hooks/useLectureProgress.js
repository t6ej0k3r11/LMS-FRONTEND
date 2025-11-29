import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { debounce } from 'lodash';

/**
 * Custom hook for managing lecture progress with real-time tracking
 * @param {string} courseId - Course ID
 * @param {string} lectureId - Lecture ID
 * @param {number} videoDuration - Video duration in seconds
 * @returns {Object} Hook state and functions
 */
export function useLectureProgress(courseId, lectureId, videoDuration = 0) {
  const [progress, setProgress] = useState({
    progressPercent: 0,
    lastTimestamp: 0,
    duration: videoDuration,
    completed: false,
    isLoading: false,
  });

  const [localProgress, setLocalProgress] = useState(null);
  const saveTimeoutRef = useRef(null);
  const lastSavedRef = useRef(0);
  const { toast } = useToast();

  // LocalStorage key for this lecture
  const getStorageKey = useCallback(() => {
    return `lecture_progress_${courseId}_${lectureId}`;
  }, [courseId, lectureId]);

  // Load progress from localStorage
  const loadLocalProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalProgress(parsed);
        setProgress(prev => ({
          ...prev,
          progressPercent: parsed.progressPercent || 0,
          lastTimestamp: parsed.lastTimestamp || 0,
          duration: parsed.duration || videoDuration,
          completed: parsed.completed || false,
        }));
        return parsed;
      }
    } catch (error) {
      console.error('Error loading local progress:', error);
    }
    return null;
  }, [getStorageKey, videoDuration]);

  // Save progress to localStorage
  const saveLocalProgress = useCallback((progressData) => {
    try {
      const data = {
        ...progressData,
        courseId,
        lectureId,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
      setLocalProgress(data);
    } catch (error) {
      console.error('Error saving local progress:', error);
    }
  }, [getStorageKey, courseId, lectureId]);

  // Calculate progress percentage
  const calculateProgress = useCallback((currentTime, duration) => {
    if (!duration || duration <= 0) return 0;
    return Math.min(Math.round((currentTime / duration) * 100), 100);
  }, []);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (progressData) => {
      try {
        setProgress(prev => ({ ...prev, isLoading: true }));
        
        const response = await fetch('/api/progress/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            courseId,
            lectureId,
            ...progressData,
            localProgress: localProgress ? [localProgress] : [],
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          setProgress(prev => ({
            ...prev,
            ...progressData,
            isLoading: false,
          }));
          
          // Update localStorage with merged data
          saveLocalProgress(progressData);
          
          lastSavedRef.current = Date.now();
        } else {
          console.error('Failed to save progress:', result.message);
          setProgress(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error saving progress:', error);
        setProgress(prev => ({ ...prev, isLoading: false }));
        // Still save to localStorage as fallback
        saveLocalProgress(progressData);
      }
    }, 3000), // 3 seconds debounce
    [courseId, lectureId, localProgress, saveLocalProgress]
  );

  // Update progress
  const updateProgress = useCallback((currentTime, forceSave = false) => {
    const duration = progress.duration || videoDuration;
    const progressPercent = calculateProgress(currentTime, duration);
    const completed = progressPercent >= 90;

    const progressData = {
      progressPercent,
      lastTimestamp: currentTime,
      duration,
      completed,
    };

    // Update local state immediately for responsive UI
    setProgress(prev => ({
      ...prev,
      ...progressData,
    }));

    // Save to localStorage immediately
    saveLocalProgress(progressData);

    // Determine if we should save to backend
    const shouldSave = forceSave || 
      progressPercent > (progress.progressPercent + 1) || // Progress increased by >1%
      completed !== progress.completed || // Completion status changed
      Date.now() - lastSavedRef.current > 30000; // 30 seconds have passed

    if (shouldSave) {
      debouncedSave(progressData);
    }
  }, [progress, videoDuration, calculateProgress, saveLocalProgress, debouncedSave]);

  // Mark as completed (manual completion)
  const markAsCompleted = useCallback(async () => {
    const progressData = {
      progressPercent: 100,
      lastTimestamp: progress.duration || videoDuration,
      duration: progress.duration || videoDuration,
      completed: true,
    };

    setProgress(prev => ({
      ...prev,
      ...progressData,
    }));

    saveLocalProgress(progressData);
    
    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          courseId,
          lectureId,
          ...progressData,
          localProgress: localProgress ? [localProgress] : [],
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Lecture Completed! 🎉",
          description: "Great job! Your progress has been saved.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
      // Still show success since it's saved locally
      toast({
        title: "Lecture Completed! 🎉",
        description: "Progress saved locally. Will sync when connection is restored.",
        variant: "default",
      });
    }
  }, [courseId, lectureId, progress, videoDuration, localProgress, saveLocalProgress, toast]);

  // Reset progress
  const resetProgress = useCallback(() => {
    const progressData = {
      progressPercent: 0,
      lastTimestamp: 0,
      duration: videoDuration,
      completed: false,
    };

    setProgress(prev => ({
      ...prev,
      ...progressData,
    }));

    saveLocalProgress(progressData);
    localStorage.removeItem(getStorageKey());
    
    toast({
      title: "Progress Reset",
      description: "Lecture progress has been reset.",
      variant: "default",
    });
  }, [videoDuration, saveLocalProgress, getStorageKey, toast]);

  // Merge with backend progress
  const mergeWithBackend = useCallback(async () => {
    try {
      const response = await fetch(`/api/progress/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();
      
      if (result.success && result.data?.detailedProgress?.lectures) {
        const backendLecture = result.data.detailedProgress.lectures.find(
          l => l.lectureId === lectureId
        );

        if (backendLecture) {
          const localData = loadLocalProgress();
          
          // Use the higher progress between local and backend
          const mergedProgress = {
            progressPercent: Math.max(
              backendLecture.progressPercent,
              localData?.progressPercent || 0
            ),
            lastTimestamp: Math.max(
              backendLecture.lastTimestamp,
              localData?.lastTimestamp || 0
            ),
            duration: Math.max(
              backendLecture.duration,
              localData?.duration || videoDuration
            ),
            completed: backendLecture.completed || (localData?.completed || false),
          };

          setProgress(prev => ({
            ...prev,
            ...mergedProgress,
          }));

          saveLocalProgress(mergedProgress);
        }
      }
    } catch (error) {
      console.error('Error merging with backend:', error);
    }
  }, [courseId, lectureId, videoDuration, loadLocalProgress, saveLocalProgress]);

  // Initialize on mount
  useEffect(() => {
    loadLocalProgress();
    mergeWithBackend();
  }, [loadLocalProgress, mergeWithBackend]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Auto-save on unmount
  useEffect(() => {
    return () => {
      if (progress.progressPercent > 0) {
        // Save immediately on unmount
        const progressData = {
          progressPercent: progress.progressPercent,
          lastTimestamp: progress.lastTimestamp,
          duration: progress.duration,
          completed: progress.completed,
        };
        
        navigator.sendBeacon(
          '/api/progress/update',
          JSON.stringify({
            courseId,
            lectureId,
            ...progressData,
            localProgress: localProgress ? [localProgress] : [],
          })
        );
      }
    };
  }, [courseId, lectureId, progress, localProgress]);

  return {
    // State
    progress,
    localProgress,
    
    // Actions
    updateProgress,
    markAsCompleted,
    resetProgress,
    mergeWithBackend,
    
    // Computed
    isCompleted: progress.completed,
    progressPercent: progress.progressPercent,
    lastTimestamp: progress.lastTimestamp,
    duration: progress.duration,
    canResume: progress.lastTimestamp > 0 && !progress.completed,
    isLoading: progress.isLoading,
  };
}