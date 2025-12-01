import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Play, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { progressCalculator } from '../utils/progressCalculator';
import PropTypes from 'prop-types';

export const ContinueWatching = ({ continueWatchingData, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!continueWatchingData) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-gray-100 rounded-full">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ready to start learning?</h3>
            <p className="text-gray-600 mt-1">Enroll in a course to begin your learning journey</p>
          </div>
          <Button onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </div>
      </Card>
    );
  }

  const { courseTitle, lectureTitle, progress, timeRemaining } = continueWatchingData;
  const timeRemainingFormatted = progressCalculator.formatTimeRemaining(timeRemaining);

  const handleContinue = () => {
    navigate(`/course-progress/${continueWatchingData.courseId}?lecture=${continueWatchingData.lectureId}`);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
            <Play className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            Continue from {lectureTitle}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {courseTitle}
          </p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center mt-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            {timeRemainingFormatted} left
          </div>
        </div>

        <div className="flex-shrink-0">
          <Button onClick={handleContinue} size="lg">
            <Play className="h-4 w-4 mr-2" />
            Continue
          </Button>
        </div>
      </div>
    </Card>
  );
};

ContinueWatching.propTypes = {
  continueWatchingData: PropTypes.shape({
    courseId: PropTypes.string.isRequired,
    courseTitle: PropTypes.string.isRequired,
    lectureId: PropTypes.string.isRequired,
    lectureTitle: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired,
    timeRemaining: PropTypes.number.isRequired,
  }),
  loading: PropTypes.bool.isRequired,
};