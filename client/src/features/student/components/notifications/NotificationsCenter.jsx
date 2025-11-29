import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, BellOff, Settings, CheckCircle, Info, BookOpen, MessageSquare, Trophy } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

function NotificationsCenter() {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    email: {
      courseUpdates: true,
      assignments: true,
      messages: true,
      announcements: true,
      achievements: true,
    },
    inApp: {
      courseUpdates: true,
      assignments: true,
      messages: true,
      announcements: true,
      achievements: true,
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { get, post, put } = useApi();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await get('/student/notifications');
        if (response.success) {
          setNotifications(response.data);
        } else {
          // Mock data for development
          const mockNotifications = [
            {
              _id: '1',
              type: 'assignment',
              title: 'Assignment Due Soon',
              message: 'Your React Components assignment is due in 2 days.',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              read: false,
              courseId: 'course123',
              courseTitle: 'React Development'
            },
            {
              _id: '2',
              type: 'announcement',
              title: 'New Course Material Added',
              message: 'Chapter 5: Advanced State Management has been added to your course.',
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              read: true,
              courseId: 'course123',
              courseTitle: 'React Development'
            },
            {
              _id: '3',
              type: 'achievement',
              title: 'Course Completed!',
              message: 'Congratulations! You have completed the JavaScript Fundamentals course.',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              read: true,
              courseId: 'course456',
              courseTitle: 'JavaScript Fundamentals'
            },
            {
              _id: '4',
              type: 'message',
              title: 'New Message from Instructor',
              message: 'Your instructor has replied to your question about the final project.',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              read: false,
              courseId: 'course123',
              courseTitle: 'React Development'
            }
          ];
          setNotifications(mockNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchPreferences = async () => {
      try {
        const response = await get('/student/notification-preferences');
        if (response.success) {
          setPreferences(response.data);
        }
        // If API fails, use default preferences
      } catch (error) {
        console.error('Error fetching preferences:', error);
        // Use default preferences
      }
    };

    fetchNotifications();
    fetchPreferences();
  }, [get]);

  const markAsRead = async (notificationId) => {
    try {
      await post(`/student/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await post('/student/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const updatePreference = async (type, category, value) => {
    const newPreferences = {
      ...preferences,
      [type]: {
        ...preferences[type],
        [category]: value
      }
    };
    setPreferences(newPreferences);

    try {
      setSaving(true);
      await put('/student/notification-preferences', newPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <BookOpen className="h-4 w-4" />;
      case 'announcement':
        return <Info className="h-4 w-4" />;
      case 'achievement':
        return <Trophy className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'assignment':
        return 'text-orange-600 bg-orange-100';
      case 'announcement':
        return 'text-blue-600 bg-blue-100';
      case 'achievement':
        return 'text-green-600 bg-green-100';
      case 'message':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-gray-600">Stay updated with your learning progress</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-600">You'll receive notifications about your courses, assignments, and achievements here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`transition-all hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{notification.courseTitle}</span>
                              <span>{formatTime(notification.timestamp)}</span>
                            </div>
                          </div>

                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification._id)}
                              className="ml-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Email Notifications
                </h3>
                <div className="space-y-3">
                  {Object.entries(preferences.email).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </label>
                        <p className="text-xs text-gray-500">
                          Receive email notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => updatePreference('email', key, checked)}
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* In-App Notifications */}
              <div>
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  In-App Notifications
                </h3>
                <div className="space-y-3">
                  {Object.entries(preferences.inApp).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </label>
                        <p className="text-xs text-gray-500">
                          Show in-app notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => updatePreference('inApp', key, checked)}
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {saving && (
                <div className="text-sm text-gray-600 text-center">
                  Saving preferences...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificationsCenter;