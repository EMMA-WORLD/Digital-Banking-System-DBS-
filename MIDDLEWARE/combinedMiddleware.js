const User = require('../MODEL/users');
const Transaction = require('../MODEL/transactions');
const { verifyAccessToken } = require('../CONFIG/jwt');
const { loginToNibss } = require('../UTILITY/nibssAuth');
const nibssService = require('../UTILITY/nibssService');
const { normalizeAccount } = require('../UTILITY/nibssHelpers');
const { HTTP_STATUS, ERROR_MESSAGES, TRANSACTION_TYPES, TRANSACTION_STATUS } = require('../CONFIG/constants');

/**
 * Combined middleware that handles:
 * 1. User JWT authentication
 * 2. NIBSS API authentication
 * 3. Pre-transfer name enquiry
 * 4. BVN validation for account creation
 * 5. Transaction logging
 */
class CombinedMiddleware {
  // Main authentication middleware - combines user auth + NIBSS auth
  static authenticate = async (req, res, next) => {
    try {
      // 1. User JWT Authentication
      await this.authenticateUser(req, res);

      // 2. NIBSS Authentication
      await this.authenticateNibss(req, res);

      next();
    } catch (error) {
      console.error('Combined authentication error:', error);
      if (!res.headersSent) {
        res.status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: error.message || 'Authentication failed',
        });
      }
    }
  };

  // User authentication
  static authenticateUser = async (req, res) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error = new Error('No authorization token provided');
      error.status = HTTP_STATUS.UNAUTHORIZED;
      throw error;
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      const error = new Error('Invalid or expired token');
      error.status = HTTP_STATUS.UNAUTHORIZED;
      throw error;
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      const error = new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      error.status = HTTP_STATUS.UNAUTHORIZED;
      throw error;
    }

    // Check if password was changed after JWT was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      const error = new Error('Password recently changed. Please login again.');
      error.status = HTTP_STATUS.UNAUTHORIZED;
      throw error;
    }

    // Attach user to request
    req.user = user;
    req.user._id = decoded.userId;
  };

  // NIBSS authentication
  static authenticateNibss = async (req, res) => {
    if (!global.nibssToken) {
      await loginToNibss();
    }
  };

  // BVN validation middleware for account creation
  static validateBVN = async (req, res, next) => {
    try {
      // First ensure authentication
      await this.authenticate(req, res);

      const { bvn } = req.body;

      if (!bvn) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'BVN is required for account creation',
        });
      }

      // Validate BVN with NIBSS
      const bvnResponse = await nibssService.validateBVN(bvn, req.user._id);

      if (!bvnResponse || !bvnResponse.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid BVN provided',
        });
      }

      // Attach BVN validation result to request
      req.bvnValidation = bvnResponse;
      next();
    } catch (error) {
      console.error('BVN validation error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'BVN validation failed',
      });
    }
  };

  // Pre-transfer name enquiry middleware
  static preTransferValidation = async (req, res, next) => {
    try {
      // First ensure authentication
      await this.authenticate(req, res);

      const { recipientAccount, amount, description } = req.body;

      if (!recipientAccount) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Recipient account number is required',
        });
      }

      // Perform name enquiry
      const nameEnquiryResponse = normalizeAccount(await nibssService.nameEnquiry(recipientAccount, req.user._id));

      if (!nameEnquiryResponse || !nameEnquiryResponse.accountName) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Invalid recipient account number',
        });
      }

      // Log transaction attempt
      const transaction = await Transaction.create({
        transactionId: Transaction.generateTransactionId(),
        reference: Transaction.generateReference(),
        type: TRANSACTION_TYPES.TRANSFER,
        amount: amount,
        description: description || 'Transfer',
        senderId: req.user._id,
        senderAccount: req.user.accounts?.[0] || 'N/A', // Assuming first account
        senderName: `${req.user.firstName} ${req.user.lastName}`,
        recipientAccount: recipientAccount,
        recipientName: nameEnquiryResponse.accountName,
        recipientBank: nameEnquiryResponse.bankName || 'Same Bank',
        status: TRANSACTION_STATUS.PENDING,
        initiatedBy: req.user._id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: {
          nameEnquiryResult: nameEnquiryResponse,
        },
      });

      // Attach transaction and name enquiry result to request
      req.transaction = transaction;
      req.nameEnquiry = nameEnquiryResponse;

      next();
    } catch (error) {
      console.error('Pre-transfer validation error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Transfer validation failed',
      });
    }
  };

  // Transaction logging middleware (for successful operations)
  static logTransaction = async (req, res, next) => {
    // Store original response methods
    const originalJson = res.json;
    const originalSend = res.send;
    const originalStatus = res.status;

    let responseData = null;
    let statusCode = 200;

    // Override response methods to capture response
    res.json = function (data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    res.send = function (data) {
      responseData = data;
      return originalSend.call(this, data);
    };

    res.status = function (code) {
      statusCode = code;
      return originalStatus.call(this, code);
    };

    // After response is sent, log transaction if it exists
    res.on('finish', async () => {
      try {
        if (req.transaction && statusCode >= 200 && statusCode < 300) {
          // Update transaction with success
          await req.transaction.markAsSuccessful(responseData?.reference || null);
          req.transaction.nibssResponse = responseData;
          await req.transaction.save();
        } else if (req.transaction && statusCode >= 400) {
          // Update transaction with failure
          await req.transaction.markAsFailed(responseData?.message || 'Request failed');
        }
      } catch (error) {
        console.error('Transaction logging error:', error);
      }
    });

    next();
  };

  // Account creation logging middleware
  static logAccountCreation = async (req, res, next) => {
    const originalJson = res.json;
    let responseData = null;

    res.json = function (data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    res.on('finish', async () => {
      try {
        if (responseData && res.statusCode >= 200 && res.statusCode < 300) {
          // Log account creation as a transaction
          await Transaction.create({
            transactionId: Transaction.generateTransactionId(),
            reference: Transaction.generateReference(),
            type: TRANSACTION_TYPES.DEPOSIT, // Account creation can be treated as initial deposit
            amount: 0, // Initial balance
            description: 'Account creation',
            senderId: req.user._id,
            senderAccount: 'SYSTEM',
            senderName: 'System',
            recipientAccount: responseData.accountNumber || req.body.accountNumber,
            recipientName: `${req.user.firstName} ${req.user.lastName}`,
            status: TRANSACTION_STATUS.SUCCESSFUL,
            initiatedBy: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            nibssResponse: responseData,
            metadata: {
              bvnValidation: req.bvnValidation,
            },
          });
        }
      } catch (error) {
        console.error('Account creation logging error:', error);
      }
    });

    next();
  };
}

module.exports = CombinedMiddleware;