const unwrapNibss = (value) => {
  if (value === undefined || value === null) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if ('data' in value && value.data !== value) {
    return unwrapNibss(value.data);
  }

  return value;
};

const normalizeAccount = (nibssAccount = {}, fallback = {}) => {
  const data = unwrapNibss(nibssAccount) || {};

  const accountNumber =
    data.accountNumber ||
    data.accountNo ||
    data.account_number ||
    fallback.accountNumber ||
    fallback.accountNo ||
    fallback.account_number ||
    null;

  const accountName =
    data.accountName ||
    data.account_name ||
    fallback.accountName ||
    fallback.account_name ||
    null;

  const bankCode =
    data.bankCode ||
    data.bank_code ||
    fallback.bankCode ||
    fallback.bank_code ||
    '000';

  const bankName =
    data.bankName ||
    data.bank_name ||
    fallback.bankName ||
    fallback.bank_name ||
    'NIBSS Bank';

  const balanceValue = data.balance ?? data.amount ?? fallback.balance ?? 0;
  const parsedBalance = Number(balanceValue);

  return {
    ...data,
    accountNumber,
    accountName,
    bankCode,
    bankName,
    balance: Number.isFinite(parsedBalance) ? parsedBalance : 0,
  };
};

module.exports = {
  unwrapNibss,
  normalizeAccount,
};
