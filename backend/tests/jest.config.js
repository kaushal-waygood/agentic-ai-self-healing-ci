module.exports = {
  setupFiles: ['./jest.setup.js'], // Path to setup file
  transformIgnorePatterns: ['node_modules/(?!mongoose|mongodb)'],
};
