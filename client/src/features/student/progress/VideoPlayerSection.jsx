import { useState, useEffect, useCallback } from 'react';
import VideoPlayer from '../../../components/video-player';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Play, RotateCcw, Clock } from 'lucide-react';
import { useContinueWatching } from '../hooks/useContinueWatching';
import { progressCalculator } from '../utils/progressCalculator';
import PropTypes from 'prop-types';

export const VideoPlayerSection = ({
  lecture,
  courseId,
  onProgressUpdate,
  progressData,
  isCompleted,
  onMarkAsViewed,
}) => {
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeFrom, setResumeFrom] = useState(0);
  const { updateProgress } = useContinueWatching();

  // Check for saved progress on lecture change
  useEffect(() => {
    if (lecture?._id) {
      const localStorageKey = `course-${courseId}-lecture-${lecture._id}-progress`;
      const savedProgress = JSON.parse(localStorage.getItem(localStorageKey) || '{}');

      if (savedProgress.watchedTime && savedProgress.watchedTime > 30) { // More than 30 seconds
        setResumeFrom(savedProgress.watchedTime);
        setShowResumeDialog(true);
      } else {
        setShowResumeDialog(false);
        setResumeFrom(0);
      }
    }
  }, [lecture?._id, courseId]);

  const handleProgressUpdate = useCallback((progressData) => {
    // Debounce progress updates to prevent excessive API calls
    const timeoutId = setTimeout(() => {
      onProgressUpdate(progressData);

      // Update localStorage for continue watching
      if (lecture?._id && courseId) {
        updateProgress(courseId, lecture._id, progressData.progressValue, progressData.watchedTime || 0);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [onProgressUpdate, lecture?._id, courseId, updateProgress]);

  const handleResumeFromBeginning = () => {
    setShowResumeDialog(false);
    setResumeFrom(0);
  };

  const handleResumeFromTimestamp = () => {
    setShowResumeDialog(false);
    // Resume will happen automatically with resumeFrom state
  };

  if (!lecture) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <Play className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No Lecture Selected</h3>
            <p className="text-gray-600">Please select a lecture from the sidebar to start watching.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Resume Dialog */}
      {showResumeDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Resume Watching</h3>
            <p className="text-gray-600 mb-6">
              You were watching <strong>{lecture.title}</strong> and stopped at{' '}
              {progressCalculator.formatTimeRemaining(resumeFrom)}.
              Would you like to resume from where you left off?
            </p>
            <div className="flex space-x-3">
              <Button onClick={handleResumeFromBeginning} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
              <Button onClick={handleResumeFromTimestamp} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Video Player */}
      <div className="relative">
        {lecture.videoUrl ? (
          <VideoPlayer
            width="100%"
            height="500px"
            url={lecture.videoUrl}
            onProgressUpdate={handleProgressUpdate}
            progressData={progressData}
            lectureId={lecture._id}
            startTime={resumeFrom}
          />
        ) : (
          <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
              <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                <Play className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Not Available</h3>
              <p className="text-gray-600">The video for this lecture is currently being processed.</p>
            </div>
          </div>
        )}

        {/* Progress indicator overlay */}
        {progressData?.progressValue > 0 && progressData.progressValue < 1 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black bg-opacity-75 rounded-lg p-3">
              <div className="flex items-center justify-between text-white text-sm">
                <span>Progress: {Math.round(progressData.progressValue * 100)}%</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {progressCalculator.formatTimeRemaining(
                      lecture.duration || 0,
                      (progressData.watchedTime || 0)
                    )} remaining
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                <div
                  className="bg-white h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progressData.progressValue * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lecture Info Bar */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{lecture.title}</h3>
            <p className="text-sm text-gray-600">
              Duration: {progressCalculator.formatTimeRemaining(lecture.duration || 0)}
            </p>
          </div>

          {!isCompleted && progressData?.progressValue >= 0.9 && (
            <Button onClick={onMarkAsViewed} size="sm">
              Mark as Complete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

VideoPlayerSection.propTypes = {
  lecture: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    videoUrl: PropTypes.string,
    duration: PropTypes.number,
  }),
  courseId: PropTypes.string.isRequired,
  onProgressUpdate: PropTypes.func.isRequired,
  progressData: PropTypes.object,
  isCompleted: PropTypes.bool,
  onMarkAsViewed: PropTypes.func.isRequired,
};