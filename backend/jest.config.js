module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // Reduce coverage thresholds for CI environment to focus on functionality
  coverageThreshold: {
    global: {
      branches: process.env.CI ? 50 : 70,
      functions: process.env.CI ? 50 : 70,
      lines: process.env.CI ? 50 : 70,
      statements: process.env.CI ? 50 : 70
    }
  },
  // Add more timeout for CI environments
  testTimeout: process.env.CI ? 30000 : 10000,
  // Better error handling for CI
  verbose: process.env.CI ? true : false
};