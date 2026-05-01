// JWT Configuration
const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, email) => {
  return jwt.sign(
    {
      userId,
      email,
      type: 'access',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY || '1d',
      algorithm: 'HS256',
    }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      userId,
      type: 'refresh',
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
      algorithm: 'HS256',
    }
  );
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

const sendTokenResponse = (user, statusCode, res, extraData = {}) => {
  const token = generateAccessToken(user._id, user.email);
  res.status(statusCode).json({
    token,
    user,
    ...extraData,
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  sendTokenResponse,
};
