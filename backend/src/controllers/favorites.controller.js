const favoritesService = require('../services/favorites.service');
const { asyncHandler } = require('../utils/async');

/**
 * Favorites Controller
 * Handles user favorites endpoints
 */

/**
 * Add movie to favorites
 */
exports.addToFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.body;

  if (!movieId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Movie ID is required',
    });
  }

  const favorite = await favoritesService.addToFavorites(userId, movieId);

  res.status(201).json({
    status: 'success',
    data: {
      favorite,
    },
  });
});

/**
 * Remove movie from favorites
 */
exports.removeFromFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.params;

  const result = await favoritesService.removeFromFavorites(userId, movieId);

  res.status(200).json({
    status: 'success',
    message: result.message,
  });
});

/**
 * Get user's favorite movies
 */
exports.getUserFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    page = 1,
    limit = 20,
    sortBy = 'addedAt',
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

  const results = await favoritesService.getUserFavorites(userId, options);

  res.status(200).json({
    status: 'success',
    results: results.pagination.total,
    data: {
      favorites: results.favorites,
      pagination: results.pagination,
    },
  });
});

/**
 * Check if movie is favorited
 */
exports.checkFavoriteStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { movieId } = req.params;

  const isFavorited = await favoritesService.isMovieFavorited(userId, movieId);

  res.status(200).json({
    status: 'success',
    data: {
      movieId,
      isFavorited,
    },
  });
});

/**
 * Get user's favorites count
 */
exports.getFavoritesCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await favoritesService.getUserFavoritesCount(userId);

  res.status(200).json({
    status: 'success',
    data: {
      count,
    },
  });
});

/**
 * Get popular movies (most favorited)
 */
exports.getPopularMovies = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const results = await favoritesService.getPopularMovies(options);

  res.status(200).json({
    status: 'success',
    results: results.pagination.total,
    data: {
      movies: results.movies,
      pagination: results.pagination,
    },
  });
});

/**
 * Get recommendations based on favorites
 */
exports.getRecommendationsFromFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 10 } = req.query;

  const recommendations = await favoritesService.getRecommendationsBasedOnFavorites(
    userId,
    parseInt(limit)
  );

  res.status(200).json({
    status: 'success',
    data: {
      recommendations,
    },
  });
});