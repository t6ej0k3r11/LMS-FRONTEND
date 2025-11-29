import PropTypes from 'prop-types';
import { Toaster } from '@/components/ui/toaster';

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};