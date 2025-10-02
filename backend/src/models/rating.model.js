const mongoose = require('mongoose');

/**
 * Rating Schema
 *
 * Represents a user's rating and review for a movie
 * Users can rate and review movies they've watched
 */
const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movieId: {
      type: String, // IMDb ID (e.g., "tt0372784")
      required: true,
    },
    movieTitle: {
      type: String,
      required: true,
      trim: true,
    },
    moviePoster: {
      type: String,
      default: null,
    },
    movieYear: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    helpful: {
      type: Number,
      default: 0, // Number of users who found this review helpful
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique ratings per user per movie
ratingSchema.index({ user: 1, movieId: 1 }, { unique: true });

// Index for efficient queries
ratingSchema.index({ movieId: 1, rating: -1, createdAt: -1 });
ratingSchema.index({ user: 1, rating: -1, createdAt: -1 });
ratingSchema.index({ isPublic: 1, helpful: -1, createdAt: -1 });
ratingSchema.index({ movieId: 1, isPublic: 1, helpful: -1 });

// Virtual for username (populate user)
ratingSchema.virtual('username', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;