/**
 * Gamification Rules and Constants
 */

// XP Points Configuration
export const XP_RULES = {
  LECTURE_COMPLETED: 10,
  COURSE_COMPLETED: 100,
  QUIZ_PASSED: 25,
  QUIZ_TOP_SCORE: 50,
  ASSIGNMENT_SUBMITTED: 15,
  ASSIGNMENT_GRADED: 20,
  NOTE_CREATED: 5,
  RESOURCE_DOWNLOADED: 2,
  BOOKMARK_ADDED: 1,
  STREAK_BONUS: 5, // Per day in streak
  DAILY_LOGIN: 5,
};

// Badge Definitions
export const BADGES = {
  FIRST_LECTURE: {
    id: 'first_lecture',
    name: 'First Steps',
    description: 'Complete your first lecture',
    icon: '🎯',
    xpRequired: 10,
    category: 'progress'
  },
  COURSE_COMPLETER: {
    id: 'course_completer',
    name: 'Course Champion',
    description: 'Complete your first course',
    icon: '🏆',
    xpRequired: 100,
    category: 'achievement'
  },
  QUIZ_MASTER: {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Score 100% on a quiz',
    icon: '🧠',
    xpRequired: 50,
    category: 'knowledge'
  },
  NOTE_TAKER: {
    id: 'note_taker',
    name: 'Note Taker',
    description: 'Create 10 notes',
    icon: '📝',
    xpRequired: 50,
    category: 'productivity'
  },
  RESOURCE_HUNTER: {
    id: 'resource_hunter',
    name: 'Resource Hunter',
    description: 'Download 20 resources',
    icon: '📚',
    xpRequired: 40,
    category: 'exploration'
  },
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    xpRequired: 35,
    category: 'consistency'
  },
  BOOKMARK_COLLECTOR: {
    id: 'bookmark_collector',
    name: 'Bookmark Collector',
    description: 'Bookmark 25 items',
    icon: '⭐',
    xpRequired: 25,
    category: 'organization'
  },
  ASSIGNMENT_SUBMITTER: {
    id: 'assignment_submitter',
    name: 'Assignment Ace',
    description: 'Submit 5 assignments',
    icon: '📤',
    xpRequired: 75,
    category: 'completion'
  }
};

// Level System
export const LEVELS = [
  { level: 1, xpRequired: 0, name: 'Beginner' },
  { level: 2, xpRequired: 50, name: 'Novice' },
  { level: 3, xpRequired: 150, name: 'Learner' },
  { level: 4, xpRequired: 300, name: 'Student' },
  { level: 5, xpRequired: 500, name: 'Scholar' },
  { level: 6, xpRequired: 750, name: 'Expert' },
  { level: 7, xpRequired: 1000, name: 'Master' },
  { level: 8, xpRequired: 1300, name: 'Grandmaster' },
  { level: 9, xpRequired: 1700, name: 'Legend' },
  { level: 10, xpRequired: 2200, name: 'Myth' }
];

// Achievement Categories
export const ACHIEVEMENT_CATEGORIES = {
  progress: 'Learning Progress',
  achievement: 'Major Achievements',
  knowledge: 'Knowledge Mastery',
  productivity: 'Productivity',
  exploration: 'Content Exploration',
  consistency: 'Learning Consistency',
  organization: 'Organization',
  completion: 'Task Completion'
};

/**
 * Calculate user level based on XP
 */
export function calculateLevel(totalXP) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * Calculate XP needed for next level
 */
export function getXPToNextLevel(currentXP) {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelIndex = LEVELS.findIndex(level => level.level === currentLevel.level + 1);

  if (nextLevelIndex === -1) {
    return 0; // Max level reached
  }

  return LEVELS[nextLevelIndex].xpRequired - currentXP;
}

/**
 * Calculate level progress percentage
 */
export function getLevelProgress(currentXP) {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelIndex = LEVELS.findIndex(level => level.level === currentLevel.level + 1);

  if (nextLevelIndex === -1) {
    return 100; // Max level
  }

  const nextLevelXP = LEVELS[nextLevelIndex].xpRequired;
  const currentLevelXP = currentLevel.xpRequired;
  const progressXP = currentXP - currentLevelXP;
  const requiredXP = nextLevelXP - currentLevelXP;

  return Math.min(Math.round((progressXP / requiredXP) * 100), 100);
}

/**
 * Check if user has earned a badge
 */
