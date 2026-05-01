const nibssService = require('../UTILITY/nibssService');
const { unwrapNibss } = require('../UTILITY/nibssHelpers');

const kycService = {
  async validateBVN(bvn, userId = null) {
    const response = await nibssService.validateBVN(bvn, userId);
    return unwrapNibss(response);
  },

  async validateNIN(nin, userId = null) {
    const response = await nibssService.validateNIN(nin, userId);
    return unwrapNibss(response);
  },

  async verifyKyc(kycType, kycID, userId = null) {
    if (kycType === 'bvn') {
      return await this.validateBVN(kycID, userId);
    }
    if (kycType === 'nin') {
      return await this.validateNIN(kycID, userId);
    }
    throw new Error('Invalid KYC type. Use "bvn" or "nin".');
  },
};

module.exports = kycService;
