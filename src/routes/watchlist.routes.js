const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/watchlist.controller');
const { authenticate } = require('../middleware/auth');

// GET /api/watchlists
router.get('/', authenticate, ctrl.getMyWatchlists);

// POST /api/watchlists
router.post('/', authenticate, ctrl.createWatchlist);

// POST /api/watchlists/join/:shareCode
router.post('/join/:shareCode', authenticate, ctrl.joinByShareCode);

// GET /api/watchlists/:id
router.get('/:id', authenticate, ctrl.getWatchlistById);

// PUT /api/watchlists/:id
router.put('/:id', authenticate, ctrl.updateWatchlist);

// DELETE /api/watchlists/:id
router.delete('/:id', authenticate, ctrl.deleteWatchlist);

// POST /api/watchlists/:id/items
router.post('/:id/items', authenticate, ctrl.addItem);

// DELETE /api/watchlists/:id/items/:filmId
router.delete('/:id/items/:filmId', authenticate, ctrl.removeItem);

// PATCH /api/watchlists/:id/items/:filmId/watch
router.patch('/:id/items/:filmId/watch', authenticate, ctrl.toggleWatched);

// POST /api/watchlists/:id/members
router.post('/:id/members', authenticate, ctrl.addMember);

// DELETE /api/watchlists/:id/members/:userId
router.delete('/:id/members/:userId', authenticate, ctrl.removeMember);

module.exports = router;
