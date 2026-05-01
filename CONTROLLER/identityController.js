const identityService = require('../SERVICE/identityService');
const { HTTP_STATUS } = require('../CONFIG/constants');

exports.insertBVN = async (req, res, next) => {
  try {
    const record = await identityService.insertBVN(req.user, req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.insertNIN = async (req, res, next) => {
  try {
    const record = await identityService.insertNIN(req.user, req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.verifyBVN = async (req, res, next) => {
  try {
    const result = await identityService.verifyBVN(req.user, req.body.bvn);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.verifyNIN = async (req, res, next) => {
  try {
    const result = await identityService.verifyNIN(req.user, req.body.nin);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getMyBVN = async (req, res, next) => {
  try {
    const result = await identityService.getMyBVN(req.user);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getMyNIN = async (req, res, next) => {
  try {
    const result = await identityService.getMyNIN(req.user);
    res.status(HTTP_STATUS.OK).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.createBusinessAccount = async (req, res, next) => {
  try {
    const result = await identityService.createBusinessAccount(req.user, req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
