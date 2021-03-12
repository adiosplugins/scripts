const webpack = require('webpack');
const webpackConfig = require('../config/webpack.hot.config');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const browserSync = require('browser-sync').create();

const { getConfig } = require('../utils');

const config = getConfig();

const bundler = webpack(webpackConfig);

browserSync.watch(webpackConfig.output.path + '/**/*.css', function (event, file) {
  if (event === 'change') {
    browserSync.reload(file);
  } else {
    browserSync.reload();
  }
});

browserSync.watch('*.php', browserSync.reload);

browserSync.init(config.browserSync({
  proxy: {
    target: config.wordPressUrl,
    ws: true,
    proxyReq: [
      function (proxyReq) {
        proxyReq.setHeader('Access-Control-Allow-Origin', '*');
      }
    ],
  },
  middleware: [
    webpackDevMiddleware(bundler, {
      writeToDisk: true,
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
