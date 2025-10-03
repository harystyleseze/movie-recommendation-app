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
   * Discover movies by filters with enhanced filtering
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} - Movie results with filtering
   */
  async discoverMovies({
    page = 1,
    genres = '',
    year = '',
    ratingMin = '',
    ratingMax = '',
    sortBy = 'popularity',
  } = {}) {
    try {
      // For OMDb, we'll search by genre as keyword if provided
      let searchQuery = genres || 'movie'; // Default search

      if (genres) {
        // Use genre as search term (e.g., "action", "comedy")
        searchQuery = genres.toLowerCase();
      }

      const results = await this.searchMovies({
        query: searchQuery,
        page,
        year
      });

      // Apply additional filtering since OMDb doesn't support advanced filters
      if (results.results && (ratingMin || ratingMax || sortBy !== 'popularity')) {
        const filteredResults = await this._applyAdvancedFilters(
          results.results,
          { ratingMin, ratingMax, sortBy }
        );

        return {
          ...results,
          results: filteredResults,
        };
      }

      return results;
    } catch (error) {
      this._handleApiError(error, 'Error discovering movies');
    }
  }

  /**
   * Get personalized movie recommendations
   * @param {Object} options - Recommendation options
   * @returns {Promise<Object>} - Recommended movies
   */
  async getRecommendations({
    userId: _userId = null, // Future use for personalized recommendations
    genres = [],
    baseMovie = null,
    page = 1,
    limit = 10
  } = {}) {
    try {
      let searchQuery = 'popular';

      // If genres provided, use them for recommendations
      if (genres.length > 0) {
        searchQuery = genres[0].toLowerCase();
      }

      // If base movie provided, get similar movies by genre
      if (baseMovie) {
        const movieDetails = await this.getMovieDetails(baseMovie, true);
        if (movieDetails && movieDetails.Genre !== 'N/A') {
          const movieGenres = movieDetails.Genre.split(', ');
          searchQuery = movieGenres[0].toLowerCase();
        }
      }

      const results = await this.searchMovies({
        query: searchQuery,
        page
      });

      // Sort by rating for better recommendations
      if (results.results) {
        const detailedResults = await this._enhanceWithRatings(results.results.slice(0, limit));

        return {
          ...results,
          results: detailedResults,
          recommendation_type: baseMovie ? 'similar' : 'genre_based',
        };
      }

      return results;
    } catch (error) {
      this._handleApiError(error, 'Error generating recommendations');
    }
  }

  /**
   * Get trending/popular movies
   * @param {Object} options - Options for trending movies
   * @returns {Promise<Object>} - Trending movies
   */
  async getTrendingMovies({ page = 1, timeWindow: _timeWindow = 'week' } = {}) {
    try {
      // OMDb doesn't have trending endpoint, so we'll search for popular movies
      const popularQueries = ['Marvel', 'Batman', 'Star Wars', 'Disney', 'Action'];
      const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)];

      const results = await this.searchMovies({
        query: randomQuery,
        page
      });

      if (results.results) {
        const enhancedResults = await this._enhanceWithRatings(results.results);

        return {
          ...results,
          results: enhancedResults.sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0)),
        };
      }

      return results;
    } catch (error) {
      this._handleApiError(error, 'Error fetching trending movies');
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
   * Apply advanced filters to movie results
   * @private
   * @param {Array} movies - Array of movie objects
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} - Filtered movies
   */
  async _applyAdvancedFilters(movies, { ratingMin, ratingMax, sortBy }) {
    try {
      // Get detailed info for filtering by rating
      const detailedMovies = await this._enhanceWithRatings(movies);

      let filteredMovies = detailedMovies;

      // Filter by rating if specified
      if (ratingMin || ratingMax) {
        filteredMovies = detailedMovies.filter(movie => {
          const rating = parseFloat(movie.imdbRating) || 0;
          const minRating = parseFloat(ratingMin) || 0;
          const maxRating = parseFloat(ratingMax) || 10;
          return rating >= minRating && rating <= maxRating;
        });
      }

      // Sort results
      switch (sortBy) {
        case 'rating':
          filteredMovies.sort((a, b) => (parseFloat(b.imdbRating) || 0) - (parseFloat(a.imdbRating) || 0));
          break;
        case 'year':
          filteredMovies.sort((a, b) => (parseInt(b.Year) || 0) - (parseInt(a.Year) || 0));
          break;
        case 'title':
          filteredMovies.sort((a, b) => a.Title.localeCompare(b.Title));
          break;
        default:
          // Keep original order (popularity)
          break;
      }

      return filteredMovies;
    } catch (error) {
      console.error('Error applying advanced filters:', error);
      return movies; // Return original movies if filtering fails
    }
  }

  /**
   * Enhance movie results with detailed ratings and info
   * @private
   * @param {Array} movies - Array of basic movie objects
   * @returns {Promise<Array>} - Enhanced movie objects
   */
  async _enhanceWithRatings(movies) {
    try {
      // Limit concurrent requests to avoid rate limiting
      const BATCH_SIZE = 3;
      const enhancedMovies = [];

      for (let i = 0; i < movies.length; i += BATCH_SIZE) {
        const batch = movies.slice(i, i + BATCH_SIZE);

        const enhancedBatch = await Promise.all(
          batch.map(async (movie) => {
            try {
              // Get detailed info for each movie
              const details = await this.getMovieDetails(movie.imdbID, true);
              return {
                ...movie,
                imdbRating: details.imdbRating,
                Genre: details.Genre,
                Director: details.Director,
                Plot: details.Plot,
                Runtime: details.Runtime,
              };
            } catch (error) {
              // If detail fetch fails, return original movie
              console.warn(`Failed to enhance movie ${movie.imdbID}:`, error.message);
              return {
                ...movie,
                imdbRating: 'N/A',
                Genre: 'N/A',
                Director: 'N/A',
                Plot: 'N/A',
                Runtime: 'N/A',
              };
            }
          })
        );

        enhancedMovies.push(...enhancedBatch);

        // Small delay between batches to be respectful to API
        if (i + BATCH_SIZE < movies.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      return enhancedMovies;
    } catch (error) {
      console.error('Error enhancing movies with ratings:', error);
      return movies; // Return original movies if enhancement fails
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