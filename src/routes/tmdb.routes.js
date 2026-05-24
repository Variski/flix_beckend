const express = require('express');
const tmdbController = require('../controllers/tmdb.controller');
const router = express.Router();

router.get('/popular', tmdbController.getPopularMovies);
router.get('/search', tmdbController.searchMovies);
router.get('/trending', tmdbController.getTrendingMovies);
router.get('/upcoming', tmdbController.getUpcomingMovies);
router.get('/top-rated', tmdbController.getTopRatedMovies);
router.get('/discover', tmdbController.discoverMovies);
router.get('/:id/watch-providers', tmdbController.getMovieProviders);
router.get('/:id', tmdbController.getMovieDetails);

module.exports = router;
