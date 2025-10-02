const watchlistsService = require('../services/watchlists.service');
const { asyncHandler } = require('../utils/async');

/**
 * Watchlists Controller
 * Handles user watchlists and watchlist items endpoints
 */

/**
 * Create a new watchlist
 */
exports.createWatchlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const watchlistData = req.body;

  const watchlist = await watchlistsService.createWatchlist(userId, watchlistData);

  res.status(201).json({
    status: 'success',
    data: {
      watchlist,
    },
  });
});

/**
 * Get user's watchlists
 */
exports.getUserWatchlists = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search = '',
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
    search,
  };

  const results = await watchlistsService.getUserWatchlists(userId, options);

  res.status(200).json({
    status: 'success',
    results: results.pagination.total,
    data: {
      watchlists: results.watchlists,
      pagination: results.pagination,
    },
  });
});

/**
 * Get watchlist by ID
 */
exports.getWatchlistById = asyncHandler(async (req, res) => {
  const { watchlistId } = req.params;
  const userId = req.user.id;

  const watchlist = await watchlistsService.getWatchlistById(watchlistId, userId);

  res.status(200).json({
    status: 'success',
    data: {
      watchlist,
    },
  });
});

/**
 * Update watchlist
 */
exports.updateWatchlist = asyncHandler(async (req, res) => {
  const { watchlistId } = req.params;
  const userId = req.user.id;
  const updateData = req.body;

  const watchlist = await watchlistsService.updateWatchlist(
    watchlistId,
    userId,
    updateData
  );

  res.status(200).json({
    status: 'success',
    data: {
      watchlist,
    },
  });
});

/**
 * Delete watchlist
 */
exports.deleteWatchlist = asyncHandler(async (req, res) => {
  const { watchlistId } = req.params;
  const userId = req.user.id;

  const result = await watchlistsService.deleteWatchlist(watchlistId, userId);

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Add movie to watchlist
 */
exports.addMovieToWatchlist = asyncHandler(async (req, res) => {
  const { watchlistId } = req.params;
  const userId = req.user.id;
  const movieData = req.body;

  if (!movieData.movieId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Movie ID is required',
    });
  }

  const movie = await watchlistsService.addMovieToWatchlist(
    watchlistId,
    userId,
    movieData
  );

  res.status(201).json({
    status: 'success',
    data: {
      movie,
    },
  });
});

/**
 * Remove movie from watchlist
 */
exports.removeMovieFromWatchlist = asyncHandler(async (req, res) => {
  const { watchlistId, movieId } = req.params;
  const userId = req.user.id;

  const result = await watchlistsService.removeMovieFromWatchlist(
    watchlistId,
    movieId,
    userId
  );

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Update watched status of movie in watchlist
 */
exports.updateWatchedStatus = asyncHandler(async (req, res) => {
  const { watchlistId, movieId } = req.params;
  const userId = req.user.id;
  const { watched } = req.body;

  if (typeof watched !== 'boolean') {
    return res.status(400).json({
      status: 'fail',
      message: 'Watched status must be a boolean value',
    });
  }

  const result = await watchlistsService.updateWatchedStatus(
    watchlistId,
    movieId,
    userId,
    watched
  );

  res.status(200).json({
    status: 'success',
    data: {
      movie: result,
    },
  });
});

/**
 * Get public watchlists
 */
exports.getPublicWatchlists = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  };

  const results = await watchlistsService.getPublicWatchlists(options);

  res.status(200).json({
    status: 'success',
    results: results.pagination.total,
    data: {
      watchlists: results.watchlists,
      pagination: results.pagination,
    },
  });
});

/**
 * Get public watchlist by ID (for viewing others' public watchlists)
 */
exports.getPublicWatchlist = asyncHandler(async (req, res) => {
  const { watchlistId } = req.params;

  // For public viewing, we don't pass a specific user ID
  // The service will check if the watchlist is public
  const watchlist = await watchlistsService.getWatchlistById(watchlistId, null);

  if (!watchlist.isOwner && !watchlist.isPublic) {
    return res.status(403).json({
      status: 'fail',
      message: 'This watchlist is private',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      watchlist,
    },
  });
});