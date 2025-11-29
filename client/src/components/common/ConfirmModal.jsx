import PropTypes from 'prop-types';
import Modal from './Modal';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

/**
 * Confirmation Modal Component
 * Standardized confirmation dialogs with different variants
 */
function ConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "Confirm Action",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'default',
  loading = false,
  children,
  ...props
}) {
  const variantConfig = {
    default: {
      icon: Info,
      iconColor: 'text-blue-500',
      confirmVariant: 'default',
    },
    destructive: {
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      confirmVariant: 'destructive',
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      confirmVariant: 'default',
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-yellow-500',
      confirmVariant: 'default',
    },
  };

  const config = variantConfig[variant] || variantConfig.default;
  const IconComponent = config.icon;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange?.(false);
    }
  };

  const footer = (
    <>
      <Button
        variant="outline"
        onClick={handleCancel}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button
        variant={config.confirmVariant}
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? 'Processing...' : confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-3">
          <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
          {title}
        </div>
      }
      description={description}
      footer={footer}
      size="sm"
      {...props}
    >
      {children}
    </Modal>
  );
}

ConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'destructive', 'success', 'warning']),
  loading: PropTypes.bool,
  children: PropTypes.node,
};

export default ConfirmModal;