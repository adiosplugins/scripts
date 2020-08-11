const webpack = require('webpack');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const WebpackManifestPlugin = require('webpack-manifest-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');
const {defaultRequestToExternal, defaultRequestToHandle} = require('@wordpress/dependency-extraction-webpack-plugin/lib/util');
const FixStyleWebpackPlugin = require('@wordpress/scripts/config/fix-style-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const findBabelConfig = require('find-babel-config');
const findPostCssConfig = require('postcss-load-config');

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

module.exports = ({isDevelopment, isHot, publicPath, entry, jsonpFunction, path}) => {
  const mode = (isDevelopment || isHot) ? 'development' : 'production';

  const babelConfig = findBabelConfig.sync(process.cwd());

  if (!babelConfig.config) {
    babelConfig.config = {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react'
      ],
      plugins: [
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-optional-chaining',
      ],
    };
  }

  if (isHot) {
    babelConfig.config.plugins.push(require.resolve('react-refresh/babel'));
  }

  let postCssConfig;

  try {
    postCssConfig = findPostCssConfig.sync(process.cwd());
  } catch {
    postCssConfig = {
      plugins: [
        require('postcss-import')(),
        require('postcss-preset-env')(),
        require('postcss-font-display')({
          display: 'swap',
          replace: false
        }),
        require('postcss-pxtorem')(),
      ],
    };
  }

  const config = {
    mode,
    entry: isHot ? addHotReload(entry) : entry,
    output: {
      path, // where to put compiled files to
      filename: isDevelopment ? `[name].js` : `[name].[hash:8].js`,
      chunkFilename: isDevelopment ? `[name].js` : `[name].[hash:8].js`,
      jsonpFunction, // pick the unique jsonp function name, so the react apps doesn't collide
      publicPath,
      pathinfo: !isDevelopment,
    },
    context: process.cwd(),
    devtool: isDevelopment ? 'eval-cheap-module-source-map' : undefined,
    stats: 'minimal',
    resolve: {
      plugins: [PnpWebpackPlugin],
      extensions: ['.js', '.json', '.jsx'],
      cacheWithContext: false, // Set resolve.cacheWithContext: false if you use custom resolving plugins, that are not context specific.
      symlinks: false, // Set resolve.symlinks: false if you don't use symlinks (e.g. npm link or yarn link).
    },
    resolveLoader: {
      plugins: [PnpWebpackPlugin.moduleLoader(module)],
    },
    optimization: {
      splitChunks: isDevelopment ? undefined : {
        chunks: 'all', // This allows us to split the code into small chunks that loads faster
        minChunks: 2,
      },
      minimizer: isDevelopment ? undefined : [
        new TerserJSPlugin({}),
        new OptimizeCSSAssetsPlugin({}),
      ],
      removeAvailableModules: !isDevelopment,
      removeEmptyChunks: !isDevelopment,
    },
    devServer: {
      hot: isHot,
    },
    module: {
      rules: [
        { // compile js and jsx files with babel
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [
            isDevelopment && {
              loader: require.resolve('thread-loader'),
            },
            {
              loader: require.resolve('babel-loader'),
              options: babelConfig.config,
            },
          ].filter(Boolean),
        },
        { // We want to handle (s)css files, but CSS modules will be handled differently
          test: /\.(css|scss|sass)$/,
          exclude: /\.module\.(css|scss|sass)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                sourceMap: isDevelopment,
              },
            },
            {
              loader: require.resolve('css-loader'),
              options: {
                sourceMap: isDevelopment,
                importLoaders: 2,
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                sourceMap: isDevelopment,
                ...postCssConfig
              },
            },
            {
              loader: require.resolve('sass-loader'),
              options: {
                sourceMap: isDevelopment,
                implementation: require('node-sass'),
                sassOptions: {
                  fiber: false,
                },
              },
            },
          ],
        },
        { // CSS modules can be used in React application
          test: /\.(css|scss|sass)$/,
          include: /\.module\.(css|scss|sass)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                sourceMap: isDevelopment,
              },
            },
            {
              loader: require.resolve('css-loader'),
              options: {
                sourceMap: isDevelopment,
                importLoaders: 2,
                modules: {
                  localIdentName: '[name]_[local]',
                },
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                sourceMap: isDevelopment,
                ...postCssConfig
              },
            },
            {
              loader: require.resolve('sass-loader'),
              options: {
                sourceMap: isDevelopment,
                implementation: require('node-sass'),
                sassOptions: {
                  fiber: false,
                },
              },
            },
          ],
        },
        { // load the fonts
          test: /.(eot|woff|woff2|ttf|otf)$/,
          loader: require.resolve('file-loader'),
          options: {
            name: isDevelopment ? `[name].[ext]` : `[name].[hash:8].[ext]`,
            outputPath: 'fonts',
          },
        },
        { // load and optimise images
          test: /\.(gif|jpg|png)$/,
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {
                limit: 8192,
                name: isDevelopment ? `[name].[ext]` : `[name].[hash:8].[ext]`,
                outputPath: 'images',
              },
            },
            !isDevelopment && {
              loader: require.resolve('img-loader'),
              options: {
                plugins: !isDevelopment && [
                  imageminGifsicle({
                    interlaced: false,
                  }),
                  imageminMozjpeg({
                    progressive: true,
                    arithmetic: false,
                  }),
                  imageminPngquant({
                    floyd: 0.5,
                    speed: 2,
                  }),
                ],
              },
            },
          ].filter(Boolean),
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          issuer: {
            test: /\.jsx?$/,
          },
          use: [
            {
              loader: require.resolve('@svgr/webpack'),
            },
            {
              loader: require.resolve('url-loader'),
            },
          ],
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {
                limit: 8192,
                name: isDevelopment ? `[name].[ext]` : `[name].[hash:8].[ext]`,
                outputPath: 'images',
              },
            },
            {
              loader: require.resolve('img-loader'),
              options: {
                plugins: !isDevelopment && [
                  imageminSvgo({
                    plugins: [
                      {removeTitle: true},
                      {cleanupAttrs: true},
                      {removeXMLProcInst: true},
                      {removeComments: true},
                      {removeMetadata: true},
                      {removeXMLNS: false},
                      {removeEditorsNSData: true},
                      {removeEmptyAttrs: true},
                      {convertPathData: true},
                      {convertTransform: true},
                      {removeUnusedNS: true},
                      {mergePaths: true},
                      {convertShapeToPath: true},
                    ],
                  }),
                ],
              },
            },
          ]
        }
      ].filter(Boolean),
    },
    plugins: [
      isHot && new webpack.HotModuleReplacementPlugin(),
      isHot && new ReactRefreshWebpackPlugin(),
      new WriteFilePlugin({
        force: true,
      }),
      new CleanWebpackPlugin({ // Clean build folder when compilation starts
        cleanStaleWebpackAssets: false,
      }),
      new MiniCssExtractPlugin({ // Extract CSS files
        filename: isDevelopment ? `[name].css` : `[name].[hash:8].css`,
      }),
      new WebpackManifestPlugin({
        fileName: 'assets-manifest.json', // This file helps us with loading the assets in WordPress
      }),
      new FriendlyErrorsWebpackPlugin(),
      new DependencyExtractionWebpackPlugin(
        isHot ? {
            injectPolyfill: true,
            combineAssets: true,
            useDefaults: false,
            requestToExternal: (request) => {
              const response = defaultRequestToExternal(request);

              if (['React', 'ReactDOM'].includes(response)) {
                return undefined;
              }

              return response;
            },
            requestToHandle: defaultRequestToHandle,
          }
          : {
            injectPolyfill: true,
            combineAssets: true,
            useDefaults: true,
          }
      ),
      new FixStyleWebpackPlugin(),
    ].filter(Boolean),
  };

  return config;
};

