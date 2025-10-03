// Load test environment variables
require('dotenv').config({ path: '.env.test' });

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup test database
beforeAll(async () => {
  // Try to use in-memory MongoDB server for tests
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB for testing');
  } catch (error) {
    // Fallback to regular MongoDB connection
    console.log('Falling back to regular MongoDB connection');
    const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/moveere_test';

    try {
      await mongoose.connect(url, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
    } catch (connError) {
      console.error('Failed to connect to MongoDB:', connError.message);
      // Don't fail the tests, just log the error
      console.log('Tests will run without database connection');
    }
  }
});

// Clean up database after each test
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    } catch (error) {
      // Ignore cleanup errors in CI
      console.log('Database cleanup skipped:', error.message);
    }
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.log('Database cleanup error:', error.message);
  }
});

// Set test timeout
jest.setTimeout(15000);