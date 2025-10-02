const { z } = require('zod');

/**
 * Update user profile validation schema
 */
const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim()
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .trim()
    .optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  favoriteGenres: z
    .array(z.string().trim())
    .max(10, 'Cannot have more than 10 favorite genres')
    .optional(),
  preferences: z
    .object({
      emailNotifications: z.boolean().optional(),
      publicWatchlists: z.boolean().optional(),
      publicRatings: z.boolean().optional(),
    })
    .optional(),
});

/**
 * User search validation schema
 */
const searchUsersSchema = z.object({
  q: z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query cannot exceed 100 characters')
    .trim(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

/**
 * User ID parameter validation schema
 */
const userIdParamSchema = z.object({
  userId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid user ID format'),
});

module.exports = {
  updateProfileSchema,
  searchUsersSchema,
  userIdParamSchema,
};