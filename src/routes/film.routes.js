const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/film.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// GET /api/films/genres
router.get('/genres', ctrl.getGenres);

// GET /api/films/moods
router.get('/moods', ctrl.getMoods);

// GET /api/films?search=&genreId=&moodId=&year=&page=&limit=
router.get('/', ctrl.getFilms);

// GET /api/films/:id
router.get('/:id', ctrl.getFilmById);

// POST /api/films  (admin only)
router.post('/', authenticate, authorize('admin'), ctrl.createFilm);

// PUT /api/films/:id  (admin only)
router.put('/:id', authenticate, authorize('admin'), ctrl.updateFilm);

// DELETE /api/films/:id  (admin only)
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteFilm);

// ── Ratings nested under films ────────────────────────────────
const ratingCtrl = require('../controllers/rating.controller');

// GET /api/films/:filmId/ratings
router.get('/:filmId/ratings', ratingCtrl.getFilmRatings);

// POST /api/films/:filmId/ratings  (create or update)
router.post('/:filmId/ratings', authenticate, ratingCtrl.upsertRating);

// DELETE /api/films/:filmId/ratings
router.delete('/:filmId/ratings', authenticate, ratingCtrl.deleteRating);

// ── Reviews nested under films ────────────────────────────────
const reviewCtrl = require('../controllers/review.controller');

// GET /api/films/:filmId/reviews
router.get('/:filmId/reviews', reviewCtrl.getReviews);

// POST /api/films/:filmId/reviews
router.post('/:filmId/reviews', authenticate, reviewCtrl.createReview);

// ── Discussions nested under films ────────────────────────────
const discussionCtrl = require('../controllers/discussion.controller');

// GET /api/films/:filmId/discussions
router.get('/:filmId/discussions', discussionCtrl.getDiscussions);

// POST /api/films/:filmId/discussions
router.post('/:filmId/discussions', authenticate, discussionCtrl.createDiscussion);

module.exports = router;
