/**
 * @fileoverview Sets up the Express application.
 * Loads environment variables, configures middleware, registers routes,
 * and adds error handling middleware.
 */

const express = require("express"); // Express framework
const cors = require("cors"); // Middleware for Cross-Origin Resource Sharing
const dotenv = require("dotenv"); // Loads environment variables from .env file

// Load environment variables
dotenv.config();

// // Route modules
const userRoutes = require("./routes/userRoutes");
// const movieRoutes = require("./routes/movieRoutes");

// Initialize Express application
const app = express();

/**
 * @constant {string[]} allowedOrigins - Whitelisted domains for CORS.
 */
const allowedOrigins = ["http://localhost:3000", "https://movieapp.com"];

/**
 * @typedef {import('cors').CorsOptions} CorsOptions
 */

/**
 * @constant {CorsOptions} corsOptions - Configuration for the CORS middleware.
 */
const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (e.g., Postman, curl) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// =======================
// Middleware
// =======================

/**
 * Enable CORS using the custom configuration.
 */
app.use(cors(corsOptions));

/**
 * Middleware to parse incoming JSON requests.
 */
app.use(express.json());

// =======================
// Routes
// =======================

/**
 * User-related routes.
 * Mounted at /api/v1/users
 */
app.use("/api/v1/users", userRoutes);

/**
 * Movie-related routes.
 * Mounted at /api/v1/movies
 */
// app.use("/api/v1/movies", movieRoutes);

// =======================
// Global Error Handling
// =======================

/**
 * Global error handler middleware.
 * Logs the error and sends a generic 500 response.
 *
 * @param {Error} err - The error object
 * @param {import('express').Request} req - The request object
 * @param {import('express').Response} res - The response object
 * @param {import('express').NextFunction} next - The next middleware function
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

module.exports = app;
