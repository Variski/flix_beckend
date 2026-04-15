const ratingService = require('../services/rating.service');

const upsertRating = async (req, res, next) => {
  try {
    const rating = await ratingService.upsertRating(req.user.id, req.params.filmId, req.body.score);
    res.json({ success: true, data: rating });
  } catch (err) { next(err); }
};

const deleteRating = async (req, res, next) => {
  try {
    await ratingService.deleteRating(req.user.id, req.params.filmId);
    res.json({ success: true, message: 'Rating removed' });
  } catch (err) { next(err); }
};

const getFilmRatings = async (req, res, next) => {
  try {
    const result = await ratingService.getFilmRatings(req.params.filmId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { upsertRating, deleteRating, getFilmRatings };
