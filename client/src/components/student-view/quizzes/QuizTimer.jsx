import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Pause, Play, AlertTriangle } from "lucide-react";
import PropTypes from "prop-types";

function QuizTimer({ timeLimit, onTimeUp, isActive = true, onPause, onResume }) {
  QuizTimer.propTypes = {
    timeLimit: PropTypes.number, // in minutes
    onTimeUp: PropTypes.func.isRequired,
    isActive: PropTypes.bool,
    onPause: PropTypes.func,
    onResume: PropTypes.func,
  };

  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // convert to seconds
  const [isPaused, setIsPaused] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isActive || !timeLimit || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, onTimeUp, isActive, isPaused]);

  // Warning effect when time is running low
  useEffect(() => {
    if (!timeLimit) return;

    const totalTime = timeLimit * 60;
    const warningThreshold = Math.min(300, totalTime * 0.1); // 5 minutes or 10% of time, whichever is smaller

    if (timeLeft <= warningThreshold && timeLeft > 0 && !showWarning) {
      setShowWarning(true);
    } else if (timeLeft > warningThreshold && showWarning) {
      setShowWarning(false);
    }
  }, [timeLeft, timeLimit, showWarning]);

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      if (onResume) onResume();
    } else {
      setIsPaused(true);
      if (onPause) onPause();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!timeLimit) return "text-gray-600";
    const percentage = (timeLeft / (timeLimit * 60)) * 100;
    if (percentage <= 10) return "text-red-600 animate-pulse";
    if (percentage <= 25) return "text-yellow-600";
    return "text-green-600";
  };

  const getCardClassName = () => {
    if (showWarning) {
      return "border-red-300 bg-red-50 animate-pulse";
    }
    return "";
  };

  if (!timeLimit) {
    return null;
  }

  return (
    <Card className={`w-fit ${getCardClassName()}`}>
      <CardContent className="flex items-center p-4 space-x-3">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          <span className={`text-lg font-mono font-bold ${getTimeColor()}`}>
            {formatTime(timeLeft)}
          </span>
          <span className="ml-2 text-sm text-gray-600">
            / {timeLimit}:00
          </span>
        </div>

        {showWarning && (
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Time running out!</span>
          </div>
        )}

        {onPause && onResume && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePauseResume}
            className="ml-2"
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default QuizTimer;