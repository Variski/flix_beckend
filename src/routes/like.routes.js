const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/like.controller');
const { authenticate } = require('../middleware/auth');

// POST /api/likes  — toggle like (like if not liked, unlike if already liked)
// Body: { target_type: "discussion"|"reply", target_id: "uuid" }
router.post('/', authenticate, ctrl.toggleLike);

module.exports = router;
