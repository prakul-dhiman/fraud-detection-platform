'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — Verifies the JWT and attaches the decoded user to req.user.
 * Expects: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided. Please log in to access this resource.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing. Please log in again.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Your session has expired. Please log in again.',
        });
      }
      if (jwtErr.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid authentication token. Please log in again.',
        });
      }
      if (jwtErr.name === 'NotBeforeError') {
        return res.status(401).json({
          success: false,
          message: 'Token is not yet valid. Please try again later.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please log in again.',
      });
    }

    // Fetch fresh user from DB (ensure user still exists)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * adminOnly — Restricts access to users with role === 'admin'.
 * Must be used AFTER the protect middleware.
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. This resource is restricted to administrators only.',
    });
  }
  next();
};

module.exports = { protect, adminOnly };
