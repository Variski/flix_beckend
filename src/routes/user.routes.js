const express = require('express');
const router = express.Router();
const { z } = require('zod');
const ctrl = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

const uuidSchema = z.string().uuid();
const idParamSchema = z.object({ id: uuidSchema });
const userIdParamSchema = z.object({ userId: uuidSchema });

const updateProfileSchema = z.object({
  displayName: z.string().max(50).optional(),
  avatarUrl: z.string().url().max(500).optional(),
});

const banUserSchema = z.object({
  isBanned: z.boolean(),
});

const setRoleSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']),
});

// GET /api/users  (admin only — list all users)
router.get('/', authenticate, authorize('admin'), ctrl.listUsers);

// GET /api/users/:id  (public profile)
router.get('/:id', validate({ params: idParamSchema }), ctrl.getUserProfile);

// GET /api/users/:userId/followers
router.get('/:userId/followers', validate({ params: userIdParamSchema }), require('../controllers/follow.controller').getFollowers);

// GET /api/users/:userId/following
router.get('/:userId/following', validate({ params: userIdParamSchema }), require('../controllers/follow.controller').getFollowing);

// PUT /api/users/me  (update own profile)
router.put('/me', authenticate, validate(updateProfileSchema), ctrl.updateProfile);

// PATCH /api/users/:id/ban  (admin only)
router.patch('/:id/ban', authenticate, authorize('admin'), validate({ params: idParamSchema, body: banUserSchema }), ctrl.banUser);

// PATCH /api/users/:id/role  (admin only)
router.patch('/:id/role', authenticate, authorize('admin'), validate({ params: idParamSchema, body: setRoleSchema }), ctrl.setRole);

// DELETE /api/users/:id  (admin only)
router.delete('/:id', authenticate, authorize('admin'), validate({ params: idParamSchema }), ctrl.deleteUser);

module.exports = router;
