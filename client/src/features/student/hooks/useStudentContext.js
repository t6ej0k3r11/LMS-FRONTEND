import { useContext, useEffect, useState } from 'react';
import { StudentContext } from '../../../context/student-context';
import { useAuth } from '../../../context/auth-context/useAuth';

export const useStudentContext = () => {
  const studentCtx = useContext(StudentContext);
  const { user } = useAuth();

  // Extended state for dashboard features
  const [profile, setProfile] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [learningStats, setLearningStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalTimeSpent: 0,
    averageProgress: 0,
  });

  // Load profile data
  useEffect(() => {
    if (user) {
      // TODO: Fetch profile data from API
      setProfile(user);
    }
  }, [user]);

  // Load enrolled courses
  useEffect(() => {
    if (studentCtx?.studentBoughtCoursesList) {
      setEnrolledCourses(studentCtx.studentBoughtCoursesList);
    }
  }, [studentCtx?.studentBoughtCoursesList]);

  // Calculate learning stats
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      const completed = enrolledCourses.filter(course => course.progress === 100).length;
      const totalTime = enrolledCourses.reduce((acc, course) => acc + (course.timeSpent || 0), 0);
      const avgProgress = enrolledCourses.reduce((acc, course) => acc + (course.progress || 0), 0) / enrolledCourses.length;

      setLearningStats({
        totalCourses: enrolledCourses.length,
        completedCourses: completed,
        totalTimeSpent: totalTime,
        averageProgress: Math.round(avgProgress),
      });
    }
  }, [enrolledCourses]);

  return {
    // Existing context
    ...studentCtx,

    // Extended state
    profile,
    setProfile,
    enrolledCourses,
    setEnrolledCourses,
    notifications,
    setNotifications,
    recentActivity,
    setRecentActivity,
    learningStats,

    // Helper functions
    refreshProfile: () => {
      // TODO: Implement profile refresh
    },
    refreshCourses: () => {
      // TODO: Implement courses refresh
    },
    refreshNotifications: () => {
      // TODO: Implement notifications refresh
    },
  };
};