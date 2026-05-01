const mongoose = require('mongoose');
const Account = require('../MODEL/account');
const Transaction = require('../MODEL/transactions');
const nibssService = require('../UTILITY/nibssService');
const { normalizeAccount, unwrapNibss } = require('../UTILITY/nibssHelpers');
const AppError = require('../UTILS/AppError');
const { TRANSACTION_STATUS, TRANSACTION_TYPES, HTTP_STATUS, ERROR_MESSAGES, CURRENCIES } = require('../CONFIG/constants');

const buildTransferPayload = ({ senderAccount, recipientAccount, amount, currency, description, recipientName, recipientBank }) => ({
  senderAccount,
  recipientAccount,
  amount,
  currency,
  description,
  recipientName,
  recipientBank,
});

exports.executeTransfer = async ({ user, payload, ipAddress, userAgent, idempotencyKey = null }) => {
  const senderAccount = await Account.findOne({ userId: user._id });
  if (!senderAccount) {
    throw new AppError(ERROR_MESSAGES.ACCOUNT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const amount = Number(payload.amount);
  if (!amount || amount <= 0) {
    throw new AppError(ERROR_MESSAGES.INVALID_AMOUNT, HTTP_STATUS.BAD_REQUEST);
  }

  if (senderAccount.balance < amount) {
    throw new AppError(ERROR_MESSAGES.INSUFFICIENT_FUNDS, HTTP_STATUS.BAD_REQUEST);
  }

  // Perform name enquiry for recipient
  const recipientAccount = payload.recipientAccount || payload.accountNumber;
  const nameEnquiryResult = normalizeAccount(await nibssService.nameEnquiry(recipientAccount, user._id));
  if (!nameEnquiryResult.accountName) {
    throw new AppError('Invalid recipient account number', HTTP_STATUS.BAD_REQUEST);
  }

  const transaction = await Transaction.create({
    transactionId: Transaction.generateTransactionId(),
    reference: Transaction.generateReference(),
    idempotencyKey,
    type: TRANSACTION_TYPES.TRANSFER,
    amount,
    currency: payload.currency || CURRENCIES.NGN,
    fee: payload.fee || 0,
    description: payload.description || 'NIBSS transfer',
    senderId: user._id,
    senderAccount: senderAccount.accountNumber,
    senderName: `${user.firstName} ${user.lastName}`,
    recipientAccount,
    recipientName: nameEnquiryResult.accountName,
    recipientBank: nameEnquiryResult.bankName || 'NIBSS Bank',
    status: TRANSACTION_STATUS.PENDING,
    initiatedBy: user._id,
    ipAddress,
    userAgent,
    metadata: {
      idempotencyKey,
      requestPayload: payload,
      nameEnquiryResult,
    },
  });

  await transaction.markAsProcessing();

  const nibssPayload = buildTransferPayload({
    senderAccount: transaction.senderAccount,
    recipientAccount: transaction.recipientAccount,
    amount: transaction.amount,
    currency: transaction.currency,
    description: transaction.description,
    recipientName: transaction.recipientName,
    recipientBank: transaction.recipientBank,
  });

  let nibssResponse;
  try {
    nibssResponse = await nibssService.transfer(
      transaction.senderAccount,
      transaction.recipientAccount,
      transaction.amount,
      user._id,
      transaction._id,
      { idempotencyKey }
    );
  } catch (error) {
    await transaction.markAsFailed(error.message);
    throw error;
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const updatedAccount = await Account.findOneAndUpdate(
        { _id: senderAccount._id, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { new: true, session }
      );

      if (!updatedAccount) {
        throw new AppError(ERROR_MESSAGES.INSUFFICIENT_FUNDS, HTTP_STATUS.BAD_REQUEST);
      }

      const transferResult = unwrapNibss(nibssResponse);
      transaction.nibssReference = transferResult.transactionId || transferResult.reference || null;
      transaction.nibssResponse = transferResult;
      transaction.status = TRANSACTION_STATUS.SUCCESSFUL;
      transaction.completedAt = new Date();
      transaction.metadata.updatedAt = new Date();
      await transaction.save({ session });
    });
  } catch (error) {
    await transaction.markAsFailed(error.message);
    throw error;
  } finally {
    session.endSession();
  }

  return transaction;
};

exports.getTransactionHistory = async (userId) =>
  Transaction.find({ initiatedBy: userId }).sort({ createdAt: -1 });

exports.findTransactionByReference = async (reference) =>
  Transaction.findOne({ reference });

exports.handleWebhookUpdate = async ({ reference, status, externalReferenceId, payload }) => {
  const transaction = await Transaction.findOne({ reference }) || await Transaction.findOne({ nibssReference: externalReferenceId });
  if (!transaction) {
    return null;
  }

  if (status === TRANSACTION_STATUS.SUCCESSFUL) {
    await transaction.markAsSuccessful(externalReferenceId, payload);
  } else if (status === TRANSACTION_STATUS.FAILED) {
    await transaction.markAsFailed(payload?.errorMessage || 'Webhook reported failure');
  } else if (status === TRANSACTION_STATUS.PROCESSING) {
    await transaction.markAsProcessing();
  }

  return transaction;
};
