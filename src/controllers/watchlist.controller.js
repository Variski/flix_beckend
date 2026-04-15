const watchlistService = require('../services/watchlist.service');

const getMyWatchlists = async (req, res, next) => {
  try {
    const result = await watchlistService.getMyWatchlists(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getWatchlistById = async (req, res, next) => {
  try {
    const wl = await watchlistService.getWatchlistById(req.params.id, req.user.id);
    res.json({ success: true, data: wl });
  } catch (err) { next(err); }
};

const createWatchlist = async (req, res, next) => {
  try {
    const wl = await watchlistService.createWatchlist(req.user.id, req.body);
    res.status(201).json({ success: true, data: wl });
  } catch (err) { next(err); }
};

const updateWatchlist = async (req, res, next) => {
  try {
    const wl = await watchlistService.updateWatchlist(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: wl });
  } catch (err) { next(err); }
};

const deleteWatchlist = async (req, res, next) => {
  try {
    await watchlistService.deleteWatchlist(req.params.id, req.user.id);
    res.json({ success: true, message: 'Watchlist deleted' });
  } catch (err) { next(err); }
};

const addItem = async (req, res, next) => {
  try {
    const item = await watchlistService.addItem(req.params.id, req.user.id, req.body.filmId);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

const removeItem = async (req, res, next) => {
  try {
    await watchlistService.removeItem(req.params.id, req.user.id, req.params.filmId);
    res.json({ success: true, message: 'Item removed' });
  } catch (err) { next(err); }
};

const toggleWatched = async (req, res, next) => {
  try {
    const item = await watchlistService.toggleWatched(req.params.id, req.user.id, req.params.filmId);
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

const joinByShareCode = async (req, res, next) => {
  try {
    const result = await watchlistService.joinByShareCode(req.user.id, req.params.shareCode);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const addMember = async (req, res, next) => {
  try {
    const result = await watchlistService.addMember(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const removeMember = async (req, res, next) => {
  try {
    await watchlistService.removeMember(req.params.id, req.user.id, req.params.userId);
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
};

module.exports = { getMyWatchlists, getWatchlistById, createWatchlist, updateWatchlist, deleteWatchlist, addItem, removeItem, toggleWatched, joinByShareCode, addMember, removeMember };
