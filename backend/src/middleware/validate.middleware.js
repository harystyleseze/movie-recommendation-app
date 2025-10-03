const { ZodError } = require('zod');

/**
 * Validate request data using Zod schemas
 * @param {Object} schemas - Object containing schemas for body, params, query
 * @returns {Function} Express middleware
 */
const validate = (schemas) => {
  return (req, res, next) => {
    try {
      // Validate request body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate request params
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      // Validate request query
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          status: 'fail',
          message: 'Validation failed',
          errors: errorMessages,
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during validation',
      });
    }
  };
};

module.exports = { validate };