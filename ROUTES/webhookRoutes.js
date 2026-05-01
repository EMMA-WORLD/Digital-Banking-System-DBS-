const express = require('express');
const router = express.Router();
const webhookController = require('../CONTROLLER/webhookController');

router.post('/nibss', webhookController.handleNibssWebhook);

module.exports = router;
