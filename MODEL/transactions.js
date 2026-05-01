const mongoose = require('mongoose');
const { TRANSACTION_STATUS, TRANSACTION_TYPES } = require('../CONFIG/constants');

const transactionSchema = new mongoose.Schema(
  {
    // Transaction Details
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
      enum: ['NGN', 'USD', 'GBP', 'EUR'],
    },
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },

    // Parties Involved
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderAccount: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    recipientAccount: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    recipientBank: {
      type: String,
      default: 'Same Bank',
    },

    // Status and Processing
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
    },
    processedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },

    // External API Response
    nibssReference: {
      type: String,
    },
    nibssResponse: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Audit Trail
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },

    // Error Handling
    errorMessage: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
      max: 3,
    },

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
transactionSchema.index({ senderId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ nibssReference: 1 });
transactionSchema.index({ 'metadata.sessionId': 1 });

// Pre-save middleware
transactionSchema.pre('save', function (next) {
  // Auto-expire old pending transactions
  if (this.status === TRANSACTION_STATUS.PENDING && this.isExpired && !this.isModified('status')) {
    this.status = TRANSACTION_STATUS.EXPIRED;
    this.errorMessage = 'Transaction expired due to inactivity';
  }

  // Set processedAt when status changes to processing
  if (this.isModified('status') && this.status === TRANSACTION_STATUS.PROCESSING && !this.processedAt) {
    this.processedAt = new Date();
  }

  // Set completedAt when status changes to successful
  if (this.isModified('status') && this.status === TRANSACTION_STATUS.SUCCESSFUL && !this.completedAt) {
    this.completedAt = new Date();
  }

  next();
});

// Post-save middleware for logging
transactionSchema.post('save', function (doc) {
  // Log status changes for monitoring
  if (doc.isModified('status')) {
    console.log(`Transaction ${doc.transactionId} status changed to ${doc.status}`);
  }
});

// Virtual for total amount (amount + fee)
transactionSchema.virtual('totalAmount').get(function () {
  return this.amount + this.fee;
});

// Virtual for transaction age in hours
transactionSchema.virtual('ageInHours').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for isExpired (transactions older than 24 hours)
transactionSchema.virtual('isExpired').get(function () {
  return this.ageInHours > 24 && this.status === TRANSACTION_STATUS.PENDING;
});

// Virtual for canRetry (failed transactions with retry count < max)
transactionSchema.virtual('canRetry').get(function () {
  return this.status === TRANSACTION_STATUS.FAILED && this.retryCount < 3;
});

// Virtual for isFinal (successful, failed, or reversed)
transactionSchema.virtual('isFinal').get(function () {
  return [TRANSACTION_STATUS.SUCCESSFUL, TRANSACTION_STATUS.FAILED, TRANSACTION_STATUS.REVERSED].includes(this.status);
});

// Instance methods for status management

// Mark transaction as processing
transactionSchema.methods.markAsProcessing = function () {
  if (this.isFinal) {
    throw new Error('Cannot process a transaction that is already in a final state');
  }
  this.status = TRANSACTION_STATUS.PROCESSING;
  this.processedAt = new Date();
  this.errorMessage = null; // Clear any previous errors
  return this.save();
};

// Mark transaction as successful
transactionSchema.methods.markAsSuccessful = function (nibssRef = null, nibssResponse = null) {
  if (this.status === TRANSACTION_STATUS.SUCCESSFUL) {
    throw new Error('Transaction is already marked as successful');
  }
  this.status = TRANSACTION_STATUS.SUCCESSFUL;
  this.completedAt = new Date();
  if (nibssRef) this.nibssReference = nibssRef;
  if (nibssResponse) this.nibssResponse = nibssResponse;
  this.errorMessage = null; // Clear any errors
  return this.save();
};

// Mark transaction as failed
transactionSchema.methods.markAsFailed = function (errorMessage = null) {
  if (this.status === TRANSACTION_STATUS.FAILED) {
    throw new Error('Transaction is already marked as failed');
  }
  this.status = TRANSACTION_STATUS.FAILED;
  this.errorMessage = errorMessage || 'Transaction failed';
  this.retryCount += 1;
  return this.save();
};

// Mark transaction as reversed
transactionSchema.methods.markAsReversed = function (reason = null) {
  if (this.status !== TRANSACTION_STATUS.SUCCESSFUL) {
    throw new Error('Only successful transactions can be reversed');
  }
  this.status = TRANSACTION_STATUS.REVERSED;
  this.errorMessage = reason || 'Transaction reversed';
  return this.save();
};

// Mark transaction as expired
transactionSchema.methods.markAsExpired = function () {
  if (this.status !== TRANSACTION_STATUS.PENDING) {
    throw new Error('Only pending transactions can be expired');
  }
  this.status = TRANSACTION_STATUS.EXPIRED;
  this.errorMessage = 'Transaction expired due to inactivity';
  return this.save();
};

