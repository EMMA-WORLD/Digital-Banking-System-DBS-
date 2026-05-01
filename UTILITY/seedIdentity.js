/**
 * Seed script — insert test BVN and NIN records into NIBSS.
 * Use this to create test identities you can use during development.
 *
 * Usage:
 *   node src/scripts/seed-identity.js
 *
 * Requires MONGO_URI, NIBSS_API_KEY and NIBSS_API_SECRET in .env
 */
require('dotenv').config();
const connectDB = require('../CONFIG/database');
const callNibss = require('../ADAPTER/callNibss');
const { NIBSS_OPERATIONS } = require('../CONFIG/constants');

const testIdentities = [
  {
    type: 'bvn',
    payload: {
      bvn: '22345678901',
      firstName: 'Amaka',
      lastName: 'Okafor',
      dob: '1995-06-15',
      phone: '08099887766',
    },
  },
  {
    type: 'nin',
    payload: {
      nin: '33456789012',
      firstName: 'Chukwuemeka',
      lastName: 'Nwosu',
      dob: '1990-03-22',
    },
  },
];

(async () => {
  await connectDB();

  for (const identity of testIdentities) {
    try {
      const operationType = identity.type === 'bvn'
        ? NIBSS_OPERATIONS.BVN_INSERTION
        : NIBSS_OPERATIONS.NIN_INSERTION;
      const route = identity.type === 'bvn' ? '/api/insertBvn' : '/api/insertNin';

      const response = await callNibss({
        operationType,
        route,
        method: 'post',
        payload: identity.payload,
      });

      console.log(`[OK] ${identity.type.toUpperCase()} seeded:`, response.data);
    } catch (err) {
      console.error(`[FAIL] ${identity.type}:`, err.response?.data || err.message);
    }
  }
})();
