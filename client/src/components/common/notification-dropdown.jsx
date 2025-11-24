import { useState, useEffect, useContext } from "react";
import { BellRing, Check, CheckCheck, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SocketContext } from "@/context/socket-context/SocketContext";
import {
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
} from "@/services";

function NotificationDropdown() {
  const navigate = useNavigate();
  const { notifications, setNotifications, unreadNotificationCount, decrementUnreadNotificationCount, resetUnreadNotificationCount } = useContext(SocketContext);
  const [recentNotifications, setRecentNotifications] = useState([]);

  // Update recent notifications when socket notifications change
  useEffect(() => {
    setRecentNotifications(notifications.slice(0, 5));
  }, [notifications]);

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await markNotificationAsReadService(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      decrementUnreadNotificationCount();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadService();
      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      resetUnreadNotificationCount();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleViewAll = () => {
    navigate("/notifications");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "alert":
        return "🚨";
      default:
        return "ℹ️";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-2xl bg-white/70 text-muted-foreground hover:text-primary relative"
          aria-label={`Notifications ${unreadNotificationCount > 0 ? `(${unreadNotificationCount} unread)` : ""}`}
        >
          <BellRing className="h-5 w-5" />
          {unreadNotificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-[hsl(var(--brand-red))] text-white"
            >
              {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm border-white/60 shadow-lg"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unreadNotificationCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:text-primary/80 h-auto p-1"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/60" />

        {recentNotifications.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            <BellRing className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <>
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-white/80 ${
                  !notification.isRead ? "bg-[hsla(var(--brand-green)/0.05)]" : ""
                }`}
                onClick={() => handleMarkAsRead(notification._id, { stopPropagation: () => {} })}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-foreground truncate ${
                    !notification.isRead ? "font-semibold" : ""
                  }`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                    className="flex-shrink-0 h-6 w-6 p-0 text-primary hover:text-primary/80"
                    aria-label="Mark as read"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-white/60" />
            <DropdownMenuItem
              onClick={handleViewAll}
              className="flex items-center justify-center p-3 cursor-pointer hover:bg-white/80"
            >
              <Eye className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium text-primary">View All Notifications</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationDropdown;