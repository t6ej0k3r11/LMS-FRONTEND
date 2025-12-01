// useTimer.js - Timer hook with pause/resume functionality
import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = ({
  duration, // in seconds, null for untimed
  onTimeUp,
  onTick,
  autoStart = true,
  tickInterval = 1000,
} = {}) => {
  const [timeLeft, setTimeLeft] = useState(duration || 0);
  const [isRunning, setIsRunning] = useState(autoStart && duration > 0);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);

  // Format time as MM:SS
  const formatTime = useCallback((seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get progress percentage
  const getProgress = useCallback(() => {
    if (!duration) return 0;
    return Math.max(0, Math.min(100, ((duration - timeLeft) / duration) * 100));
  }, [duration, timeLeft]);

  // Start the timer
  const start = useCallback(() => {
    if (!duration || duration <= 0) return;

    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);
  }, [duration]);

  // Pause the timer
  const pause = useCallback(() => {
    if (!isRunning) return;

    setIsRunning(false);
    setIsPaused(true);
    pausedTimeRef.current = elapsed;
  }, [isRunning, elapsed]);

  // Resume the timer
  const resume = useCallback(() => {
    if (!isPaused) return;

    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now() - (pausedTimeRef.current * 1000);
  }, [isPaused]);

  // Reset the timer
  const reset = useCallback(() => {
    setTimeLeft(duration || 0);
    setElapsed(0);
    setIsRunning(false);
    setIsPaused(false);
    pausedTimeRef.current = 0;
    startTimeRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [duration]);

  // Set new duration
  const setDuration = useCallback((newDuration) => {
    setTimeLeft(newDuration);
    reset();
  }, [reset]);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused && duration > 0) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000);
        const remaining = Math.max(0, duration - elapsedSeconds);

        setElapsed(elapsedSeconds);
        setTimeLeft(remaining);

        // Call tick callback
        onTick?.({
          timeLeft: remaining,
          elapsed: elapsedSeconds,
          progress: ((duration - remaining) / duration) * 100,
        });

        // Check if time is up
        if (remaining <= 0) {
          setIsRunning(false);
          setIsPaused(false);
          onTimeUp?.();
        }
      }, tickInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, duration, onTimeUp, onTick, tickInterval]);

  // Initialize timer
  useEffect(() => {
    if (duration > 0 && autoStart) {
      startTimeRef.current = Date.now();
    }
  }, [duration, autoStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    elapsed,
    isRunning,
    isPaused,
    progress: getProgress(),
    formatTime,
    start,
    pause,
    resume,
    reset,
    setDuration,
    // Computed values
    isTimeUp: duration > 0 && timeLeft <= 0,
    isLowTime: duration > 0 && timeLeft <= 300, // 5 minutes
    isCriticalTime: duration > 0 && timeLeft <= 60, // 1 minute
  };
};