const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const favoritesController = require('../controllers/favorites.controller');
const {
  addToFavoritesSchema,
  getUserFavoritesSchema,
  getPopularMoviesSchema,
  getRecommendationsSchema,
  movieIdParamSchema,
} = require('../validators/favorites.validator');

const router = express.Router();

/**
 * @route   POST /api/v1/favorites
 * @desc    Add movie to favorites
 * @access  Private
 */
router.post(
  '/',
  protect,
  validate({ body: addToFavoritesSchema }),
  favoritesController.addToFavorites
);

/**
 * @route   GET /api/v1/favorites
 * @desc    Get current user's favorite movies
 * @access  Private
 */
router.get(
  '/',
  protect,
  validate({ query: getUserFavoritesSchema }),
  favoritesController.getUserFavorites
);

/**
 * @route   GET /api/v1/favorites/count
 * @desc    Get current user's favorites count
 * @access  Private
 */
router.get('/count', protect, favoritesController.getFavoritesCount);

/**
 * @route   GET /api/v1/favorites/recommendations
 * @desc    Get recommendations based on favorites
 * @access  Private
 */
router.get(
  '/recommendations',
  protect,
  validate({ query: getRecommendationsSchema }),
  favoritesController.getRecommendationsFromFavorites
);

/**
 * @route   GET /api/v1/favorites/popular
 * @desc    Get popular movies (most favorited)
 * @access  Public
 */
router.get(
  '/popular',
  validate({ query: getPopularMoviesSchema }),
  favoritesController.getPopularMovies
);

/**
 * @route   GET /api/v1/favorites/:movieId/status
 * @desc    Check if movie is favorited
 * @access  Private
 */
router.get(
  '/:movieId/status',
  protect,
  validate({ params: movieIdParamSchema }),
  favoritesController.checkFavoriteStatus
);

/**
 * @route   DELETE /api/v1/favorites/:movieId
 * @desc    Remove movie from favorites
 * @access  Private
 */
router.delete(
  '/:movieId',
  protect,
  validate({ params: movieIdParamSchema }),
  favoritesController.removeFromFavorites
);

module.exports = router;