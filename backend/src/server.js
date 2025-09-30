/**
 * @fileoverview Entry point of the server application.
 * Loads environment variables, connects to MongoDB, and starts the Express server.
 */

const dotenv = require('dotenv'); // Loads environment variables from .env file
const app = require('./app'); // Express application instance
const connectDB = require('./config/database'); // Database connection function

// Load environment variables from .env file into process.env
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
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
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