// Retry transaction (reset to pending and increment retry count)
transactionSchema.methods.retry = function () {
  if (!this.canRetry) {
    throw new Error('Transaction cannot be retried');
  }
  this.status = TRANSACTION_STATUS.PENDING;
  this.retryCount += 1;
  this.processedAt = null;
  this.completedAt = null;
  this.errorMessage = null;
  this.nibssReference = null;
  this.nibssResponse = null;
  return this.save();
};

// Update transaction metadata
transactionSchema.methods.updateMetadata = function (metadata) {
  this.metadata = { ...this.metadata, ...metadata };
  return this.save();
};

// Add audit log entry
transactionSchema.methods.addAuditLog = function (action, details = {}) {
  if (!this.metadata.auditLog) {
    this.metadata.auditLog = [];
  }
  this.metadata.auditLog.push({
    action,
    timestamp: new Date(),
    details,
  });
  return this.save();
};

// Check if transaction can be cancelled
transactionSchema.methods.canCancel = function () {
  return [TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.PROCESSING].includes(this.status) && !this.isExpired;
};

// Cancel transaction
transactionSchema.methods.cancel = function (reason = 'Cancelled by user') {
  if (!this.canCancel) {
    throw new Error('Transaction cannot be cancelled');
  }
  this.status = TRANSACTION_STATUS.FAILED;
  this.errorMessage = reason;
  return this.save();
};

// Get transaction summary
transactionSchema.methods.getSummary = function () {
  return {
    transactionId: this.transactionId,
    reference: this.reference,
    type: this.type,
    amount: this.amount,
    fee: this.fee,
    totalAmount: this.totalAmount,
    status: this.status,
    senderName: this.senderName,
    recipientName: this.recipientName,
    createdAt: this.createdAt,
    processedAt: this.processedAt,
    completedAt: this.completedAt,
    isExpired: this.isExpired,
    canRetry: this.canRetry,
    ageInHours: this.ageInHours,
  };
};

// Static method to generate transaction ID
transactionSchema.statics.generateTransactionId = function () {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TXN${timestamp}${random}`;
};

// Static method to generate reference
transactionSchema.statics.generateReference = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Static methods for queries

// Find transactions by user
transactionSchema.statics.findByUser = function (userId, options = {}) {
  const query = this.find({ senderId: userId });
  if (options.status) query.where('status').equals(options.status);
  if (options.type) query.where('type').equals(options.type);
  if (options.limit) query.limit(options.limit);
  if (options.skip) query.skip(options.skip);
  return query.sort({ createdAt: -1 });
};

// Find transactions by status
transactionSchema.statics.findByStatus = function (status, options = {}) {
  const query = this.find({ status });
  if (options.limit) query.limit(options.limit);
  if (options.skip) query.skip(options.skip);
  return query.sort({ createdAt: -1 });
};

// Find expired transactions
transactionSchema.statics.findExpired = function () {
  return this.find({
    status: TRANSACTION_STATUS.PENDING,
    createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Older than 24 hours
  });
};

// Find transactions that can be retried
transactionSchema.statics.findRetryable = function () {
  return this.find({
    status: TRANSACTION_STATUS.FAILED,
    retryCount: { $lt: 3 },
  });
};

// Get transaction statistics
transactionSchema.statics.getStats = async function (userId = null, dateRange = null) {
  const matchConditions = {};
  if (userId) matchConditions.senderId = userId;
  if (dateRange) {
    matchConditions.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end,
    };
  }

  const stats = await this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: '$fee' },
        successfulCount: {
          $sum: { $cond: [{ $eq: ['$status', TRANSACTION_STATUS.SUCCESSFUL] }, 1, 0] },
        },
        failedCount: {
          $sum: { $cond: [{ $eq: ['$status', TRANSACTION_STATUS.FAILED] }, 1, 0] },
        },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', TRANSACTION_STATUS.PENDING] }, 1, 0] },
        },
        processingCount: {
          $sum: { $cond: [{ $eq: ['$status', TRANSACTION_STATUS.PROCESSING] }, 1, 0] },
        },
      },
    },
  ]);

  return stats[0] || {
    totalTransactions: 0,
    totalAmount: 0,
    totalFees: 0,
    successfulCount: 0,
    failedCount: 0,
    pendingCount: 0,
    processingCount: 0,
  };
};

// Process expired transactions
transactionSchema.statics.processExpired = async function () {
  const expiredTransactions = await this.findExpired();
  const updates = expiredTransactions.map(tx => tx.markAsExpired());
  return Promise.all(updates);
};

// Bulk update status
transactionSchema.statics.bulkUpdateStatus = async function (transactionIds, newStatus, reason = null) {
  const updateData = { status: newStatus };
  if (reason && newStatus === TRANSACTION_STATUS.FAILED) {
    updateData.errorMessage = reason;
  }
  if (newStatus === TRANSACTION_STATUS.SUCCESSFUL) {
    updateData.completedAt = new Date();
  }

  return this.updateMany(
    { _id: { $in: transactionIds } },
    { $set: updateData }
  );
};

module.exports = mongoose.model('Transaction', transactionSchema);