const callNibss = require('../ADAPTER/callNibss');
const { NIBSS_OPERATIONS } = require('../CONFIG/constants');
const { unwrapNibss } = require('./nibssHelpers');

const nibssService = {
  /**
   * Validate BVN against NIBSS identity store.
   * @returns {{ valid: boolean, firstName, lastName, dob }}
   */
  async validateBVN(bvn, userId = null) {
    const response = await callNibss({
      operationType: NIBSS_OPERATIONS.BVN_VERIFICATION,
      route: '/api/validateBvn',
      method: 'post',
      payload: { bvn },
      userId,
    });
    return unwrapNibss(response);
  },

  /**
   * Validate NIN against NIBSS identity store.
   * @returns {{ valid: boolean, firstName, lastName, dob }}
   */
  async validateNIN(nin, userId = null) {
    const response = await callNibss({
      operationType: NIBSS_OPERATIONS.NIN_VERIFICATION,
      route: '/api/validateNin',
      method: 'post',
      payload: { nin },
      userId,
    });
    return unwrapNibss(response);
  },

  // --- Account -------------------------------------------------------------

  /**
   * Create a customer account on NIBSS.
   * @returns {{ accountNumber, bankCode, bankName, balance }}
   */
  async createAccount(kycType, kycID, dob, userId = null) {
    const response = await callNibss({
      operationType: NIBSS_OPERATIONS.ACCOUNT_CREATION,
      route: '/api/account/create',
      method: 'post',
      payload: { kycType, kycID, dob },
      userId,
    });
    return unwrapNibss(response);
  },

  async insertBVN(payload, userId = null) {
    const response = await callNibss({
      operationType: NIBSS_OPERATIONS.BVN_INSERTION,
      route: '/api/insertBvn',
      method: 'post',
      payload,
      userId,
    });
    return unwrapNibss(response);
  },

  async insertNIN(payload, userId = null) {
    const response = await callNibss({
      operationType: NIBSS_OPERATIONS.NIN_INSERTION,
      route: '/api/insertNin',
      method: 'post',
      payload,
      userId,
    });
    return unwrapNibss(response);
  },

  async createBusinessAccount(body, userId = null) {
    const response = await callNibss({
      operationType: NIBSS_OPERATIONS.BUSINESS_ACCOUNT_CREATION,
      route: '/api/account/business/create',
      method: 'post',
      payload: body,
      userId,
    });
    return unwrapNibss(response);
  },

  /**
   * Name enquiry � resolve account number to holder name.
   */
  async nameEnquiry(accountNumber, userId = null) {
    const response = await callNibss({
      operationType: NIBSS_OPERATIONS.NAME_ENQUIRY,
      route: `/api/account/name-enquiry/${accountNumber}`,
      method: 'get',
      payload: {},
      userId,
    });
    return unwrapNibss(response);
  },

  /**
   * Get account balance from NIBSS.
   */
  async getBalance(accountNumber, userId = null) {
    const response = await callNibss({
      operationType: NIBSS_OPERATIONS.BALANCE_INQUIRY,
      route: `/api/account/balance/${accountNumber}`,
      method: 'get',
      payload: {},
      userId,
    });
    return unwrapNibss(response);
  },

  // --- Transfer --------------------------------------------------------------

  /**
   * Initiate a fund transfer.
   * @param {string} from - Sender account number
   * @param {string} to - Recipient account number
   * @param {number} amount - Transfer amount
   * @param {string} userId - User ID for audit logging
   * @param {string} transactionId - Optional MongoDB transaction ID for context
   * @param {object} meta - Optional metadata (e.g., { idempotencyKey })
   * @returns {{ transactionId, amount, from, to, status }}
   */
  async transfer(from, to, amount, userId = null, transactionId = null, meta = {}) {
    const response = await callNibss({
      operationType: NIBSS_OPERATIONS.TRANSFER,
      route: '/api/transfer',
      method: 'post',
      payload: { from, to, amount: String(amount) },
      userId,
      transactionId,
      meta,
    });
    return unwrapNibss(response);
  },

  /**
   * Query transaction status (TSQ).
   */
  async getTransactionStatus(transactionId, userId = null) {
    const response = await callNibss({
      operationType: NIBSS_OPERATIONS.TRANSACTION_STATUS_QUERY,
      route: `/api/transaction/${transactionId}`,
      method: 'get',
      payload: {},
      userId,
    });
    return unwrapNibss(response);
  },
};

module.exports = nibssService;
