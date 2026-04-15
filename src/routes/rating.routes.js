const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rating.controller');
const { authenticate } = require('../middleware/auth');

// Standalone endpoints (film-specific routes are in film.routes.js)
// GET /api/ratings/:filmId
router.get('/:filmId', ctrl.getFilmRatings);

// POST /api/ratings/:filmId
router.post('/:filmId', authenticate, ctrl.upsertRating);

// DELETE /api/ratings/:filmId
router.delete('/:filmId', authenticate, ctrl.deleteRating);

module.exports = router;
