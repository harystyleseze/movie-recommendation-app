const { z } = require('zod');

/**
 * Add to favorites validation schema
 */
const addToFavoritesSchema = z.object({
  movieId: z.string().min(1, 'Movie ID is required').trim(),
});

/**
 * Remove from favorites validation schema
 */
const removeFromFavoritesSchema = z.object({
  movieId: z.string().min(1, 'Movie ID is required').trim(),
});

/**
 * Get user favorites query validation schema
 */
const getUserFavoritesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['addedAt', 'movieTitle', 'movieYear']).default('addedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
});

/**
 * Get popular movies query validation schema
 */
const getPopularMoviesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Get recommendations query validation schema
 */
const getRecommendationsSchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(10),
});

/**
 * Movie ID parameter validation schema
 */
const movieIdParamSchema = z.object({
  movieId: z.string().min(1, 'Movie ID is required').trim(),
});

module.exports = {
  addToFavoritesSchema,
  removeFromFavoritesSchema,
  getUserFavoritesSchema,
  getPopularMoviesSchema,
  getRecommendationsSchema,
  movieIdParamSchema,
};