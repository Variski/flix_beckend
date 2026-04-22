const cinecommentService = require('../services/cinecomment.service');

// GET /api/cinethread/:postId/comments
const getComments = async (req, res, next) => {
  try {
    const result = await cinecommentService.getComments(req.params.postId, req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// GET /api/cinethread/comments/:commentId/replies
const getReplies = async (req, res, next) => {
  try {
    const result = await cinecommentService.getReplies(req.params.commentId, req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// POST /api/cinethread/:postId/comments
const addComment = async (req, res, next) => {
  try {
    const comment = await cinecommentService.addComment(req.user.id, req.params.postId, req.body);
    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
};

// POST /api/cinethread/comments/:commentId/reply
const replyToComment = async (req, res, next) => {
  try {
    const reply = await cinecommentService.replyToComment(req.user.id, req.params.commentId, req.body);
    res.status(201).json({ success: true, data: reply });
  } catch (err) { next(err); }
};

// DELETE /api/cinethread/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    await cinecommentService.deleteComment(req.params.commentId, req.user.id, req.user.role);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) { next(err); }
};

module.exports = { getComments, getReplies, addComment, replyToComment, deleteComment };
