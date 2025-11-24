import { useState, useEffect, useContext, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { SocketContext } from "@/context/socket-context/SocketContext";
import {
  getUserNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
} from "@/services";

function NotificationsPage() {
  const { notifications, resetUnreadNotificationCount } = useContext(SocketContext);
  const [allNotifications, setAllNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch notifications on mount and when page changes
  useEffect(() => {
    fetchNotifications(false);
  }, [page, fetchNotifications]);

  // Update filtered notifications when all notifications or filters change
  useEffect(() => {
    let filtered = [...allNotifications];

    // Apply read/unread filter
    if (activeFilter === "unread") {
      filtered = filtered.filter(n => !n.isRead);
    } else if (activeFilter === "read") {
      filtered = filtered.filter(n => n.isRead);
    }

    // Apply type filter
    if (activeTypeFilter !== "all") {
      filtered = filtered.filter(n => n.type === activeTypeFilter);
    }

    setFilteredNotifications(filtered);
  }, [allNotifications, activeFilter, activeTypeFilter]);

  // Update all notifications when socket notifications change
  useEffect(() => {
    setAllNotifications(prev => {
      const existingIds = new Set(prev.map(n => n._id));
      const newNotifications = notifications.filter(n => !existingIds.has(n._id));
      return [...newNotifications, ...prev];
    });
  }, [notifications]);

  const fetchNotifications = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const skip = reset ? 0 : (page - 1) * limit;
      const response = await getUserNotificationsService({
        limit,
        skip,
      });

      if (response.success) {
        if (reset) {
          setAllNotifications(response.data.notifications);
        } else {
          setAllNotifications(prev => [...prev, ...response.data.notifications]);
        }
        setHasMore(response.data.notifications.length === limit);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading]);


  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsReadService(notificationId);
      // Update local state
      setAllNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadService();
      // Update local state
      setAllNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      // Update context
      resetUnreadNotificationCount();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotificationService(notificationId);
      // Update local state
      setAllNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "alert":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_50%)] py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
              <p className="text-muted-foreground">Stay updated with your latest activities</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="rounded-xl"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            </div>
          )}
        </div>

        <Card className="rounded-[32px] border-white/60 bg-white/90 shadow-[0_35px_80px_rgba(9,42,31,0.14)]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-foreground">All Notifications</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNotifications(true)}
                disabled={isLoading}
                className="rounded-xl"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-xl bg-white/60">
                <TabsTrigger value="all" className="rounded-lg">
                  All ({allNotifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread" className="rounded-lg">
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="read" className="rounded-lg">
                  Read ({allNotifications.length - unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by type:</span>
              {["all", "info", "success", "warning", "alert"].map((type) => (
                <Button
                  key={type}
                  variant={activeTypeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTypeFilter(type)}
                  className="rounded-full text-xs capitalize"
                >
                  {type === "all" ? "All Types" : type}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    {activeFilter === "unread" ? "No unread notifications" : "No notifications found"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {activeFilter === "unread"
                      ? "You've read all your notifications. Great job staying up to date!"
                      : "When you have notifications, they'll appear here."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                        !notification.isRead
                          ? "bg-[hsla(var(--brand-green)/0.05)] border-[hsla(var(--brand-green)/0.2)]"
                          : "bg-white/50 border-white/60"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className={`text-sm font-semibold text-foreground truncate ${
                            !notification.isRead ? "font-bold" : ""
                          }`}>
                            {notification.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${getTypeColor(notification.type)}`}
                          >
                            {notification.type}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.createdAt)}
                          </span>

                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="h-8 px-3 text-xs rounded-lg hover:bg-green-50 hover:text-green-700"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark as read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(notification._id)}
                              className="h-8 px-3 text-xs rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {hasMore && (
                    <div className="text-center py-4">
                      <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={isLoading}
                        className="rounded-xl"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default NotificationsPage;