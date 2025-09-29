const mongoose = require('mongoose');

// Setup test database
beforeAll(async () => {
  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/moveere_test';
  await mongoose.connect(url);
});

// Clean up database after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

// Set test timeout
jest.setTimeout(10000);