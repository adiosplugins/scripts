const webpack = require('webpack');
const defaultConfig = require('./webpack.config');
const DependencyExtractionWebpackPlugin = require('@wordpress/scripts/../dependency-extraction-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const {
  defaultRequestToExternal,
  defaultRequestToHandle
} = require('@wordpress/scripts/../dependency-extraction-webpack-plugin/lib/util');

const config = {
  ...defaultConfig,
  mode: 'development',
  devServer: {
    hot: true,
    hmr: true,
  }
};

const addHotReload = (entry) => {
  const hotEntry = 'webpack-hot-middleware/client?path=/__webpack_hmr&log=false&heartbeat=2000&reload=true';

  if (typeof entry === 'string') {
    return entry.match(/jsx?$/gi)
      ? [hotEntry, entry]
      : entry;
  }

  if (Array.isArray(entry)) {
    return entry.some(item => item.match(/jsx?$/gi))
      ? [hotEntry, ...entry]
      : entry;
  }

  if (Object(entry) === entry) {
    Object.keys(entry).forEach((item) => {
      entry[item] = addHotReload(entry[item]);
    });
  }

  return entry;
};

//config.entry = addHotReload(config.entry);

config.plugins.push(new webpack.HotModuleReplacementPlugin());
config.plugins.push(new ReactRefreshWebpackPlugin({
  overlay: {
    sockIntegration: 'whm',
  },
}));

config.plugins = config.plugins.map(plugin => {
  if (plugin instanceof DependencyExtractionWebpackPlugin) {
    return new DependencyExtractionWebpackPlugin({
      ...plugin.options,
      useDefaults: false,
      requestToExternal: (request) => {
        const response = defaultRequestToExternal(request);

        if (['React', 'ReactDOM'].includes(response)) {
          return undefined;
        }

        return response;
      },
      requestToHandle: defaultRequestToHandle,
    });
  }

  return plugin;
});

const transformBabelRule = (rule) => {
  if (rule.loader === require.resolve('babel-loader')) {
    rule.options = rule.options || {};
    rule.options.plugins = rule.options.plugins || [];
    rule.options.plugins.push(require.resolve('react-refresh/babel'));
  }

  return rule;
};

const transformRule = (rule) => {
  if (typeof rule === 'string') {
    return transformBabelRule({ loader: rule });
  } else if (typeof rule.loader === 'string') {
    return transformBabelRule(rule);
  } else if (Array.isArray(rule.use)) {
    rule.use = rule.use.map(transformRule);
  }

  return rule;
};

config.module.rules = config.module.rules.map(transformRule);

module.exports = config;
