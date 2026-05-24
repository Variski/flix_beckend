const tmdbService = require('../services/tmdb.service');

const getPopularMovies = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const data = await tmdbService.getPopularMovies(page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const searchMovies = async (req, res, next) => {
  try {
    const query = req.query.query;
    const page = req.query.page || 1;
    if (!query) return res.status(400).json({ success: false, message: 'Query parameter is required' });
    
    const data = await tmdbService.searchMovies(query, page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getMovieDetails = async (req, res, next) => {
  try {
    const data = await tmdbService.getMovieDetails(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getTrendingMovies = async (req, res, next) => {
  try {
    const timeWindow = req.query.timeWindow || 'day';
    const data = await tmdbService.getTrendingMovies(timeWindow);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getUpcomingMovies = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const data = await tmdbService.getUpcomingMovies(page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getTopRatedMovies = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const data = await tmdbService.getTopRatedMovies(page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const discoverMovies = async (req, res, next) => {
  try {
    const data = await tmdbService.discoverMovies(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getMovieProviders = async (req, res, next) => {
  try {
    const data = await tmdbService.getMovieProviders(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  getTrendingMovies,
  getUpcomingMovies,
  getTopRatedMovies,
  discoverMovies,
  getMovieProviders
};
