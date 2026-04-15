const likeService = require('../services/like.service');

const toggleLike = async (req, res, next) => {
  try {
    const result = await likeService.toggleLike(req.user.id, req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { toggleLike };
