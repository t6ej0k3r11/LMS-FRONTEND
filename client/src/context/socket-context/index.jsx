import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { useAuth } from "../auth-context/useAuth";
import { SocketContext } from "./SocketContext";

export default function SocketProvider({ children }) {
  const { auth } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    if (auth.authenticate && auth.user) {
      const token = sessionStorage.getItem("accessToken");
      if (token) {
        // Connect to socket server
        socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
          auth: {
            token: token,
          },
          transports: ["websocket", "polling"],
        });

        socketRef.current.on("connect", () => {
          console.log("Connected to socket server");
          setIsConnected(true);
        });

        socketRef.current.on("disconnect", () => {
          console.log("Disconnected from socket server");
          setIsConnected(false);
        });

        socketRef.current.on("receive_message", (message) => {
          setMessages(prev => {
            // Dedupe messages by _id before adding to state
            if (prev.some(m => m._id === message._id)) {
              return prev;
            }
            return [...prev, message];
          });
        });

        socketRef.current.on("user_typing", (data) => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (data.isTyping) {
              newSet.add(data.senderId);
            } else {
              newSet.delete(data.senderId);
            }
            return newSet;
          });
        });

        socketRef.current.on("messages_seen", (data) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.senderId === data.senderId && msg.receiverId === auth.user._id
                ? { ...msg, seen: true }
                : msg
            )
          );
        });

        socketRef.current.on("new_notification", (notification) => {
          setNotifications(prev => [notification, ...prev]);
          if (!notification.isRead) {
            setUnreadNotificationCount(prev => prev + 1);
          }
        });

        socketRef.current.on("notification_count_update", (data) => {
          setUnreadNotificationCount(data.unreadCount);
        });

        socketRef.current.on("error", (error) => {
          console.error("Socket error:", error);
        });
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [auth.authenticate, auth.user]);

  const sendMessage = (receiverId, message, courseId = null) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("send_message", {
        receiverId,
        message,
        courseId,
      });
    }
  };

  const startTyping = (receiverId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("typing", {
        receiverId,
        isTyping: true,
      });
    }
  };

  const stopTyping = (receiverId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("typing", {
        receiverId,
        isTyping: false,
      });
    }
  };

  const markMessagesSeen = (senderId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("mark_seen", {
        senderId,
      });
    }
  };

  const decrementUnreadNotificationCount = () => {
    setUnreadNotificationCount(prev => Math.max(0, prev - 1));
  };

  const resetUnreadNotificationCount = () => {
    setUnreadNotificationCount(0);
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    messages,
    setMessages,
    typingUsers,
    notifications,
    setNotifications,
    unreadNotificationCount,
    decrementUnreadNotificationCount,
    resetUnreadNotificationCount,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesSeen,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

SocketProvider.propTypes = {
  children: PropTypes.node,
};