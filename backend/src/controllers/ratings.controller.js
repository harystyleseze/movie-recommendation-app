const ratingsService = require('../services/ratings.service');
const { asyncHandler } = require('../utils/async');

/**
 * Ratings Controller
 * Handles movie ratings and reviews endpoints
 */

/**
 * Add or update a movie rating/review
 */
exports.addOrUpdateRating = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const ratingData = req.body;

  if (!ratingData.movieId || !ratingData.rating) {
    return res.status(400).json({
      status: 'fail',
      message: 'Movie ID and rating are required',
    });
  }

  if (ratingData.rating < 1 || ratingData.rating > 10) {
    return res.status(400).json({
      status: 'fail',
      message: 'Rating must be between 1 and 10',
    });
  }

  const rating = await ratingsService.addOrUpdateRating(userId, ratingData);

  res.status(rating.isUpdate ? 200 : 201).json({
    status: 'success',
    data: {
      rating,
    },
  });
});

/**
 * Get user's ratings
 */
exports.getUserRatings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search = '',
    ratingFilter = null,
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
    search,
    ratingFilter: ratingFilter ? parseFloat(ratingFilter) : null,
  };

  const results = await ratingsService.getUserRatings(userId, options);

  res.status(200).json({
    status: 'success',
    results: results.pagination.total,
    data: {
      ratings: results.ratings,
      pagination: results.pagination,
    },
  });
});

/**
 * Get ratings for a specific movie
 */
exports.getMovieRatings = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = 'helpful',
    sortOrder = 'desc',
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  };

  const results = await ratingsService.getMovieRatings(movieId, options);

  res.status(200).json({
    status: 'success',
    results: results.pagination.total,
    data: {
      ratings: results.ratings,
      statistics: results.statistics,
      pagination: results.pagination,
    },
  });
});

/**
 * Get user's rating for a specific movie
 */
exports.getUserRatingForMovie = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.params;

  const rating = await ratingsService.getUserRatingForMovie(userId, movieId);

  res.status(200).json({
    status: 'success',
    data: {
      rating,
    },
  });
});

/**
 * Delete a rating
 */
exports.deleteRating = asyncHandler(async (req, res) => {
  const { ratingId } = req.params;
  const userId = req.user.id;

  const result = await ratingsService.deleteRating(ratingId, userId);

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Mark rating as helpful
 */
exports.markRatingHelpful = asyncHandler(async (req, res) => {
  const { ratingId } = req.params;
  const userId = req.user.id;

  const result = await ratingsService.markRatingHelpful(ratingId, userId);

  res.status(200).json({
    status: 'success',
    data: {
      ratingId: result.ratingId,
      helpful: result.helpful,
    },
  });
});

/**
 * Get user's rating statistics
 */
exports.getUserRatingStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await ratingsService.getUserRatingStats(userId);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

/**
 * Get recent reviews (public)
 */
exports.getRecentReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const results = await ratingsService.getRecentReviews(options);

  res.status(200).json({
    status: 'success',
    results: results.pagination.total,
    data: {
      reviews: results.reviews,
      pagination: results.pagination,
    },
  });
});

/**
 * Get my rating statistics (convenience endpoint)
 */
exports.getMyRatingStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await ratingsService.getUserRatingStats(userId);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});