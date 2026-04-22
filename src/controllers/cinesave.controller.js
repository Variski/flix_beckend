const cinesaveService = require('../services/cinesave.service');

// POST/DELETE /api/cinethread/:postId/save  (toggle)
const toggleSave = async (req, res, next) => {
  try {
    const result = await cinesaveService.toggleSave(req.user.id, req.params.postId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// GET /api/cinethread/saved
const getSavedPosts = async (req, res, next) => {
  try {
    const result = await cinesaveService.getSavedPosts(req.user.id, req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { toggleSave, getSavedPosts };
