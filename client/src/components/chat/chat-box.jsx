import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/context/socket-context/useSocket";
import { useAuth } from "@/context/auth-context/useAuth";
import { Send, Check, CheckCheck } from "lucide-react";
import { getChatHistoryService } from "@/services";

export default function ChatBox({ selectedUser }) {
  ChatBox.propTypes = {
    selectedUser: PropTypes.shape({
      userId: PropTypes.string,
      userName: PropTypes.string,
      role: PropTypes.string,
      courseId: PropTypes.string,
      courseTitle: PropTypes.string,
    }),
  };
  const { auth } = useAuth();
  const {
    messages,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesSeen,
    typingUsers,
  } = useSocket();
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Combine chat history and real-time messages, avoiding duplicates
  const allMessages = selectedUser ? [...chatHistory, ...messages].filter(
    (msg) =>
      (msg.senderId === auth.user._id && msg.receiverId === selectedUser.userId) ||
      (msg.senderId === selectedUser.userId && msg.receiverId === auth.user._id)
  ) : [];

  // Remove duplicates based on _id
  const chatMessages = allMessages.filter(
    (msg, index, self) => index === self.findIndex((m) => m._id === msg._id)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load chat history when user is selected
  useEffect(() => {
    const loadChatHistory = async () => {
      if (selectedUser && selectedUser.userId) {
        try {
          setLoadingHistory(true);
          const response = await getChatHistoryService(
            auth.user._id,
            selectedUser.userId,
            selectedUser.courseId || null
          );
          if (response.success) {
            setChatHistory(response.data);
          }
        } catch (error) {
          console.error("Failed to load chat history:", error);
        } finally {
          setLoadingHistory(false);
        }
      } else {
        setChatHistory([]);
      }
    };

    loadChatHistory();
  }, [selectedUser, auth.user._id]);

  useEffect(() => {
    if (selectedUser && selectedUser.userId) {
      markMessagesSeen(selectedUser.userId);
    }
  }, [selectedUser, markMessagesSeen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser && selectedUser.userId) {
      // For students and instructors, messages need course context
      // For admin, courseId might be null
      const courseId = selectedUser.courseId || null;
      sendMessage(selectedUser.userId, newMessage.trim(), courseId);
      setNewMessage("");
      stopTyping(selectedUser.userId);
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (selectedUser && selectedUser.userId && !isTyping && e.target.value.trim()) {
      startTyping(selectedUser.userId);
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedUser && selectedUser.userId) {
        stopTyping(selectedUser.userId);
      }
      setIsTyping(false);
    }, 1000);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-white">
        <h3 className="font-semibold">{selectedUser.userName}</h3>
        <p className="text-sm text-gray-500 capitalize">{selectedUser.role}</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {loadingHistory && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading chat history...</p>
            </div>
          )}
          {chatMessages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.senderId === auth.user._id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === auth.user._id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p>{message.message}</p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <span className="text-xs opacity-75">
                    {formatTime(message.createdAt)}
                  </span>
                  {message.senderId === auth.user._id && (
                    <div className="flex">
                      {message.seen ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {selectedUser && selectedUser.userId && typingUsers.has(selectedUser.userId) && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}