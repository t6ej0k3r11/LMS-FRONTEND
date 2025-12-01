import { Button } from '../../../components/ui/button';
import { RotateCcw, Eye, Download } from 'lucide-react';
import PropTypes from 'prop-types';

export const RetryReviewControls = ({
  onRetry,
  onReview,
  onExport,
  canRetry = true,
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
      {canRetry && (
        <Button onClick={onRetry} variant="outline" className="flex items-center space-x-2">
          <RotateCcw className="h-4 w-4" />
          <span>Retry Quiz</span>
        </Button>
      )}
      <Button onClick={onReview} variant="outline" className="flex items-center space-x-2">
        <Eye className="h-4 w-4" />
        <span>Review Answers</span>
      </Button>
      <Button onClick={onExport} variant="outline" className="flex items-center space-x-2">
        <Download className="h-4 w-4" />
        <span>Export Results</span>
      </Button>
    </div>
  );
};

RetryReviewControls.propTypes = {
  onRetry: PropTypes.func,
  onReview: PropTypes.func,
  onExport: PropTypes.func,
  canRetry: PropTypes.bool,
  className: PropTypes.string,
};