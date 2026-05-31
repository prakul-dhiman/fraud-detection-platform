const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // Require authentication for all user routes

router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);

module.exports = router;
