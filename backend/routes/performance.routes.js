const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performance.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.route('/')
  .get(protect, adminOnly, performanceController.getPerformanceMetrics);

module.exports = router;
