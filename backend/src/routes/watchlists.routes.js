const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const watchlistsController = require('../controllers/watchlists.controller');
const {
  createWatchlistSchema,
  updateWatchlistSchema,
  getWatchlistsSchema,
  addMovieToWatchlistSchema,
  updateWatchedStatusSchema,
  watchlistIdParamSchema,
  watchlistMovieParamsSchema,
} = require('../validators/watchlists.validator');

const router = express.Router();

/**
 * @route   POST /api/v1/watchlists
 * @desc    Create a new watchlist
 * @access  Private
 */
router.post(
  '/',
  protect,
  validate({ body: createWatchlistSchema }),
  watchlistsController.createWatchlist
);

/**
 * @route   GET /api/v1/watchlists
 * @desc    Get current user's watchlists
 * @access  Private
 */
router.get(
  '/',
  protect,
  validate({ query: getWatchlistsSchema }),
  watchlistsController.getUserWatchlists
);

/**
 * @route   GET /api/v1/watchlists/public
 * @desc    Get public watchlists
 * @access  Public
 */
router.get(
  '/public',
  validate({ query: getWatchlistsSchema }),
  watchlistsController.getPublicWatchlists
);

/**
 * @route   GET /api/v1/watchlists/public/:watchlistId
 * @desc    Get public watchlist by ID
 * @access  Public
 */
router.get(
  '/public/:watchlistId',
  validate({ params: watchlistIdParamSchema }),
  watchlistsController.getPublicWatchlist
);

/**
 * @route   GET /api/v1/watchlists/:watchlistId
 * @desc    Get watchlist by ID
 * @access  Private
 */
router.get(
  '/:watchlistId',
  protect,
  validate({ params: watchlistIdParamSchema }),
  watchlistsController.getWatchlistById
);

/**
 * @route   PUT /api/v1/watchlists/:watchlistId
 * @desc    Update watchlist
 * @access  Private
 */
router.put(
  '/:watchlistId',
  protect,
  validate({
    params: watchlistIdParamSchema,
    body: updateWatchlistSchema,
  }),
  watchlistsController.updateWatchlist
);

/**
 * @route   DELETE /api/v1/watchlists/:watchlistId
 * @desc    Delete watchlist
 * @access  Private
 */
router.delete(
  '/:watchlistId',
  protect,
  validate({ params: watchlistIdParamSchema }),
  watchlistsController.deleteWatchlist
);

/**
 * @route   POST /api/v1/watchlists/:watchlistId/movies
 * @desc    Add movie to watchlist
 * @access  Private
 */
router.post(
  '/:watchlistId/movies',
  protect,
  validate({
    params: watchlistIdParamSchema,
    body: addMovieToWatchlistSchema,
  }),
  watchlistsController.addMovieToWatchlist
);

/**
 * @route   DELETE /api/v1/watchlists/:watchlistId/movies/:movieId
 * @desc    Remove movie from watchlist
 * @access  Private
 */
router.delete(
  '/:watchlistId/movies/:movieId',
  protect,
  validate({ params: watchlistMovieParamsSchema }),
  watchlistsController.removeMovieFromWatchlist
);

/**
 * @route   PATCH /api/v1/watchlists/:watchlistId/movies/:movieId/watched
 * @desc    Update watched status of movie in watchlist
 * @access  Private
 */
router.patch(
  '/:watchlistId/movies/:movieId/watched',
  protect,
  validate({
    params: watchlistMovieParamsSchema,
    body: updateWatchedStatusSchema,
  }),
  watchlistsController.updateWatchedStatus
);

module.exports = router;