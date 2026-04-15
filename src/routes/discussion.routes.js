const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/discussion.controller');
const replyCtrl = require('../controllers/reply.controller');
const { authenticate } = require('../middleware/auth');

// GET /api/discussions/:id
router.get('/:id', ctrl.getDiscussionById);

// PUT /api/discussions/:id
router.put('/:id', authenticate, ctrl.updateDiscussion);

// DELETE /api/discussions/:id
router.delete('/:id', authenticate, ctrl.deleteDiscussion);

// GET /api/discussions/:id/replies
router.get('/:id/replies', replyCtrl.getReplies);

// POST /api/discussions/:id/replies
router.post('/:id/replies', authenticate, replyCtrl.createReply);

module.exports = router;
