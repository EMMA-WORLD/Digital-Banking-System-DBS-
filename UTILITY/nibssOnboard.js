/**
 * One-time NIBSS onboarding script.
 * Run ONCE to register your bank with NIBSS and get API credentials.
 *
 * Usage:
 *   BANK_NAME="YourBankName" BANK_EMAIL="you@example.com" node src/scripts/nibss-onboard.js
 *
 * Copy the returned apiKey, apiSecret, bankCode, bankName into your .env file.
 */
require('dotenv').config();
const connectDB = require('../CONFIG/database');
const callNibss = require('../ADAPTER/callNibss');

const bankName = process.env.BANK_NAME;
const bankEmail = process.env.BANK_EMAIL;

if (!bankName || !bankEmail) {
  console.error('Set BANK_NAME and BANK_EMAIL env vars before running.');
  process.exit(1);
}

(async () => {
  try {
    await connectDB();
    console.log(`\nRegistering "${bankName}" with NIBSS...`);

    const response = await callNibss({
      operationType: 'FINTECH_ONBOARD',
      route: '/api/fintech/onboard',
      method: 'post',
      payload: {
        name: bankName,
        email: bankEmail,
      },
    });

    const data = response.data;
    console.log('\nOnboarding successful! Add these to your .env:\n');
    console.log(`NIBSS_API_KEY=${data.apiKey}`);
    console.log(`NIBSS_API_SECRET=${data.apiSecret}`);
    console.log(`BANK_CODE=${data.bankCode}`);
    console.log(`BANK_NAME=${data.bankName}\n`);
  } catch (err) {
    console.error('Onboarding failed:', err.response?.data || err.message);
    process.exit(1);
  }
})();
