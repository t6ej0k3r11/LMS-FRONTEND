import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Pause, Play, RotateCcw, Clock } from 'lucide-react';
import PropTypes from 'prop-types';

export const QuizTimer = ({
  duration, // in minutes
  onTimeUp,
  onPause,
  onResume,
  autoSubmit = false,
  showControls = true,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Format time as MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const getProgressPercentage = useCallback(() => {
    const totalSeconds = duration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  }, [duration, timeLeft]);

  // Get color based on time remaining
  const getTimeColor = useCallback(() => {
    const percentage = (timeLeft / (duration * 60)) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  }, [timeLeft, duration]);

  // Get background color for progress bar
  const getProgressColor = useCallback(() => {
    const percentage = (timeLeft / (duration * 60)) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  }, [timeLeft, duration]);

  // Handle pause/resume
  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      setIsRunning(true);
      setIsPaused(false);
      onResume?.();
    } else {
      setIsRunning(false);
      setIsPaused(true);
      onPause?.();
    }
  }, [isPaused, onPause, onResume]);

  // Handle reset
  const handleReset = useCallback(() => {
    setTimeLeft(duration * 60);
    setIsRunning(true);
    setIsPaused(false);
  }, [duration]);

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, timeLeft, onTimeUp]);

  // Warning when time is low
  const isLowTime = timeLeft <= 300; // 5 minutes
  const isCriticalTime = timeLeft <= 60; // 1 minute

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Clock className={`h-5 w-5 ${getTimeColor()}`} />
            <span className={`text-xl font-mono font-bold ${getTimeColor()}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {isLowTime && (
            <div className={`text-sm font-medium px-2 py-1 rounded ${
              isCriticalTime
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isCriticalTime ? 'Time Critical!' : 'Running Low'}
            </div>
          )}

          {isPaused && (
            <div className="text-sm font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
              Paused
            </div>
          )}
        </div>

        {showControls && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseResume}
              className="flex items-center space-x-1"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center space-x-1"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Started</span>
          <span>{Math.round(getProgressPercentage())}% Complete</span>
          <span>Time Up</span>
        </div>
      </div>

      {/* Auto-submit warning */}
      {autoSubmit && timeLeft <= 60 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          <strong>Warning:</strong> Quiz will auto-submit in {formatTime(timeLeft)}
        </div>
      )}
    </Card>
  );
};

QuizTimer.propTypes = {
  duration: PropTypes.number.isRequired, // in minutes
  onTimeUp: PropTypes.func,
  onPause: PropTypes.func,
  onResume: PropTypes.func,
  autoSubmit: PropTypes.bool,
  showControls: PropTypes.bool,
  className: PropTypes.string,
};