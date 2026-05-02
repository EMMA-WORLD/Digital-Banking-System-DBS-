const { validationResult } = require('express-validator');
const User = require('../MODEL/users');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, sendTokenResponse } = require('../CONFIG/jwt');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../CONFIG/constants');
const crypto = require('crypto');
const kycService = require('../SERVICE/kycService');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, dob, gender } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, errors: errors.array() });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: existingUser.email === email ? ERROR_MESSAGES.EMAIL_EXISTS : ERROR_MESSAGES.PHONE_EXISTS,
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      dob,
      gender,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_REGISTERED,
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and select password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;
    await user.save({ validateBeforeSave: false });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
      data: {
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Login failed',
    });
  }
};

// Refresh access token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    const accessToken = generateAccessToken(user._id, user.email);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Token refresh failed',
    });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'If an account with that email exists, a reset code has been sent.',
      });
    }

    // Generate reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const resetCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save({ validateBeforeSave: false });

    // TODO: Send reset code via email/SMS

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'If an account with that email exists, a reset code has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Password reset request failed',
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetCode,
      resetCodeExpiry: { $gt: new Date() },
    }).select('+resetCode +resetCodeExpiry');

    if (!user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid or expired reset code',
      });
    }

    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESSFUL,
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Password reset failed',
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Password change failed',
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // Optionally, you could implement token blacklisting here
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

/**
 * POST /api/auth/verify-kyc
 * Verifies user's KYC using BVN or NIN after login
 */
exports.verifyKyc = async (req, res, next) => {
  try {
    const { kycType, kycID, dob } = req.body;
    const user = await User.findById(req.user._id);

    // Check if already verified
    if (user.kycVerified) {
      return res.status(400).json({ message: 'KYC already verified.' });
    }

    // ── KYC Verification via NIBSS ────────────────────────────────────────────
    let kycData;
    try {
      kycData = await kycService.verifyKyc(kycType, kycID, user._id);
    } catch (nibssErr) {
      return res.status(400).json({
        message: `KYC validation failed: ${nibssErr.response?.data?.message || nibssErr.message}`,
      });
    }

    if (!kycData.valid) {
      return res.status(400).json({ message: `${kycType.toUpperCase()} not found in NIBSS records.` });
    }

    // Cross-check name and DOB returned from NIBSS against what user supplied
    const nibssFirst = (kycData.firstName || '').toLowerCase().trim();
    const nibssLast = (kycData.lastName || '').toLowerCase().trim();
    const suppliedFirst = user.firstName.toLowerCase().trim();
    const suppliedLast = user.lastName.toLowerCase().trim();

    if (nibssFirst !== suppliedFirst || nibssLast !== suppliedLast) {
      return res.status(400).json({
        message: 'Name does not match the identity on record. Please use your legal name.',
      });
    }

    if (kycData.dob !== dob) {
      return res.status(400).json({
        message: 'Date of birth does not match the identity on record.',
      });
    }

    // Update user with KYC info
    user.dob = dob;
    user.kycType = kycType;
    user.kycID = kycID;
    user.kycVerified = true;
    await accountService.createAccount(user);
    user.onboardingStatus = 'verified';
    await user.save();

    res.status(200).json({
      message: 'KYC verification successful. You can now create your bank account.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        kycVerified: user.kycVerified,
        onboardingStatus: user.onboardingStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
exports.getMe = async (req, res) => {
  res.json({ user: req.user._id });
};