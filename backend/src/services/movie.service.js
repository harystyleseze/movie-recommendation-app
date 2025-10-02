const omdbService = require('./omdb.service');
const Movie = require('../models/movie.model');
const { AppError } = require('../utils/error');

/**
 * Movie service for handling business logic
 * Uses OMDb API for movie data
 */
class MovieService {
  /**
   * Search movies by title, genres, or year
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchMovies(searchParams) {
    const { query, page, year } = searchParams;

    if (!query && !year) {
      throw new AppError('Search query or year is required', 400);
    }

    return omdbService.searchMovies({ query, page, year });
  }

  /**
   * Get movies by filters with enhanced filtering
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Movie results
   */
  async getMoviesByFilters(filters) {
    return omdbService.discoverMovies(filters);
  }

  /**
   * Get personalized movie recommendations
   * @param {Object} options - Recommendation options
   * @returns {Promise<Object>} Recommended movies
   */
  async getRecommendations(options) {
    return omdbService.getRecommendations(options);
  }

  /**
   * Get trending/popular movies
   * @param {Object} options - Options for trending movies
   * @returns {Promise<Object>} Trending movies
   */
  async getTrendingMovies(options) {
    return omdbService.getTrendingMovies(options);
  }

  /**
   * Get movie details
   * @param {string} movieId - IMDb ID or movie title
   * @returns {Promise<Object>} Movie details
   */
  async getMovieDetails(movieId) {
    if (!movieId) {
      throw new AppError('Movie ID is required', 400);
    }

    // Check if it's an IMDb ID (starts with 'tt')
    const isImdbId = movieId.startsWith('tt');
    return omdbService.getMovieDetails(movieId, isImdbId);
  }

  /**
   * Get all available genres
   * @returns {Promise<Array>} List of genres
   */
  async getGenres() {
    return omdbService.getGenres();
  }

  /**
   * Save movie to database (for optimization or user history)
   * @param {Object} movieData - Movie data from OMDb
   * @returns {Promise<Object>} Saved movie
   */
  async saveMovie(movieData) {
    try {
      // Check if movie already exists
      const existingMovie = await Movie.findOne({ imdbId: movieData.imdbID });

      if (existingMovie) {
        return existingMovie;
      }

      // Map OMDb movie data to our schema
      const movie = new Movie({
        imdbId: movieData.imdbID,
        title: movieData.Title,
        posterPath: movieData.Poster !== 'N/A' ? movieData.Poster : null,
        overview: movieData.Plot !== 'N/A' ? movieData.Plot : '',
        releaseDate: movieData.Released !== 'N/A' ? new Date(movieData.Released) : null,
        genres: movieData.Genre !== 'N/A' ? movieData.Genre.split(', ') : [],
        voteAverage: movieData.imdbRating !== 'N/A' ? parseFloat(movieData.imdbRating) : null,
        year: movieData.Year !== 'N/A' ? parseInt(movieData.Year) : null,
        runtime: movieData.Runtime !== 'N/A' ? movieData.Runtime : null,
        director: movieData.Director !== 'N/A' ? movieData.Director : null,
        actors: movieData.Actors !== 'N/A' ? movieData.Actors : null,
      });

      return await movie.save();
    } catch (error) {
      console.error('Error saving movie:', error);
      throw new AppError('Failed to save movie', 500);
    }
  }
}

module.exports = new MovieService();
