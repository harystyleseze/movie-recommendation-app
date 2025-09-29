const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/error");
const User = require("../models/user.model");
const { asyncHandler } = require("../utils/async");

exports.protect = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Not authenticated", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    throw new AppError("Invalid token", 401);
  }
});
