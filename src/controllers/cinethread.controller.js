const cinethreadService = require('../services/cinethread.service');

// GET /api/cinethread/feed
const getFeed = async (req, res, next) => {
  try {
    const result = await cinethreadService.getFeed(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// GET /api/cinethread/user/:userId
const getPostsByUser = async (req, res, next) => {
  try {
    const result = await cinethreadService.getPostsByUser(req.params.userId, req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// GET /api/cinethread/:postId
const getThread = async (req, res, next) => {
  try {
    const result = await cinethreadService.getThread(req.params.postId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// POST /api/cinethread
const createPost = async (req, res, next) => {
  try {
    const post = await cinethreadService.createPost(req.user.id, req.body);
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
};

// POST /api/cinethread/:postId/thread
const appendThread = async (req, res, next) => {
  try {
    const post = await cinethreadService.appendThread(req.user.id, req.params.postId, req.body);
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
};

// PATCH /api/cinethread/:postId
const updatePost = async (req, res, next) => {
  try {
    const post = await cinethreadService.updatePost(req.params.postId, req.user.id, req.body);
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
};

// DELETE /api/cinethread/:postId
const deletePost = async (req, res, next) => {
  try {
    await cinethreadService.deletePost(req.params.postId, req.user.id, req.user.role);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
};

module.exports = { getFeed, getPostsByUser, getThread, createPost, appendThread, updatePost, deletePost };
