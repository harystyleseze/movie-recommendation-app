const { z } = require('zod');

/**
 * Search movies validation schema
 */
const searchMoviesSchema = z
  .object({
    query: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    year: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => data.query || data.year, {
    message: 'Either \'query\' or \'year\' must be provided',
    path: ['query'],
  });

/**
 * Discover movies validation schema
 */
const discoverMoviesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  sortBy: z.enum(['popularity', 'rating', 'year', 'title']).default('popularity'),
  genres: z.string().optional(),
  year: z.coerce.number().int().positive().optional(),
  ratingMin: z.coerce.number().min(0).max(10).optional(),
  ratingMax: z.coerce.number().min(0).max(10).optional(),
});

/**
 * Recommendations validation schema
 */
const recommendationsSchema = z.object({
  genres: z.string().optional(),
  baseMovie: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(20).default(10),
});

/**
 * Trending movies validation schema
 */
const trendingMoviesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  timeWindow: z.enum(['day', 'week']).default('week'),
});

/**
 * Movie ID validation schema
 */
const movieIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = {
  searchMoviesSchema,
  discoverMoviesSchema,
  movieIdSchema,
  recommendationsSchema,
  trendingMoviesSchema,
};
