const User = require('../models/user.model');
const Favorite = require('../models/favorite.model');
const Watchlist = require('../models/watchlist.model');
const Rating = require('../models/rating.model');
const { AppError } = require('../utils/error');

/**
 * User Profile Service
 * Handles user profile management and statistics
 */
class UserProfileService {
  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @param {boolean} isOwner - Whether the requester is the profile owner
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(userId, isOwner = false) {
    try {
      const user = await User.findById(userId).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // If not public and not owner, limit data
      if (!user.isPublic && !isOwner) {
        return {
          name: user.name,
          isPublic: false,
          message: 'This profile is private',
        };
      }

      // Update user stats
      await this._updateUserStats(userId);

      // Return appropriate data based on ownership
      const profileData = {
        id: user._id,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        location: user.location,
        favoriteGenres: user.favoriteGenres,
        stats: user.stats,
        memberSince: user.createdAt,
        lastActive: user.lastActive,
        isPublic: user.isPublic,
      };

      // Add private data if owner
      if (isOwner) {
        profileData.email = user.email;
        profileData.preferences = user.preferences;
      }

      return profileData;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get user profile', 500);
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile data to update
   * @returns {Promise<Object>} Updated profile
   */
  async updateUserProfile(userId, updateData) {
    try {
      const allowedFields = [
        'name',
        'bio',
        'avatar',
        'location',
        'favoriteGenres',
        'isPublic',
        'preferences',
      ];

      // Filter only allowed fields
      const filteredData = {};
      Object.keys(updateData).forEach((key) => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      // Update last active timestamp
      filteredData.lastActive = new Date();

      const user = await User.findByIdAndUpdate(
        userId,
        filteredData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'ValidationError') {
        throw new AppError(error.message, 400);
      }
      throw new AppError('Failed to update profile', 500);
    }
  }

  /**
   * Get user activity summary
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Activity summary
   */
  async getUserActivity(userId) {
    try {
      const [recentRatings, recentFavorites, recentWatchlists] = await Promise.all([
        Rating.find({ user: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('movieTitle moviePoster rating createdAt'),

        Favorite.find({ user: userId })
          .sort({ addedAt: -1 })
          .limit(5)
          .select('movieTitle moviePoster addedAt'),

        Watchlist.find({ user: userId })
          .sort({ createdAt: -1 })
          .limit(3)
          .select('name movieCount createdAt'),
      ]);

      return {
        recentRatings,
        recentFavorites,
        recentWatchlists,
      };
    } catch (error) {
      throw new AppError('Failed to get user activity', 500);
    }
  }

  /**
   * Update user statistics (private method)
   * @private
   * @param {string} userId - User ID
   */
  async _updateUserStats(userId) {
    try {
      const [ratingsCount, watchlistsCount, favoritesCount, avgRating] = await Promise.all([
        Rating.countDocuments({ user: userId }),
        Watchlist.countDocuments({ user: userId }),
        Favorite.countDocuments({ user: userId }),
        Rating.aggregate([
          { $match: { user: userId } },
          { $group: { _id: null, avg: { $avg: '$rating' } } },
        ]),
      ]);

      const stats = {
        totalMoviesRated: ratingsCount,
        totalWatchlists: watchlistsCount,
        totalFavorites: favoritesCount,
        averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avg * 10) / 10 : 0,
      };

      await User.findByIdAndUpdate(userId, { stats });
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Don't throw error for stats update failure
    }
  }

  /**
   * Delete user profile and all associated data
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUserProfile(userId) {
    try {
      // Delete all user data
      await Promise.all([
        User.findByIdAndDelete(userId),
        Favorite.deleteMany({ user: userId }),
        Watchlist.deleteMany({ user: userId }),
        Rating.deleteMany({ user: userId }),
      ]);
    } catch (error) {
      throw new AppError('Failed to delete user profile', 500);
    }
  }

  /**
   * Search users by name or bio
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} Search results
   */
  async searchUsers(query, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const searchRegex = new RegExp(query, 'i');
      const searchQuery = {
        isPublic: true,
        $or: [
          { name: { $regex: searchRegex } },
          { bio: { $regex: searchRegex } },
        ],
      };

      const [users, total] = await Promise.all([
        User.find(searchQuery)
          .select('name bio avatar location favoriteGenres stats createdAt')
          .sort({ 'stats.totalMoviesRated': -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(searchQuery),
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new AppError('Failed to search users', 500);
    }
  }
}

module.exports = new UserProfileService();