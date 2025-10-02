const Watchlist = require('../models/watchlist.model');
const WatchlistItem = require('../models/watchlistItem.model');
const omdbService = require('./omdb.service');
const { AppError } = require('../utils/error');

/**
 * Watchlists Service
 * Handles user's custom movie watchlists functionality
 */
class WatchlistsService {
  /**
   * Create a new watchlist
   * @param {string} userId - User ID
   * @param {Object} watchlistData - Watchlist data
   * @returns {Promise<Object>} Created watchlist
   */
  async createWatchlist(userId, watchlistData) {
    try {
      const { name, description, isPublic = false } = watchlistData;

      // Check if user already has a watchlist with this name
      const existingWatchlist = await Watchlist.findOne({ user: userId, name });
      if (existingWatchlist) {
        throw new AppError('Watchlist with this name already exists', 409);
      }

      const watchlist = new Watchlist({
        user: userId,
        name: name.trim(),
        description: description?.trim() || '',
        isPublic,
      });

      await watchlist.save();

      return {
        id: watchlist._id,
        name: watchlist.name,
        description: watchlist.description,
        isPublic: watchlist.isPublic,
        movieCount: watchlist.movieCount,
        createdAt: watchlist.createdAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.code === 11000) {
        throw new AppError('Watchlist name must be unique', 409);
      }
      throw new AppError('Failed to create watchlist', 500);
    }
  }

  /**
   * Get user's watchlists
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User's watchlists
   */
  async getUserWatchlists(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = '',
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Build query
      const query = { user: userId };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Execute queries
      const [watchlists, total] = await Promise.all([
        Watchlist.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('-user'),
        Watchlist.countDocuments(query),
      ]);

      return {
        watchlists,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError('Failed to get user watchlists', 500);
    }
  }

