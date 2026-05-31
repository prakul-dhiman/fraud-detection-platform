'use strict';

const express = require('express');
const { generateApiKey } = require('../controllers/apikey.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.post('/generate', generateApiKey);

module.exports = router;
