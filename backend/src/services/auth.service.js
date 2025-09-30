const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { AppError } = require('../utils/error');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registered user data and token
   */
  async register(userData) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Create new user
    const user = await User.create(userData);

    // Generate token
    const token = this.generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  /**
   * Login user with email and password
   * @param {Object} loginData - User login data
   * @returns {Promise<Object>} - User data and token
   */
  async login(loginData) {
    const { email, password } = loginData;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = this.generateToken(user._id);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  /**
   * Get user profile by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile data
   */
  async getProfile(userId) {
    // Find user by ID
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile update data
   * @returns {Promise<Object>} - Updated user profile data
   */
  async updateProfile(userId, profileData) {
    const { name, email } = profileData;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('Email already registered', 409);
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    return {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    };
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} - Success message
   */
  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password (will be hashed by mongoose middleware)
    user.password = newPassword;
    await user.save();

    return {
      message: 'Password updated successfully',
    };
  }

  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @returns {string} - JWT token
   */
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  }
}

module.exports = new AuthService();
