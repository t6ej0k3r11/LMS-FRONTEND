import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { ProgressCalculator } from "@/features/student/utils/progressCalculator";
import PropTypes from 'prop-types';

function ProgressTracker({
  courseDetails,
  progress,
  userProgress,
  currentLecture,
  realTimeProgress
}) {
  const overallProgress = ProgressCalculator.calculateCourseProgress(
    progress,
    courseDetails?.curriculum,
    currentLecture,
    realTimeProgress
  );

  const videoProgress = ProgressCalculator.calculateWeightedVideoProgress(
    progress,
    courseDetails?.curriculum,
    currentLecture,
    realTimeProgress
  );

  const completedLectures = ProgressCalculator.getCompletedLectures(
    progress,
    currentLecture,
    realTimeProgress
  );

  const totalLectures = courseDetails?.curriculum?.length || 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 mb-4">
      <Card className="rounded-2xl border border-white/60 bg-white/85 p-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-foreground">
              {completedLectures}
              <span className="text-lg text-muted-foreground">/{totalLectures}</span>
            </p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[hsla(var(--brand-green)/0.15)]">
            <div
              className="h-full rounded-full bg-[hsl(var(--brand-green))] transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {overallProgress}% Complete
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-white/60 bg-white/85 p-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Video Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-foreground">
              {videoProgress}<span className="text-lg text-muted-foreground">%</span>
            </p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[hsla(var(--brand-green)/0.15)]">
            <div
              className="h-full rounded-full bg-[hsl(var(--brand-green))] transition-all duration-500"
              style={{ width: `${videoProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Video Watching Progress
          </p>
        </CardContent>
      </Card>

      {/* Course Completion Status */}
      {userProgress?.isCompleted && (
        <Card className="col-span-full rounded-2xl border border-green-200 bg-green-50/80 p-4">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Course Completed! 🎉</h3>
                <p className="text-sm text-green-600">
                  Completed on {userProgress?.completionDate ?
                    new Date(userProgress.completionDate).toLocaleDateString() :
                    'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {userProgress?.lastUpdated && (
        <Card className="col-span-full rounded-2xl border border-white/60 bg-white/85 p-3">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(userProgress.lastUpdated).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

ProgressTracker.propTypes = {
  courseDetails: PropTypes.object,
  progress: PropTypes.array,
  userProgress: PropTypes.object,
  currentLecture: PropTypes.object,
  realTimeProgress: PropTypes.object,
};

export default ProgressTracker;