const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');
const CleanWebpackPlugin = require('clean-webpack-plugin');

// 开发配置
exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    stats: 'errors-only',
    host, // 默认值是 localhost
    port, // 默认值是 8080
    open: true,
    overlay: true,
  },
});

exports.loadJS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.js/,
        include,
        exclude,
        use: 'babel-loader',
      },
    ],
  },
});

// css
exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('precss'), require('postcss-cssnext')],
            },
          },
        ],
      },
    ],
  },
});
// 压缩css代码
exports.minifyCSS = ({ options }) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: options,
      canPrint: false, // webpack代码分析中使用 '--json' 需要这个设置为false
    }),
  ],
});

// 提取CSS
exports.extractCSS = ({ include, exclude, use = [] }) => {
  // 将提取的CSS生成一个文件
  const plugin = new MiniCssExtractPlugin({
    filename: '[name].[contenthash].css',
  });

  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,
          use: [MiniCssExtractPlugin.loader].concat(use),
        },
      ],
    },
    plugins: [plugin],
  };
};

// 图片处理
exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        include,
        exclude,
        use: {
          loader: 'url-loader',
          options,
        },
      },
    ],
  },
});

// 处理sourceMap
exports.generateSourceMaps = ({ type }) => ({
  devtool: type,
});

// 清理目录
exports.clean = path => ({
  plugins: [
    // https://www.npmjs.com/package/clean-webpack-plugin
    new CleanWebpackPlugin([path], {
      verbose: true,
      allowExternal: true, // 允许插件清理webpack所在目录外的目录，默认为false
    }),
  ],
});
