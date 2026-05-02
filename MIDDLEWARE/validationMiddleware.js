const { body, validationResult, param } = require('express-validator');
const { HTTP_STATUS } = require('../CONFIG/constants');

// Validation error handler middleware
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// User Registration Validation
exports.validateUserRegistration = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .withMessage('Valid phone number is required'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  body('dob').notEmpty().withMessage('Date of birth is required').isISO8601().withMessage('Valid date is required'),
  body('gender').notEmpty().withMessage('Gender is required').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
];

// User Login Validation
exports.validateUserLogin = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Password Reset Validation
exports.validatePasswordReset = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
];

// New Password Validation
exports.validateNewPassword = [
  body('resetCode').notEmpty().withMessage('Reset code is required'),
  body('newPassword').notEmpty().withMessage('New password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

// Change Password Validation
exports.validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must be different from current password'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
];

// Create Account Validation
exports.validateCreateAccount = [
  body('accountType').notEmpty().withMessage('Account type is required').isIn(['Savings', 'Checking', 'Investment', 'MoneyMarket']).withMessage('Invalid account type'),
  body('accountName').trim().notEmpty().withMessage('Account name is required').isLength({ min: 2 }).withMessage('Account name must be at least 2 characters'),
  body('currency').optional().isIn(['NGN', 'USD', 'GBP', 'EUR']).withMessage('Invalid currency'),
];

// Transaction Validation
exports.validateTransaction = [
  body('toAccountId').optional().notEmpty().withMessage('Recipient account ID is required'),
  body('recipientBank').optional().notEmpty().withMessage('Recipient bank is required'),
  body('recipientAccountNumber').optional().notEmpty().withMessage('Recipient account number is required'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0')
    .custom((value) => value <= 100000000)
    .withMessage('Amount exceeds maximum limit'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 3 }).withMessage('Description must be at least 3 characters'),
  body('transactionType').optional().notEmpty().withMessage('Transaction type is required'),
];

// Beneficiary Validation
exports.validateBeneficiary = [
  body('beneficiaryName').trim().notEmpty().withMessage('Beneficiary name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .withMessage('Valid phone number is required'),
  body('accountNumber').trim().notEmpty().withMessage('Account number is required').isLength({ min: 10 }).withMessage('Valid account number is required'),
  body('bankCode').trim().notEmpty().withMessage('Bank code is required'),
  body('bankName').trim().notEmpty().withMessage('Bank name is required'),
];

// Payment Validation
exports.validatePayment = [
  body('payeeId')
    .optional()
    .custom((value) => {
      if (!require('mongoose').Types.ObjectId.isValid(value)) {
        throw new Error('Invalid payee ID');
      }
      return true;
    }),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0')
    .custom((value) => value <= 100000000)
    .withMessage('Amount exceeds maximum limit'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ min: 3 }).withMessage('Description must be at least 3 characters'),
  body('category').notEmpty().withMessage('Category is required').isIn(['bill', 'transfer', 'loan', 'investment', 'education', 'healthcare', 'shopping', 'entertainment', 'subscription', 'other']).withMessage('Invalid category'),
];

// Loan Application Validation
exports.validateLoanApplication = [
  body('loanType').notEmpty().withMessage('Loan type is required').isIn(['personal', 'business', 'auto', 'home', 'education', 'emergency', 'salary_advance']).withMessage('Invalid loan type'),
  body('loanAmount')
    .notEmpty()
    .withMessage('Loan amount is required')
    .isFloat({ min: 1000, max: 100000000 })
    .withMessage('Loan amount must be between 1000 and 100000000'),
  body('loanTerm').notEmpty().withMessage('Loan term is required').isInt({ min: 1, max: 360 }).withMessage('Loan term must be between 1 and 360'),
  body('purpose').trim().notEmpty().withMessage('Purpose is required').isLength({ min: 5 }).withMessage('Purpose must be at least 5 characters'),
];

// OTP Validation
exports.validateOTP = [
  body('otp').notEmpty().withMessage('OTP is required').isLength({ min: 4, max: 6 }).withMessage('OTP must be between 4 and 6 digits'),
];

// Update Profile Validation
exports.validateUpdateProfile = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .withMessage('Valid phone number is required'),
  body('occupation').optional().trim(),
  body('employmentStatus').optional().isIn(['employed', 'self-employed', 'unemployed', 'retired', 'student']).withMessage('Invalid employment status'),
];

