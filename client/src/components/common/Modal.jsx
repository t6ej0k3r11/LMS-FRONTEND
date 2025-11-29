import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Unified Modal Component
 * Provides consistent modal behavior and styling across the application
 */
function Modal({
  children,
  trigger,
  title,
  description,
  footer,
  open,
  onOpenChange,
  size = 'default',
  className,
  contentClassName,
  showCloseButton = true,
  closeOnOutsideClick = true,
  ...props
}) {
  const sizeClasses = {
    sm: 'max-w-md',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      modal={!closeOnOutsideClick}
      {...props}
    >
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}

      <DialogContent
        className={cn(
          'glass-effect border border-white/50 shadow-[0_25px_60px_rgba(12,49,36,0.18)]',
          sizeClasses[size],
          contentClassName
        )}
        onPointerDownOutside={(e) => {
          if (!closeOnOutsideClick) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (!showCloseButton) {
            e.preventDefault();
          }
        }}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle className="text-xl font-semibold text-foreground">{title}</DialogTitle>}
            {description && <DialogDescription className="text-muted-foreground">{description}</DialogDescription>}
          </DialogHeader>
        )}

        <div className={cn('flex-1', className)}>
          {children}
        </div>

        {footer && (
          <DialogFooter className="gap-2">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  trigger: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  footer: PropTypes.node,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'default', 'lg', 'xl', 'full']),
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  showCloseButton: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
};

export default Modal;