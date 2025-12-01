import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { RotateCcw, Play, X } from 'lucide-react';
import PropTypes from 'prop-types';

export const ResumeBanner = ({
  onResume,
  onStartOver,
  onDismiss,
  className = ''
}) => {
  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <Alert className="border-blue-200 bg-blue-50">
        <RotateCcw className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Incomplete Quiz Found:</strong> You have an unfinished quiz attempt.
            Would you like to resume where you left off or start over?
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button onClick={onResume} size="sm" className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Resume</span>
            </Button>
            <Button onClick={onStartOver} variant="outline" size="sm" className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Start Over</span>
            </Button>
            <Button onClick={onDismiss} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

ResumeBanner.propTypes = {
  onResume: PropTypes.func.isRequired,
  onStartOver: PropTypes.func.isRequired,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
};