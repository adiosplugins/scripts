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

const getWordPressURL = () => {
  if (process.env.WPIFY_URL) {
    return process.env.WPIFY_URL;
  }

  try {
    const detectedUrl = readFromPHP(path.resolve(__dirname, 'get-wordpress-url.php'));

    if (detectedUrl) {
      return detectedUrl;
    }
  } catch {}

  return 'http://localhost';
};

const getPluginURL = () => {
  if (process.env.WPIFY_PLUGIN_URL) {
    return process.env.WPIFY_PLUGIN_URL;
  }

  try {
    const detectedUrl = readFromPHP(path.resolve(__dirname, 'get-plugin-url.php'));

    if (detectedUrl) {
      return detectedUrl.replace(getWordPressURL(), '');
    }
  } catch {}

  return '/wp-content/plugins/' + path.basename(process.env.PWD) + '/';
};

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
      config = { build: 'build' },
      webpack = config => config,
      browserSync = config => config,
      copy = {},
    } = result.config;

    return { config, webpack, browserSync, copy };
  }
};

const copyAssets = (build, manifestFile, files) => {
  if (Object(files) !== files) {
    return null;
  }

  if (fs.existsSync(path.resolve(process.cwd(), build, manifestFile))) {
    const manifest = require(path.resolve(process.cwd(), build, manifestFile));

    Object.keys(files)
      .map((source) => {
        const realFile = manifest[source];
        let filePath = null;
        let rootPath = process.cwd();

        if (!realFile) {
          console.error(`Error: File ${source} doesn't exists.`);
          return null;
        }

        // Find WordPress root path
        do {
          if (fs.readdirSync(rootPath).includes('wp-includes')) {
            break;
          }
          rootPath = path.resolve(rootPath, '..');
        } while (rootPath !== '/')

        if (realFile.match(/^(https?:)?\/\//)) {
          filePath = manifest[source];
        } else if (realFile.startsWith('/')) {
          filePath = path.join(rootPath, manifest[source]);
        } else {
          filePath = path.resolve(path.resolve(process.cwd(), build, manifest[source]))
        }

        if (fs.existsSync(filePath)) {
          return {
            from: filePath,
            to: path.resolve(process.cwd(), files[source]),
          };
        }
      })
      .filter(Boolean)
      .forEach((file) => {
        if (file.from.endsWith('.css')) {
          const css = fs.readFileSync(file.from);
          postcss([cssnano])
            .process(css, { ...file, map: false })
            .then(result => fs.writeFileSync(file.to, result.css));
        } else {
          fs.copyFileSync(file.from, file.to);
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
