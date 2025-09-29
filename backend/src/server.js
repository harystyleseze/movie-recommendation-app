/**
 * @fileoverview Entry point of the server application.
 * Loads environment variables, connects to MongoDB, and starts the Express server.
 */

const mongoose = require("mongoose"); // Mongoose ODM for MongoDB interaction
const dotenv = require("dotenv"); // Loads environment variables from .env file
const app = require("./app"); // Express application instance

// Load environment variables from .env file into process.env
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});

/**
 * @constant {number|string} PORT - Port number from environment or default value
 */
const PORT = process.env.PORT || 5000;

/**
 * Connect to MongoDB and start the Express server.
 * Ensures that the app does not start unless the database connection is successful.
 *
 * @async
 * @function startServer
 * @returns {Promise<void>} Resolves when the server has started successfully.
 */
async function startServer() {
  try {
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Exit the app if DB connection fails
  }
}

// Start the server
startServer();
