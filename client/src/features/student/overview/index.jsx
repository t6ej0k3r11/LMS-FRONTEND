import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Clock,
  TrendingUp,
  PlayCircle,
  Calendar,
  Award,
  Users,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useStudentContext } from '../hooks/useStudentContext';
import { useContinueWatching } from '../hooks/useContinueWatching';
import { useApi } from '../hooks/useApi';
import { ProgressCalculator } from '../utils/progressCalculator';
import { ContinueWatching } from '../components/ContinueWatching';
import { DashboardSkeleton } from '../components/Skeleton/DashboardSkeleton';
import StudentErrorBoundary from '../components/ErrorBoundary';
import { RefreshCw } from 'lucide-react';

function StudentDashboardOverview() {
  const navigate = useNavigate();
  const { user, courses, courseProgress, loading, refetchEnrolledData } = useStudentContext();
  const { continueWatching, isLoading: continueWatchingLoading } = useContinueWatching();
  const { get } = useApi();

  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    if (!courses?.length) {
      return {
        totalCourses: 0,
        completedCourses: 0,
        totalProgress: 0,
        timeSpent: 0,
        xpEarned: 0,
      };
    }

    const totalCourses = courses.length;
    let completedCourses = 0;
    let totalProgress = 0;
    let timeSpent = 0;
    let xpEarned = 0;

    courses.forEach(course => {
      const progress = courseProgress?.[course.courseId];
      if (progress) {
        const courseProgressPercent = ProgressCalculator.calculateCourseProgress(
          progress.progress,
          course.curriculum,
          null,
          {}
        );

        totalProgress += courseProgressPercent;

        if (ProgressCalculator.isCompleted(progress.progress, course.curriculum, null, {})) {
          completedCourses += 1;
        }

        xpEarned += ProgressCalculator.calculateXP(progress.progress, course.curriculum);

        // Calculate time spent from progress data
        if (progress.progress && Array.isArray(progress.progress)) {
          progress.progress.forEach(lecture => {
            if (lecture.viewed && lecture.timeSpent) {
              timeSpent += lecture.timeSpent;
            }
          });
        }
      }
    });

    const averageProgress = totalCourses > 0 ? totalProgress / totalCourses : 0;

    return {
      totalCourses,
      completedCourses,
      totalProgress: Math.round(averageProgress),
      timeSpent,
      xpEarned,
    };
  }, [courses, courseProgress]);

  // Fetch recommended courses
  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      if (!courses?.length) return;

      try {
        // Get all available courses
        const response = await get('/student/course/get');
        if (response?.success && response.data) {
          // Filter courses not enrolled and same category as enrolled courses
          const enrolledCourseIds = new Set(courses.map(c => c._id));
          const enrolledCategories = new Set(courses.map(c => c.category));

          const recommended = response.data
            .filter(course =>
              !enrolledCourseIds.has(course._id) &&
              enrolledCategories.has(course.category)
            )
            .slice(0, 4); // Limit to 4 recommendations

          setRecommendedCourses(recommended);
        }
      } catch (error) {
        console.error('Error fetching recommended courses:', error);
      }
    };

    fetchRecommendedCourses();
  }, [courses, get]);

  // Generate recent activity (placeholder - would come from backend)
  useEffect(() => {
    const generateRecentActivity = () => {
      const activities = [];

      courses?.forEach(course => {
        const progress = courseProgress?.[course.courseId];
        if (progress?.progress?.length > 0) {
          // Get last viewed lecture
          const lastViewed = progress.progress
            .filter(p => p.viewed)
            .sort((a, b) => new Date(b.viewedAt || 0) - new Date(a.viewedAt || 0))[0];

          if (lastViewed) {
            activities.push({
              id: `${course.courseId}-${lastViewed.lectureId}`,
              type: 'lecture_completed',
              courseTitle: course.title,
              lectureTitle: lastViewed.lectureTitle || 'Lecture',
              timestamp: lastViewed.viewedAt || Date.now(),
            });
          }
        }
      });

      // Sort by timestamp and take latest 5
      activities.sort((a, b) => b.timestamp - a.timestamp);
      setRecentActivity(activities.slice(0, 5));
      setStatsLoading(false);
    };

    if (!loading) {
      generateRecentActivity();
    }
  }, [courses, courseProgress, loading]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatActivityTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Recently';
  };

  if (loading || statsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <StudentErrorBoundary>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.userName || 'Student'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Continue your learning journey and track your progress.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetchEnrolledData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.completedCourses} completed
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalProgress}%</div>
                <p className="text-xs text-muted-foreground">
                  Average completion
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(dashboardStats.timeSpent)}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">XP Earned</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.xpEarned}</div>
                <p className="text-xs text-muted-foreground">
                  Keep learning!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Continue Watching */}
        {continueWatching && !continueWatchingLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Continue Watching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContinueWatching {...continueWatching} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Target className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            Completed {activity.lectureTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            in {activity.courseTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatActivityTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                    <p className="text-sm text-muted-foreground">Start learning to see your progress here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommended Courses */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recommendedCourses.length > 0 ? (
                  <div className="space-y-3">
                    {recommendedCourses.map((course) => (
                      <div
                        key={course._id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/course/details/${course._id}`)}
                      >
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.target.src = '/banner-img.png';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {course.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {course.instructorName}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {course.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/courses')}
                    >
                      View All Courses
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recommendations yet</p>
                    <p className="text-sm text-muted-foreground">Complete more courses to get personalized recommendations!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </StudentErrorBoundary>
  );
}

export default StudentDashboardOverview;