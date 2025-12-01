import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Pause, Play, Clock, AlertTriangle } from 'lucide-react';
import PropTypes from 'prop-types';

export const Timer = ({
  duration,
  timeLeft,
  isRunning,
  isPaused,
  onPause,
  onResume,
  onTimeUp,
  showControls = true,
  className = ''
}) => {
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!duration) return 0;
    return Math.max(0, Math.min(100, ((duration - timeLeft) / duration) * 100));
  };

  const getTimeColor = () => {
    if (!timeLeft) return 'text-gray-600';
    const percentage = (timeLeft / duration) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = () => {
    if (!timeLeft) return 'bg-gray-500';
    const percentage = (timeLeft / duration) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
            <div className={`flex items-center space-x-2 text-sm font-medium px-2 py-1 rounded ${
              isCriticalTime
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <span>{isCriticalTime ? 'Time Critical!' : 'Running Low'}</span>
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
              onClick={isPaused ? onResume : onPause}
              className="flex items-center space-x-1"
              disabled={!isRunning && !isPaused}
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
      {isCriticalTime && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          <strong>Warning:</strong> Quiz will auto-submit when time expires
        </div>
      )}
    </Card>
  );
};

Timer.propTypes = {
  duration: PropTypes.number,
  timeLeft: PropTypes.number,
  isRunning: PropTypes.bool,
  isPaused: PropTypes.bool,
  onPause: PropTypes.func,
  onResume: PropTypes.func,
  onTimeUp: PropTypes.func,
  showControls: PropTypes.bool,
  className: PropTypes.string,
};