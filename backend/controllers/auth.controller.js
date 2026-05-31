'use strict';

const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const auditController = require('./audit.controller');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Signs a JWT token for the given userId.
 * @param {string} userId - MongoDB ObjectId as string
 * @returns {string} Signed JWT token
 */
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Sends a JSON response containing the token and user object.
 * @param {object} user - Mongoose User document
 * @param {number} statusCode - HTTP status code
 * @param {object} res - Express response object
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id.toString());

  // Strip the password from the response (in case select: false wasn't applied)
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.__v;

  return res.status(statusCode).json({
    success: true,
    token,
    data: {
      user: userObj,
    },
  });
};

// ── Controller Methods ────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a new user account and returns a JWT.
 */
const register = async (req, res, next) => {
  try {
    // Check express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create user (password is hashed in the pre-save hook)
    const user = await User.create({ name, email, password });

    return createSendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT along with the user object.
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Fetch user WITH password field (it's select: false by default)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare passwords
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Create AuditLog entry
    await auditController.logAction({
      userId: user._id,
      action: 'LOGIN_SUCCESS',
      ipAddress: req.ip || req.connection?.remoteAddress,
      browser: req.headers['user-agent'],
    });

    return createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 * Requires the protect middleware to have run first.
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware (already has password stripped)
    return res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/send-otp
 * Sends a mock 6-digit OTP to the user's email or phone.
 */
const sendOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Email or phone required' });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[MOCK OTP] Sending OTP ${otp} to ${email || phone}`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/verify-otp
 * Verifies the mock OTP and sets isPhoneVerified = true.
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'userId and otp required' });
    }

    // Mock check
    if (otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isPhoneVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, signToken, createSendToken, sendOtp, verifyOtp };
