const axios = require('axios');

const nibssClient = axios.create({
  baseURL: process.env.NIBSS_BASE_URL,
  timeout: 10000,
});

// Attach token automatically
nibssClient.interceptors.request.use((config) => {
  if (global.nibssToken) {
    config.headers.Authorization = `Bearer ${global.nibssToken}`;
  }
  return config;
});

module.exports = nibssClient;