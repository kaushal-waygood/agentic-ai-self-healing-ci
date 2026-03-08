module.exports = {
  setupFiles: ['./jest.setup.js'],
  transform: {
    '^.+\\.js$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  transformIgnorePatterns: ['node_modules/(?!mongoose|mongodb)'],
};
