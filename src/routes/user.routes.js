const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// GET /api/users  (admin only — list all users)
router.get('/', authenticate, authorize('admin'), ctrl.listUsers);

// GET /api/users/:id  (public profile)
router.get('/:id', ctrl.getUserProfile);

// GET /api/users/:userId/followers
router.get('/:userId/followers', require('../controllers/follow.controller').getFollowers);

// GET /api/users/:userId/following
router.get('/:userId/following', require('../controllers/follow.controller').getFollowing);

// PUT /api/users/me  (update own profile)
router.put('/me', authenticate, ctrl.updateProfile);

// PATCH /api/users/:id/ban  (admin only)
router.patch('/:id/ban', authenticate, authorize('admin'), ctrl.banUser);

// PATCH /api/users/:id/role  (admin only)
router.patch('/:id/role', authenticate, authorize('admin'), ctrl.setRole);

// DELETE /api/users/:id  (admin only)
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteUser);

module.exports = router;
