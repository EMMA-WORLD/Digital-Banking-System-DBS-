const mongoose = require('mongoose');

const nibssLogSchema = new mongoose.Schema({
  operation: {
    type: String,
    enum: [
      'ACCOUNT_CREATION',
      'BVN_VERIFICATION',
      'NIN_VERIFICATION',
      'TRANSFER',
      'BALANCE_CHECK',
      'FINTECH_CREATION'
    ],
    required: true,
  },

  requestPayload: {
    type: Object,
    required: true,
  },

  responsePayload: {
    type: Object,
  },

  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },

  reference: String, // transactionId or external ref

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  error: String,

}, { timestamps: true });

module.exports = mongoose.model('NibssLog', nibssLogSchema);