// Application Constants

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Transaction Status
const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESSFUL: 'successful',
  FAILED: 'failed',
  REVERSED: 'reversed',
  EXPIRED: 'expired',
};

// Transaction Types
const TRANSACTION_TYPES = {
  TRANSFER: 'transfer',
  WITHDRAWAL: 'withdrawal',
  DEPOSIT: 'deposit',
  PAYMENT: 'payment',
  AIRTIME: 'airtime',
  DATAPLAN: 'dataplan',
  BILLPAYMENT: 'billpayment',
  LOANREPAYMENT: 'loanrepayment',
  INTEREST: 'interest',
  FEE: 'fee',
  REVERSAL: 'reversal',
  REFUND: 'refund',
};

// Account Status
const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  DORMANT: 'dormant',
  SUSPENDED: 'suspended',
  CLOSED: 'closed',
};

// Account Types
const ACCOUNT_TYPES = {
  SAVINGS: 'Savings',
  CHECKING: 'Checking',
  INVESTMENT: 'Investment',
  MONEYMARKET: 'MoneyMarket',
};

// User Account Status
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  CLOSED: 'closed',
};

// KYC Status
const KYC_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// Verification Status
const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
  REJECTED: 'rejected',
};

// Risk Levels
const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Loan Status
const LOAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISBURSED: 'disbursed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DEFAULTED: 'defaulted',
  WRITTEN_OFF: 'written_off',
};

// Payment Status
const PAYMENT_STATUS = {
  INITIATED: 'initiated',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// Currency
const CURRENCIES = {
  NGN: 'NGN',
  USD: 'USD',
  GBP: 'GBP',
  EUR: 'EUR',
};

// Default Limits
const DEFAULT_LIMITS = {
  DAILY_WITHDRAWAL: 500000,
  DAILY_TRANSFER: 1000000,
  DAILY_ATM: 100000,
  MONTHLY_TRANSACTION: 10000000,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME: 2 * 60 * 60 * 1000, // 2 hours
};

// Token Expiry
const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '1d',
  REFRESH_TOKEN: '7d',
  OTP: 10 * 60 * 1000, // 10 minutes
  RESET_CODE: 24 * 60 * 60 * 1000, // 24 hours
};

// Pagination
const PAGINATION = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_NOT_FOUND: 'Account not found',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  ACCOUNT_LOCKED: 'Account is locked due to failed login attempts',
  EMAIL_EXISTS: 'Email already exists',
  PHONE_EXISTS: 'Phone number already exists',
  INVALID_OTP: 'Invalid OTP',
  OTP_EXPIRED: 'OTP has expired',
  NETWORK_ERROR: 'Network error occurred',
  DUPLICATE_ACCOUNT: 'Account already exists',
  INVALID_AMOUNT: 'Invalid amount',
  TRANSACTION_FAILED: 'Transaction failed',
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  USER_REGISTERED: 'User registered successfully',
  PASSWORD_RESET_SUCCESSFUL: 'Password reset successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  TRANSACTION_SUCCESS: 'Transaction successful',
  PAYMENT_SUCCESS: 'Payment successful',
  OTP_SENT: 'OTP sent to your email/phone',
  PASSWORD_RESET: 'Password reset successful',
};

const AUDIT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

const NIBSS_OPERATIONS = {
  ACCOUNT_CREATION: 'ACCOUNT_CREATION',
  BALANCE_INQUIRY: 'BALANCE_INQUIRY',
  NAME_ENQUIRY: 'NAME_ENQUIRY',
  TRANSFER: 'TRANSFER',
  TRANSACTION_STATUS_QUERY: 'TRANSACTION_STATUS_QUERY',
  BVN_VERIFICATION: 'BVN_VERIFICATION',
  NIN_VERIFICATION: 'NIN_VERIFICATION',
  BVN_INSERTION: 'BVN_INSERTION',
  NIN_INSERTION: 'NIN_INSERTION',
  BUSINESS_ACCOUNT_CREATION: 'BUSINESS_ACCOUNT_CREATION',
  WEBHOOK_EVENT: 'WEBHOOK_EVENT',
};

module.exports = {
  HTTP_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  ACCOUNT_STATUS,
  ACCOUNT_TYPES,
  USER_STATUS,
  KYC_STATUS,
  VERIFICATION_STATUS,
  RISK_LEVELS,
  LOAN_STATUS,
  PAYMENT_STATUS,
  CURRENCIES,
  DEFAULT_LIMITS,
  TOKEN_EXPIRY,
  PAGINATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  AUDIT_STATUS,
  NIBSS_OPERATIONS,
};
