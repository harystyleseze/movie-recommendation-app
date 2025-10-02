const { z } = require('zod');

/**
 * Add or update rating validation schema
 */
const addOrUpdateRatingSchema = z.object({
  movieId: z.string().min(1, 'Movie ID is required').trim(),
  rating: z
    .coerce
    .number()
    .int()
    .min(1, 'Rating must be between 1 and 10')
    .max(10, 'Rating must be between 1 and 10'),
  review: z
    .string()
    .max(2000, 'Review cannot exceed 2000 characters')
    .trim()
    .optional(),
  isPublic: z.boolean().default(true),
  watchedAt: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .or(z.date().optional()),
});

/**
 * Get user ratings query validation schema
 */
const getUserRatingsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'rating', 'movieTitle', 'watchedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().optional(),
  ratingFilter: z.coerce.number().min(1).max(10).optional(),
});

/**
 * Get movie ratings query validation schema
 */
const getMovieRatingsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['helpful', 'createdAt', 'rating']).default('helpful'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Get recent reviews query validation schema
 */
const getRecentReviewsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

/**
 * Rating ID parameter validation schema
 */
const ratingIdParamSchema = z.object({
  ratingId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid rating ID format'),
});

/**
 * Movie ID parameter validation schema
 */
const movieIdParamSchema = z.object({
  movieId: z.string().min(1, 'Movie ID is required').trim(),
});

module.exports = {
  addOrUpdateRatingSchema,
  getUserRatingsSchema,
  getMovieRatingsSchema,
  getRecentReviewsSchema,
  ratingIdParamSchema,
  movieIdParamSchema,
};