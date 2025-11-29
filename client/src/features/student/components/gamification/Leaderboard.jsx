import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, Crown, Star, TrendingUp, Users } from 'lucide-react';
import { getLeaderboardData, formatXP } from '../../utils/gamificationRules';
import { useStudentContext } from '../../hooks/useStudentContext';
import PropTypes from 'prop-types';

function Leaderboard({ courseId }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(courseId ? 'course' : 'global');
  const { user } = useStudentContext();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch from API
        // For now, using mock data from gamificationRules
        const data = getLeaderboardData(activeTab === 'course' ? courseId : null);
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab, courseId]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-600" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };


  const getCurrentUserRank = () => {
    // Mock current user position - in real implementation, this would come from API
    const mockUserRank = {
      rank: 7,
      userName: user?.userName || 'You',
      xp: 1250,
      level: 6,
      avatar: null
    };
    return mockUserRank;
  };

  const currentUser = getCurrentUserRank();
  const isUserInTop10 = leaderboardData.some(entry => entry.userName === currentUser.userName);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leaderboard</h2>
          <p className="text-gray-600">See how you rank among other learners</p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-medium">Top Performers</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Global Rankings
          </TabsTrigger>
          <TabsTrigger value="course" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Course Rankings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          {/* Top 3 Podium */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center justify-center">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Top 3 Champions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-end gap-4 mb-6">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-300">
                      <span className="text-lg font-bold text-gray-600">2</span>
                    </div>
                    <Medal className="absolute -top-1 -right-1 h-6 w-6 text-gray-400" />
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border min-w-24">
                    <p className="font-medium text-sm">{leaderboardData[1]?.userName}</p>
                    <p className="text-xs text-gray-500">{formatXP(leaderboardData[1]?.xp)} XP</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Level {leaderboardData[1]?.level}
                    </Badge>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="relative mb-2">
                    <div className="w-20 h-20 bg-yellow-200 rounded-full flex items-center justify-center border-4 border-yellow-400">
                      <Crown className="h-8 w-8 text-yellow-600" />
                    </div>
                    <Crown className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500" />
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border min-w-24">
                    <p className="font-bold text-sm">{leaderboardData[0]?.userName}</p>
                    <p className="text-xs text-gray-500">{formatXP(leaderboardData[0]?.xp)} XP</p>
                    <Badge className="text-xs mt-1 bg-yellow-100 text-yellow-800">
                      Level {leaderboardData[0]?.level}
                    </Badge>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center border-4 border-amber-300">
                      <span className="text-lg font-bold text-amber-600">3</span>
                    </div>
                    <Award className="absolute -top-1 -right-1 h-6 w-6 text-amber-600" />
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border min-w-24">
                    <p className="font-medium text-sm">{leaderboardData[2]?.userName}</p>
                    <p className="text-xs text-gray-500">{formatXP(leaderboardData[2]?.xp)} XP</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Level {leaderboardData[2]?.level}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Rankings List */}
          <Card>
            <CardHeader>
              <CardTitle>Full Rankings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaderboardData.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    entry.userName === currentUser.userName
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank)}
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {entry.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${
                        entry.userName === currentUser.userName ? 'text-blue-700' : ''
                      }`}>
                        {entry.userName}
                        {entry.userName === currentUser.userName && (
                          <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatXP(entry.xp)} XP</span>
                      <Badge variant="secondary" className="text-xs">
                        Level {entry.level}
                      </Badge>
                    </div>
                  </div>

                  {entry.rank <= 3 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">Top {entry.rank}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Current User Position (if not in top 10) */}
          {!isUserInTop10 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    <span className="text-sm font-bold text-blue-600">#{currentUser.rank}</span>
                  </div>

                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {currentUser.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-medium text-blue-700">{currentUser.userName}</p>
                    <div className="flex items-center gap-4 text-sm text-blue-600">
                      <span>{formatXP(currentUser.xp)} XP</span>
                      <Badge variant="outline" className="text-xs border-blue-300">
                        Level {currentUser.level}
                      </Badge>
                    </div>
                  </div>

                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    Your Rank
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="course" className="space-y-4">
          {courseId ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Course Rankings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {leaderboardData.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                        entry.userName === currentUser.userName
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(entry.rank)}
                      </div>

                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {entry.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <p className={`font-medium ${
                          entry.userName === currentUser.userName ? 'text-blue-700' : ''
                        }`}>
                          {entry.userName}
                          {entry.userName === currentUser.userName && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                          )}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatXP(entry.xp)} XP</span>
                          <Badge variant="secondary" className="text-xs">
                            Level {entry.level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a course</h3>
                <p className="text-gray-600">Course rankings will appear here when you select a specific course.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

Leaderboard.propTypes = {
  courseId: PropTypes.string
};

export default Leaderboard;