import PropTypes from 'prop-types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

function ProgressBadge({ totalLectures, completedLectures, isCompleted, size = 'default' }) {
  const percentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  const getProgressColor = () => {
    if (isCompleted) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getProgressIcon = () => {
    if (isCompleted) return <CheckCircle className="w-3 h-3" />;
    if (percentage > 0) return <TrendingUp className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2',
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: {
      width: `${percentage}%`,
      transition: { duration: 1, ease: 'easeOut' }
    },
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Badge
          variant="outline"
          className={`${getProgressColor()} ${sizeClasses[size]} font-medium border`}
        >
          {getProgressIcon()}
          <span className="ml-1">
            {isCompleted ? 'Completed' : `${percentage}% Complete`}
          </span>
        </Badge>
        <span className="text-xs text-muted-foreground">
          {completedLectures}/{totalLectures} lectures
        </span>
      </div>

      {!isCompleted && (
        <div className="relative">
          <Progress value={percentage} className="h-2" />
          <motion.div
            className="absolute top-0 left-0 h-2 bg-primary rounded-full"
            variants={progressVariants}
            initial="initial"
            animate="animate"
          />
        </div>
      )}
    </div>
  );
}

ProgressBadge.propTypes = {
  totalLectures: PropTypes.number.isRequired,
  completedLectures: PropTypes.number.isRequired,
  isCompleted: PropTypes.bool.isRequired,
  size: PropTypes.oneOf(['small', 'default', 'large']),
};

ProgressBadge.defaultProps = {
  progress: null,
  size: 'default',
};

export default ProgressBadge;