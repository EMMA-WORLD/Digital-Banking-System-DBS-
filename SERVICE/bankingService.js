const Account = require('../MODEL/account');
const transactionService = require('./transactionService');
const nibssService = require('../UTILITY/nibssService');
const { normalizeAccount } = require('../UTILITY/nibssHelpers');
const AppError = require('../UTILS/AppError');
const { HTTP_STATUS, ERROR_MESSAGES, CURRENCIES, ACCOUNT_STATUS } = require('../CONFIG/constants');

exports.createAccount = async (user, body) => {
  // Check if KYC is verified
  if (!user.kycVerified) {
    throw new AppError('KYC verification required before creating account', HTTP_STATUS.BAD_REQUEST);
  }

  const existingAccount = await Account.findOne({
  userId: user._id
});
  if (existingAccount) {
    throw new AppError(ERROR_MESSAGES.DUPLICATE_ACCOUNT, HTTP_STATUS.CONFLICT, { accountNumber: existingAccount.accountNumber });
  }

  const nibssAccount = await nibssService.createAccount(user.kycType, user.kycID, user.dob, user._id);
  const acctData = normalizeAccount(nibssAccount, body);

  if (!acctData?.accountNumber) {
    throw new AppError('No account number returned from NIBSS', HTTP_STATUS.BAD_REQUEST);
  }

  let account;

  try {
    account = await Account.create({
      userId: user._id,
      accountNumber: acctData.accountNumber,
      accountName: acctData.accountName || `${user.firstName} ${user.lastName}`,
      bankCode: acctData.bankCode,
      bankName: acctData.bankName,
      balance: acctData.balance,
    });
  } catch (err) {
    console.error('ACCOUNT SAVE FAILED:', err);
    throw err;
  }

  if (user.accounts && Array.isArray(user.accounts)) {
    user.accounts.push(account._id);
  } else {
    user.accounts = [account._id];
  }
  user.accountStatus = ACCOUNT_STATUS.ACTIVE;
  await user.save();

  return account;
};

exports.getBalance = async (accountNumber, userId = null) =>
  nibssService.getBalance(accountNumber, userId);

exports.transfer = async ({ user, body, ipAddress, userAgent, idempotencyKey }) =>
  transactionService.executeTransfer({ user, payload: body, ipAddress, userAgent, idempotencyKey });

exports.getMyAccounts = async (userId) =>
  Account.find({ userId });

exports.getTransactionHistory = async (userId) =>
  transactionService.getTransactionHistory(userId);
