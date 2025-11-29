import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, Lock, Trophy } from 'lucide-react';
import { BADGES, ACHIEVEMENT_CATEGORIES, getEarnedBadges } from '../../utils/gamificationRules';
import PropTypes from 'prop-types';

function BadgeDisplay({ userStats, showProgress = true, compact = false }) {
  const earnedBadges = getEarnedBadges(userStats);
  const allBadges = Object.values(BADGES);

  // Group badges by category
  const badgesByCategory = allBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {});


  const getCategoryColor = (category) => {
    const colorMap = {
      progress: 'bg-blue-100 text-blue-800',
      achievement: 'bg-yellow-100 text-yellow-800',
      knowledge: 'bg-purple-100 text-purple-800',
      productivity: 'bg-green-100 text-green-800',
      exploration: 'bg-orange-100 text-orange-800',
      consistency: 'bg-red-100 text-red-800',
      organization: 'bg-indigo-100 text-indigo-800',
      completion: 'bg-pink-100 text-pink-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  const isBadgeEarned = (badgeId) => {
    return earnedBadges.some(badge => badge.id === badgeId);
  };

  const getBadgeProgress = (badge) => {
    // Calculate progress towards earning the badge
    switch (badge.id) {
      case 'first_lecture':
        return Math.min((userStats.lecturesCompleted || 0) / 1 * 100, 100);
      case 'course_completer':
        return Math.min((userStats.coursesCompleted || 0) / 1 * 100, 100);
      case 'quiz_master':
        return Math.min((userStats.perfectQuizzes || 0) / 1 * 100, 100);
      case 'note_taker':
        return Math.min((userStats.notesCreated || 0) / 10 * 100, 100);
      case 'resource_hunter':
        return Math.min((userStats.resourcesDownloaded || 0) / 20 * 100, 100);
      case 'streak_master':
        return Math.min((userStats.maxStreak || 0) / 7 * 100, 100);
      case 'bookmark_collector':
        return Math.min((userStats.bookmarksCreated || 0) / 25 * 100, 100);
      case 'assignment_submitter':
        return Math.min((userStats.assignmentsSubmitted || 0) / 5 * 100, 100);
      default:
        return 0;
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {earnedBadges.slice(0, 6).map((badge) => (
          <TooltipProvider key={badge.id}>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium">{badge.name}</div>
                    <div className="text-xs text-gray-500">{badge.description}</div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {earnedBadges.length > 6 && (
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg border">
            <span className="text-sm font-medium">+{earnedBadges.length - 6} more</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievements</h2>
          <p className="text-gray-600">Your learning milestones and badges</p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-medium">{earnedBadges.length} badges earned</span>
        </div>
      </div>

      {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className={getCategoryColor(category)}>
                {ACHIEVEMENT_CATEGORIES[category]}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBadges.map((badge) => {
                const earned = isBadgeEarned(badge.id);
                const progress = getBadgeProgress(badge);

                return (
                  <TooltipProvider key={badge.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                          earned
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              earned ? 'bg-yellow-200' : 'bg-gray-200'
                            }`}>
                              {earned ? (
                                <span className="text-2xl">{badge.icon}</span>
                              ) : (
                                <Lock className="h-6 w-6 text-gray-400" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className={`font-medium text-sm ${
                                earned ? 'text-gray-900' : 'text-gray-500'
                              }`}>
                                {badge.name}
                              </h3>
                              <p className={`text-xs mt-1 ${
                                earned ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {badge.description}
                              </p>

                              {showProgress && !earned && (
                                <div className="mt-2">
                                  <Progress value={progress} className="h-1" />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {Math.round(progress)}% complete
                                  </p>
                                </div>
                              )}

                              {earned && (
                                <div className="mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    Earned!
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-medium">{badge.name}</p>
                          <p className="text-sm">{badge.description}</p>
                          {earned && (
                            <p className="text-xs text-green-600 mt-1">✓ Earned</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {earnedBadges.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No badges yet</h3>
            <p className="text-gray-600">
              Start learning to earn your first achievement badges!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

BadgeDisplay.propTypes = {
  userStats: PropTypes.shape({
    lecturesCompleted: PropTypes.number,
    coursesCompleted: PropTypes.number,
    perfectQuizzes: PropTypes.number,
    notesCreated: PropTypes.number,
    resourcesDownloaded: PropTypes.number,
    maxStreak: PropTypes.number,
    bookmarksCreated: PropTypes.number,
    assignmentsSubmitted: PropTypes.number
  }).isRequired,
  showProgress: PropTypes.bool,
  compact: PropTypes.bool
};

export default BadgeDisplay;