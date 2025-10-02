const userProfileService = require('../services/userProfile.service');
const { asyncHandler } = require('../utils/async');

/**
 * User Profile Controller
 * Handles user profile management endpoints
 */

/**
 * Get user profile
 */
exports.getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user?.id;

  // Check if requester is viewing their own profile
  const isOwner = requesterId === userId;

  const profile = await userProfileService.getUserProfile(userId, isOwner);

  res.status(200).json({
    status: 'success',
    data: {
      profile,
    },
  });
});

/**
 * Get current user's profile
 */
exports.getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const profile = await userProfileService.getUserProfile(userId, true);

  res.status(200).json({
    status: 'success',
    data: {
      profile,
    },
  });
});

/**
 * Update user profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  const updatedProfile = await userProfileService.updateUserProfile(userId, updateData);

  res.status(200).json({
    status: 'success',
    data: {
      profile: updatedProfile,
    },
  });
});

/**
 * Get user activity summary
 */
exports.getUserActivity = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user?.id;

  // For now, only allow users to see their own activity
  // In the future, this could be made public based on user preferences
  if (requesterId !== userId) {
    return res.status(403).json({
      status: 'fail',
      message: 'Access denied to user activity',
    });
  }

  const activity = await userProfileService.getUserActivity(userId);

  res.status(200).json({
    status: 'success',
    data: {
      activity,
    },
  });
});

/**
 * Get current user's activity
 */
exports.getMyActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const activity = await userProfileService.getUserActivity(userId);

  res.status(200).json({
    status: 'success',
    data: {
      activity,
    },
  });
});

/**
 * Delete user profile
 */
exports.deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await userProfileService.deleteUserProfile(userId);

  res.status(200).json({
    status: 'success',
    message: 'Profile deleted successfully',
  });
});

/**
 * Search users
 */
exports.searchUsers = asyncHandler(async (req, res) => {
  const { q: query, page = 1, limit = 10 } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      status: 'fail',
      message: 'Search query must be at least 2 characters long',
    });
  }

  const results = await userProfileService.searchUsers(
    query.trim(),
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    status: 'success',
    results: results.pagination.total,
    data: {
      users: results.users,
      pagination: results.pagination,
    },
  });
});