/**
 * Calendar and Event Management Utilities
 */

/**
 * Generate ICS file content for calendar integration
 */
export function generateICSContent(event) {
  const formatDateTime = (dateString) => {
    return new Date(dateString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LMS Bangla//Calendar//EN
BEGIN:VEVENT
UID:${event._id}@lms-bangla
DTSTAMP:${formatDateTime(new Date())}
DTSTART:${formatDateTime(event.startTime)}
DTEND:${formatDateTime(event.endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.type === 'live_session' ? event.meetingLink : 'Online'}
ORGANIZER;CN=${event.instructor?.userName}:mailto:${event.instructor?.userName}@lms-bangla.com
${event.tags ? `CATEGORIES:${event.tags.join(',')}` : ''}
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

/**
 * Download ICS file for calendar integration
 */
export function downloadICSFile(event) {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Check if an event is happening now
 */
export function isEventLive(event) {
  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);

  return now >= startTime && now <= endTime;
}

/**
 * Check if an event is upcoming (within next 24 hours)
 */
export function isEventUpcoming(event) {
  const now = new Date();
  const startTime = new Date(event.startTime);
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return startTime > now && startTime <= twentyFourHoursFromNow;
}

/**
 * Check if an event is past
 */
export function isEventPast(event) {
  const now = new Date();
  const endTime = new Date(event.endTime);

  return endTime < now;
}

/**
 * Get time until event starts
 */
export function getTimeUntilEvent(event) {
  const now = new Date();
  const startTime = new Date(event.startTime);
  const diffMs = startTime - now;

  if (diffMs <= 0) return null;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
}

/**
 * Format event duration
 */
export function formatEventDuration(event) {
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const diffMs = endTime - startTime;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
}

/**
 * Group events by date
 */
export function groupEventsByDate(events) {
  return events.reduce((groups, event) => {
    const date = new Date(event.startTime).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});
}

/**
 * Sort events by start time
 */
export function sortEventsByTime(events) {
  return [...events].sort((a, b) => {
    return new Date(a.startTime) - new Date(b.startTime);
  });
}

/**
 * Filter events by type
 */
export function filterEventsByType(events, type) {
  if (!type || type === 'all') return events;
  return events.filter(event => event.type === type);
}

/**
 * Filter events by course
 */
export function filterEventsByCourse(events, courseId) {
  if (!courseId) return events;
  return events.filter(event => event.courseId === courseId);
}

/**
 * Get events for a specific date range
 */
export function getEventsInDateRange(events, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return events.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate >= start && eventDate <= end;
  });
}

/**
 * Get next upcoming events
 */
export function getUpcomingEvents(events, limit = 5) {
  const now = new Date();
  const upcoming = events
    .filter(event => new Date(event.startTime) > now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return upcoming.slice(0, limit);
}

/**
 * Get events happening today
 */
export function getTodayEvents(events) {
  const today = new Date().toDateString();
  return events.filter(event => {
    return new Date(event.startTime).toDateString() === today;
  });
}

/**
 * Get live events (currently happening)
 */
export function getLiveEvents(events) {
  return events.filter(event => isEventLive(event));
}

/**
 * Validate event data
 */
export function validateEvent(event) {
  const errors = [];

  if (!event.title || event.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!event.startTime) {
    errors.push('Start time is required');
  }

  if (!event.endTime) {
    errors.push('End time is required');
  }

  if (event.startTime && event.endTime) {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    if (end <= start) {
      errors.push('End time must be after start time');
    }
  }

  if (event.type === 'live_session' && (!event.meetingLink || event.meetingLink.trim().length === 0)) {
    errors.push('Meeting link is required for live sessions');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Format event for display
 */
export function formatEventForDisplay(event) {
  return {
    ...event,
    formattedStartTime: new Date(event.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    formattedEndTime: new Date(event.endTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    formattedDate: new Date(event.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    duration: formatEventDuration(event),
    isLive: isEventLive(event),
    isUpcoming: isEventUpcoming(event),
    isPast: isEventPast(event),
    timeUntil: getTimeUntilEvent(event)
  };
}