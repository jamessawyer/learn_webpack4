const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const parts = require('./webpack.parts');

const commonConfig = merge([
  {
    plugins: [
      new HtmlWebpackPlugin({
        title: 'webpack demo',
      }),
    ],
  },
]);

// const productionConfig = merge([
//   parts.extractCSS({
//     use: 'css-loader',
//   }),
// ]);
const productionConfig = merge([
  parts.extractCSS({
    use: [
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          plugins: () => [require('precss'), require('postcss-cssnext')],
        },
      },
    ],
  }),
]);

const developmentConfig = merge([
  parts.devServer({
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
]);

module.exports = mode => {
  if (mode === 'production') {
    return merge(commonConfig, productionConfig, {
      mode,
    });
  }
  return merge(commonConfig, developmentConfig, {
    mode,
  });
};
