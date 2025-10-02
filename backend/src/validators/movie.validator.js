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
  sortBy: z.string().optional().default('popularity.desc'),
  genres: z.string().optional(),
  year: z.coerce.number().int().positive().optional(),
  ratingMin: z.coerce.number().min(0).max(10).optional(),
  ratingMax: z.coerce.number().min(0).max(10).optional(),
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
};
