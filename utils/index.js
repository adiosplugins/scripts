const { cosmiconfigSync } = require('cosmiconfig');

const getConfig = () => {
  const explorerSync = cosmiconfigSync('wpify');
  const result = explorerSync.search();

  if (result && result.config) {
    const {
      wordPressUrl = 'http://localhost',
      config = { build: 'build' },
      webpack = config => config,
      browserSync = config => config,
      copy = {},
    } = result.config;

    return { wordPressUrl, config, webpack, browserSync, copy };
  }
};

module.exports = {
  getConfig,
};