// Query Validation
exports.validatePagination = [
  param('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
  param('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// Date Range Validation for Transactions
exports.validateDateRange = [
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

// Fintech Login Validation
exports.validateFintechLogin = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Bank Onboarding Validation
exports.validateBankOnboarding = [
  body('bankName').trim().notEmpty().withMessage('Bank name is required').isLength({ min: 3 }).withMessage('Bank name must be at least 3 characters'),
  body('bankCode').trim().notEmpty().withMessage('Bank code is required').isLength({ min: 2, max: 4 }).withMessage('Bank code must be 2-4 characters'),
  body('bankType').notEmpty().withMessage('Bank type is required').isIn(['commercial', 'microfinance', 'cooperative', 'development', 'merchant']).withMessage('Invalid bank type'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .withMessage('Valid phone number is required'),
];

// Bank Update Validation
exports.validateBankUpdate = [
  body('bankName').optional().trim().isLength({ min: 3 }).withMessage('Bank name must be at least 3 characters'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .withMessage('Valid phone number is required'),
];

// Bank Account Creation Validation
exports.validateBankAccountCreation = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .withMessage('Valid phone number is required'),
  body('nin')
    .optional()
    .matches(/^\d{11}$/)
    .withMessage('NIN must be exactly 11 digits'),
  body('bvn')
    .optional()
    .matches(/^\d{11}$/)
    .withMessage('BVN must be exactly 11 digits'),
];

exports.validateInsertBVN = [
  body('bvn')
    .trim()
    .notEmpty()
    .withMessage('BVN is required')
    .matches(/^\d{11}$/)
    .withMessage('BVN must be exactly 11 digits'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('dob')
    .trim()
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .withMessage('Valid phone number is required'),
];

exports.validateInsertNIN = [
  body('nin')
    .trim()
    .notEmpty()
    .withMessage('NIN is required')
    .matches(/^\d{11}$/)
    .withMessage('NIN must be exactly 11 digits'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('dob')
    .trim()
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
];

// Identity Validation (NIN/BVN)
exports.validateIdentity = [
  body('nin')
    .optional()
    .matches(/^\d{11}$/)
    .withMessage('NIN must be exactly 11 digits'),
  body('bvn')
    .optional()
    .matches(/^\d{11}$/)
    .withMessage('BVN must be exactly 11 digits'),
  body('userId').optional().trim(),
  body()
    .custom((value) => {
      if (!value.nin && !value.bvn) {
        throw new Error('Either NIN or BVN is required');
      }
      return true;
    }),
];

exports.validateTransfer = [
  body('recipientAccount')
    .trim()
    .notEmpty()
    .withMessage('Recipient account number is required')
    .matches(/^[0-9]{10,}$/)
    .withMessage('Recipient account number must be at least 10 digits'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Description must be at least 3 characters'),
  body('recipientBank')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Recipient bank is required'),
];

exports.validateBusinessAccountCreation = [
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business name is required'),
  body('businessRegNumber')
    .trim()
    .notEmpty()
    .withMessage('Business registration number is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Business email is required')
    .isEmail()
    .withMessage('Valid business email is required'),
];

exports.validateWebhookPayload = [
  body('transactionId')
    .optional()
    .trim(),
  body('reference')
    .optional()
    .trim(),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Webhook status is required'),
];

exports.validateBVNVerification = [
  body('bvn')
    .trim()
    .notEmpty()
    .withMessage('BVN is required')
    .matches(/^[0-9]{11}$/)
    .withMessage('BVN must be exactly 11 digits'),
];

exports.validateNINVerification = [
  body('nin')
    .trim()
    .notEmpty()
    .withMessage('NIN is required')
    .matches(/^[0-9]{11}$/)
    .withMessage('NIN must be exactly 11 digits'),
];