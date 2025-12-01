import { Card } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import PropTypes from 'prop-types';

export const ProgressTracker = ({
  courseDetails,
  userProgress,
  completedLessons = [],
  totalLectures = 0,
  className = ''
}) => {
  // Calculate progress metrics using the unified calculator
  const overallProgress = userProgress?.overallProgressPercentage || 0;
  const videoProgress = userProgress?.videoProgressPercentage || 0;
  const completedCount = completedLessons.length;

  // Calculate time-based metrics
  const totalTimeSpent = completedLessons.reduce((acc, lesson) => {
    // Assuming each lesson has an estimated duration
    const lessonDetail = courseDetails?.curriculum?.find(l => l._id === lesson);
    return acc + (lessonDetail?.duration || 0);
  }, 0);

  const averageProgress = courseDetails?.curriculum?.length > 0
    ? (completedCount / courseDetails.curriculum.length) * 100
    : 0;

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressStatus = (progress) => {
    if (progress >= 100) return { label: 'Completed', variant: 'default' };
    if (progress >= 75) return { label: 'Almost Done', variant: 'secondary' };
    if (progress >= 50) return { label: 'Halfway There', variant: 'secondary' };
    if (progress >= 25) return { label: 'Getting Started', variant: 'outline' };
    return { label: 'Just Started', variant: 'outline' };
  };

  const status = getProgressStatus(overallProgress);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
          <p className="text-sm text-gray-600">Track your learning journey</p>
        </div>
        <Badge variant={status.variant} className="flex items-center gap-1">
          <Target className="h-3 w-3" />
          {status.label}
        </Badge>
      </div>

      {/* Overall Progress */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-semibold text-gray-900">{Math.round(overallProgress)}%</span>
          </div>
          <div className="relative">
            <Progress value={overallProgress} className="h-3" />
            <div
              className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor(overallProgress)}`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{completedCount}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalLectures}</div>
            <div className="text-xs text-gray-600">Total Lectures</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(totalTimeSpent)}</div>
            <div className="text-xs text-gray-600">Time Spent</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(averageProgress)}%</div>
            <div className="text-xs text-gray-600">Average</div>
          </div>
        </div>

        {/* Video Progress (if different from overall) */}
        {videoProgress !== overallProgress && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Video Progress</span>
              <span className="text-sm font-semibold text-gray-900">{Math.round(videoProgress)}%</span>
            </div>
            <Progress value={videoProgress} className="h-2" />
          </div>
        )}

        {/* Completion Status */}
        {userProgress?.isCompleted && userProgress?.completionDate && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">Course Completed!</p>
                <p className="text-xs text-green-600">
                  Completed on {new Date(userProgress.completionDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {userProgress?.lastUpdated && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Last updated: {new Date(userProgress.lastUpdated).toLocaleString()}
          </p>
        )}
      </div>
    </Card>
  );
};

ProgressTracker.propTypes = {
  courseDetails: PropTypes.shape({
    curriculum: PropTypes.array,
  }),
  userProgress: PropTypes.shape({
    overallProgressPercentage: PropTypes.number,
    videoProgressPercentage: PropTypes.number,
    isCompleted: PropTypes.bool,
    completionDate: PropTypes.string,
    lastUpdated: PropTypes.string,
  }),
  completedLessons: PropTypes.arrayOf(PropTypes.string),
  totalLectures: PropTypes.number,
  className: PropTypes.string,
};