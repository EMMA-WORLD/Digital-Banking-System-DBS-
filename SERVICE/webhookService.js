const AuditLog = require('../MODEL/AuditLog');
const Transaction = require('../MODEL/transactions');
const { TRANSACTION_STATUS, AUDIT_STATUS, NIBSS_OPERATIONS } = require('../CONFIG/constants');

exports.handleNibssWebhook = async (payload) => {
  const log = {
    operationType: NIBSS_OPERATIONS.WEBHOOK_EVENT,
    route: '/webhook/nibss',
    method: 'POST',
    payload,
    status: AUDIT_STATUS.SUCCESS,
    response: null,
    meta: {
      eventType: payload.eventType || payload.status || 'unknown',
    },
  };

  try {
    const externalReferenceId = payload.transactionId || payload.reference || payload.externalId;
    const reference = payload.reference || payload.transactionId || payload.nibssReference;
    const transaction = await Transaction.findOne({ reference }) || await Transaction.findOne({ nibssReference: externalReferenceId });

    if (!transaction) {
      log.status = AUDIT_STATUS.FAILED;
      log.errorMessage = 'Transaction not found for webhook payload';
      await AuditLog.create(log);
      return { matched: false };
    }

    const status = payload.status?.toLowerCase();
    if (status === TRANSACTION_STATUS.SUCCESSFUL) {
      await transaction.markAsSuccessful(externalReferenceId, payload);
    } else if (status === TRANSACTION_STATUS.FAILED) {
      await transaction.markAsFailed(payload.errorMessage || 'Failed via webhook');
    } else if (status === TRANSACTION_STATUS.PROCESSING) {
      await transaction.markAsProcessing();
    }

    log.response = { transactionId: transaction.transactionId, status: transaction.status };
    await AuditLog.create(log);

    return { matched: true, transactionId: transaction.transactionId, status: transaction.status };
  } catch (error) {
    log.status = AUDIT_STATUS.FAILED;
    log.errorMessage = error.message;
    await AuditLog.create(log);
    throw error;
  }
};
