const reviewService = require('../services/review.service');

const getReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getReviews(req.params.filmId, req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user.id, req.params.filmId, req.body);
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: review });
  } catch (err) { next(err); }
};

const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

module.exports = { getReviews, createReview, updateReview, deleteReview };
