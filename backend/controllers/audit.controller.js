'use strict';

const AuditLog = require('../models/AuditLog');

/**
 * Logs an action performed by a user.
 * 
 * @param {Object} data 
 * @param {mongoose.Types.ObjectId|string} data.userId
 * @param {string} data.action
 * @param {string} [data.ipAddress]
 * @param {string} [data.deviceOS]
 * @param {string} [data.browser]
 * @param {string} [data.location]
 */
exports.logAction = async (data) => {
  try {
    const log = new AuditLog({
      userId: data.userId,
      action: data.action,
      ipAddress: data.ipAddress,
      deviceOS: data.deviceOS,
      browser: data.browser,
      location: data.location,
    });
    await log.save();
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
