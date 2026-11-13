module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^\\.\\./src/(.*)\\.js$': '<rootDir>/src/$1',
    '^(\\./.*)\\.js$': '$1',
  },
  transformIgnorePatterns: ['node_modules/'],
  testMatch: ['**/tests/**/*.test.ts'],
  testTimeout: 20000,
};
