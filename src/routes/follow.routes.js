const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/follow.controller');
const { authenticate } = require('../middleware/auth');

// POST /api/follow/:userId
router.post('/:userId', authenticate, ctrl.follow);

// DELETE /api/follow/:userId
router.delete('/:userId', authenticate, ctrl.unfollow);

// GET /api/follow/:userId/followers
router.get('/:userId/followers', ctrl.getFollowers);

// GET /api/follow/:userId/following
router.get('/:userId/following', ctrl.getFollowing);

module.exports = router;
