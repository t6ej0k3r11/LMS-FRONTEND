import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, Globe, BookOpen, Pin, Eye } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useStudentContext } from '../../hooks/useStudentContext';
import PropTypes from 'prop-types';

function AnnouncementsList({ courseId }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(courseId ? 'course' : 'global');
  const { get, post } = useApi();
  const { user } = useStudentContext();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);

        // Fetch course-specific announcements if courseId is provided
        const courseAnnouncements = courseId ? await get(`/student/courses/${courseId}/announcements`) : { data: [] };

        // Fetch global announcements
        const globalAnnouncements = await get('/student/announcements/global');

        const allAnnouncements = [
          ...(courseAnnouncements.success ? courseAnnouncements.data.map(a => ({ ...a, type: 'course' })) : []),
          ...(globalAnnouncements.success ? globalAnnouncements.data.map(a => ({ ...a, type: 'global' })) : [])
        ];

        // Mock data for development
        if (allAnnouncements.length === 0) {
          const mockAnnouncements = [
            {
              _id: '1',
              title: 'Welcome to React Development!',
              content: 'Welcome to our comprehensive React Development course. We\'re excited to have you on board! This course will take you from beginner to advanced React developer.',
              author: {
                _id: 'instructor1',
                userName: 'Sarah Johnson',
                role: 'instructor'
              },
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              pinned: true,
              type: 'course',
              courseId: courseId || 'course123',
              courseTitle: 'React Development',
              readBy: ['user1', 'user2'] // Mock read status
            },
            {
              _id: '2',
              title: 'Assignment Submission Guidelines Updated',
              content: 'We\'ve updated our assignment submission guidelines. Please review the new requirements before submitting your work. All assignments must now include proper documentation.',
              author: {
                _id: 'instructor1',
                userName: 'Sarah Johnson',
                role: 'instructor'
              },
              createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              pinned: false,
              type: 'course',
              courseId: courseId || 'course123',
              courseTitle: 'React Development',
              readBy: ['user1']
            },
            {
              _id: '3',
              title: 'Platform Maintenance Notice',
              content: 'The LMS will undergo scheduled maintenance this Saturday from 2 AM to 4 AM UTC. During this time, the platform will be temporarily unavailable. We apologize for any inconvenience.',
              author: {
                _id: 'admin1',
                userName: 'LMS Admin',
                role: 'admin'
              },
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
              pinned: true,
              type: 'global',
              readBy: ['user1', 'user2', 'user3']
            },
            {
              _id: '4',
              title: 'New Feature: Interactive Quizzes',
              content: 'We\'re excited to announce the launch of our new interactive quiz feature! Now you can take practice quizzes with instant feedback to reinforce your learning.',
              author: {
                _id: 'admin1',
                userName: 'LMS Admin',
                role: 'admin'
              },
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              pinned: false,
              type: 'global',
              readBy: ['user1']
            }
          ];
          setAnnouncements(mockAnnouncements);
        } else {
          setAnnouncements(allAnnouncements);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [courseId, get]);

  const markAsRead = async (announcementId) => {
    try {
      await post(`/student/announcements/${announcementId}/read`);
      setAnnouncements(prev =>
        prev.map(announcement =>
          announcement._id === announcementId
            ? { ...announcement, readBy: [...(announcement.readBy || []), user?._id] }
            : announcement
        )
      );
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return `${Math.floor(diffMs / (1000 * 60))}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (activeTab === 'course') return announcement.type === 'course';
    if (activeTab === 'global') return announcement.type === 'global';
    return true;
  });

  // Sort by pinned first, then by creation date
  const sortedAnnouncements = filteredAnnouncements.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const isRead = (announcement) => {
    return announcement.readBy?.includes(user?._id);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
          <h2 className="text-2xl font-bold">Announcements</h2>
          <p className="text-gray-600">Stay informed about important updates and news</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="course" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Course Announcements
            {courseId && (
              <Badge variant="secondary" className="ml-1">
                {announcements.filter(a => a.type === 'course').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Global Announcements
            <Badge variant="secondary" className="ml-1">
              {announcements.filter(a => a.type === 'global').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course" className="space-y-4">
          {courseId ? (
            sortedAnnouncements.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No course announcements</h3>
                  <p className="text-gray-600">There are no announcements for this course yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedAnnouncements.map((announcement) => (
                  <Card key={announcement._id} className={`transition-all hover:shadow-md ${
                    announcement.pinned ? 'border-l-4 border-l-yellow-500 bg-yellow-50/50' : ''
                  } ${!isRead(announcement) ? 'bg-blue-50/30' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {announcement.author?.userName?.charAt(0)?.toUpperCase() || 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{announcement.title}</CardTitle>
                              {announcement.pinned && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Pin className="h-3 w-3" />
                                  Pinned
                                </Badge>
                              )}
                              {!isRead(announcement) && (
                                <Badge variant="destructive" className="text-xs">New</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {announcement.author?.userName || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatTime(announcement.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!isRead(announcement) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(announcement._id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a course</h3>
                <p className="text-gray-600">Course announcements will appear here when you select a specific course.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          {sortedAnnouncements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No global announcements</h3>
                <p className="text-gray-600">There are no global announcements at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedAnnouncements.map((announcement) => (
                <Card key={announcement._id} className={`transition-all hover:shadow-md ${
                  announcement.pinned ? 'border-l-4 border-l-yellow-500 bg-yellow-50/50' : ''
                } ${!isRead(announcement) ? 'bg-blue-50/30' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {announcement.author?.userName?.charAt(0)?.toUpperCase() || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            {announcement.pinned && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Pin className="h-3 w-3" />
                                Pinned
                              </Badge>
                            )}
                            {!isRead(announcement) && (
                              <Badge variant="destructive" className="text-xs">New</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {announcement.author?.userName || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatTime(announcement.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!isRead(announcement) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(announcement._id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

AnnouncementsList.propTypes = {
  courseId: PropTypes.string,
};

export default AnnouncementsList;