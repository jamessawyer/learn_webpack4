const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PostcssSafeParser = require('postcss-safe-parser');

const parts = require('./webpack.parts');
const PATHS = require('./paths');

const commonConfig = merge([
  {
    plugins: [
      new HtmlWebpackPlugin({
        title: 'webpack demo',
      }),
    ],
  },
  parts.loadJS({ include: PATHS.app }),
  parts.generateSourceMaps({ type: 'source-map' }),
]);

// const productionConfig = merge([
//   parts.extractCSS({
//     use: 'css-loader',
//   }),
// ]);
const productionConfig = merge([
  parts.clean(PATHS.build),
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
  parts.minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      // 使cssnano以 safe模式运行
      // 避免错误的转换
      // safe: true, // 已经被废弃 使用postcss需要特别的parser
      parser: PostcssSafeParser,
    },
  }),
  // production时 对小于 15000字节的图片进行内联
  parts.loadImages({
    options: {
      limit: 15000,
      name: '[name].[ext]',
    },
  }),
  {
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'initial',
          },
        },
      },
    },
  },
  // {
  //   optimization: {
  //     splitChunks: {
  //       chunks: 'initial',
  //     },
  //   },
  // },
]);

const developmentConfig = merge([
  parts.devServer({
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.loadImages(),
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
