import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Request a password reset email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Response from the server
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/request-reset`, { email });
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to process password reset request',
    };
  }
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Response from the server
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
      token,
      newPassword,
    });
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to reset password',
      errors: error.response?.data?.errors,
    };
  }
};

export default {
  requestPasswordReset,
  resetPassword,
};
