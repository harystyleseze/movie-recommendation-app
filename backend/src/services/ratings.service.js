const Rating = require('../models/rating.model');
const omdbService = require('./omdb.service');
const { AppError } = require('../utils/error');

/**
 * Ratings Service
 * Handles user movie ratings and reviews functionality
 */
class RatingsService {
  /**
   * Add or update a movie rating/review
   * @param {string} userId - User ID
   * @param {Object} ratingData - Rating data
   * @returns {Promise<Object>} Created/updated rating
   */
  async addOrUpdateRating(userId, ratingData) {
    try {
      const {
        movieId,
        rating,
        review = '',
        isPublic = true,
        watchedAt,
      } = ratingData;

      // Validate rating value
      if (rating < 1 || rating > 10) {
        throw new AppError('Rating must be between 1 and 10', 400);
      }

      // Get movie details from OMDb
      const movieDetails = await omdbService.getMovieDetails(movieId, true);

      if (!movieDetails) {
        throw new AppError('Movie not found', 404);
      }

      // Check if rating already exists
      let existingRating = await Rating.findOne({ user: userId, movieId });

      if (existingRating) {
        // Update existing rating
        existingRating.rating = rating;
        existingRating.review = review.trim();
        existingRating.isPublic = isPublic;
        existingRating.watchedAt = watchedAt || existingRating.watchedAt;

        await existingRating.save();

        return {
          id: existingRating._id,
          movieId: existingRating.movieId,
          movieTitle: existingRating.movieTitle,
          moviePoster: existingRating.moviePoster,
          movieYear: existingRating.movieYear,
          rating: existingRating.rating,
          review: existingRating.review,
          isPublic: existingRating.isPublic,
          watchedAt: existingRating.watchedAt,
          updatedAt: existingRating.updatedAt,
          isUpdate: true,
        };
      } else {
        // Create new rating
        const newRating = new Rating({
          user: userId,
          movieId,
          movieTitle: movieDetails.Title,
          moviePoster: movieDetails.Poster !== 'N/A' ? movieDetails.Poster : null,
          movieYear: movieDetails.Year !== 'N/A' ? movieDetails.Year : null,
          rating,
          review: review.trim(),
          isPublic,
          watchedAt: watchedAt || new Date(),
        });

        await newRating.save();

        return {
          id: newRating._id,
          movieId: newRating.movieId,
          movieTitle: newRating.movieTitle,
          moviePoster: newRating.moviePoster,
          movieYear: newRating.movieYear,
          rating: newRating.rating,
          review: newRating.review,
          isPublic: newRating.isPublic,
          watchedAt: newRating.watchedAt,
          createdAt: newRating.createdAt,
          isUpdate: false,
        };
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to save rating', 500);
    }
  }

  /**
   * Get user's ratings
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User's ratings
   */
  async getUserRatings(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = '',
        ratingFilter = null,
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Build query
      const query = { user: userId };

      if (search) {
        query.movieTitle = { $regex: search, $options: 'i' };
      }

      if (ratingFilter) {
        query.rating = { $gte: ratingFilter };
      }

      // Execute queries
      const [ratings, total] = await Promise.all([
        Rating.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('-user'),
        Rating.countDocuments(query),
      ]);

      return {
        ratings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError('Failed to get user ratings', 500);
    }
  }

  /**
   * Get ratings for a specific movie
   * @param {string} movieId - Movie ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Movie ratings
   */
  async getMovieRatings(movieId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'helpful',
        sortOrder = 'desc',
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Get ratings and statistics
      const [ratings, total, stats] = await Promise.all([
        Rating.find({ movieId, isPublic: true })
          .populate('user', 'name avatar')
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Rating.countDocuments({ movieId, isPublic: true }),
        Rating.aggregate([
          { $match: { movieId, isPublic: true } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
              totalRatings: { $sum: 1 },
              ratingDistribution: {
                $push: '$rating',
              },
            },
          },
        ]),
      ]);

      // Calculate rating distribution
      let distribution = {};
      if (stats.length > 0) {
        distribution = stats[0].ratingDistribution.reduce((acc, rating) => {
          acc[rating] = (acc[rating] || 0) + 1;
          return acc;
        }, {});
      }

      return {
        ratings: ratings.map((rating) => ({
          id: rating._id,
          rating: rating.rating,
          review: rating.review,
          helpful: rating.helpful,
          watchedAt: rating.watchedAt,
          createdAt: rating.createdAt,
          user: {
            name: rating.user.name,
            avatar: rating.user.avatar,
          },
        })),
        statistics: {
          averageRating: stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0,
          totalRatings: total,
          distribution,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError('Failed to get movie ratings', 500);
    }
  }

  /**
   * Delete a rating
   * @param {string} ratingId - Rating ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteRating(ratingId, userId) {
    try {
      const rating = await Rating.findOneAndDelete({
        _id: ratingId,
        user: userId,
      });

      if (!rating) {
        throw new AppError('Rating not found or access denied', 404);
      }

      return { message: 'Rating deleted successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete rating', 500);
    }
  }

  /**
   * Get user's rating for a specific movie
   * @param {string} userId - User ID
   * @param {string} movieId - Movie ID
   * @returns {Promise<Object|null>} User's rating or null
   */
  async getUserRatingForMovie(userId, movieId) {
    try {
      const rating = await Rating.findOne({ user: userId, movieId })
        .select('-user');

      return rating;
    } catch (error) {
      throw new AppError('Failed to get user rating', 500);
    }
  }

  /**
   * Mark rating as helpful
   * @param {string} ratingId - Rating ID
   * @param {string} userId - User ID (who finds it helpful)
   * @returns {Promise<Object>} Updated helpful count
   */
  async markRatingHelpful(ratingId, userId) {
    try {
      const rating = await Rating.findById(ratingId);

      if (!rating) {
        throw new AppError('Rating not found', 404);
      }

      // Prevent users from marking their own ratings as helpful
      if (rating.user.toString() === userId) {
        throw new AppError('Cannot mark your own rating as helpful', 400);
      }

      // For now, just increment helpful count
      // In a more complex system, you'd track which users marked it helpful
      rating.helpful += 1;
      await rating.save();

      return {
        ratingId: rating._id,
        helpful: rating.helpful,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to mark rating as helpful', 500);
    }
  }

  /**
   * Get user's rating statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Rating statistics
   */
  async getUserRatingStats(userId) {
    try {
      const stats = await Rating.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            totalRatings: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            highestRating: { $max: '$rating' },
            lowestRating: { $min: '$rating' },
            totalReviews: {
              $sum: {
                $cond: [{ $ne: ['$review', ''] }, 1, 0],
              },
            },
            ratingDistribution: {
              $push: '$rating',
            },
          },
        },
      ]);

