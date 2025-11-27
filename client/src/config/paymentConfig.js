// Payment Configuration - Centralized for both backend and frontend
export const PAYMENT_CONFIG = {
  // API Base URLs
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  CLIENT_BASE_URL: window.location.origin,

  // Payment Routes
  ROUTES: {
    INIT_ONLINE: '/payments/online/init',
    SUCCESS: '/payment/success',
    FAIL: '/payment/fail',
    CANCEL: '/payment/cancel',
    OFFLINE_SUBMIT: '/payments/offline/submit',
    OFFLINE_LIST: '/payments/offline/list',
    OFFLINE_VERIFY: '/payments/offline/verify',
    OFFLINE_REJECT: '/payments/offline/reject',
    MY_PAYMENTS: '/payments/my-payments',
    PAYMENT_DETAILS: '/payments/details',
    ADMIN_PAYMENTS: '/payments/admin',
    ADMIN_PAYMENT_BY_ID: '/payments/admin',
    ADMIN_UPDATE_STATUS: '/payments/admin/update-status',
  },

  // Payment Methods
  METHODS: {
    SSLCOMMERZ: 'sslcommerz',
    AAMARPAY: 'aamarpay',
    BKASH_MANUAL: 'bkash_manual',
    NAGAD_MANUAL: 'nagad_manual',
    BANK_TRANSFER: 'bank_transfer',
    CASH_OFFICE: 'cash_office',
  },

  // Payment Statuses
  STATUSES: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    VERIFIED: 'verified',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  },

  // Response Format
  RESPONSE_FORMAT: {
    SUCCESS: 'success',
    MESSAGE: 'message',
    DATA: 'data',
  },

  // Field Names
  FIELDS: {
    AMOUNT: 'amount',
    METHOD: 'method',
    TRANSACTION_ID: 'transactionId',
    COURSE_ID: 'courseId',
    STUDENT_ID: 'studentId',
    PROOF_FILE: 'proofFile',
    REFERENCE_NOTE: 'referenceNote',
    STATUS: 'status',
    ADMIN_NOTE: 'adminNote',
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  },

  // Gateway URLs
  GATEWAYS: {
    SSLCOMMERZ: {
      SANDBOX_URL: 'https://sandbox.sslcommerz.com',
      LIVE_URL: 'https://securepay.sslcommerz.com',
    },
    AAMARPAY: {
      SANDBOX_URL: 'https://sandbox.aamarpay.com',
      LIVE_URL: 'https://secure.aamarpay.com',
    },
  },

  // UI Constants
  UI: {
    PAYMENT_METHODS: [
      { value: 'bkash_manual', label: 'bKash', icon: '💳' },
      { value: 'nagad_manual', label: 'Nagad', icon: '📱' },
      { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
      { value: 'cash_office', label: 'Office Cash', icon: '💰' },
    ],
  },
};