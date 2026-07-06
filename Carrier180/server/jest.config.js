module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'routes/**/*.js',
    'services/**/*.js',
    '!services/gemini.js',
  ],
  coverageReporters: ['text', 'lcov'],
}
