import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from './useApi';
import {
  groupEventsByDate,
  sortEventsByTime,
  filterEventsByType,
  filterEventsByCourse,
  getEventsInDateRange,
  getUpcomingEvents,
  getTodayEvents,
  getLiveEvents,
  formatEventForDisplay
} from '../utils/calendarUtils';

/**
 * Custom hook for calendar and event management
 */
export function useCalendar(courseId = null, initialFilters = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: initialFilters.type || 'all',
    courseId: courseId || initialFilters.courseId || null,
    dateRange: initialFilters.dateRange || null,
    ...initialFilters
  });

  const { get, post, delete: deleteApi } = useApi();

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start);
      if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end);

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
            startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
            endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            courseId: 'course123',
            courseTitle: 'React Development',
            instructor: { _id: 'inst1', userName: 'Sarah Johnson', role: 'instructor' },
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
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            courseId: 'course123',
            courseTitle: 'React Development',
            instructor: { _id: 'inst1', userName: 'Sarah Johnson', role: 'instructor' },
            tags: ['assignment', 'deadline', 'react']
          }
        ];
        setEvents(mockEvents);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters, get]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      type: 'all',
      courseId: courseId || null,
      dateRange: null
    });
  }, [courseId]);

  // Register for event (for live sessions)
  const registerForEvent = useCallback(async (eventId) => {
    try {
      const response = await post(`/student/calendar/events/${eventId}/register`);
      if (response.success) {
        // Update local event data
        setEvents(prev => prev.map(event =>
          event._id === eventId
            ? { ...event, currentParticipants: event.currentParticipants + 1 }
            : event
        ));
        return response.data;
      }
    } catch (err) {
      console.error('Error registering for event:', err);
      throw err;
    }
  }, [post]);

  // Unregister from event
  const unregisterFromEvent = useCallback(async (eventId) => {
    try {
      const response = await deleteApi(`/student/calendar/events/${eventId}/register`);
      if (response.success) {
        // Update local event data
        setEvents(prev => prev.map(event =>
          event._id === eventId
            ? { ...event, currentParticipants: Math.max(0, event.currentParticipants - 1) }
            : event
        ));
        return response.data;
      }
    } catch (err) {
      console.error('Error unregistering from event:', err);
      throw err;
    }
  }, [deleteApi]);

  // Get event by ID
  const getEventById = useCallback((eventId) => {
    return events.find(event => event._id === eventId);
  }, [events]);

  // Processed events based on filters
  const processedEvents = useMemo(() => {
    let filtered = events;

    // Apply filters
    filtered = filterEventsByType(filtered, filters.type);
    filtered = filterEventsByCourse(filtered, filters.courseId);

    if (filters.dateRange) {
      filtered = getEventsInDateRange(filtered, filters.dateRange.start, filters.dateRange.end);
    }

    // Sort by time
    filtered = sortEventsByTime(filtered);

    // Format for display
    return filtered.map(formatEventForDisplay);
  }, [events, filters]);

  // Grouped events
  const eventsByDate = useMemo(() => {
    return groupEventsByDate(processedEvents);
  }, [processedEvents]);

  // Computed values
  const todayEvents = useMemo(() => getTodayEvents(processedEvents), [processedEvents]);
  const upcomingEvents = useMemo(() => getUpcomingEvents(processedEvents, 5), [processedEvents]);
  const liveEvents = useMemo(() => getLiveEvents(processedEvents), [processedEvents]);

  // Event statistics
  const eventStats = useMemo(() => {
    const total = processedEvents.length;
    const liveSessions = processedEvents.filter(e => e.type === 'live_session').length;
    const deadlines = processedEvents.filter(e => e.type === 'deadline').length;
    const live = liveEvents.length;

    return { total, liveSessions, deadlines, live };
  }, [processedEvents, liveEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    // Data
    events: processedEvents,
    eventsByDate,
    todayEvents,
    upcomingEvents,
    liveEvents,
    eventStats,

    // State
    loading,
    error,
    filters,

    // Actions
    fetchEvents,
    updateFilters,
    clearFilters,
    registerForEvent,
    unregisterFromEvent,
    getEventById,

    // Utilities
    refetch: fetchEvents
  };
}