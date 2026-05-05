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

router.use((req, res, next) => {
  console.log("🔥 IDENTITY ROUTE HIT:", req.originalUrl);
  next();
});

router.post('/insertbvn', validateInsertBVN, handleValidationErrors, identityController.insertBVN);
router.post('/insertnin', validateInsertNIN, handleValidationErrors, identityController.insertNIN);
router.get('/mybvn', identityController.getMyBVN);
router.get('/mynin', identityController.getMyNIN);

router.post('/verify-bvn', validateBVNVerification, handleValidationErrors, identityController.verifyBVN);
router.post('/verify-nin', validateNINVerification, handleValidationErrors, identityController.verifyNIN);
router.post('/business-account', validateBusinessAccountCreation, handleValidationErrors, identityController.createBusinessAccount);

module.exports = router;
