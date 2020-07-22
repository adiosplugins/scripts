module.exports = {
  "parser": "babel-eslint",
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier",
    "prettier/react"
  ],
  "plugins": [
    "react-hooks",
    "babel",
    "react"
  ],
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  },
  "parserOptions": {
    "useJSXTextNode": true,
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": {
      "modules": true,
      "jsx": true
    }
  },
  "globals": {
    "document": false,
    "wp": false,
    "__webpack_public_path__": true,
    "WPIFY": false
  },
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [
          ".js",
          ".jsx",
          ".json"
        ]
      }
    },
    "react": {
      "version": "v16.9.0"
    }
  },
  "rules": {
    "no-console": "off",
    "no-unused-vars": [
      "warn",
      {
        "ignoreRestSiblings": true
      }
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
};
