const cinerepostService = require('../services/cinerepost.service');

// POST /api/cinethread/:postId/repost
const repost = async (req, res, next) => {
  try {
    const result = await cinerepostService.repost(req.user.id, req.params.postId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

// DELETE /api/cinethread/:postId/repost
const undoRepost = async (req, res, next) => {
  try {
    await cinerepostService.undoRepost(req.user.id, req.params.postId);
    res.json({ success: true, message: 'Repost removed' });
  } catch (err) { next(err); }
};

module.exports = { repost, undoRepost };
