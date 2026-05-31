'use strict';

const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
  },
  country: {
    type: String,
  },
  billingTier: {
    type: String,
    default: 'free',
  },
}, { timestamps: true });

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
