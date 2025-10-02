const mongoose = require('mongoose');

/**
 * Watchlist Schema
 *
 * Represents a user's custom movie watchlist
 * Users can create multiple named watchlists
 */
const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    movieCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
watchlistSchema.index({ user: 1, createdAt: -1 });
watchlistSchema.index({ user: 1, name: 1 });
watchlistSchema.index({ isPublic: 1, createdAt: -1 });

// Virtual for watchlist items
watchlistSchema.virtual('items', {
  ref: 'WatchlistItem',
  localField: '_id',
  foreignField: 'watchlist',
});

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;