import InlineNotification from './InlineNotification';
import { useNotification } from '@/hooks/useNotification';
import PropTypes from 'prop-types';

/**
 * Notification Container Component
 * Displays multiple inline notifications in a stack
 */
function NotificationContainer({ position = 'top-right', maxNotifications = 5 }) {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
  };

  // Show only the most recent notifications up to maxNotifications
  const visibleNotifications = notifications.slice(-maxNotifications);

  return (
    <div className={`${positionClasses[position]} space-y-2 max-w-sm`}>
      {visibleNotifications.map((notification) => (
        <InlineNotification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          progress={notification.progress}
          total={notification.total}
          onClose={() => removeNotification(notification.id)}
          className="shadow-lg"
        />
      ))}
    </div>
  );
}

NotificationContainer.propTypes = {
  position: PropTypes.oneOf([
    'top-right',
    'top-left',
    'bottom-right',
    'bottom-left',
    'top-center',
    'bottom-center'
  ]),
  maxNotifications: PropTypes.number,
};

export default NotificationContainer;