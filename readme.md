# WPify scripts

Easy build process automation that utilizes `@wordpress/scripts`, but adds hot reloading with BrowserSync to `hot` script and creating plugin archive with `archive` script.

## Install

`npm install -D wpify-scripts`

## Available scripts:

```json
{
  "scripts": {
    "build": "wpify build",
    "start": "wpify start",
    "hot": "wpify hot",
    "archive": "wpify archive",
    "check-engines": "wpify check-engines",
    "check-licenses": "wpify check-licenses",
    "format:js": "wpify format-js",
    "lint:css": "wpify lint-style",
    "lint:js": "wpify lint-js",
    "lint:md:docs": "wpify lint-md-docs",
    "lint:md:js": "wpify lint-md-js",
    "lint:pkg-json": "wpify lint-pkg-json",
    "packages-update": "wpify packages-update",
    "test:e2e": "wpify test-e2e",
    "test:unit": "wpify test-unit-js"
  }
}
```

## Configuration

Configuration file `wpify.config.js` is in the root directory:

```js
const path = require('path');

module.exports = {
  wordPressUrl: 'http://localhost',
  config: {
    build: 'build', // folder where built files end-up
    entry: { // entry points
      'app': './assets/app.jsx',
      'theme': [
        './assets/theme/main.js',
        './assets/theme/main.scss',
      ],
    },
  },
  copy: { // copy built files somewhere else
    'editor-style.scss': path.resolve('./themes/custom-theme/editor-style.css'),
  },
  webpack: (config) => {
    // custom modification of Webpack configuration
    return config;
  },
  browserSync: (config) => {
    // custom configuration of browserSync init configuration
    return config;
  },
};

```
