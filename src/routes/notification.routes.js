const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authenticate, ctrl.getNotifications);

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, ctrl.markAllRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, ctrl.markRead);

// DELETE /api/notifications/:id
router.delete('/:id', authenticate, ctrl.deleteNotification);

module.exports = router;
