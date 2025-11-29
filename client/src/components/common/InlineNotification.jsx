import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  X,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import PropTypes from 'prop-types';

/**
 * Inline Notification Component
 * Displays notifications within components with different variants
 */
function InlineNotification({
  type = 'info',
  title,
  message,
  onClose,
  className,
  showCloseButton = true,
  progress,
  total,
  ...props
}) {
  const variantConfig = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
    },
    loading: {
      icon: Loader2,
      iconColor: 'text-blue-600 animate-spin',
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
    },
    progress: {
      icon: Loader2,
      iconColor: 'text-blue-600 animate-spin',
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
    },
  };

  const config = variantConfig[type] || variantConfig.info;
  const IconComponent = config.icon;

  const progressPercentage = progress && total ? Math.round((progress / total) * 100) : 0;

  return (
    <Alert
      className={cn(
        config.bgColor,
        'border relative',
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />

        <div className="flex-1 min-w-0">
          {title && (
            <div className={cn('font-semibold text-sm mb-1', config.textColor)}>
              {title}
            </div>
          )}

          <AlertDescription className={cn('text-sm', config.textColor)}>
            {message}
          </AlertDescription>

          {/* Progress bar for progress type */}
          {type === 'progress' && progress !== undefined && total !== undefined && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {progressPercentage}% complete
              </div>
            </div>
          )}
        </div>

        {showCloseButton && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-transparent"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}

InlineNotification.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info', 'loading', 'progress']),
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  className: PropTypes.string,
  showCloseButton: PropTypes.bool,
  progress: PropTypes.number,
  total: PropTypes.number,
};

export default InlineNotification;