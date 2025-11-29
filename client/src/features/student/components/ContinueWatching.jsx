import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function ContinueWatching({
  courseId,
  lectureId,
  courseTitle,
  lectureTitle,
  progress,
  remainingTime,
  thumbnail,
  onClick,
}) {
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/course-progress/${courseId}?lecture=${lectureId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="flex items-center gap-4 p-4">
            {/* Thumbnail */}
            <div className="relative flex-shrink-0">
              <img
                src={thumbnail}
                alt={courseTitle}
                className="w-20 h-14 object-cover rounded-md"
                onError={(e) => {
                  e.target.src = '/banner-img.png';
                }}
              />
              <div className="absolute inset-0 bg-black/20 rounded-md flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {courseTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {lectureTitle}
                  </p>
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <Progress value={progress * 100} className="h-1" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress * 100)}% complete</span>
                    {remainingTime > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(remainingTime)} left
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              size="sm"
              onClick={handleClick}
              className="flex-shrink-0"
              aria-label={`Continue watching ${lectureTitle} from ${courseTitle}`}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

ContinueWatching.propTypes = {
  courseId: PropTypes.string.isRequired,
  lectureId: PropTypes.string.isRequired,
  courseTitle: PropTypes.string.isRequired,
  lectureTitle: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  remainingTime: PropTypes.number,
  thumbnail: PropTypes.string,
  onClick: PropTypes.func,
};

ContinueWatching.defaultProps = {
  remainingTime: 0,
  thumbnail: '/banner-img.png',
  onClick: null,
};