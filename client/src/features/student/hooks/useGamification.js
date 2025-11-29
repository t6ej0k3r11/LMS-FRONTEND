import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { calculateTotalXP, getEarnedBadges, getMotivationalMessage } from '../utils/gamificationRules';

/**
 * Custom hook for gamification features
 */
export function useGamification() {
  const [userStats, setUserStats] = useState({
    lecturesCompleted: 0,
    coursesCompleted: 0,
    perfectQuizzes: 0,
    notesCreated: 0,
    resourcesDownloaded: 0,
    maxStreak: 0,
    bookmarksCreated: 0,
    assignmentsSubmitted: 0,
    loginDays: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const { get, post } = useApi();

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await get('/student/gamification/stats');
      if (response.success) {
        setUserStats(response.data);
      } else {
        // Mock data for development
        setUserStats({
          lecturesCompleted: 15,
          coursesCompleted: 2,
          perfectQuizzes: 3,
          notesCreated: 8,
          resourcesDownloaded: 12,
          maxStreak: 5,
          bookmarksCreated: 20,
          assignmentsSubmitted: 4,
          loginDays: 25,
          currentStreak: 3
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Update user stats
  const updateUserStats = useCallback(async (updates) => {
    try {
      const response = await post('/student/gamification/stats', updates);
      if (response.success) {
        setUserStats(prev => ({ ...prev, ...updates }));
        return response.data;
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Update locally even if API fails
      setUserStats(prev => ({ ...prev, ...updates }));
    }
  }, [post]);

  // Award XP for activity
  const awardXP = useCallback(async (activityType) => {
    const xpRules = {
      lecture_completed: 10,
      course_completed: 100,
      quiz_passed: 25,
      quiz_perfect: 50,
      assignment_submitted: 15,
      note_created: 5,
      resource_downloaded: 2,
      bookmark_added: 1,
      daily_login: 5
    };

    const xpAwarded = xpRules[activityType] || 0;
    if (xpAwarded === 0) return;

    // Update stats based on activity
    const statUpdates = {};
    switch (activityType) {
      case 'lecture_completed':
        statUpdates.lecturesCompleted = (userStats.lecturesCompleted || 0) + 1;
        break;
      case 'course_completed':
        statUpdates.coursesCompleted = (userStats.coursesCompleted || 0) + 1;
        break;
      case 'quiz_perfect':
        statUpdates.perfectQuizzes = (userStats.perfectQuizzes || 0) + 1;
        break;
      case 'note_created':
        statUpdates.notesCreated = (userStats.notesCreated || 0) + 1;
        break;
      case 'resource_downloaded':
        statUpdates.resourcesDownloaded = (userStats.resourcesDownloaded || 0) + 1;
        break;
      case 'bookmark_added':
        statUpdates.bookmarksCreated = (userStats.bookmarksCreated || 0) + 1;
        break;
      case 'assignment_submitted':
        statUpdates.assignmentsSubmitted = (userStats.assignmentsSubmitted || 0) + 1;
        break;
    }

    // Update stats
    if (Object.keys(statUpdates).length > 0) {
      await updateUserStats(statUpdates);
    }

    // Check for new badges
    const previousBadges = getEarnedBadges(userStats);
    const newUserStats = { ...userStats, ...statUpdates };
    const newBadges = getEarnedBadges(newUserStats);

    const earnedBadges = newBadges.filter(newBadge =>
      !previousBadges.some(oldBadge => oldBadge.id === newBadge.id)
    );

    // Show notifications for new badges and XP
    if (earnedBadges.length > 0) {
      earnedBadges.forEach(badge => {
        addNotification({
          type: 'badge_earned',
          title: `New Badge: ${badge.name}`,
          message: badge.description,
          icon: badge.icon
        });
      });
    }

    if (xpAwarded > 0) {
      addNotification({
        type: 'xp_earned',
        title: `+${xpAwarded} XP Earned!`,
        message: getMotivationalMessage(activityType === 'lecture_completed' ? 'lecture_completed' : 'xp_earned')
      });
    }

    return { xpAwarded, newBadges: earnedBadges };
  }, [userStats, updateUserStats]);

  // Add notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Calculate current XP
  const currentXP = calculateTotalXP(userStats);

  // Get earned badges
  const earnedBadges = getEarnedBadges(userStats);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  return {
    userStats,
    currentXP,
    earnedBadges,
    notifications,
    loading,
    fetchUserStats,
    updateUserStats,
    awardXP,
    addNotification,
    clearNotifications
  };
}