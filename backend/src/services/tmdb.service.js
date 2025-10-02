const axios = require('axios');
const { AppError } = require('../utils/error');

/**
 * Service for interacting with TMDB API
 */
class TMDBService {
  constructor() {
    this.baseUrl = 'https://api.themoviedb.org/3';
    this.apiKey = process.env.TMDB_API_KEY;
    this.language = 'en-US';

    // Initialize axios instance with common config
    this.api = axios.create({
      baseURL: this.baseUrl,
      params: {
        api_key: this.apiKey,
        language: this.language,
      },
    });
  }

  /**
   * Search movies by query string
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.year - Release year filter (optional)
   * @returns {Promise<Object>} - Search results
   */
  async searchMovies({ query, page = 1, year }) {
    try {
      const params = { query, page };

      // Add optional year filter if provided
      if (year) {
        params.primary_release_year = year;
      }

      const response = await this.api.get('/search/movie', { params });
      return response.data;
    } catch (error) {
      this._handleApiError(error, 'Error searching movies');
    }
  }

  /**
   * Discover movies by filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - Movie results
   */
  async discoverMovies({
    page = 1,
    sortBy = 'popularity.desc',
    withGenres = '',
    primaryReleaseYear = '',
    voteAverageGte = '',
    voteAverageLte = '',
  }) {
    try {
      const params = {
        page,
        sort_by: sortBy,
      };

      // Add optional filters
      if (withGenres) params.with_genres = withGenres;
      if (primaryReleaseYear) params.primary_release_year = primaryReleaseYear;
      if (voteAverageGte) params.vote_average_gte = voteAverageGte;
      if (voteAverageLte) params.vote_average_lte = voteAverageLte;

      const response = await this.api.get('/discover/movie', { params });
      return response.data;
    } catch (error) {
      this._handleApiError(error, 'Error discovering movies');
    }
  }

  /**
   * Get movie details by TMDB ID
   * @param {number} movieId - TMDB movie ID
   * @returns {Promise<Object>} - Movie details
   */
  async getMovieDetails(movieId) {
    try {
      const response = await this.api.get(`/movie/${movieId}`, {
        params: {
          append_to_response: 'credits,videos,recommendations,similar',
        },
      });
      return response.data;
    } catch (error) {
      this._handleApiError(
        error,
        `Error fetching movie details for ID: ${movieId}`
      );
    }
  }

  /**
   * Get all available genres
   * @returns {Promise<Array>} - List of genres
   */
  async getGenres() {
    try {
      const response = await this.api.get('/genre/movie/list');
      return response.data.genres;
    } catch (error) {
      this._handleApiError(error, 'Error fetching genres');
    }
  }

  /**
   * Handle API errors
   * @private
   * @param {Error} error - Error object
   * @param {string} message - Custom error message
   */
  _handleApiError(error, message) {
    console.error(
      `TMDB API Error: ${message}`,
      error.response?.data || error.message
    );

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new AppError(
        error.response.data.status_message || message,
        error.response.status || 500
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new AppError('No response from TMDB API', 503);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new AppError(message, 500);
    }
  }
}

module.exports = new TMDBService();
