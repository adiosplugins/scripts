module.exports = {
  'extends': [
    'stylelint-config-standard',
    'stylelint-config-css-modules',
    'stylelint-config-prettier'
  ],
  'plugins': [
    'stylelint-scss',
    'stylelint-order'
  ],
  'rules': {
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'selector-type-no-unknown': [
      true,
      {
        'ignoreTypes': [
          '/^custom-/'
        ]
      }
    ],
    'no-descending-specificity': null
  }
};
