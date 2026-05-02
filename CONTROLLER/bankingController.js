const { validationResult } = require('express-validator');
const bankingService = require('../SERVICE/bankingService');
const { HTTP_STATUS } = require('../CONFIG/constants');

exports.createAccount = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, errors: errors.array() });
  }

  try {
    const account = await bankingService.createAccount(req.user, req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

exports.getMyAccounts = async (req, res, next) => {
  try {
    const accounts = await bankingService.getMyAccounts(req.user._id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: accounts });
  } catch (error) {
    next(error);
  }
};

exports.getTransactionHistory = async (req, res, next) => {
  try {
    const transactions = await bankingService.getTransactionHistory(req.user._id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

exports.getBalance = async (req, res, next) => {
  try {
    const accountNumber = req.params.accountNumber;
    const balance = await bankingService.getBalance(accountNumber, req.user?._id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: balance });
  } catch (error) {
    next(error);
  }
};

exports.transfer = async (req, res, next) => {
  try {
    const transaction = await bankingService.transfer({
      user: req.user,
      body: req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      idempotencyKey: req.get('Idempotency-Key') || null,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Transfer completed successfully',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};