const Account = require('../MODEL/account');
const transactionService = require('./transactionService');
const nibssService = require('../UTILITY/nibssService');
const { normalizeAccount } = require('../UTILITY/nibssHelpers');
const AppError = require('../UTILS/AppError');
const { HTTP_STATUS, ERROR_MESSAGES, CURRENCIES, ACCOUNT_STATUS } = require('../CONFIG/constants');

exports.createAccount = async (user, body) => {
  const existingAccount = await Account.findOne({
  customerId: new mongoose.Types.ObjectId(user._id)
});
  if (existingAccount) {
    throw new AppError(ERROR_MESSAGES.DUPLICATE_ACCOUNT, HTTP_STATUS.CONFLICT, { accountNumber: existingAccount.accountNumber });
  }

  // Validate BVN before creating account
  const bvnValidation = await nibssService.validateBVN(body.bvn, user._id);

  if (!bvnValidation?.valid) {
    throw new AppError('Invalid BVN provided', HTTP_STATUS.BAD_REQUEST);
  }

  const nibssAccount = await nibssService.createAccount(body.kycType, body.kycID, body.dob, user._id);
  const acctData = normalizeAccount(nibssAccount, body);

  if (!acctData?.accountNumber) {
    throw new AppError('No account number returned from NIBSS', HTTP_STATUS.BAD_REQUEST);
  }

  let account;

  try {
    account = await Account.create({
      customerId: user._id,
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
  Account.find({ customerId: userId });

exports.getTransactionHistory = async (userId) =>
  transactionService.getTransactionHistory(userId);
