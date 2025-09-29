const { ZodError } = require("zod");
const { AppError } = require("./error");

exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (err instanceof ZodError) {
      const errors = err.errors || [];
      const errorMessage = errors.length > 0
        ? errors.map(error => error.message).join(", ")
        : "Validation error";
      return next(new AppError(errorMessage, 400));
    }
    next(err);
  });
};
