const express = require('express');
const router = express.Router();

const identityController = require('../CONTROLLER/identityController');
const {
  validateInsertBVN,
  validateInsertNIN,
  validateBVNVerification,
  validateNINVerification,
  validateBusinessAccountCreation,
  handleValidationErrors,
} = require('../MIDDLEWARE/validationMiddleware');
const { protect } = require('../MIDDLEWARE/authMiddleware');

router.post('/insertbvn', protect, validateInsertBVN, handleValidationErrors, identityController.insertBVN);
router.post('/insertnin', protect, validateInsertNIN, handleValidationErrors, identityController.insertNIN);
router.get('/mybvn', protect, identityController.getMyBVN);
router.get('/mynin', protect, identityController.getMyNIN);

router.post('/verify-bvn', protect, validateBVNVerification, handleValidationErrors, identityController.verifyBVN);
router.post('/verify-nin', protect, validateNINVerification, handleValidationErrors, identityController.verifyNIN);
router.post('/business-account', protect, validateBusinessAccountCreation, handleValidationErrors, identityController.createBusinessAccount);

module.exports = router;
