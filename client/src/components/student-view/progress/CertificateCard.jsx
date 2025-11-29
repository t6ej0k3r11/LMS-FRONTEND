import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  Download, 
  CheckCircle, 
  Clock,
  Target,
  Trophy,
  Lock,
  Star,
  Medal
} from 'lucide-react';
import { formatProgressPercent, getProgressColor } from '@/utils/progressCalculations';

/**
 * CertificateCard Component
 * 
 * Displays certificate eligibility and progress
 * Shows certificate status, progress percentage, and download options
 */
const CertificateCard = ({ 
  courseId,
  courseProgress,
  courseDetails,
  onDownloadCertificate,
  onViewRequirements,
  className = "",
  showActions = true 
}) => {
  const {
    certificateEligible = false,
    certificateProgressPercent = 0,
    completedLecturesCount = 0,
    totalLecturesCount = 0,
    isCompleted = false,
    overallProgressPercent = 0,
  } = courseProgress || {};

  // Don't render if no course data
  if (!courseId || !courseProgress) {
    return null;
  }

  const progressColor = getProgressColor(certificateProgressPercent);
  const remainingLectures = Math.max(0, totalLecturesCount - completedLecturesCount);
  const progressToGoal = Math.max(0, 90 - certificateProgressPercent);
  const isGoalReached = certificateProgressPercent >= 90;
  const canDownload = certificateEligible && isCompleted;

  const getCertificateStatus = () => {
    if (canDownload) return 'ready';
    if (isGoalReached) return 'eligible';
    if (overallProgressPercent > 0) return 'in-progress';
    return 'not-started';
  };

  const getStatusConfig = () => {
    const status = getCertificateStatus();
    
    switch (status) {
      case 'ready':
        return {
          icon: Trophy,
          title: 'Certificate Ready!',
          description: 'Congratulations! Your certificate is ready for download.',
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeColor: 'bg-green-600',
          actionText: 'Download Certificate',
          actionIcon: Download,
        };
      case 'eligible':
        return {
          icon: Award,
          title: 'Certificate Eligible',
          description: 'You\'ve met the requirements! Complete the course to download.',
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeColor: 'bg-blue-600',
          actionText: 'Complete Course',
          actionIcon: Target,
        };
      case 'in-progress':
        return {
          icon: Clock,
          title: 'In Progress',
          description: `Keep going! ${progressToGoal}% more to reach certificate requirements.`,
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badgeColor: 'bg-yellow-600',
          actionText: 'Continue Learning',
          actionIcon: Target,
        };
      default:
        return {
          icon: Lock,
          title: 'Not Started',
          description: 'Start watching lectures to begin your certificate progress.',
          color: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeColor: 'bg-gray-600',
          actionText: 'Start Learning',
          actionIcon: Target,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const ActionIcon = statusConfig.actionIcon;

  const getRequirementsList = () => {
    const requirements = [
      {
        met: completedLecturesCount >= totalLecturesCount,
        text: `Complete all lectures (${completedLecturesCount}/${totalLecturesCount})`,
        progress: totalLecturesCount > 0 ? (completedLecturesCount / totalLecturesCount) * 100 : 0,
      },
      {
        met: isCompleted,
        text: 'Complete the entire course',
        progress: overallProgressPercent,
      },
    ];

    return requirements;
  };

  const requirements = getRequirementsList();
  const metRequirements = requirements.filter(req => req.met).length;
  const totalRequirements = requirements.length;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-yellow-600" />
            Certificate Progress
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`${statusConfig.borderColor} ${statusConfig.color} ${statusConfig.bgColor}`}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {getCertificateStatus().replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Certificate Status Section */}
        <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${statusConfig.badgeColor} text-white`}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${statusConfig.color}`}>
                {statusConfig.title}
              </h3>
              <p className={`text-sm ${statusConfig.color} opacity-80 mt-1`}>
                {statusConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Certificate Progress</h4>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {formatProgressPercent(certificateProgressPercent)}
              </div>
              <div className="text-sm text-gray-500">to 90% goal</div>
            </div>
          </div>
          
          <Progress 
            value={certificateProgressPercent} 
            className="h-3"
          />
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Current: {formatProgressPercent(certificateProgressPercent)}</span>
            <span>Goal: 90%</span>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Requirements</h4>
          <div className="space-y-2">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {requirement.met ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={`text-sm ${requirement.met ? 'text-green-700' : 'text-gray-600'}`}>
                    {requirement.text}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatProgressPercent(requirement.progress)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center text-sm text-gray-600 pt-2">
            {metRequirements}/{totalRequirements} requirements met
          </div>
        </div>

        {/* Next Steps Section */}
        {!canDownload && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
            <div className="space-y-2 text-sm text-blue-800">
              {remainingLectures > 0 && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>Watch {remainingLectures} more lecture{remainingLectures !== 1 ? 's' : ''}</span>
                </div>
              )}
              {!isCompleted && (
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>Complete the remaining course content</span>
                </div>
              )}
              {progressToGoal > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Reach {progressToGoal}% more to qualify</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completion Celebration */}
        {canDownload && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-semibold text-yellow-900 mb-1">
                Congratulations! 🎉
              </h4>
              <p className="text-sm text-yellow-800">
                You've successfully completed the course and earned your certificate!
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 pt-4 border-t">
            {canDownload && onDownloadCertificate && (
              <Button 
                onClick={() => onDownloadCertificate(courseId)}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            )}
            
            {!canDownload && (
              <Button 
                variant="outline"
                className="flex-1"
                onClick={onViewRequirements}
              >
                <Target className="w-4 h-4 mr-2" />
                View Requirements
              </Button>
            )}
            
            {statusConfig.actionText && !canDownload && (
              <Button 
                className="flex-1"
                onClick={() => {
                  // Navigate to course content or continue learning
                  if (onDownloadCertificate) {
                    onDownloadCertificate(null); // Use null to indicate continue learning
                  }
                }}
              >
                <ActionIcon className="w-4 h-4 mr-2" />
                {statusConfig.actionText}
              </Button>
            )}
          </div>
        )}

        {/* Certificate Info */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Certificates are generated automatically upon course completion. 
          Requirements must be met to be eligible for download.
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateCard;