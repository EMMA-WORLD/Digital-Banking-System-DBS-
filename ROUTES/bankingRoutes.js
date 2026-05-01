const express = require('express');
const router = express.Router();

const bankingController = require('../CONTROLLER/bankingController');
const { protect } = require('../MIDDLEWARE/authMiddleware');
const { validateTransfer, handleValidationErrors } = require('../MIDDLEWARE/validationMiddleware');

// Account creation
router.post('/account', protect, bankingController.createAccount);

// Get authenticated user's saved accounts
router.get('/account', protect, bankingController.getMyAccounts);

// Transaction history for authenticated user
router.get('/transactions', protect, bankingController.getTransactionHistory);

// Balance inquiry with authentication
router.get('/balance/:accountNumber', protect, bankingController.getBalance);

// Transfer with validation
router.post('/transfer',
  protect,
  validateTransfer,
  handleValidationErrors,
  bankingController.transfer
);

module.exports = router;