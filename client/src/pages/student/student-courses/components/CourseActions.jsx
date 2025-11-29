import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Watch, Eye, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

function CourseActions({ courseId, isCompleted, onContinue, onViewDetails }) {
  const navigate = useNavigate();

  const handleContinue = useCallback(() => {
    if (onContinue) {
      onContinue(courseId);
    } else {
      navigate(`/course-progress/${courseId}`);
    }
  }, [courseId, onContinue, navigate]);

  const handleViewDetails = useCallback(() => {
    if (onViewDetails) {
      onViewDetails(courseId);
    } else {
      navigate(`/course/details/${courseId}`);
    }
  }, [courseId, onViewDetails, navigate]);

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleContinue}
        className="flex-1 btn-primary"
        size="sm"
        aria-label={`${isCompleted ? 'Review' : 'Continue'} course`}
      >
        <Watch className="w-4 h-4 mr-2" />
        {isCompleted ? 'Review' : 'Continue'}
      </Button>

      <Button
        onClick={handleViewDetails}
        variant="outline"
        size="sm"
        aria-label="View course details"
      >
        <Eye className="w-4 h-4" />
      </Button>

      {isCompleted && (
        <Button
          onClick={() => navigate(`/student/certificates/${courseId}`)}
          variant="outline"
          size="sm"
          className="text-green-600 border-green-200 hover:bg-green-50"
          aria-label="View certificate"
        >
          <Award className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

CourseActions.propTypes = {
  courseId: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  onContinue: PropTypes.func,
  onViewDetails: PropTypes.func,
};

CourseActions.defaultProps = {
  onContinue: null,
  onViewDetails: null,
};

export default CourseActions;