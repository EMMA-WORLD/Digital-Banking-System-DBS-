const nibssService = require('./nibssService');

exports.validateBVN = (bvn, userId = null) =>
  nibssService.validateBVN(bvn, userId);

exports.validateNIN = (nin, userId = null) =>
  nibssService.validateNIN(nin, userId);

exports.insertBVN = (payload, userId = null) =>
  nibssService.insertBVN(payload, userId);

exports.insertNIN = (payload, userId = null) =>
  nibssService.insertNIN(payload, userId);
