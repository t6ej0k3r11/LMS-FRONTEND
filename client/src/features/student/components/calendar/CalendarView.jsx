import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users, Download, ExternalLink } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PropTypes from 'prop-types';

function CalendarView({ courseId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { get } = useApi();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (courseId) params.append('courseId', courseId);
        params.append('month', currentDate.getMonth() + 1);
        params.append('year', currentDate.getFullYear());

        const response = await get(`/student/calendar/events?${params}`);
        if (response.success) {
          setEvents(response.data);
        } else {
          // Mock data for development
          const mockEvents = [
            {
              _id: '1',
              title: 'React Advanced Patterns Live Session',
              description: 'Join us for an interactive session on advanced React patterns and best practices.',
              type: 'live_session',
              startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 14, 0).toISOString(),
              endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 16, 0).toISOString(),
              courseId: 'course123',
              courseTitle: 'React Development',
              instructor: {
                _id: 'instructor1',
                userName: 'Sarah Johnson',
                role: 'instructor'
              },
              meetingLink: 'https://meet.google.com/abc-defg-hij',
              maxParticipants: 50,
              currentParticipants: 23,
              tags: ['react', 'advanced', 'live']
            },
            {
              _id: '2',
              title: 'Assignment 3 Deadline',
              description: 'Final submission deadline for React Components Assignment',
              type: 'deadline',
              startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 23, 59).toISOString(),
              endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 20, 23, 59).toISOString(),
              courseId: 'course123',
              courseTitle: 'React Development',
              instructor: {
                _id: 'instructor1',
                userName: 'Sarah Johnson',
                role: 'instructor'
              },
              tags: ['assignment', 'deadline', 'react']
            },
            {
              _id: '3',
              title: 'JavaScript Fundamentals Q&A',
              description: 'Open Q&A session for JavaScript fundamentals course',
              type: 'live_session',
              startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25, 10, 0).toISOString(),
              endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25, 11, 30).toISOString(),
              courseId: 'course456',
              courseTitle: 'JavaScript Fundamentals',
              instructor: {
                _id: 'instructor2',
                userName: 'Mike Chen',
                role: 'instructor'
              },
              meetingLink: 'https://zoom.us/j/123456789',
              maxParticipants: 30,
              currentParticipants: 15,
              tags: ['javascript', 'qa', 'fundamentals']
            },
            {
              _id: '4',
              title: 'Final Project Submission',
              description: 'Deadline for final project submission and presentation',
              type: 'deadline',
              startTime: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1, 17, 0).toISOString(),
              endTime: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1, 17, 0).toISOString(),
              courseId: 'course123',
              courseTitle: 'React Development',
              instructor: {
                _id: 'instructor1',
                userName: 'Sarah Johnson',
                role: 'instructor'
              },
              tags: ['project', 'deadline', 'final']
            }
          ];
          setEvents(mockEvents);
        }
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [courseId, currentDate, get]);

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const generateICSFile = (event) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LMS Bangla//Calendar//EN
BEGIN:VEVENT
UID:${event._id}@lms-bangla
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${new Date(event.startTime).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(event.endTime).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.type === 'live_session' ? event.meetingLink : 'Online'}
ORGANIZER;CN=${event.instructor?.userName}:mailto:${event.instructor?.userName}@lms-bangla.com
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'live_session':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'deadline':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'live_session':
        return <Users className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Group events by date for the current month
  const eventsByDate = useMemo(() => {
    const grouped = {};
    events.forEach(event => {
      const date = new Date(event.startTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
  }, [events]);

  // Get events for today
  const todayEvents = useMemo(() => {
    const today = new Date().toDateString();
    return eventsByDate[today] || [];
  }, [eventsByDate]);

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const upcoming = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toDateString();
      const dayEvents = eventsByDate[dateString] || [];
      upcoming.push(...dayEvents.map(event => ({ ...event, daysFromNow: i })));
    }
    return upcoming.slice(0, 5); // Show next 5 upcoming events
  }, [eventsByDate]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Calendar</h2>
          <p className="text-gray-600">Stay on top of your learning schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Events */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No events today</h3>
                <p className="text-gray-600">Enjoy your day off or catch up on your studies!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayEvents.map((event) => (
                  <div
                    key={event._id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type === 'live_session' ? 'Live Session' : 'Deadline'}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.startTime)}
                          {event.endTime && ` - ${formatTime(event.endTime)}`}
                        </span>
                        <span>{event.courseTitle}</span>
                        {event.type === 'live_session' && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.currentParticipants}/{event.maxParticipants}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event._id}
                    className="p-3 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`p-1 rounded ${getEventTypeColor(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">{event.title}</h4>
                        <p className="text-xs text-gray-500">{event.courseTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {event.daysFromNow === 0 ? 'Today' :
                         event.daysFromNow === 1 ? 'Tomorrow' :
                         `In ${event.daysFromNow} days`}
                      </span>
                      <span>{formatTime(event.startTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getEventIcon(selectedEvent.type)}
                  {selectedEvent.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getEventTypeColor(selectedEvent.type)}>
                    {selectedEvent.type === 'live_session' ? 'Live Session' : 'Deadline'}
                  </Badge>
                  <span className="text-sm text-gray-600">{selectedEvent.courseTitle}</span>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{selectedEvent.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(selectedEvent.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    {formatTime(selectedEvent.startTime)}
                    {selectedEvent.endTime && ` - ${formatTime(selectedEvent.endTime)}`}
                  </span>
                </div>
                {selectedEvent.instructor && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{selectedEvent.instructor.userName}</span>
                  </div>
                )}
              </div>

              {selectedEvent.type === 'live_session' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} participants</span>
                  </div>
                  {selectedEvent.meetingLink && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <a
                        href={selectedEvent.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedEvent.tags && selectedEvent.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedEvent.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={() => generateICSFile(selectedEvent)} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
              {selectedEvent.type === 'live_session' && selectedEvent.meetingLink && (
                <Button asChild>
                  <a href={selectedEvent.meetingLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Now
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

CalendarView.propTypes = {
  courseId: PropTypes.string
};

export default CalendarView;