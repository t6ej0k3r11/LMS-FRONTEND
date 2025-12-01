import { Button } from '../../../components/ui/button';
import { Watch, Eye } from 'lucide-react';
import PropTypes from 'prop-types';

export const CourseActions = ({ courseId, isCompleted, onNavigate }) => {
  return (
    <Button
      onClick={() => onNavigate(courseId)}
      className="w-full btn-primary text-sm sm:text-base"
    >
      {isCompleted ? (
        <>
          <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Review Course
        </>
      ) : (
        <>
          <Watch className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Continue Learning
        </>
      )}
    </Button>
  );
};

CourseActions.propTypes = {
  courseId: PropTypes.string.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func.isRequired,
};