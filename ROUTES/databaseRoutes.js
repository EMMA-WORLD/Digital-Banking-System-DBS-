const express = require('express');
const router = express.Router();
const { protect } = require('../MIDDLEWARE/authMiddleware');
const databaseController = require('../CONTROLLER/databaseController');

// NIBSS / audit log retrieval
router.get('/logs', protect, databaseController.getNibssLogs);

module.exports = router;
