'use strict';

const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

let retryCount = 0;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[DB] MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  const attemptConnection = async () => {
    try {
      await mongoose.connect(uri, options);
      retryCount = 0;
      console.log(`[DB] MongoDB connected successfully — host: ${mongoose.connection.host}`);
    } catch (err) {
      retryCount += 1;
      console.error(`[DB] Connection attempt ${retryCount} failed: ${err.message}`);

      if (retryCount < MAX_RETRIES) {
        console.log(`[DB] Retrying in ${RETRY_INTERVAL_MS / 1000}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(attemptConnection, RETRY_INTERVAL_MS);
      } else {
        console.error('[DB] Max retries reached. Exiting process.');
        process.exit(1);
      }
    }
  };

  await attemptConnection();
};

// ── Mongoose connection event listeners ─────────────────────────────────────

mongoose.connection.on('connected', () => {
  console.log('[DB] Mongoose connection state: connected');
});

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] Mongoose connection state: disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('[DB] Mongoose reconnected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error(`[DB] Mongoose connection error: ${err.message}`);
});

// Graceful shutdown — close the connection when the Node process exits
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('[DB] Mongoose connection closed due to app termination (SIGINT)');
    process.exit(0);
  } catch (err) {
    console.error('[DB] Error closing Mongoose connection:', err.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    await mongoose.connection.close();
    console.log('[DB] Mongoose connection closed due to app termination (SIGTERM)');
    process.exit(0);
  } catch (err) {
    console.error('[DB] Error closing Mongoose connection:', err.message);
    process.exit(1);
  }
});

module.exports = connectDB;
