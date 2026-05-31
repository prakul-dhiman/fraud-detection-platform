'use strict';

const crypto = require('crypto');
const User = require('../models/User');

exports.generateApiKey = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Generate a 32 character string (16 bytes = 32 hex chars)
    const apiKey = crypto.randomBytes(16).toString('hex');
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { apiKey },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      data: {
        apiKey: updatedUser.apiKey
      }
    });
  } catch (error) {
    next(error);
  }
};
