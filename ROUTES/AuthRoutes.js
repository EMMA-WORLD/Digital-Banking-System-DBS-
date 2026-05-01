const express = require('express');
const authController = require('../CONTROLLER/authController');
const { protect, loginLimiter } = require('../MIDDLEWARE/authMiddleware');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordReset,
  validateNewPassword,
  validateChangePassword,
  handleValidationErrors,
} = require('../MIDDLEWARE/validationMiddleware');

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, handleValidationErrors, authController.register);

router.post('/login', loginLimiter, validateUserLogin, handleValidationErrors, authController.login);

router.post('/refresh-token', authController.refreshToken);

router.post('/request-password-reset', validatePasswordReset, handleValidationErrors, authController.requestPasswordReset);

router.post('/reset-password', validateNewPassword, handleValidationErrors, authController.resetPassword);

// Protected routes
router.post('/verify-kyc', protect, authController.verifyKyc);

router.post('/change-password', protect, validateChangePassword, handleValidationErrors, authController.changePassword);

router.post('/logout', protect, authController.logout);

module.exports = router;
