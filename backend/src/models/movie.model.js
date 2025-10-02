const mongoose = require('mongoose');

/**
 * Movie Schema
 *
 * Stores basic movie information from TMDB API.
 * Full details are fetched from API when needed.
 */
const movieSchema = new mongoose.Schema(
  {
    imdbId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    posterPath: {
      type: String,
      default: null,
    },
    overview: {
      type: String,
      default: '',
    },
    releaseDate: {
      type: Date,
    },
    genres: [
      {
        type: String,
      },
    ],
    voteAverage: {
      type: Number,
      min: 0,
      max: 10,
    },
    year: {
      type: Number,
    },
    runtime: {
      type: String,
    },
    director: {
      type: String,
    },
    actors: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
movieSchema.index({ title: 'text', genres: 'text' });
movieSchema.index({ imdbId: 1 });
movieSchema.index({ voteAverage: -1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ year: -1 });

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
