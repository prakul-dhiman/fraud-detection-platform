const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // protect all case routes

router.route('/')
  .get(caseController.getAllCases);

router.route('/:id/assign')
  .put(caseController.assignCase);

router.route('/:id/status')
  .put(caseController.updateStatus);

router.route('/:id/comments')
  .post(caseController.addComment);

module.exports = router;
