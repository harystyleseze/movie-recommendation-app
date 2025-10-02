const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const ratingsController = require('../controllers/ratings.controller');
const {
  addOrUpdateRatingSchema,
  getUserRatingsSchema,
  getMovieRatingsSchema,
  getRecentReviewsSchema,
  ratingIdParamSchema,
  movieIdParamSchema,
} = require('../validators/ratings.validator');

const router = express.Router();

/**
 * @route   POST /api/v1/ratings
 * @desc    Add or update a movie rating/review
 * @access  Private
 */
router.post(
  '/',
  protect,
  validate({ body: addOrUpdateRatingSchema }),
  ratingsController.addOrUpdateRating
);

/**
 * @route   GET /api/v1/ratings
 * @desc    Get current user's ratings
 * @access  Private
 */
router.get(
  '/',
  protect,
  validate({ query: getUserRatingsSchema }),
  ratingsController.getUserRatings
);

/**
 * @route   GET /api/v1/ratings/stats
 * @desc    Get current user's rating statistics
 * @access  Private
 */
router.get('/stats', protect, ratingsController.getMyRatingStats);

/**
 * @route   GET /api/v1/ratings/recent
 * @desc    Get recent reviews (public)
 * @access  Public
 */
router.get(
  '/recent',
  validate({ query: getRecentReviewsSchema }),
  ratingsController.getRecentReviews
);

/**
 * @route   GET /api/v1/ratings/movie/:movieId
 * @desc    Get ratings for a specific movie
 * @access  Public
 */
router.get(
  '/movie/:movieId',
  validate({
    params: movieIdParamSchema,
    query: getMovieRatingsSchema,
  }),
  ratingsController.getMovieRatings
);

/**
 * @route   GET /api/v1/ratings/movie/:movieId/my-rating
 * @desc    Get current user's rating for a specific movie
 * @access  Private
 */
router.get(
  '/movie/:movieId/my-rating',
  protect,
  validate({ params: movieIdParamSchema }),
  ratingsController.getUserRatingForMovie
);

/**
 * @route   POST /api/v1/ratings/:ratingId/helpful
 * @desc    Mark rating as helpful
 * @access  Private
 */
router.post(
  '/:ratingId/helpful',
  protect,
  validate({ params: ratingIdParamSchema }),
  ratingsController.markRatingHelpful
);

/**
 * @route   DELETE /api/v1/ratings/:ratingId
 * @desc    Delete a rating
 * @access  Private
 */
router.delete(
  '/:ratingId',
  protect,
  validate({ params: ratingIdParamSchema }),
  ratingsController.deleteRating
);

module.exports = router;