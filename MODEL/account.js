const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one account per user
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    bankCode: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 15000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', accountSchema);
