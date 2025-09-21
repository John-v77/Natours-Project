module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testSetup.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 60000, // Increased timeout for MongoDB Memory Server
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',
  maxWorkers: 1, // Run tests serially to avoid MongoDB conflicts
  forceExit: true, // Force Jest to exit after tests complete
  detectOpenHandles: true // Help identify hanging resources
};