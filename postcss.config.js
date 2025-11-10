export default {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'not IE 11'
      ],
      grid: 'autoplace'
    }
  }
};
