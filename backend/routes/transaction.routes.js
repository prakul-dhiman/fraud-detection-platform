'use strict';

const express = require('express');
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const {
  predictSingle,
  predictBulk,
  getHistory,
  getStats,
  getAllTransactions,
  getAllUsers,
} = require('../controllers/transaction.controller');

const router = express.Router();

// ── Multer configuration (CSV in memory) ─────────────────────────────────────
const storage = multer.memoryStorage();

const csvFilter = (_req, file, cb) => {
  const allowedMimeTypes = ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain'];
  if (
    allowedMimeTypes.includes(file.mimetype) ||
    file.originalname.toLowerCase().endsWith('.csv')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are accepted for bulk prediction.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: csvFilter,
  limits: {
    fileSize: 150 * 1024 * 1024, // 150 MB max
  },
});

// ── All routes require authentication ────────────────────────────────────────
router.use(protect);

// POST /api/transactions/predict
router.post('/predict', predictSingle);

// POST /api/transactions/predict-bulk
router.post('/predict-bulk', upload.single('file'), predictBulk);

// GET /api/transactions/history
router.get('/history', getHistory);

// GET /api/transactions/stats
router.get('/stats', getStats);

// ── Admin-only routes ─────────────────────────────────────────────────────────

// GET /api/transactions/admin/transactions
router.get('/admin/transactions', adminOnly, getAllTransactions);

// GET /api/transactions/admin/users
router.get('/admin/users', adminOnly, getAllUsers);

// ── Multer error handler for this router ─────────────────────────────────────
router.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum allowed size is 150 MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }
  if (err && err.message && err.message.includes('Only CSV')) {
    return res.status(415).json({
      success: false,
      message: err.message,
    });
  }
  next(err);
});

module.exports = router;
