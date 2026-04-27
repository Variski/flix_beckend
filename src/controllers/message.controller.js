const msgService = require('../services/message.service');

// ─── Message Requests ─────────────────────────────────────────────────────────

const sendRequest = async (req, res, next) => {
  try {
    const result = await msgService.sendRequest(req.user.id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getRequests = async (req, res, next) => {
  try {
    const requests = await msgService.getIncomingRequests(req.user.id);
    res.json({ success: true, data: requests });
  } catch (err) { next(err); }
};

const respondRequest = async (req, res, next) => {
  try {
    const result = await msgService.respondRequest(req.params.requestId, req.user.id, req.body.action);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// ─── Conversations ────────────────────────────────────────────────────────────

const getConversations = async (req, res, next) => {
  try {
    const data = await msgService.getConversations(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const createConversation = async (req, res, next) => {
  try {
    const data = await msgService.createOrGetConversation(req.user.id, req.body.partnerId);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

// ─── Messages ─────────────────────────────────────────────────────────────────

const getMessages = async (req, res, next) => {
  try {
    const data = await msgService.getMessages(req.params.conversationId, req.user.id, req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const sendMessage = async (req, res, next) => {
  try {
    const msg = await msgService.sendMessage(req.params.conversationId, req.user.id, req.body);
    res.status(201).json({ success: true, data: msg });
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    const data = await msgService.markAsRead(req.params.conversationId, req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const deleteMessage = async (req, res, next) => {
  try {
    const data = await msgService.softDeleteMessage(req.params.messageId, req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  sendRequest,
  getRequests,
  respondRequest,
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
};
