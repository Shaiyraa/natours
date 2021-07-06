const path = require('path');

module.exports = {
  mode: "production",
  entry: ['@babel/polyfill', './public/js/index.js'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/js'),
  },
  module: {
    rules: [
      {
        loader: "babel-loader",
        // the loader which should be applied, it'll be resolved relative to the context
        options: {
          presets: ["@babel/preset-env"]
        }
      }
    ]
  }
};