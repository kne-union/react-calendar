module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.js'],
  transform: {
    '^.+\\.jsx?$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
      }
    ]
  }
};
