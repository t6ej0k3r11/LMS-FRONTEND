import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Trophy,
  Play,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';
import { formatProgressPercent, getProgressColor } from '@/utils/progressCalculations';

/**
 * OverviewProgressCard Component
 * 
 * Displays comprehensive course progress for the overview tab
 * Shows overall progress, completed lectures, and progress bars
 */
const OverviewProgressCard = ({ 
  courseId,
  courseProgress,
  detailedProgress,
  courseDetails,
  onContinueLearning,
  onResetProgress,
  className = "",
  showActions = true 
}) => {
  const {
    overallProgressPercent = 0,
    videoProgressPercent = 0,
    quizProgressPercent = 0,
    completedLecturesCount = 0,
    totalLecturesCount = 0,
    completedQuizzesCount = 0,
    totalQuizzesCount = 0,
    isCompleted = false,
    certificateEligible = false,
    certificateProgressPercent = 0,
    lastAccessedAt = null,
  } = courseProgress || {};

  const { lectures = [], quizzes = [] } = detailedProgress || {};

  // Don't render if no course data
  if (!courseId || !courseProgress) {
    return null;
  }

  const progressColor = getProgressColor(overallProgressPercent);
  const completionRatio = `${completedLecturesCount}/${totalLecturesCount}`;
  const quizCompletionRatio = `${completedQuizzesCount}/${totalQuizzesCount}`;
  const remainingLectures = Math.max(0, totalLecturesCount - completedLecturesCount);
  const remainingQuizzes = Math.max(0, totalQuizzesCount - completedQuizzesCount);

  const formatLastAccessed = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getNextLecture = () => {
    return lectures.find(lecture => !lecture.completed);
  };

  const nextLecture = getNextLecture();

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Course Progress
          </CardTitle>
          <div className="flex items-center gap-2">
            {certificateEligible && (
              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                <Award className="w-3 h-3 mr-1" />
                Certificate Ready
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="outline" className="text-green-700 border-green-300">
                <Trophy className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatProgressPercent(overallProgressPercent)}
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          
          <Progress 
            value={overallProgressPercent} 
            className="h-3"
          />
          
          <div className="text-center text-sm text-gray-600">
            {isCompleted ? 
              "🎉 Congratulations! You've completed this course!" : 
              `${remainingLectures + remainingQuizzes} items remaining`
            }
          </div>
        </div>

        {/* Detailed Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Video Progress */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Video Lectures</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">{completionRatio}</span>
                <span className="text-sm font-semibold text-blue-900">
                  {formatProgressPercent(videoProgressPercent)}
                </span>
              </div>
              <Progress value={videoProgressPercent} className="h-2" />
            </div>
          </div>

          {/* Quiz Progress */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">Quizzes</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">{quizCompletionRatio}</span>
                <span className="text-sm font-semibold text-green-900">
                  {formatProgressPercent(quizProgressPercent)}
                </span>
              </div>
              <Progress value={quizProgressPercent} className="h-2" />
            </div>
          </div>

          {/* Certificate Progress */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">Certificate</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700">
                  {certificateEligible ? "Eligible" : "Not Ready"}
                </span>
                <span className="text-sm font-semibold text-yellow-900">
                  {formatProgressPercent(certificateProgressPercent)}
                </span>
              </div>
              <Progress value={certificateProgressPercent} className="h-2" />
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Progress Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">{completedLecturesCount}</span>
              </div>
              <div className="text-xs text-gray-600">Lectures Completed</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{remainingLectures}</span>
              </div>
              <div className="text-xs text-gray-600">Lectures Remaining</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="font-semibold">{totalLecturesCount}</span>
              </div>
              <div className="text-xs text-gray-600">Total Lectures</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="font-semibold">
                  {formatProgressPercent(certificateProgressPercent, false)}%
                </span>
              </div>
              <div className="text-xs text-gray-600">Certificate Progress</div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {!isCompleted && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">What's Next?</h4>
            <div className="space-y-3">
              {nextLecture ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">Continue Learning</div>
                    <div className="text-sm text-blue-700">
                      Next: Lecture {nextLecture.lectureId?.slice(-6) || 'Next Lecture'}
                    </div>
                  </div>
                  <Button 
                    onClick={() => onContinueLearning?.(nextLecture.lectureId)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </div>
              ) : (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="font-medium text-green-900">All Lectures Completed!</div>
                  <div className="text-sm text-green-700">You're almost done with this course.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Accessed */}
        {lastAccessedAt && (
          <div className="text-center text-sm text-gray-500 pt-2 border-t">
            Last accessed: {formatLastAccessed(lastAccessedAt)}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            {onResetProgress && (
              <Button 
                variant="outline" 
                onClick={onResetProgress}
                className="flex-1"
              >
                Reset Progress
              </Button>
            )}
            {certificateEligible && !isCompleted && (
              <Button 
                variant="outline" 
                className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                <Award className="w-4 h-4 mr-2" />
                Get Certificate
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverviewProgressCard;