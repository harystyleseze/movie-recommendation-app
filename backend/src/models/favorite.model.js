const mongoose = require('mongoose');

/**
 * Favorite Schema
 *
 * Represents a user's favorite movie
 * Simple many-to-many relationship between users and movies
 */
const favoriteSchema = new mongoose.Schema(
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
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique favorites per user
favoriteSchema.index({ user: 1, movieId: 1 }, { unique: true });

// Index for efficient queries
favoriteSchema.index({ user: 1, addedAt: -1 });
favoriteSchema.index({ movieId: 1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;