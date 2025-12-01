import { useState, useEffect, useRef } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Send, ArrowLeft } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useStudentToast } from '../components/ToastProvider';
import PropTypes from 'prop-types';

export const MessageThread = ({ threadId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const { getMessages, sendMessage } = useApi();
  const { showError, showSuccess } = useStudentToast();

  useEffect(() => {
    if (threadId) {
      fetchThread();
    }
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchThread = async () => {
    try {
      setLoading(true);
      const data = await getMessages(threadId);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching thread:', error);
      showError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      await sendMessage({
        threadId,
        content: newMessage.trim(),
      });

      // Add message to local state for immediate feedback
      const message = {
        _id: Date.now().toString(),
        content: newMessage.trim(),
        sender: 'me',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      showSuccess('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      showError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">Chat</h3>
          <p className="text-xs text-gray-500">Thread #{threadId?.slice(-6)}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 max-w-xs ${message.sender === 'me' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {message.sender === 'me' ? 'Me' : 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg px-3 py-2 ${
                  message.sender === 'me'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

MessageThread.propTypes = {
  threadId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};