const { z } = require('zod');

/**
 * Create watchlist validation schema
 */
const createWatchlistSchema = z.object({
  name: z
    .string()
    .min(1, 'Watchlist name is required')
    .max(100, 'Watchlist name cannot exceed 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional(),
  isPublic: z.boolean().default(false),
});

/**
 * Update watchlist validation schema
 */
const updateWatchlistSchema = z.object({
  name: z
    .string()
    .min(1, 'Watchlist name is required')
    .max(100, 'Watchlist name cannot exceed 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .trim()
    .optional(),
  isPublic: z.boolean().optional(),
});

/**
 * Get watchlists query validation schema
 */
const getWatchlistsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'name', 'movieCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
});

/**
 * Add movie to watchlist validation schema
 */
const addMovieToWatchlistSchema = z.object({
  movieId: z.string().min(1, 'Movie ID is required').trim(),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .trim()
    .optional(),
  priority: z.coerce.number().int().min(0).max(10).default(0),
});

/**
 * Update watched status validation schema
 */
const updateWatchedStatusSchema = z.object({
  watched: z.boolean(),
});

/**
 * Watchlist ID parameter validation schema
 */
const watchlistIdParamSchema = z.object({
  watchlistId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid watchlist ID format'),
});

/**
 * Movie ID parameter validation schema
 */
const movieIdParamSchema = z.object({
  movieId: z.string().min(1, 'Movie ID is required').trim(),
});

/**
 * Watchlist and Movie ID parameters validation schema
 */
const watchlistMovieParamsSchema = z.object({
  watchlistId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid watchlist ID format'),
  movieId: z.string().min(1, 'Movie ID is required').trim(),
});

module.exports = {
  createWatchlistSchema,
  updateWatchlistSchema,
  getWatchlistsSchema,
  addMovieToWatchlistSchema,
  updateWatchedStatusSchema,
  watchlistIdParamSchema,
  movieIdParamSchema,
  watchlistMovieParamsSchema,
};