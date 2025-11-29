import { useRef, useCallback } from 'react';

/**
 * Custom hook for accessibility utilities
 * Provides focus management, keyboard navigation, and ARIA helpers
 */
export function useAccessibility() {
  const focusRef = useRef(null);

  // Focus management
  const focusElement = useCallback((element) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }, []);

  const focusFirstFocusableElement = useCallback((container) => {
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusElement(focusableElements[0]);
    }
  }, [focusElement]);

  const trapFocus = useCallback((container) => {
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            focusElement(lastElement);
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            focusElement(firstElement);
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    focusElement(firstElement);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusElement]);

  // Keyboard navigation helpers
  const handleKeyboardNavigation = useCallback((e, handlers) => {
    const { onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onSpace } = handlers;

    switch (e.key) {
      case 'Enter':
        if (onEnter) {
          e.preventDefault();
          onEnter(e);
        }
        break;
      case 'Escape':
        if (onEscape) {
          e.preventDefault();
          onEscape(e);
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          e.preventDefault();
          onArrowUp(e);
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          e.preventDefault();
          onArrowDown(e);
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          e.preventDefault();
          onArrowLeft(e);
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          e.preventDefault();
          onArrowRight(e);
        }
        break;
      case ' ':
        if (onSpace) {
          e.preventDefault();
          onSpace(e);
        }
        break;
    }
  }, []);

  // ARIA helpers
  const getAriaProps = useCallback((options = {}) => {
    const {
      label,
      labelledBy,
      describedBy,
      expanded,
      hasPopup,
      pressed,
      checked,
      selected,
      disabled,
      required,
      invalid,
      busy,
      live,
      atomic,
      relevant,
    } = options;

    const ariaProps = {};

    if (label) ariaProps['aria-label'] = label;
    if (labelledBy) ariaProps['aria-labelledby'] = labelledBy;
    if (describedBy) ariaProps['aria-describedby'] = describedBy;
    if (expanded !== undefined) ariaProps['aria-expanded'] = expanded;
    if (hasPopup) ariaProps['aria-haspopup'] = hasPopup;
    if (pressed !== undefined) ariaProps['aria-pressed'] = pressed;
    if (checked !== undefined) ariaProps['aria-checked'] = checked;
    if (selected !== undefined) ariaProps['aria-selected'] = selected;
    if (disabled !== undefined) ariaProps['aria-disabled'] = disabled;
    if (required !== undefined) ariaProps['aria-required'] = required;
    if (invalid !== undefined) ariaProps['aria-invalid'] = invalid;
    if (busy !== undefined) ariaProps['aria-busy'] = busy;
    if (live) ariaProps['aria-live'] = live;
    if (atomic !== undefined) ariaProps['aria-atomic'] = atomic;
    if (relevant) ariaProps['aria-relevant'] = relevant;

    return ariaProps;
  }, []);

  // Screen reader announcements
  const announceToScreenReader = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    // Remove after announcement
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }, []);

  // Skip link functionality
  const createSkipLink = useCallback((targetId, label = 'Skip to main content') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
      border-radius: 4px;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    return skipLink;
  }, []);

  return {
    focusRef,
    focusElement,
    focusFirstFocusableElement,
    trapFocus,
    handleKeyboardNavigation,
    getAriaProps,
    announceToScreenReader,
    createSkipLink,
  };
}