import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { Clock, List, Home } from 'lucide-react';
import PropTypes from 'prop-types';

export const NavigationBar = ({
  quiz,
  currentQuestionIndex,
  totalQuestions,
  progress,
  timer,
  onToggleSidebar,
  onExit,
  className = ''
}) => {
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!timer?.timeLeft) return 'text-gray-600';
    if (timer.isCriticalTime) return 'text-red-600';
    if (timer.isLowTime) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-3 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left side - Quiz info */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Exit Quiz</span>
          </Button>

          <div className="h-6 w-px bg-gray-300" />

          <div>
            <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs">
              {quiz?.title || 'Quiz'}
            </h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
          </div>
        </div>

        {/* Center - Progress bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Progress
            </span>
            <div className="flex-1">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Right side - Timer and controls */}
        <div className="flex items-center space-x-4">
          {/* Timer */}
          {timer && quiz?.timeLimit && (
            <div className="flex items-center space-x-2">
              <Clock className={`h-4 w-4 ${getTimerColor()}`} />
              <span className={`text-sm font-mono font-medium ${getTimerColor()}`}>
                {formatTime(timer.timeLeft)}
              </span>
              {timer.isPaused && (
                <span className="text-xs text-blue-600 font-medium">PAUSED</span>
              )}
            </div>
          )}

          {/* Sidebar toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSidebar}
            className="flex items-center space-x-2"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Questions</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

NavigationBar.propTypes = {
  quiz: PropTypes.object,
  currentQuestionIndex: PropTypes.number,
  totalQuestions: PropTypes.number,
  progress: PropTypes.number,
  timer: PropTypes.shape({
    timeLeft: PropTypes.number,
    isRunning: PropTypes.bool,
    isPaused: PropTypes.bool,
    isLowTime: PropTypes.bool,
    isCriticalTime: PropTypes.bool,
  }),
  onToggleSidebar: PropTypes.func,
  onExit: PropTypes.func,
  className: PropTypes.string,
};