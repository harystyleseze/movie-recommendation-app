const Favorite = require('../models/favorite.model');
const omdbService = require('./omdb.service');
const { AppError } = require('../utils/error');

/**
 * Favorites Service
 * Handles user's favorite movies functionality
 */
class FavoritesService {
  /**
   * Add movie to user's favorites
   * @param {string} userId - User ID
   * @param {string} movieId - IMDb movie ID
   * @returns {Promise<Object>} Added favorite
   */
  async addToFavorites(userId, movieId) {
    try {
      // Check if already in favorites
      const existingFavorite = await Favorite.findOne({ user: userId, movieId });
      if (existingFavorite) {
        throw new AppError('Movie already in favorites', 409);
      }

      // Get movie details from OMDb
      const movieDetails = await omdbService.getMovieDetails(movieId, true);

      if (!movieDetails) {
        throw new AppError('Movie not found', 404);
      }

      // Create favorite entry
      const favorite = new Favorite({
        user: userId,
        movieId,
        movieTitle: movieDetails.Title,
        moviePoster: movieDetails.Poster !== 'N/A' ? movieDetails.Poster : null,
        movieYear: movieDetails.Year !== 'N/A' ? movieDetails.Year : null,
      });

      await favorite.save();

      return {
        id: favorite._id,
        movieId: favorite.movieId,
        movieTitle: favorite.movieTitle,
        moviePoster: favorite.moviePoster,
        movieYear: favorite.movieYear,
        addedAt: favorite.addedAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add movie to favorites', 500);
    }
  }

  /**
   * Remove movie from user's favorites
   * @param {string} userId - User ID
   * @param {string} movieId - IMDb movie ID
   * @returns {Promise<void>}
   */
  async removeFromFavorites(userId, movieId) {
    try {
      const favorite = await Favorite.findOneAndDelete({ user: userId, movieId });

      if (!favorite) {
        throw new AppError('Movie not found in favorites', 404);
      }

      return { message: 'Movie removed from favorites successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to remove movie from favorites', 500);
    }
  }

  /**
   * Get user's favorite movies
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User's favorites
   */
  async getUserFavorites(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'addedAt',
        sortOrder = 'desc',
        search = '',
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Build query
      const query = { user: userId };
      if (search) {
        query.movieTitle = { $regex: search, $options: 'i' };
      }

      // Execute queries
      const [favorites, total] = await Promise.all([
        Favorite.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('-user'),
        Favorite.countDocuments(query),
      ]);

      return {
        favorites,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError('Failed to get user favorites', 500);
    }
  }

  /**
   * Check if movie is in user's favorites
   * @param {string} userId - User ID
   * @param {string} movieId - IMDb movie ID
   * @returns {Promise<boolean>} Whether movie is favorited
   */
  async isMovieFavorited(userId, movieId) {
    try {
      const favorite = await Favorite.findOne({ user: userId, movieId });
      return !!favorite;
    } catch (error) {
      throw new AppError('Failed to check favorite status', 500);
    }
  }

  /**
   * Get user's favorites count
   * @param {string} userId - User ID
   * @returns {Promise<number>} Favorites count
   */
  async getUserFavoritesCount(userId) {
    try {
      return await Favorite.countDocuments({ user: userId });
    } catch (error) {
      throw new AppError('Failed to get favorites count', 500);
    }
  }

  /**
   * Get popular movies (most favorited)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Popular movies
   */
  async getPopularMovies(options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const pipeline = [
        {
          $group: {
            _id: '$movieId',
            movieTitle: { $first: '$movieTitle' },
            moviePoster: { $first: '$moviePoster' },
            movieYear: { $first: '$movieYear' },
            favoriteCount: { $sum: 1 },
            lastAdded: { $max: '$addedAt' },
          },
        },
        { $sort: { favoriteCount: -1, lastAdded: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];

      const [popularMovies, totalResult] = await Promise.all([
        Favorite.aggregate(pipeline),
        Favorite.aggregate([
          { $group: { _id: '$movieId' } },
          { $count: 'total' },
        ]),
      ]);

      const total = totalResult[0]?.total || 0;

      return {
        movies: popularMovies.map((movie) => ({
          movieId: movie._id,
          movieTitle: movie.movieTitle,
          moviePoster: movie.moviePoster,
          movieYear: movie.movieYear,
          favoriteCount: movie.favoriteCount,
          lastAdded: movie.lastAdded,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError('Failed to get popular movies', 500);
    }
  }

  /**
   * Get recommendations based on user's favorites
   * @param {string} userId - User ID
   * @param {number} limit - Number of recommendations
   * @returns {Promise<Array>} Recommended movies
   */
  async getRecommendationsBasedOnFavorites(userId, limit = 10) {
    try {
      // Get user's favorite movies
      const favorites = await Favorite.find({ user: userId })
        .sort({ addedAt: -1 })
        .limit(5);

      if (favorites.length === 0) {
        return [];
      }

      // Get recommendations based on the most recent favorite
      const latestFavorite = favorites[0];
      const recommendations = await omdbService.getRecommendations({
        baseMovie: latestFavorite.movieId,
        limit,
      });

      return recommendations.results || [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return []; // Return empty array instead of throwing error
    }
  }
}

module.exports = new FavoritesService();