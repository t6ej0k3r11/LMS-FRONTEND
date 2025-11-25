import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, User } from "lucide-react";
import PropTypes from "prop-types";

function Announcements({ courseId }) {
  Announcements.propTypes = {
    courseId: PropTypes.string
  };

  const [announcements, setAnnouncements] = useState([]);

  // Mock announcements data - in real implementation, this would come from API
  useEffect(() => {
    const mockAnnouncements = [
      {
        id: 1,
        title: "Welcome to the Course!",
        content: "Welcome everyone! I'm excited to have you in this course. Please introduce yourself in the Q&A section and let me know what you're hoping to learn.",
        author: "Course Instructor",
        timestamp: "2024-01-10T09:00:00Z",
        type: "welcome",
        isRead: false
      },
      {
        id: 2,
        title: "Assignment Due Date Extended",
        content: "Due to popular request, I've extended the deadline for Assignment 1 to next Friday. Make sure to submit your best work!",
        author: "Course Instructor",
        timestamp: "2024-01-12T14:30:00Z",
        type: "update",
        isRead: false
      },
      {
        id: 3,
        title: "Live Q&A Session This Week",
        content: "I'll be hosting a live Q&A session on Thursday at 7 PM EST. Join us on Zoom to ask questions and get clarifications on the course material.",
        author: "Course Instructor",
        timestamp: "2024-01-08T11:15:00Z",
        type: "event",
        isRead: true
      },
      {
        id: 4,
        title: "Course Update: New Resources Added",
        content: "I've added additional reading materials and practice exercises to Lecture 3. These will help reinforce the concepts we covered.",
        author: "Course Instructor",
        timestamp: "2024-01-05T16:45:00Z",
        type: "resource",
        isRead: true
      }
    ];
    setAnnouncements(mockAnnouncements);
  }, [courseId]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "welcome":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-purple-100 text-purple-800";
      case "resource":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "welcome":
        return "👋";
      case "update":
        return "📢";
      case "event":
        return "📅";
      case "resource":
        return "📚";
      default:
        return "📌";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
        </div>
        <Badge variant="secondary" className="bg-gray-100">
          {announcements.filter(a => !a.isRead).length} new
        </Badge>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No announcements yet</p>
            <p className="text-sm">Announcements from the instructor will appear here.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={`border-gray-200 ${!announcement.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getTypeIcon(announcement.type)}</span>
                    <div>
                      <CardTitle className="text-base text-gray-900">
                        {announcement.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`text-xs ${getTypeColor(announcement.type)}`}>
                          {announcement.type}
                        </Badge>
                        {!announcement.isRead && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatTimestamp(announcement.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3 leading-relaxed">
                  {announcement.content}
                </p>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <User className="h-3 w-3" />
                  <span>Posted by {announcement.author}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Announcement Guidelines */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-green-900 mb-2">📢 About Announcements</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Important course updates and deadlines</li>
            <li>• Schedule changes and live session information</li>
            <li>• New resources and assignment clarifications</li>
            <li>• Check regularly for time-sensitive information</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default Announcements;