const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// PUT /api/reviews/:id
router.put('/:id', authenticate, ctrl.updateReview);

// DELETE /api/reviews/:id  (owner, moderator, or admin)
router.delete('/:id', authenticate, ctrl.deleteReview);

module.exports = router;
