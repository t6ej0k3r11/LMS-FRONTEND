import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Award, Trophy, Star, TrendingUp, Target, Zap, Crown } from 'lucide-react';
import { calculateLevel, getXPToNextLevel, getLevelProgress, formatXP, getEarnedBadges, calculateTotalXP } from '../../utils/gamificationRules';
import { useStudentContext } from '../../hooks/useStudentContext';
import PropTypes from 'prop-types';

function ProfileAchievements({ compact = false }) {
  const { user } = useStudentContext();

  // Mock user stats - in real implementation, this would come from API
  const userStats = {
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
  };

  const totalXP = calculateTotalXP(userStats);
  const currentLevel = calculateLevel(totalXP);
  const xpToNext = getXPToNextLevel(totalXP);
  const levelProgress = getLevelProgress(totalXP);
  const earnedBadges = getEarnedBadges(userStats);

  // Recent achievements (mock data)
  const recentAchievements = [
    {
      id: 'course_completer',
      name: 'Course Champion',
      description: 'Completed your first course',
      earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      xpReward: 100
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Scored 100% on a quiz',
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      xpReward: 50
    },
    {
      id: 'note_taker',
      name: 'Note Taker',
      description: 'Created 10 notes',
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      xpReward: 50
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{user?.userName || 'Student'}</h3>
                <Badge variant="secondary" className="text-xs">
                  Level {currentLevel.level}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{formatXP(totalXP)} XP</span>
                  <span className="text-gray-500">
                    {xpToNext > 0 ? `${formatXP(xpToNext)} to next level` : 'Max level!'}
                  </span>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-600">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">{earnedBadges.length}</span>
              </div>
              <p className="text-xs text-gray-500">badges</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Level and XP Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-blue-600" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{user?.userName || 'Student'}</h2>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  {currentLevel.name} (Level {currentLevel.level})
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">{formatXP(totalXP)} XP</span>
                  <span className="text-sm text-gray-600">
                    {xpToNext > 0 ? `${formatXP(xpToNext)} XP to next level` : '🎉 Max level reached!'}
                  </span>
                </div>
                <Progress value={levelProgress} className="h-3" />
                <p className="text-sm text-gray-600">
                  {levelProgress}% complete • Next: {currentLevel.level + 1 > 10 ? 'Legendary status' : `Level ${currentLevel.level + 1}`}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{earnedBadges.length}</p>
              <p className="text-sm text-gray-600">Badges</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{userStats.lecturesCompleted}</p>
            <p className="text-sm text-gray-600">Lectures Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2">
              <Star className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{userStats.coursesCompleted}</p>
            <p className="text-sm text-gray-600">Courses Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{userStats.currentStreak}</p>
            <p className="text-sm text-gray-600">Day Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mx-auto mb-2">
              <Award className="h-4 w-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{userStats.perfectQuizzes}</p>
            <p className="text-sm text-gray-600">Perfect Quizzes</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAchievements.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements yet</h3>
              <p className="text-gray-600">Start learning to earn your first achievements!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                    <Trophy className="h-5 w-5 text-green-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-green-800">{achievement.name}</h3>
                        <p className="text-sm text-green-700 mb-1">{achievement.description}</p>
                        <p className="text-xs text-green-600">Earned {formatDate(achievement.earnedAt)}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        +{achievement.xpReward} XP
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Categories Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries({
              progress: { icon: Target, color: 'text-blue-600 bg-blue-100', count: earnedBadges.filter(b => b.category === 'progress').length },
              achievement: { icon: Trophy, color: 'text-yellow-600 bg-yellow-100', count: earnedBadges.filter(b => b.category === 'achievement').length },
              knowledge: { icon: Star, color: 'text-purple-600 bg-purple-100', count: earnedBadges.filter(b => b.category === 'knowledge').length },
              productivity: { icon: Zap, color: 'text-green-600 bg-green-100', count: earnedBadges.filter(b => b.category === 'productivity').length },
              exploration: { icon: Award, color: 'text-orange-600 bg-orange-100', count: earnedBadges.filter(b => b.category === 'exploration').length },
              consistency: { icon: TrendingUp, color: 'text-red-600 bg-red-100', count: earnedBadges.filter(b => b.category === 'consistency').length },
              organization: { icon: Target, color: 'text-indigo-600 bg-indigo-100', count: earnedBadges.filter(b => b.category === 'organization').length },
              completion: { icon: Trophy, color: 'text-pink-600 bg-pink-100', count: earnedBadges.filter(b => b.category === 'completion').length }
            }).map(([category, { icon: Icon, color, count }]) => (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`inline-flex items-center justify-center w-8 h-8 ${color} rounded-full mb-2`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium capitalize">{category}</p>
                <p className="text-lg font-bold">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

ProfileAchievements.propTypes = {
  compact: PropTypes.bool
};

export default ProfileAchievements;