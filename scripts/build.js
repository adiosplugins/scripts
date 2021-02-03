const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('../config/webpack');
const { getRandonString, getConfig, copyAssets } = require('../utils');

const custom          = getConfig();
const webpackSettings = webpackConfig({
  isDevelopment: false,
  isHot: false,
  path: path.resolve(process.cwd(), custom.config.build),
  chunkLoadingGlobal: getRandonString(10, '_jsonp'),
  entry: custom.config.entry,
});

webpack(custom.webpack(webpackSettings), (err, stats) => {
  if (err) {
    console.error(err.stack || err);

    if (err.details) {
      console.error(err.details);
    }

    return;
  }

  const info = stats.toJson();

  copyAssets(custom.config.build, 'assets-manifest.json', custom.copy);
});
