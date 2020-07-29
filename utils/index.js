const execSync = require('child_process').execSync;
const path = require('path');
const fs = require('fs');
const postcss = require('postcss');
const cssnano = require('cssnano');
const {cosmiconfigSync} = require('cosmiconfig');

const readFromPHP = (file) => {
  try {
    return execSync(`php ${file}`, {
      cwd: process.cwd(),
      encoding: 'utf8',
    });
  } catch (e) {
    return null;
  }
}

const getWordPressURL = () => readFromPHP(path.resolve(__dirname, 'get-wordpress-url.php'));

const getPluginURL = () => readFromPHP(path.resolve(__dirname, 'get-plugin-url.php')).replace(getWordPressURL(), '');

const getRandonString = (length, prefix = '') => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return prefix + result;
};

const getConfig = () => {
  const explorerSync = cosmiconfigSync('wpify');
  const result = explorerSync.search();

  if (result && result.config) {
    const {
      config = {build: 'build'},
      webpack = config => config,
      browserSync = config => config,
    } = result.config;

    return {config, webpack, browserSync};
  }
};

const copyAssets = (build, manifestFile, files) => {
  if (Object(files) !== files) {
    return null;
  }

  if (fs.existsSync(path.resolve(process.cwd(), build, manifestFile))) {
    const manifest = require(path.resolve(process.cwd(), build, manifestFile));

    Object.keys(files)
    .filter((source) => fs.existsSync(path.resolve(process.cwd(), build, manifest[source])))
    .forEach((source) => {
      if (source.endsWith('.css')) {
        const css = fs.readFileSync(path.resolve(process.cwd(), build, manifest[source]));
        postcss([cssnano])
        .process(css, {
          from: path.resolve(process.cwd(), build, manifest[source]),
          to: path.resolve(files[source]),
          map: false,
        })
        .then((result) => {
          fs.writeFileSync(path.resolve(files[source]), result.css);
        });
      } else {
        fs.copyFileSync(
          path.resolve(process.cwd(), build, manifest[source]),
          path.resolve(files[source]),
        );
      }
    });
  }
};

const localizeWordPressRoot = () => {

};

module.exports = {
  getPluginURL,
  getWordPressURL,
  getRandonString,
  getConfig,
  copyAssets,
  localizeWordPressRoot,
};
