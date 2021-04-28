module.exports = {
  // TODO: should probably have a src directory to target.
  purge: [
    './components/**/*.ts',
    './components/**/*.tsx',
    './page-handlers/**/*.ts',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
