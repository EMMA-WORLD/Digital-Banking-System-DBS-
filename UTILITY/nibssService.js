const callNibss = require('../ADAPTER/callNibss');
const { NIBSS_OPERATIONS } = require('../CONFIG/constants');
const { unwrapNibss } = require('./nibssHelpers');


const operationConfig = {
  [NIBSS_OPERATIONS.BVN_VERIFICATION]: {
    route: '/api/validateBvn',
    method: 'post',
    buildPayload: (data) => ({ bvn: data.bvn }),
  },

  [NIBSS_OPERATIONS.NIN_VERIFICATION]: {
    route: '/api/validateNin',
    method: 'post',
    buildPayload: (data) => ({ nin: data.nin }),
  },

  [NIBSS_OPERATIONS.ACCOUNT_CREATION]: {
    route: '/api/account/create',
    method: 'post',
    buildPayload: (data) => ({
      kycType: data.kycType,
      kycID: data.kycID,
      dob: data.dob,
    }),
  },

  [NIBSS_OPERATIONS.NAME_ENQUIRY]: {
    route: (data) => `/api/account/name-enquiry/${data.accountNumber}`,
    method: 'get',
    buildPayload: () => ({}),
  },

  [NIBSS_OPERATIONS.BALANCE_INQUIRY]: {
    route: (data) => `/api/account/balance/${data.accountNumber}`,
    method: 'get',
    buildPayload: () => ({}),
  },

  [NIBSS_OPERATIONS.TRANSFER]: {
    route: '/api/transfer',
    method: 'post',
    buildPayload: (data) => ({
      from: data.from,
      to: data.to,
      amount: String(data.amount),
    }),
  },

  [NIBSS_OPERATIONS.TRANSACTION_STATUS_QUERY]: {
    route: (data) => `/api/transaction/${data.transactionId}`,
    method: 'get',
    buildPayload: () => ({}),
  },
};

const request = async ({ operation, data = {}, userId = null, transactionId = null, meta = {} }) => {
  const config = operationConfig[operation];

  if (!config) {
    throw new Error(`Unsupported NIBSS operation: ${operation}`);
  }

  const route = typeof config.route === 'function'
    ? config.route(data)
    : config.route;

  const payload = config.buildPayload(data);

  const response = await callNibss({
    operationType: operation,
    route,
    method: config.method,
    payload,
    userId,
    transactionId,
    meta,
  });

  return unwrapNibss(response);
};

const nibssService = {
  request,

  // Optional clean wrappers (recommended)
  validateBVN: (bvn, userId) =>
    request({
      operation: NIBSS_OPERATIONS.BVN_VERIFICATION,
      data: { bvn },
      userId,
    }),

  validateNIN: (nin, userId) =>
    request({
      operation: NIBSS_OPERATIONS.NIN_VERIFICATION,
      data: { nin },
      userId,
    }),

  createAccount: (data, userId) =>
    request({
      operation: NIBSS_OPERATIONS.ACCOUNT_CREATION,
      data,
      userId,
    }),

  nameEnquiry: (accountNumber, userId) =>
    request({
      operation: NIBSS_OPERATIONS.NAME_ENQUIRY,
      data: { accountNumber },
      userId,
    }),

  getBalance: (accountNumber, userId) =>
    request({
      operation: NIBSS_OPERATIONS.BALANCE_INQUIRY,
      data: { accountNumber },
      userId,
    }),

  transfer: (data, userId, transactionId, meta) =>
    request({
      operation: NIBSS_OPERATIONS.TRANSFER,
      data,
      userId,
      transactionId,
      meta,
    }),

  getTransactionStatus: (transactionId, userId) =>
    request({
      operation: NIBSS_OPERATIONS.TRANSACTION_STATUS_QUERY,
      data: { transactionId },
      userId,
    }),
};

module.exports = nibssService;