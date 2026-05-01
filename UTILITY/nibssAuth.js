const callNibss = require('../ADAPTER/callNibss');

exports.loginToNibss = async () => {
  const response = await callNibss({
    operationType: 'NIBSS_AUTH',
    route: '/api/auth/token',
    method: 'post',
    payload: {
      apiKey: process.env.NIBSS_API_KEY,
      apiSecret: process.env.NIBSS_API_SECRET,
    },
  });

  global.nibssToken = response.data.token;

  return response.data;
};