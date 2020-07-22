const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('../config/webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const browserSync = require('browser-sync').create();
const {getPluginURL, getWordPressURL, getRandonString, getConfig, copyAssets} = require('../utils');

const custom = getConfig();
const wordPressURL = getWordPressURL();
const pluginURL = getPluginURL();
const webpackSettings = custom.webpack(webpackConfig({
  isDevelopment: true,
  isHot: true,
  path: path.resolve(process.cwd(), custom.config.build),
  publicPath: pluginURL + custom.config.build + '/',
  jsonpFunction: getRandonString(10, '_jsonp'),
  entry: custom.config.entry,
}));

const bundler = webpack(
  webpackSettings
);

browserSync.watch(custom.config.build + '/**/*.css', function (event, file) {
  if (event === 'change') {
    browserSync.reload(file);
  } else {
    browserSync.reload();
  }
});

browserSync.watch(custom.config.build + '/assets-manifest.json', () => {
  copyAssets(custom.config.build, 'assets-manifest.json', custom.copy);
});

browserSync.watch('*.php', browserSync.reload);

browserSync.init(custom.browserSync({
  proxy: {
    target: wordPressURL,
    ws: true,
    proxyReq: [
      function (proxyReq) {
        proxyReq.setHeader('Access-Control-Allow-Origin', '*');
      }
    ],
  },
  middleware: [
    webpackDevMiddleware(bundler, {
      quiet: true,
      path: webpackSettings.output.path,
      publicPath: webpackSettings.output.publicPath,
      stats: webpackSettings.stats,
    }),
    webpackHotMiddleware(bundler, {
      path: '/__webpack_hmr',
      log: false,
      heartbeat: 2000,
    }),
  ],
  open: false,
  stream: true,
  watchOptions: {
    cwd: process.cwd(),
  },
}));
