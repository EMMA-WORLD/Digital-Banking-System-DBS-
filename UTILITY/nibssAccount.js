const nibssService = require('./nibssService');

exports.createAccount = (data, userId = null) =>
  nibssService.createAccount(data.kycType, data.kycID, data.dob, userId);

exports.getBalance = (accountNumber, userId = null) =>
  nibssService.getBalance(accountNumber, userId);

exports.nameEnquiry = (accountNumber, userId = null) =>
  nibssService.nameEnquiry(accountNumber, userId);