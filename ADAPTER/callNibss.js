const nibssClient = require('../CONFIG/nibssAdapter');
const AuditLog = require('../MODEL/AuditLog');
const { AUDIT_STATUS } = require('../CONFIG/constants');
const { loginToNibss } = require('../UTILITY/nibssAuth');

module.exports = async function callNibss({
  operationType,
  route,
  method = 'post',
  payload = {},
  userId = null,
  transactionId = null,
  meta = {},
}) {
  let log;

  try {
    if (!global.nibssToken && route !== '/api/auth/token') {
      await loginToNibss();
    }

    log = await AuditLog.create({
      userId,
      transactionId,
      operationType,
      route,
      method: method.toUpperCase(),
      payload,
      status: AUDIT_STATUS.PENDING,
      meta,
    });

    const response = await nibssClient({
      method,
      url: route,
      data: payload,
    });

    log.status = AUDIT_STATUS.SUCCESS;
    log.response = response.data;
    log.externalReferenceId = response.data?.reference || response.data?.transactionId || null;

    await log.save();

    return response;
  } catch (error) {
    if (log) {
      log.status = AUDIT_STATUS.FAILED;
      log.errorMessage = error.message;
      log.response = error.response?.data || null;
      await log.save();
    }

    if (error.response?.status === 401 && route !== '/api/auth/token') {
      global.nibssToken = null;
    }

    throw error;
  }
};

