const path = require('path');
const fs = require('fs');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const WriteFilePlugin = require('write-file-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const DependencyExtractionWebpackPlugin = require('@wordpress/scripts/../dependency-extraction-webpack-plugin');

const config = { ...defaultConfig };
const wpifyConfigPath = path.resolve(process.cwd(), 'wpify.config.js');

config.resolve.extensions = ['.js', '.json', '.jsx'];

config.plugins.push(new WriteFilePlugin({
  force: true,
}));

config.plugins.push(new WebpackManifestPlugin({
  fileName: 'assets-manifest.json',
}));

if (fs.existsSync(wpifyConfigPath)) {
  const wpifyConfig = require(wpifyConfigPath);

  if (wpifyConfig.config.entry) {
    config.entry = wpifyConfig.config.entry;
  }

  if (wpifyConfig.config.build) {
    config.output.path = path.resolve(process.cwd(), wpifyConfig.config.build);
  }

  if (typeof wpifyConfig.webpack === 'function') {
    return wpifyConfig.webpack(config);
  }

  if (typeof wpifyConfig.copy === 'object') {
    const copy = [];

    Object.keys(wpifyConfig.copy).forEach((file) => {
      copy.push({
        source: path.resolve(process.cwd(), config.output.path, file),
        destination: path.resolve(process.cwd(), wpifyConfig.copy[file]),
      });
    });

    config.plugins.push(new FileManagerPlugin({
      events: {
        onEnd: { copy },
      },
    }));
  }
}

config.plugins = config.plugins.map(plugin => {
  if (plugin instanceof DependencyExtractionWebpackPlugin) {
    return new DependencyExtractionWebpackPlugin({
      ...plugin.options,
      combineAssets: true,
    });
  }

  return plugin;
});

module.exports = config;
