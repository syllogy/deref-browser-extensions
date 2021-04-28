module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss'),
    // TODO: https://tailwindcss.com/docs/using-with-preprocessors#future-css-features
    require('postcss-nesting').default,
    require('autoprefixer'),
  ],
};
