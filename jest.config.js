module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/middleware/**",
    "!src/models/**",
    "!src/routes/**",
    "!src/services/**",
    "!src/utils/**",
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
