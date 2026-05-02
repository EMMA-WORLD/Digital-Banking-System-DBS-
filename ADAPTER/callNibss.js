const axios = require('axios');

const callNibss = async ({
  operationType,
  route,
  method = 'get',
  payload = {},
  userId = null,
  transactionId = null,
  meta = {},
}) => {
  const baseURL = process.env.NIBSS_BASE_URL;

  if (!baseURL) {
    throw new Error('NIBSS_BASE_URL is not configured');
  }

  // 🔐 Build headers
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NIBSS_API_KEY,
  };

  if (userId) headers['x-user-id'] = userId.toString();
  if (transactionId) headers['x-transaction-id'] = transactionId.toString();
  if (meta?.idempotencyKey) headers['Idempotency-Key'] = meta.idempotencyKey;

  // ✅ FIX 1: define BEFORE use
  const normalizedMethod = method.toLowerCase();

  try {
    // ✅ FIX 2: proper config block
    const config = {
      url: route,
      method: normalizedMethod,
      baseURL,
      headers,
      timeout: 15000,
    };

    // ✅ FIX 3: attach payload correctly
    if (normalizedMethod === 'get') {
      config.params = payload;
    } else {
      config.data = payload;
    }

    // ✅ Logging
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 NIBSS REQUEST:', {
        operationType,
        method: normalizedMethod,
        url: `${baseURL}${route}`,
        payload,
      });
    }

    const response = await axios(config);

    return {
      success: true,
      data: response.data,
      status: response.status,
      operationType,
    };
  } catch (error) {
    // ✅ FIX 4: define errResponse
    const errResponse = error.response;

    // ✅ FIX 5: timeout handling FIRST
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        status: 504,
        operationType,
        error: {
          message: 'NIBSS request timeout',
          data: null,
        },
      };
    }

    const isNetworkError = !errResponse;

    console.error('❌ NIBSS ERROR:', {
      operationType,
      method: normalizedMethod,
      url: `${baseURL}${route}`,
      error: errResponse?.data || error.message,
    });

    return {
      success: false,
      status: isNetworkError ? 503 : errResponse?.status || 500,
      operationType,
      error: {
        message:
          errResponse?.data?.message ||
          errResponse?.data?.error ||
          error.message ||
          'NIBSS request failed',
        data: errResponse?.data || null,
      },
    };
  }
};

module.exports = callNibss;