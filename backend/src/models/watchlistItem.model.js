const mongoose = require('mongoose');

/**
 * WatchlistItem Schema
 *
 * Represents a movie item within a user's watchlist
 * Links movies to specific watchlists
 */
const watchlistItemSchema = new mongoose.Schema(
  {
    watchlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Watchlist',
      required: true,
    },
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
    movieGenres: {
      type: [String],
      default: [],
    },
    priority: {
      type: Number,
      default: 0, // For custom ordering within watchlist
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    watched: {
      type: Boolean,
      default: false,
    },
    watchedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique movies per watchlist
watchlistItemSchema.index({ watchlist: 1, movieId: 1 }, { unique: true });

// Index for efficient queries
watchlistItemSchema.index({ watchlist: 1, priority: 1, createdAt: -1 });
watchlistItemSchema.index({ user: 1, movieId: 1 });
watchlistItemSchema.index({ user: 1, watched: 1, watchedAt: -1 });

const WatchlistItem = mongoose.model('WatchlistItem', watchlistItemSchema);

module.exports = WatchlistItem;