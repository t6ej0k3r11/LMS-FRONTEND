import { Badge } from '../../../components/ui/badge';
import PropTypes from 'prop-types';

export const ProgressBadge = ({ progress }) => {
  const getProgressColor = (progress) => {
    if (progress === 0) return 'bg-gray-100 text-gray-600';
    if (progress < 25) return 'bg-red-100 text-red-700';
    if (progress < 50) return 'bg-orange-100 text-orange-700';
    if (progress < 75) return 'bg-yellow-100 text-yellow-700';
    if (progress < 100) return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  const getProgressText = (progress) => {
    if (progress === 0) return 'Not Started';
    if (progress === 100) return 'Completed';
    return `${progress}%`;
  };

  return (
    <Badge className={`${getProgressColor(progress)} border-0 font-medium text-xs px-2 py-1`}>
      {getProgressText(progress)}
    </Badge>
  );
};

ProgressBadge.propTypes = {
  progress: PropTypes.number.isRequired,
};