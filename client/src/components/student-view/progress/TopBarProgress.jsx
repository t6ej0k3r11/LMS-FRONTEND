import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  CheckCircle, 
  Trophy, 
  Clock,
  Target 
} from 'lucide-react';
import { formatProgressPercent, getProgressColor } from '@/utils/progressCalculations';

/**
 * TopBarProgress Component
 * 
 * Displays comprehensive course progress in the top navigation bar
 * Shows overall progress, completed lectures count, and per-lecture indicators
 */
const TopBarProgress = ({ 
  courseId,
  courseProgress,
  detailedProgress,
  className = "",
  compact = false,
  showLecturesList = false 
}) => {
  const {
    overallProgressPercent = 0,
    videoProgressPercent = 0,
    completedLecturesCount = 0,
    totalLecturesCount = 0,
    certificateEligible = false,
    certificateProgressPercent = 0,
  } = courseProgress || {};

  const { lectures = [] } = detailedProgress || {};

  // Don't render if no course data
  if (!courseId || !courseProgress) {
    return null;
  }

  const progressColor = getProgressColor(overallProgressPercent);
  const isCompleted = overallProgressPercent >= 100;
  const completionRatio = `${completedLecturesCount}/${totalLecturesCount}`;

  if (compact) {
    // Compact version for tight spaces
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Overall Progress Circle */}
        <div className="relative">
          <div className={`w-8 h-8 rounded-full ${progressColor} flex items-center justify-center text-white text-xs font-bold`}>
            {formatProgressPercent(overallProgressPercent, false)}
          </div>
          {certificateEligible && (
            <Trophy className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen className="w-4 h-4" />
          <span>{completionRatio}</span>
          {certificateEligible && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              Certified
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-0 shadow-none bg-transparent ${className}`}>
      <CardContent className="p-0">
        <div className="space-y-3">
          {/* Main Progress Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Course Progress</h3>
              {certificateEligible && (
                <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                  <Trophy className="w-3 h-3 mr-1" />
                  Certificate Eligible
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatProgressPercent(overallProgressPercent)}
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={overallProgressPercent} 
              className="h-2"
              style={{
                '--progress-background': progressColor.replace('bg-', '').replace('-500', ''),
              }}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Video Progress: {formatProgressPercent(videoProgressPercent)}</span>
              <span>
                <CheckCircle className="w-4 h-4 inline mr-1" />
                {completionRatio} Lectures
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {/* Completed Lectures */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">{completedLecturesCount}</span>
              </div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>

            {/* Remaining Lectures */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-600">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">
                  {Math.max(0, totalLecturesCount - completedLecturesCount)}
                </span>
              </div>
              <div className="text-xs text-gray-500">Remaining</div>
            </div>

            {/* Certificate Progress */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-600">
                <Trophy className="w-4 h-4" />
                <span className="font-semibold">
                  {formatProgressPercent(certificateProgressPercent, false)}%
                </span>
              </div>
              <div className="text-xs text-gray-500">Certificate</div>
            </div>
          </div>

          {/* Per-Lecture Progress List */}
          {showLecturesList && lectures.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Lecture Progress</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {lectures.map((lecture, index) => (
                  <div 
                    key={lecture.lectureId} 
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-gray-500 w-6">
                        {index + 1}.
                      </span>
                      <span className="truncate">
                        Lecture {lecture.lectureId?.slice(-6) || `Lecture ${index + 1}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {lecture.completed ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-200" />
                      )}
                      <span className="text-gray-500 w-10 text-right">
                        {formatProgressPercent(lecture.progressPercent, false)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Status */}
          {isCompleted && (
            <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Course Completed!</span>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopBarProgress;