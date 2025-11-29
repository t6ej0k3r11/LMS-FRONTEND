import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Upload, CheckCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import PropTypes from 'prop-types';

function AssignmentsList({ courseId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API endpoint when backend is ready
        const response = await get(`/student/courses/${courseId}/assignments`);
        if (response.success) {
          setAssignments(response.data);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
        // For now, show mock data
        setAssignments([
          {
            _id: '1',
            title: 'React Components Assignment',
            description: 'Create reusable React components with proper TypeScript types',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            maxPoints: 100,
            submitted: false,
            graded: false,
            attachments: ['assignment-brief.pdf']
          },
          {
            _id: '2',
            title: 'API Integration Project',
            description: 'Build a complete CRUD application with REST API integration',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            maxPoints: 150,
            submitted: true,
            graded: true,
            score: 135,
            attachments: ['api-spec.pdf', 'starter-code.zip']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchAssignments();
    }
  }, [courseId, get]);

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = now > dueDate;

    if (assignment.submitted) {
      if (assignment.graded) {
        return <Badge variant="default" className="bg-green-600">Graded: {assignment.score}/{assignment.maxPoints}</Badge>;
      }
      return <Badge variant="secondary">Submitted</Badge>;
    }

    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }

    const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 1) {
      return <Badge variant="destructive">Due Soon</Badge>;
    }

    return <Badge variant="outline">Pending</Badge>;
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Yet</h3>
          <p className="text-gray-600">Assignments for this course will appear here when available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card key={assignment._id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{assignment.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDueDate(assignment.dueDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {assignment.maxPoints} points
                  </div>
                </div>
              </div>
              {getStatusBadge(assignment)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{assignment.description}</p>

            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments:</h4>
                <div className="flex flex-wrap gap-2">
                  {assignment.attachments.map((attachment, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        // TODO: Implement file download
                        console.log('Download:', attachment);
                      }}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      {attachment}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              {assignment.submitted ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Submitted</span>
                </div>
              ) : (
                <Button className="btn-primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Assignment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

AssignmentsList.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default AssignmentsList;