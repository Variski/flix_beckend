const replyService = require('../services/reply.service');

const getReplies = async (req, res, next) => {
  try {
    const replies = await replyService.getReplies(req.params.id);
    res.json({ success: true, data: replies });
  } catch (err) { next(err); }
};

const createReply = async (req, res, next) => {
  try {
    const reply = await replyService.createReply(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, data: reply });
  } catch (err) { next(err); }
};

const updateReply = async (req, res, next) => {
  try {
    const reply = await replyService.updateReply(req.params.id, req.user.id, req.body.body);
    res.json({ success: true, data: reply });
  } catch (err) { next(err); }
};

const deleteReply = async (req, res, next) => {
  try {
    await replyService.deleteReply(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: 'Reply deleted' });
  } catch (err) { next(err); }
};

module.exports = { getReplies, createReply, updateReply, deleteReply };