  /**
   * Get watchlist by ID
   * @param {string} watchlistId - Watchlist ID
   * @param {string} userId - User ID (for permission check)
   * @returns {Promise<Object>} Watchlist with items
   */
  async getWatchlistById(watchlistId, userId) {
    try {
      const watchlist = await Watchlist.findById(watchlistId);

      if (!watchlist) {
        throw new AppError('Watchlist not found', 404);
      }

      // Check permissions
      if (watchlist.user.toString() !== userId && !watchlist.isPublic) {
        throw new AppError('Access denied to this watchlist', 403);
      }

      // Get watchlist items
      const items = await WatchlistItem.find({ watchlist: watchlistId })
        .sort({ priority: 1, createdAt: -1 })
        .select('-user -watchlist');

      return {
        id: watchlist._id,
        name: watchlist.name,
        description: watchlist.description,
        isPublic: watchlist.isPublic,
        movieCount: watchlist.movieCount,
        createdAt: watchlist.createdAt,
        updatedAt: watchlist.updatedAt,
        items,
        isOwner: watchlist.user.toString() === userId,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get watchlist', 500);
    }
  }

  /**
   * Update watchlist
   * @param {string} watchlistId - Watchlist ID
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated watchlist
   */
  async updateWatchlist(watchlistId, userId, updateData) {
    try {
      const watchlist = await Watchlist.findOne({
        _id: watchlistId,
        user: userId,
      });

      if (!watchlist) {
        throw new AppError('Watchlist not found or access denied', 404);
      }

      const allowedFields = ['name', 'description', 'isPublic'];
      const filteredData = {};

      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      Object.assign(watchlist, filteredData);
      await watchlist.save();

      return {
        id: watchlist._id,
        name: watchlist.name,
        description: watchlist.description,
        isPublic: watchlist.isPublic,
        movieCount: watchlist.movieCount,
        updatedAt: watchlist.updatedAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update watchlist', 500);
    }
  }

  /**
   * Delete watchlist
   * @param {string} watchlistId - Watchlist ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteWatchlist(watchlistId, userId) {
    try {
      const watchlist = await Watchlist.findOne({
        _id: watchlistId,
        user: userId,
      });

      if (!watchlist) {
        throw new AppError('Watchlist not found or access denied', 404);
      }

      // Delete watchlist and all its items
      await Promise.all([
        Watchlist.findByIdAndDelete(watchlistId),
        WatchlistItem.deleteMany({ watchlist: watchlistId }),
      ]);

      return { message: 'Watchlist deleted successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete watchlist', 500);
    }
  }

  /**
   * Add movie to watchlist
   * @param {string} watchlistId - Watchlist ID
   * @param {string} userId - User ID
   * @param {Object} movieData - Movie data
   * @returns {Promise<Object>} Added movie
   */
  async addMovieToWatchlist(watchlistId, userId, movieData) {
    try {
      const { movieId, notes = '', priority = 0 } = movieData;

      // Verify watchlist ownership
      const watchlist = await Watchlist.findOne({
        _id: watchlistId,
        user: userId,
      });

      if (!watchlist) {
        throw new AppError('Watchlist not found or access denied', 404);
      }

      // Check if movie already in watchlist
      const existingItem = await WatchlistItem.findOne({
        watchlist: watchlistId,
        movieId,
      });

      if (existingItem) {
        throw new AppError('Movie already in this watchlist', 409);
      }

      // Get movie details from OMDb
      const movieDetails = await omdbService.getMovieDetails(movieId, true);

      if (!movieDetails) {
        throw new AppError('Movie not found', 404);
      }

      // Create watchlist item
      const watchlistItem = new WatchlistItem({
        watchlist: watchlistId,
        user: userId,
        movieId,
        movieTitle: movieDetails.Title,
        moviePoster: movieDetails.Poster !== 'N/A' ? movieDetails.Poster : null,
        movieYear: movieDetails.Year !== 'N/A' ? movieDetails.Year : null,
        movieGenres: movieDetails.Genre !== 'N/A' ? movieDetails.Genre.split(', ') : [],
        notes: notes.trim(),
        priority,
      });

      await watchlistItem.save();

      // Update watchlist movie count
      await Watchlist.findByIdAndUpdate(watchlistId, {
        $inc: { movieCount: 1 },
      });

      return {
        id: watchlistItem._id,
        movieId: watchlistItem.movieId,
        movieTitle: watchlistItem.movieTitle,
        moviePoster: watchlistItem.moviePoster,
        movieYear: watchlistItem.movieYear,
        movieGenres: watchlistItem.movieGenres,
        notes: watchlistItem.notes,
        priority: watchlistItem.priority,
        watched: watchlistItem.watched,
        createdAt: watchlistItem.createdAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add movie to watchlist', 500);
    }
  }

  /**
   * Remove movie from watchlist
   * @param {string} watchlistId - Watchlist ID
   * @param {string} movieId - Movie ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Removal result
   */
  async removeMovieFromWatchlist(watchlistId, movieId, userId) {
    try {
      // Verify watchlist ownership
      const watchlist = await Watchlist.findOne({
        _id: watchlistId,
        user: userId,
      });

      if (!watchlist) {
        throw new AppError('Watchlist not found or access denied', 404);
      }

      const watchlistItem = await WatchlistItem.findOneAndDelete({
        watchlist: watchlistId,
        movieId,
      });

      if (!watchlistItem) {
        throw new AppError('Movie not found in this watchlist', 404);
      }

      // Update watchlist movie count
      await Watchlist.findByIdAndUpdate(watchlistId, {
        $inc: { movieCount: -1 },
      });

      return { message: 'Movie removed from watchlist successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to remove movie from watchlist', 500);
    }
  }

  /**
   * Mark movie as watched in watchlist
   * @param {string} watchlistId - Watchlist ID
   * @param {string} movieId - Movie ID
   * @param {string} userId - User ID
   * @param {boolean} watched - Watched status
   * @returns {Promise<Object>} Updated item
   */
  async updateWatchedStatus(watchlistId, movieId, userId, watched) {
    try {
      // Verify watchlist ownership
      const watchlist = await Watchlist.findOne({
        _id: watchlistId,
        user: userId,
      });

      if (!watchlist) {
        throw new AppError('Watchlist not found or access denied', 404);
      }

      const watchlistItem = await WatchlistItem.findOneAndUpdate(
        { watchlist: watchlistId, movieId },
        {
          watched,
          watchedAt: watched ? new Date() : null,
        },
        { new: true }
      );

      if (!watchlistItem) {
        throw new AppError('Movie not found in this watchlist', 404);
      }

      return {
        movieId: watchlistItem.movieId,
        watched: watchlistItem.watched,
        watchedAt: watchlistItem.watchedAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update watched status', 500);
    }
  }

  /**
   * Get public watchlists
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Public watchlists
   */
  async getPublicWatchlists(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [watchlists, total] = await Promise.all([
        Watchlist.find({ isPublic: true })
          .populate('user', 'name avatar')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Watchlist.countDocuments({ isPublic: true }),
      ]);

      return {
        watchlists: watchlists.map((wl) => ({
          id: wl._id,
          name: wl.name,
          description: wl.description,
          movieCount: wl.movieCount,
          createdAt: wl.createdAt,
          user: {
            name: wl.user.name,
            avatar: wl.user.avatar,
          },
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError('Failed to get public watchlists', 500);
    }
  }
}

module.exports = new WatchlistsService();