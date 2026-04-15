const discussionService = require('../services/discussion.service');

const getDiscussions = async (req, res, next) => {
  try {
    const result = await discussionService.getDiscussions(req.params.filmId, req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getDiscussionById = async (req, res, next) => {
  try {
    const discussion = await discussionService.getDiscussionById(req.params.id);
    res.json({ success: true, data: discussion });
  } catch (err) { next(err); }
};

const createDiscussion = async (req, res, next) => {
  try {
    const discussion = await discussionService.createDiscussion(req.user.id, req.params.filmId, req.body);
    res.status(201).json({ success: true, data: discussion });
  } catch (err) { next(err); }
};

const updateDiscussion = async (req, res, next) => {
  try {
    const discussion = await discussionService.updateDiscussion(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: discussion });
  } catch (err) { next(err); }
};

const deleteDiscussion = async (req, res, next) => {
  try {
    await discussionService.deleteDiscussion(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: 'Discussion deleted' });
  } catch (err) { next(err); }
};

module.exports = { getDiscussions, getDiscussionById, createDiscussion, updateDiscussion, deleteDiscussion };