export function checkBadgeEligibility(userStats, badgeId) {
  const badge = BADGES[badgeId];
  if (!badge) return false;

  switch (badgeId) {
    case 'first_lecture':
      return userStats.lecturesCompleted >= 1;
    case 'course_completer':
      return userStats.coursesCompleted >= 1;
    case 'quiz_master':
      return userStats.perfectQuizzes >= 1;
    case 'note_taker':
      return userStats.notesCreated >= 10;
    case 'resource_hunter':
      return userStats.resourcesDownloaded >= 20;
    case 'streak_master':
      return userStats.maxStreak >= 7;
    case 'bookmark_collector':
      return userStats.bookmarksCreated >= 25;
    case 'assignment_submitter':
      return userStats.assignmentsSubmitted >= 5;
    default:
      return false;
  }
}

/**
 * Get all earned badges for a user
 */
export function getEarnedBadges(userStats) {
  return Object.values(BADGES).filter(badge =>
    checkBadgeEligibility(userStats, badge.id)
  );
}

/**
 * Calculate total XP from user activities
 */
export function calculateTotalXP(userStats) {
  return (
    (userStats.lecturesCompleted || 0) * XP_RULES.LECTURE_COMPLETED +
    (userStats.coursesCompleted || 0) * XP_RULES.COURSE_COMPLETED +
    (userStats.quizzesPassed || 0) * XP_RULES.QUIZ_PASSED +
    (userStats.perfectQuizzes || 0) * XP_RULES.QUIZ_TOP_SCORE +
    (userStats.assignmentsSubmitted || 0) * XP_RULES.ASSIGNMENT_SUBMITTED +
    (userStats.notesCreated || 0) * XP_RULES.NOTE_CREATED +
    (userStats.resourcesDownloaded || 0) * XP_RULES.RESOURCE_DOWNLOADED +
    (userStats.bookmarksCreated || 0) * XP_RULES.BOOKMARK_ADDED +
    (userStats.currentStreak || 0) * XP_RULES.STREAK_BONUS +
    (userStats.loginDays || 0) * XP_RULES.DAILY_LOGIN
  );
}

/**
 * Get leaderboard rankings (mock implementation)
 */
export function getLeaderboardData(courseId = null) {
  // Mock leaderboard data - in real implementation, this would come from API
  const mockData = [
    { rank: 1, userName: 'Sarah Johnson', xp: 2450, level: 10, avatar: null },
    { rank: 2, userName: 'Mike Chen', xp: 2200, level: 9, avatar: null },
    { rank: 3, userName: 'Emma Davis', xp: 1980, level: 9, avatar: null },
    { rank: 4, userName: 'Alex Wilson', xp: 1750, level: 8, avatar: null },
    { rank: 5, userName: 'Lisa Brown', xp: 1620, level: 8, avatar: null },
    { rank: 6, userName: 'David Lee', xp: 1480, level: 7, avatar: null },
    { rank: 7, userName: 'Anna Garcia', xp: 1350, level: 7, avatar: null },
    { rank: 8, userName: 'Tom Anderson', xp: 1220, level: 6, avatar: null },
    { rank: 9, userName: 'Maria Rodriguez', xp: 1100, level: 6, avatar: null },
    { rank: 10, userName: 'James Taylor', xp: 980, level: 5, avatar: null }
  ];

  return courseId ? mockData.slice(0, 5) : mockData; // Course-specific shows top 5
}

/**
 * Format XP display
 */
export function formatXP(xp) {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

/**
 * Get motivational messages based on activity
 */
export const MOTIVATIONAL_MESSAGES = {
  lecture_completed: [
    "Great job completing that lecture! 🎯",
    "One step closer to mastery! 📚",
    "Knowledge is power! ⚡",
    "Keep up the excellent work! 🌟"
  ],
  course_completed: [
    "Congratulations on completing the course! 🏆",
    "You've achieved something amazing! 🎉",
    "Your dedication is inspiring! 💪",
    "Welcome to the completion club! 🎊"
  ],
  quiz_passed: [
    "Quiz conquered! Your knowledge is growing! 🧠",
    "Test passed with flying colors! 🎨",
    "Smart and getting smarter! 📈",
    "Quiz champion in the making! 👑"
  ],
  level_up: [
    "Level up! You're unstoppable! 🚀",
    "New level achieved! Keep climbing! 🏔️",
    "You're leveling up your skills! ⬆️",
    "Congratulations on your progress! 🎯"
  ],
  badge_earned: [
    "New badge unlocked! 🏅",
    "Achievement earned! 🌟",
    "Badge collection growing! 📌",
    "You've earned recognition! 🎖️"
  ]
};

/**
 * Get random motivational message
 */
export function getMotivationalMessage(type) {
  const messages = MOTIVATIONAL_MESSAGES[type] || MOTIVATIONAL_MESSAGES.lecture_completed;
  return messages[Math.floor(Math.random() * messages.length)];
}