      if (stats.length === 0) {
        return {
          totalRatings: 0,
          averageRating: 0,
          highestRating: 0,
          lowestRating: 0,
          totalReviews: 0,
          distribution: {},
        };
      }

      const userStats = stats[0];

      // Calculate rating distribution
      const distribution = userStats.ratingDistribution.reduce((acc, rating) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {});

      return {
        totalRatings: userStats.totalRatings,
        averageRating: Math.round(userStats.averageRating * 10) / 10,
        highestRating: userStats.highestRating,
        lowestRating: userStats.lowestRating,
        totalReviews: userStats.totalReviews,
        distribution,
      };
    } catch (error) {
      throw new AppError('Failed to get user rating stats', 500);
    }
  }

  /**
   * Get recent reviews (public)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Recent reviews
   */
  async getRecentReviews(options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const [reviews, total] = await Promise.all([
        Rating.find({
          isPublic: true,
          review: { $ne: '' },
        })
          .populate('user', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Rating.countDocuments({
          isPublic: true,
          review: { $ne: '' },
        }),
      ]);

      return {
        reviews: reviews.map((review) => ({
          id: review._id,
          movieId: review.movieId,
          movieTitle: review.movieTitle,
          moviePoster: review.moviePoster,
          movieYear: review.movieYear,
          rating: review.rating,
          review: review.review,
          helpful: review.helpful,
          createdAt: review.createdAt,
          user: {
            name: review.user.name,
            avatar: review.user.avatar,
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
      throw new AppError('Failed to get recent reviews', 500);
    }
  }
}

module.exports = new RatingsService();