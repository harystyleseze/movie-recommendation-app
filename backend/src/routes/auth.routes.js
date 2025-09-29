const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log(`Auth Route accessed: ${req.method} ${req.url}`);
  next();
});

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes (require authentication)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/change-password", protect, changePassword);

module.exports = router;
