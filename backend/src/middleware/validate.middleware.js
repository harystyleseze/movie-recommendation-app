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
        // Debug log to see the actual error structure
        console.log('Zod Error:', JSON.stringify(error, null, 2));
        console.log('Error.errors:', error.errors);
        console.log('Error.issues:', error.issues);

        const errorMessages = (error.issues || error.errors || []).map((err) => ({
          field: err.path?.join('.') || 'unknown',
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