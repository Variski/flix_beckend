const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reply.controller');
const { authenticate } = require('../middleware/auth');

// PUT /api/replies/:id
router.put('/:id', authenticate, ctrl.updateReply);

// DELETE /api/replies/:id
router.delete('/:id', authenticate, ctrl.deleteReply);

module.exports = router;
