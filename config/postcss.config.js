module.exports = {
  plugins: [
    require('postcss-preset-env')(),
    require('postcss-font-display')({
      display: 'swap',
      replace: false
    }),
    require('postcss-pxtorem')(),
  ],
};
