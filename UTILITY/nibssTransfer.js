const nibssService = require('./nibssService');

exports.transfer = (data, userId = null) =>
  nibssService.transfer(data.from, data.to, data.amount, userId);

exports.getTransaction = (id, userId = null) =>
  nibssService.getTransactionStatus(id, userId);
