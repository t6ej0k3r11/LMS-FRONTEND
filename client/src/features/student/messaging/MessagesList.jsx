import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { MessageCircle, User } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useStudentToast } from '../components/ToastProvider';
import PropTypes from 'prop-types';

export const MessagesList = ({ onThreadSelect, selectedThreadId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getMessages } = useApi();
  const { showError } = useStudentToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages</h3>
        <p className="text-gray-600">You don't have any messages yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((thread) => (
        <Card
          key={thread._id}
          className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
            selectedThreadId === thread._id ? 'bg-blue-50 border-blue-200' : ''
          }`}
          onClick={() => onThreadSelect(thread._id)}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {thread.participants?.[0]?.name ? getInitials(thread.participants[0].name) : <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {thread.participants?.[0]?.name || 'Unknown User'}
                </h3>
                <div className="flex items-center space-x-2">
                  {!thread.isRead && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTime(thread.lastMessage?.timestamp)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 truncate mt-1">
                {thread.lastMessage?.content || 'No messages yet'}
              </p>

              {thread.unreadCount > 0 && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {thread.unreadCount} new
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

MessagesList.propTypes = {
  onThreadSelect: PropTypes.func.isRequired,
  selectedThreadId: PropTypes.string,
};