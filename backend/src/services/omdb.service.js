const axios = require('axios');
const { AppError } = require('../utils/error');

/**
 * Service for interacting with OMDb API
 * Minimal, secure, and follows the existing codebase patterns
 */
class OMDbService {
  constructor() {
    this.baseUrl = 'http://www.omdbapi.com/';
    this.apiKey = process.env.OMDB_API_KEY;

    if (!this.apiKey) {
      throw new Error('OMDB_API_KEY environment variable is required');
    }

    // Initialize axios instance with common config
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000, // 10 second timeout
      params: {
        apikey: this.apiKey,
      },
    });
  }

  /**
   * Search movies by title
   * @param {Object} options - Search options
   * @param {string} options.query - Search query (movie title)
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.year - Release year filter (optional)
   * @returns {Promise<Object>} - Search results
   */
  async searchMovies({ query, page = 1, year }) {
    try {
      if (!query) {
        throw new AppError('Search query is required', 400);
      }

      const params = {
        s: query,
        page,
        type: 'movie', // Only search for movies
      };

      // Add optional year filter if provided
      if (year) {
        params.y = year;
      }

      const response = await this.api.get('', { params });
      const data = response.data;

      // OMDb returns error in the response body
      if (data.Response === 'False') {
        throw new AppError(data.Error || 'Movie not found', 404);
      }

      // Transform OMDb response to match our expected format
      return {
        results: data.Search || [],
        total_results: parseInt(data.totalResults) || 0,
        page: page,
        total_pages: Math.ceil((parseInt(data.totalResults) || 0) / 10),
      };
    } catch (error) {
      this._handleApiError(error, 'Error searching movies');
    }
  }

  /**
   * Get movie details by IMDb ID or title
   * @param {string} identifier - IMDb ID (tt1285016) or movie title
   * @param {boolean} isImdbId - Whether identifier is IMDb ID
   * @returns {Promise<Object>} - Movie details
   */
  async getMovieDetails(identifier, isImdbId = true) {
    try {
      if (!identifier) {
        throw new AppError('Movie identifier is required', 400);
      }

      const params = {
        plot: 'full', // Get full plot
      };

      // Use IMDb ID or title search
      if (isImdbId) {
        params.i = identifier;
      } else {
        params.t = identifier;
      }

      const response = await this.api.get('', { params });
      const data = response.data;

      // OMDb returns error in the response body
      if (data.Response === 'False') {
        throw new AppError(data.Error || 'Movie not found', 404);
      }

      return data;
    } catch (error) {
      this._handleApiError(
        error,
        `Error fetching movie details for: ${identifier}`
      );
    }
  }

  /**
   * Discover movies by filters (simplified for OMDb)
   * OMDb doesn't have advanced filtering, so we'll search by genre keywords
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - Movie results
   */
  async discoverMovies({
    page = 1,
    genres = '',
    year = '',
  } = {}) {
    try {
      // For OMDb, we'll search by genre as keyword if provided
      let searchQuery = genres || 'movie'; // Default search

      if (genres) {
        // Use genre as search term (e.g., "action", "comedy")
        searchQuery = genres.toLowerCase();
      }

      return this.searchMovies({
        query: searchQuery,
        page,
        year
      });
    } catch (error) {
      this._handleApiError(error, 'Error discovering movies');
    }
  }

  /**
   * Get genres - OMDb doesn't have a genres endpoint
   * Return common movie genres as fallback
   * @returns {Promise<Array>} - List of genres
   */
  async getGenres() {
    try {
      // OMDb doesn't provide genres endpoint, so return common genres
      const commonGenres = [
        { id: 1, name: 'Action' },
        { id: 2, name: 'Adventure' },
        { id: 3, name: 'Comedy' },
        { id: 4, name: 'Crime' },
        { id: 5, name: 'Drama' },
        { id: 6, name: 'Fantasy' },
        { id: 7, name: 'Horror' },
        { id: 8, name: 'Romance' },
        { id: 9, name: 'Sci-Fi' },
        { id: 10, name: 'Thriller' },
        { id: 11, name: 'Animation' },
        { id: 12, name: 'Documentary' },
        { id: 13, name: 'Family' },
        { id: 14, name: 'Musical' },
        { id: 15, name: 'Mystery' },
      ];

      return commonGenres;
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
      `OMDb API Error: ${message}`,
      error.response?.data || error.message
    );

    // If it's already an AppError, re-throw it
    if (error instanceof AppError) {
      throw error;
    }

    if (error.response) {
      // The request was made and the server responded with a status code
      const status = error.response.status || 500;
      const errorMessage = error.response.data?.Error || message;
      throw new AppError(errorMessage, status);
    } else if (error.request) {
      // The request was made but no response was received
      throw new AppError('No response from OMDb API', 503);
    } else {
      // Something happened in setting up the request
      throw new AppError(message, 500);
    }
  }
}

module.exports = new OMDbService();