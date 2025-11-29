import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Clock, Search } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useStudentContext } from '../../hooks/useStudentContext';
import PropTypes from 'prop-types';

function MessagesList({ onSelectThread, selectedThreadId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read
  const { get, post } = useApi();
  const { user } = useStudentContext();

  // Cache key for messages
  const cacheKey = `messages_cache_${user?._id}`;
  const cacheExpiry = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);

        // Check cache first
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheExpiry) {
            setMessages(data);
            setLoading(false);
            return;
          }
        }

        // Fetch from API
        const response = await get('/student/messages');
        if (response.success) {
          const messageData = response.data;
          setMessages(messageData);

          // Cache the data
          localStorage.setItem(cacheKey, JSON.stringify({
            data: messageData,
            timestamp: Date.now()
          }));
        } else {
          // Mock data for development
          const mockMessages = [
            {
              _id: '1',
              participants: [
                { _id: 'user1', userName: 'John Instructor', role: 'instructor' },
                { _id: user?._id, userName: user?.userName, role: 'student' }
              ],
              lastMessage: {
                content: 'Please check the assignment submission guidelines',
                sender: 'user1',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                read: false
              },
              unreadCount: 2,
              courseId: 'course123',
              courseTitle: 'React Development'
            },
            {
              _id: '2',
              participants: [
                { _id: 'user2', userName: 'Sarah Support', role: 'admin' },
                { _id: user?._id, userName: user?.userName, role: 'student' }
              ],
              lastMessage: {
                content: 'Your payment has been processed successfully',
                sender: 'user2',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                read: true
              },
              unreadCount: 0,
              courseId: null,
              courseTitle: null
            }
          ];
          setMessages(mockMessages);
          localStorage.setItem(cacheKey, JSON.stringify({
            data: mockMessages,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Use cached data if available, even if expired
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data } = JSON.parse(cached);
          setMessages(data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchMessages();
    }
  }, [user?._id, get, cacheKey, cacheExpiry]);

  // Mark message as read
  const markAsRead = async (threadId) => {
    try {
      await post(`/student/messages/${threadId}/read`);
      // Update local state
      setMessages(prev => prev.map(thread =>
        thread._id === threadId
          ? { ...thread, unreadCount: 0, lastMessage: { ...thread.lastMessage, read: true } }
          : thread
      ));

      // Update cache
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data } = JSON.parse(cached);
        const updatedData = data.map(thread =>
          thread._id === threadId
            ? { ...thread, unreadCount: 0, lastMessage: { ...thread.lastMessage, read: true } }
            : thread
        );
        localStorage.setItem(cacheKey, JSON.stringify({
          data: updatedData,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Filter and search messages
  const filteredMessages = useMemo(() => {
    return messages.filter(thread => {
      // Search filter
      const otherParticipant = thread.participants.find(p => p._id !== user?._id);
      const matchesSearch = !searchTerm ||
        otherParticipant?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesFilter = filter === 'all' ||
        (filter === 'unread' && thread.unreadCount > 0) ||
        (filter === 'read' && thread.unreadCount === 0);

      return matchesSearch && matchesFilter;
    });
  }, [messages, searchTerm, filter, user?._id]);

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

  const getOtherParticipant = (thread) => {
    return thread.participants.find(p => p._id !== user?._id);
  };

  const handleSelectThread = (thread) => {
    onSelectThread(thread);
    if (thread.unreadCount > 0) {
      markAsRead(thread._id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
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
    <div className="space-y-4">
      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'unread', label: 'Unread' },
                { value: 'read', label: 'Read' }
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  variant={filter === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-2">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You don\'t have any messages yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((thread) => {
            const otherParticipant = getOtherParticipant(thread);
            const isSelected = selectedThreadId === thread._id;

            return (
              <Card
                key={thread._id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleSelectThread(thread)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {otherParticipant?.userName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">
                            {otherParticipant?.userName || 'Unknown User'}
                          </h3>
                          {otherParticipant?.role === 'instructor' && (
                            <Badge variant="secondary" className="text-xs">
                              Instructor
                            </Badge>
                          )}
                          {thread.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {thread.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(thread.lastMessage?.timestamp)}
                        </span>
                      </div>

                      {thread.courseTitle && (
                        <p className="text-xs text-blue-600 mb-1">
                          {thread.courseTitle}
                        </p>
                      )}

                      <p className="text-sm text-gray-600 truncate">
                        {thread.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

MessagesList.propTypes = {
  onSelectThread: PropTypes.func.isRequired,
  selectedThreadId: PropTypes.string,
};

export default MessagesList;