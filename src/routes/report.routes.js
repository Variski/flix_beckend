const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// POST /api/reports  (any authenticated user)
router.post('/', authenticate, ctrl.createReport);

// GET /api/reports?status=pending  (mod/admin only)
router.get('/', authenticate, authorize('moderator', 'admin'), ctrl.getReports);

// PATCH /api/reports/:id  (mod/admin only) — resolve or reject
router.patch('/:id', authenticate, authorize('moderator', 'admin'), ctrl.resolveReport);

module.exports = router;
