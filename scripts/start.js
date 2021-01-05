const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('../config/webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const browserSync = require('browser-sync').create();
const {getPluginURL, getRandonString, getConfig, copyAssets} = require('../utils');

const custom = getConfig();
const pluginURL = getPluginURL();
const webpackSettings = webpackConfig({
  isDevelopment: true,
  isHot: false,
  path: path.resolve(process.cwd(), custom.config.build),
  publicPath: pluginURL + custom.config.build + '/',
  jsonpFunction: getRandonString(10, '_jsonp'),
  entry: custom.config.entry,
});

const bundler = webpack(custom.webpack(webpackSettings));

browserSync.watch('*.php', browserSync.reload);

browserSync.watch(custom.config.build + '/**.*', browserSync.reload);

browserSync.watch(custom.config.build + '/**.*', () => {
  copyAssets(custom.config.build, 'assets-manifest.json', custom.copy);
});

/*
browserSync.use(require('./utils/snippet-injector'), {
  file: path.join(process.cwd(), 'bs-snippet.php'),
});
*/

browserSync.init({
  open: false,
  stream: true,
  watchOptions: {
    cwd: process.cwd(),
  },
  middleware: [
    webpackDevMiddleware(bundler, {
      publicPath: webpackSettings.output.publicPath,
      writeToDisk: true,
    }),
  ],
  https: true,
});
