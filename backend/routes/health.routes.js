'use strict';

const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

router.get('/system-health', healthController.getSystemHealth);

module.exports = router;
