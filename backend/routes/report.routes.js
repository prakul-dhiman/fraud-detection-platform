'use strict';

const express = require('express');
const { getExecutiveReport } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.get('/', getExecutiveReport);

module.exports = router;
