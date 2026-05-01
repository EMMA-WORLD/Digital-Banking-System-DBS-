const User = require('../MODEL/users');
const BVN = require('../MODEL/bvn');
const NIN = require('../MODEL/nin');
const AppError = require('../UTILS/AppError');
const nibssService = require('../UTILITY/nibssService');
const { unwrapNibss } = require('../UTILITY/nibssHelpers');
const { HTTP_STATUS, KYC_STATUS, VERIFICATION_STATUS } = require('../CONFIG/constants');

exports.verifyBVN = async (user, bvn) => {
  const response = await nibssService.validateBVN(bvn, user._id);
  return unwrapNibss(response);
};

exports.verifyNIN = async (user, nin) => {
  const response = await nibssService.validateNIN(nin, user._id);
  return unwrapNibss(response);
};

exports.insertBVN = async (user, body) => {
  const record = await BVN.findOneAndUpdate(
    { bvnNumber: body.bvn },
    {
      user: user._id,
      bvnNumber: body.bvn,
      firstName: body.firstName,
      lastName: body.lastName,
      dob: body.dob,
      phone: body.phone,
      nibssResponse: null,
      status: VERIFICATION_STATUS.PENDING,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let response;
  try {
    response = await nibssService.insertBVN(body, user._id);
    record.nibssResponse = unwrapNibss(response);
    record.status = VERIFICATION_STATUS.VERIFIED;
    await record.save();

    user.bvn = record._id;
    user.bvnNumber = body.bvn;
    user.kycStatus = KYC_STATUS.VERIFIED;
    user.identityVerified = true;
    user.kycVerifiedAt = new Date();
    await user.save();

    return record;
  } catch (error) {
    record.status = VERIFICATION_STATUS.FAILED;
    record.nibssResponse = error.response?.data || { error: error.message };
    await record.save();
    throw error;
  }
};

exports.insertNIN = async (user, body) => {
  const record = await NIN.findOneAndUpdate(
    { ninNumber: body.nin },
    {
      user: user._id,
      ninNumber: body.nin,
      firstName: body.firstName,
      lastName: body.lastName,
      dob: body.dob,
      nibssResponse: null,
      status: VERIFICATION_STATUS.PENDING,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let response;
  try {
    response = await nibssService.insertNIN(body, user._id);
    record.nibssResponse = unwrapNibss(response);
    record.status = VERIFICATION_STATUS.VERIFIED;
    await record.save();

    user.nin = record._id;
    user.ninNumber = body.nin;
    user.kycStatus = KYC_STATUS.VERIFIED;
    user.identityVerified = true;
    user.kycVerifiedAt = new Date();
    await user.save();

    return record;
  } catch (error) {
    record.status = VERIFICATION_STATUS.FAILED;
    record.nibssResponse = error.response?.data || { error: error.message };
    await record.save();
    throw error;
  }
};

exports.getMyBVN = async (user) => {
  if (!user.bvn) {
    throw new AppError('BVN record not found for this user', HTTP_STATUS.NOT_FOUND);
  }

  return await BVN.findById(user.bvn).lean();
};

exports.getMyNIN = async (user) => {
  if (!user.nin) {
    throw new AppError('NIN record not found for this user', HTTP_STATUS.NOT_FOUND);
  }

  return await NIN.findById(user.nin).lean();
};

exports.createBusinessAccount = async (user, body) => {
  const response = await nibssService.createBusinessAccount(body, user._id);
  return response;
};
