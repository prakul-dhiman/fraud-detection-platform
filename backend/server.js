'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transaction.routes');
const healthRoutes = require('./routes/health.routes');
const caseRoutes = require('./routes/case.routes');
const performanceRoutes = require('./routes/performance.routes');
const reportRoutes = require('./routes/report.routes');
const apikeyRoutes = require('./routes/apikey.routes');
const userRoutes = require('./routes/user.routes');

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Express Application ───────────────────────────────────────────────────────
const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Origin '${origin}' is not allowed.`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── Strict Security: Rate Limiting ────────────────────────────────────────────
// Limit each IP to 100 requests per 15 minutes for general API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Extremely strict limit for authentication routes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login/register requests per hour
  message: { success: false, message: 'Too many login attempts from this IP, please try again after an hour' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter); // Apply general limiter to all /api routes

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes); // Apply strict limiter only to auth
app.use('/api/transactions', transactionRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/keys', apikeyRoutes);
app.use('/api', healthRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} — route not found.`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // Log the error (in production you'd use a proper logger like Winston/Pino)
  console.error(`[ERROR] ${req.method} ${req.originalUrl} —`, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({
      success: false,
      message: 'Validation error',
      errors: messages,
    });
  }

  // Mongoose cast error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for field '${err.path}': ${err.value}`,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `Duplicate value: A record with this ${field} already exists.`,
    });
  }

  // JWT errors (should be caught in middleware, but just in case)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token has expired.' });
  }

  // CORS error
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // Generic server error
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 5000;

const server = app.listen(PORT, () => {
  console.log('─'.repeat(50));
  console.log(`[SERVER] Fraud Detection Backend`);
  console.log(`[SERVER] Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`[SERVER] Listening on : http://localhost:${PORT}`);
  console.log(`[SERVER] ML Service   : ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
  console.log('─'.repeat(50));
});

const io = require('socket.io')(server, { cors: { origin: '*' } });
app.locals.io = io;

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER] Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[SERVER] Uncaught Exception:', err.message);
  console.error(err.stack);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; // for testing
