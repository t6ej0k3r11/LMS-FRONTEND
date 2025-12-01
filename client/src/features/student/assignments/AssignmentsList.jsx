import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Calendar, FileText, Upload, Clock, CheckCircle } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useStudentToast } from '../components/ToastProvider';
import PropTypes from 'prop-types';

export const AssignmentsList = ({ courseId = null }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAssignments } = useApi();
  const { showError } = useStudentToast();

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments(courseId);
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const submitted = assignment.submission;

    if (submitted) {
      return <Badge className="bg-green-100 text-green-800">Submitted</Badge>;
    }

    if (dueDate < now) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }

    const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 1) {
      return <Badge className="bg-yellow-100 text-yellow-800">Due Soon</Badge>;
    }

    return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments</h3>
        <p className="text-gray-600">
          {courseId ? 'No assignments available for this course.' : 'No assignments available.'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card key={assignment._id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {assignment.title}
                </h3>
                {getStatusBadge(assignment)}
              </div>

              <p className="text-gray-600 mb-3">{assignment.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {formatDate(assignment.dueDate)}</span>
                </div>

                {assignment.points && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>{assignment.points} points</span>
                  </div>
                )}

                {assignment.submission && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Submitted {formatDate(assignment.submission.submittedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="ml-4">
              {assignment.submission ? (
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-green-600 font-medium">Submitted</p>
                  {assignment.submission.grade && (
                    <p className="text-sm text-gray-600">
                      Grade: {assignment.submission.grade}/{assignment.points}
                    </p>
                  )}
                </div>
              ) : (
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

AssignmentsList.propTypes = {
  courseId: PropTypes.string,
};