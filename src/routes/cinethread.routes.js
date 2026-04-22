const express = require('express');
const router = express.Router();

const postCtrl    = require('../controllers/cinethread.controller');
const commentCtrl = require('../controllers/cinecomment.controller');
const repostCtrl  = require('../controllers/cinerepost.controller');
const saveCtrl    = require('../controllers/cinesave.controller');
const { authenticate } = require('../middleware/auth');

// ── Feed & User Posts ─────────────────────────────────────────

// GET /api/cinethread/feed?page=&limit=&postType=&hashtag=
router.get('/feed', postCtrl.getFeed);

// GET /api/cinethread/saved  (auth – harus sebelum /:postId)
router.get('/saved', authenticate, saveCtrl.getSavedPosts);

// GET /api/cinethread/user/:userId?page=&limit=
router.get('/user/:userId', postCtrl.getPostsByUser);

// ── Comments standalone ───────────────────────────────────────

// GET  /api/cinethread/comments/:commentId/replies
router.get('/comments/:commentId/replies', commentCtrl.getReplies);

// POST /api/cinethread/comments/:commentId/reply
router.post('/comments/:commentId/reply', authenticate, commentCtrl.replyToComment);

// DELETE /api/cinethread/comments/:commentId
router.delete('/comments/:commentId', authenticate, commentCtrl.deleteComment);

// ── Post by ID ────────────────────────────────────────────────

// GET /api/cinethread/:postId
router.get('/:postId', postCtrl.getThread);

// ── Create / Update / Delete post ────────────────────────────

// POST /api/cinethread
router.post('/', authenticate, postCtrl.createPost);

// POST /api/cinethread/:postId/thread  (tambah thread lanjutan)
router.post('/:postId/thread', authenticate, postCtrl.appendThread);

// PATCH /api/cinethread/:postId
router.patch('/:postId', authenticate, postCtrl.updatePost);

// DELETE /api/cinethread/:postId
router.delete('/:postId', authenticate, postCtrl.deletePost);

// ── Comments on post ──────────────────────────────────────────

// GET  /api/cinethread/:postId/comments?page=&limit=
router.get('/:postId/comments', commentCtrl.getComments);

// POST /api/cinethread/:postId/comments
router.post('/:postId/comments', authenticate, commentCtrl.addComment);

// ── Repost ────────────────────────────────────────────────────

// POST   /api/cinethread/:postId/repost
router.post('/:postId/repost', authenticate, repostCtrl.repost);

// DELETE /api/cinethread/:postId/repost
router.delete('/:postId/repost', authenticate, repostCtrl.undoRepost);

// ── Save ──────────────────────────────────────────────────────

// POST /api/cinethread/:postId/save  (toggle)
router.post('/:postId/save', authenticate, saveCtrl.toggleSave);

module.exports = router;
