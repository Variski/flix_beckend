const express = require('express');
const router = express.Router();
const { z } = require('zod');

const postCtrl    = require('../controllers/cinethread.controller');
const commentCtrl = require('../controllers/cinecomment.controller');
const repostCtrl  = require('../controllers/cinerepost.controller');
const saveCtrl    = require('../controllers/cinesave.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const uuidSchema = z.string().uuid();
const postIdParamSchema = z.object({ postId: uuidSchema });
const commentIdParamSchema = z.object({ commentId: uuidSchema });
const userIdParamSchema = z.object({ userId: uuidSchema });

const pageSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

const feedQuerySchema = pageSchema.extend({
  postType: z.enum(['text', 'film_review', 'film_recommendation', 'poll', 'question']).optional(),
  hashtag: z.string().optional(),
});

const createPostSchema = z.object({
  postType: z.enum(['text', 'film_review', 'film_recommendation', 'poll', 'question']).optional().default('text'),
  content: z.string().max(10000).optional(),
  filmIds: z.array(z.string().uuid()).max(10).optional(),
  hashtags: z.array(z.string()).max(10).optional(),
  media: z.array(z.object({
    mediaType: z.enum(['image', 'gif', 'video']),
    url: z.string().url(),
    altText: z.string().optional(),
  })).max(4).optional(),
});

const updatePostSchema = z.object({
  postType: z.enum(['text', 'film_review', 'film_recommendation', 'poll', 'question']).optional(),
  content: z.string().max(10000).optional(),
});

const commentSchema = z.object({
  content: z.string().max(5000),
  parentCommentId: z.string().uuid().optional(),
});

// ── Feed & User Posts ─────────────────────────────────────────

// GET /api/cinethread/feed?page=&limit=&postType=&hashtag=
router.get('/feed', validate({ query: feedQuerySchema }), postCtrl.getFeed);

// GET /api/cinethread/saved  (auth – harus sebelum /:postId)
router.get('/saved', authenticate, validate({ query: pageSchema }), saveCtrl.getSavedPosts);

// GET /api/cinethread/user/:userId?page=&limit=
router.get('/user/:userId', validate({ params: userIdParamSchema, query: pageSchema }), postCtrl.getPostsByUser);

// ── Comments standalone ───────────────────────────────────────

// GET  /api/cinethread/comments/:commentId/replies
router.get('/comments/:commentId/replies', validate({ params: commentIdParamSchema }), commentCtrl.getReplies);

// POST /api/cinethread/comments/:commentId/reply
router.post('/comments/:commentId/reply', authenticate, validate({ params: commentIdParamSchema, body: commentSchema }), commentCtrl.replyToComment);

// DELETE /api/cinethread/comments/:commentId
router.delete('/comments/:commentId', authenticate, validate({ params: commentIdParamSchema }), commentCtrl.deleteComment);

// ── Post by ID ────────────────────────────────────────────────

// GET /api/cinethread/:postId
router.get('/:postId', validate({ params: postIdParamSchema }), postCtrl.getThread);

// ── Create / Update / Delete post ────────────────────────────

// POST /api/cinethread
router.post('/', authenticate, validate({ body: createPostSchema }), postCtrl.createPost);

// POST /api/cinethread/:postId/thread  (tambah thread lanjutan)
router.post('/:postId/thread', authenticate, validate({ params: postIdParamSchema, body: createPostSchema }), postCtrl.appendThread);

// PATCH /api/cinethread/:postId
router.patch('/:postId', authenticate, validate({ params: postIdParamSchema, body: updatePostSchema }), postCtrl.updatePost);

// DELETE /api/cinethread/:postId
router.delete('/:postId', authenticate, validate({ params: postIdParamSchema }), postCtrl.deletePost);

// ── Comments on post ──────────────────────────────────────────

// GET  /api/cinethread/:postId/comments?page=&limit=
router.get('/:postId/comments', validate({ params: postIdParamSchema, query: pageSchema }), commentCtrl.getComments);

// POST /api/cinethread/:postId/comments
router.post('/:postId/comments', authenticate, validate({ params: postIdParamSchema, body: commentSchema }), commentCtrl.addComment);

// ── Repost ────────────────────────────────────────────────────

// POST   /api/cinethread/:postId/repost
router.post('/:postId/repost', authenticate, validate({ params: postIdParamSchema }), repostCtrl.repost);

// DELETE /api/cinethread/:postId/repost
router.delete('/:postId/repost', authenticate, validate({ params: postIdParamSchema }), repostCtrl.undoRepost);

// ── Save ──────────────────────────────────────────────────────

// POST /api/cinethread/:postId/save  (toggle)
router.post('/:postId/save', authenticate, validate({ params: postIdParamSchema }), saveCtrl.toggleSave);

module.exports = router;
