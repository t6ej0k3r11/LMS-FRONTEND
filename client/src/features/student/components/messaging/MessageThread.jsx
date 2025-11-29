import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, Paperclip, MoreVertical } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useStudentContext } from '../../hooks/useStudentContext';
import PropTypes from 'prop-types';

function MessageThread({ thread, onBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { get, post } = useApi();
  const { user } = useStudentContext();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!thread?._id) return;

      try {
        setLoading(true);
        const response = await get(`/student/messages/${thread._id}`);
        if (response.success) {
          setMessages(response.data);
        } else {
          // Mock data for development
          const mockMessages = [
            {
              _id: 'msg1',
              content: 'Hello! I hope you\'re enjoying the React Development course.',
              sender: thread.participants.find(p => p.role === 'instructor')?._id || 'user1',
              timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
              read: true
            },
            {
              _id: 'msg2',
              content: 'Hi! Yes, I\'m really enjoying it. I have a question about the assignment though.',
              sender: user?._id,
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              read: true
            },
            {
              _id: 'msg3',
              content: 'Of course! What specific part are you having trouble with?',
              sender: thread.participants.find(p => p.role === 'instructor')?._id || 'user1',
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              read: false
            }
          ];
          setMessages(mockMessages);
        }
      } catch (error) {
        console.error('Error fetching thread messages:', error);
        // Use mock data as fallback
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [thread?._id, get, user?._id, thread?.participants]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await post(`/student/messages/${thread._id}`, {
        content: newMessage.trim()
      });

      if (response.success) {
        const newMsg = {
          _id: Date.now().toString(),
          content: newMessage.trim(),
          sender: user?._id,
          timestamp: new Date().toISOString(),
          read: true
        };
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOtherParticipant = () => {
    return thread?.participants?.find(p => p._id !== user?._id);
  };

  const otherParticipant = getOtherParticipant();

  if (!thread) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Select a conversation to view messages</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {otherParticipant?.userName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div>
              <CardTitle className="text-lg">
                {otherParticipant?.userName || 'Unknown User'}
              </CardTitle>
              <div className="flex items-center gap-2">
                {otherParticipant?.role === 'instructor' && (
                  <Badge variant="secondary" className="text-xs">
                    Instructor
                  </Badge>
                )}
                {thread?.courseTitle && (
                  <span className="text-xs text-gray-500">
                    {thread.courseTitle}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No messages in this conversation yet.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender === user?._id;
            const sender = thread.participants.find(p => p._id === message.sender);

            return (
              <div key={message._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {!isOwnMessage && (
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {sender?.userName || 'Unknown'}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={2}
              disabled={sending}
              className="resize-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="opacity-50"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </Card>
  );
}

MessageThread.propTypes = {
  thread: PropTypes.shape({
    _id: PropTypes.string,
    participants: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string,
      userName: PropTypes.string,
      role: PropTypes.string,
    })),
    courseTitle: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
};

export default MessageThread;