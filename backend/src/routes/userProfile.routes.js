const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const userProfileController = require('../controllers/userProfile.controller');
const {
  updateProfileSchema,
  searchUsersSchema,
  userIdParamSchema,
} = require('../validators/userProfile.validator');

const router = express.Router();

/**
 * @route   GET /api/v1/profile/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', protect, userProfileController.getMyProfile);

/**
 * @route   PUT /api/v1/profile/me
 * @desc    Update current user's profile
 * @access  Private
 */
router.put(
  '/me',
  protect,
  validate({ body: updateProfileSchema }),
  userProfileController.updateProfile
);

/**
 * @route   DELETE /api/v1/profile/me
 * @desc    Delete current user's profile
 * @access  Private
 */
router.delete('/me', protect, userProfileController.deleteProfile);

/**
 * @route   GET /api/v1/profile/me/activity
 * @desc    Get current user's activity summary
 * @access  Private
 */
router.get('/me/activity', protect, userProfileController.getMyActivity);

/**
 * @route   GET /api/v1/profile/search
 * @desc    Search users
 * @access  Public
 */
router.get(
  '/search',
  validate({ query: searchUsersSchema }),
  userProfileController.searchUsers
);

/**
 * @route   GET /api/v1/profile/:userId
 * @desc    Get user profile by ID
 * @access  Public (with privacy controls)
 */
router.get(
  '/:userId',
  validate({ params: userIdParamSchema }),
  userProfileController.getUserProfile
);

/**
 * @route   GET /api/v1/profile/:userId/activity
 * @desc    Get user's activity summary
 * @access  Private (user can only see their own activity)
 */
router.get(
  '/:userId/activity',
  protect,
  validate({ params: userIdParamSchema }),
  userProfileController.getUserActivity
);

module.exports = router;