import { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Calendar,
  Bell,
  PlayCircle,
  Award,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useStudentContext } from '../hooks/useStudentContext';
import { useContinueWatching } from '../hooks/useContinueWatching';
import { useApi } from '../hooks/useApi';
import { ContinueWatching } from '../components/ContinueWatching';
import { DashboardSkeleton } from '../components/Skeleton';
import StudentErrorBoundary from '../components/ErrorBoundary';
import { isFeatureEnabled } from '../../../config/featureFlags';

const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

const RecentActivityItem = ({ type, title, course, time, status }) => {
  const getIcon = () => {
    switch (type) {
      case 'lecture': return <PlayCircle className="h-4 w-4" />;
      case 'quiz': return <Target className="h-4 w-4" />;
      case 'certificate': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
      <div className="flex-shrink-0">
        <div className="p-2 bg-gray-100 rounded-full">
          {getIcon()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-600 truncate">{course}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className={`text-xs ${getStatusColor()}`}>
          {status}
        </Badge>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
    </div>
  );
};

const RecommendedCourseCard = ({ course, onEnroll }) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={onEnroll}>
      <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
        <BookOpen className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{course.title}</h3>
      <p className="text-xs text-gray-600 mb-2">{course.instructor}</p>
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">{course.category}</Badge>
        <Button size="sm" variant="outline">View</Button>
      </div>
    </Card>
  );
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { learningStats, enrolledCourses, profile } = useStudentContext();
  const { continueWatchingData, loading: continueWatchingLoading } = useContinueWatching();
  const { getNotifications, loading: apiLoading } = useApi();

  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Mock data for development - replace with real API calls
  useEffect(() => {
    // Recent activity
    setRecentActivity([
      {
        id: 1,
        type: 'lecture',
        title: 'Introduction to React Hooks',
        course: 'Advanced React Development',
        time: '2 hours ago',
        status: 'completed'
      },
      {
        id: 2,
        type: 'quiz',
        title: 'JavaScript Fundamentals Quiz',
        course: 'Web Development Basics',
        time: '1 day ago',
        status: 'completed'
      },
      {
        id: 3,
        type: 'lecture',
        title: 'CSS Grid Layout',
        course: 'Modern CSS Techniques',
        time: '2 days ago',
        status: 'in-progress'
      }
    ]);

    // Recommended courses
    setRecommendedCourses([
      {
        id: 1,
        title: 'Node.js Backend Development',
        instructor: 'John Doe',
        category: 'Backend'
      },
      {
        id: 2,
        title: 'UI/UX Design Principles',
        instructor: 'Jane Smith',
        category: 'Design'
      },
      {
        id: 3,
        title: 'Python Data Science',
        instructor: 'Bob Johnson',
        category: 'Data Science'
      }
    ]);

    // Notifications
    setNotifications([
      { id: 1, message: 'New assignment available', read: false },
      { id: 2, message: 'Course deadline approaching', read: false }
    ]);
  }, []);

  const handleEnrollCourse = (courseId) => {
    navigate(`/course/details/${courseId}`);
  };

  const formatTimeSpent = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (apiLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <StudentErrorBoundary>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.firstName || 'Student'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Continue your learning journey
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                {notifications.length} notifications
              </Button>
            )}
            <Button onClick={() => navigate('/courses')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          </div>
        </div>

        {/* Continue Watching */}
        {isFeatureEnabled('CONTINUE_WATCHING') && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Continue Watching</h2>
            <ContinueWatching
              continueWatchingData={continueWatchingData}
              loading={continueWatchingLoading}
            />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={BookOpen}
            title="Total Courses"
            value={learningStats.totalCourses}
            subtitle="Enrolled courses"
            color="blue"
          />
          <StatCard
            icon={Trophy}
            title="Completed"
            value={`${learningStats.averageProgress}%`}
            subtitle={`${learningStats.completedCourses} courses done`}
            color="green"
          />
          <StatCard
            icon={Clock}
            title="Time Spent"
            value={formatTimeSpent(learningStats.totalTimeSpent)}
            subtitle="This month"
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="Current Streak"
            value="7 days"
            subtitle="Keep it up!"
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-1">
                {recentActivity.map((activity) => (
                  <RecentActivityItem key={activity.id} {...activity} />
                ))}
              </div>
            </Card>
          </div>

          {/* Recommended Courses */}
          {isFeatureEnabled('RECOMMENDED_COURSES') && (
            <div>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recommended for You</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {recommendedCourses.slice(0, 3).map((course) => (
                    <RecommendedCourseCard
                      key={course.id}
                      course={course}
                      onEnroll={() => handleEnrollCourse(course.id)}
                    />
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate('/student-courses')}
            >
              <BookOpen className="h-6 w-6 mb-2" />
              My Courses
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate('/student/settings')}
            >
              <Trophy className="h-6 w-6 mb-2" />
              Achievements
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate('/student/settings')}
            >
              <Calendar className="h-6 w-6 mb-2" />
              Schedule
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate('/student/settings')}
            >
              <Bell className="h-6 w-6 mb-2" />
              Notifications
            </Button>
          </div>
        </Card>
      </div>
    </StudentErrorBoundary>
  );
}