'use strict';

const mongoose = require('mongoose');
const axios = require('axios');

exports.getSystemHealth = async (req, res) => {
  const start = Date.now();
  let dbStatus = 'ok';
  let mlStatus = 'ok';

  try {
    if (mongoose.connection.readyState !== 1) {
      dbStatus = 'error';
    }
  } catch (error) {
    dbStatus = 'error';
  }

  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.get(`${mlUrl}/health`, { timeout: 3000 });
    if (response.status !== 200) {
      mlStatus = 'error';
    }
  } catch (error) {
    mlStatus = 'error';
  }

  const latency = `${Date.now() - start}ms`;

  return res.status(200).json({
    backend: 'ok',
    db: dbStatus,
    ml: mlStatus,
    latency,
  });
};
