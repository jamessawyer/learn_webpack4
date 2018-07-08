主要内容：
  1.code minification 代码压缩
  2.setting environment variables 设置环境变量
  3.adding hashing to filenames 给文件名添加hash
  4.webpack manifest （webpack 启动清单）
  5.analyzing build statistics 分析打包数据

## 1.压缩代码

### 1.1 压缩JS代码

webpack4 在production时默认使用 **`UglifyJS`** 进行压缩，webpack4通过下面2个字段对压缩过程进行控制：
  - **`optimization.minimize`**: {bool} 是否开启压缩
  - **`optimization.minimizer`**: {array} 配置压缩的过程

除了webpack4默认的压缩，我们也可以使用 **uglifyjs-webpack-plugin** 自己定义压缩
```
yarn add -D uglifyjs-webpack-plugin

# 使用
# webpack.parts.js
const UglifyWebpackPlugin = require('uglifyjs-webpack-plugin');

exports.minifyJavaScript = () => ({
  optimization: {
    minimizer: [new UglifyWebpackPlugin({sourceMap: true})], // sourceMap默认是关闭的
  },
});

# webpack.config.js
const productionConfig = merge([
  parts.clean(PATHS.build),
  parts.minifyJavaScript(),
  //...
]);
```
这样得到的压缩代码和webpack4 production时差不多，也可能压缩质量更好一点，因为自己下载的uglifywebpakcPlugin可能版本更新一点。

如果想要去掉 **console.log**, 可以使用 **`uglifyOptions.compress.drop_console: true`**
  - [Webpack V4: Remove console.logs with Webpack & Uglify - stackoverflow](https://stackoverflow.com/questions/49101152/webpack-v4-remove-console-logs-with-webpack-uglify)

除了UglifyJS外，其它的压缩JS的方式：
  - [babel-minify-webpack-plugin](https://www.npmjs.com/package/babel-minify-webpack-plugin):底层依赖babel-preset-minify,比UglifyJS压缩速度慢
  - [webpack-closure-compiler](https://www.npmjs.com/package/webpack-closure-compiler): 并行的运行，压缩出来的代码比上面的更小

### 1.2 压缩HTML
如果在代码中使用**[html-loader](https://www.npmjs.com/package/html-loader)** 生产HTML模版，可以通过 [posthtml](https://www.npmjs.com/package/posthtml) 和 [posthtml-loader](https://www.npmjs.com/package/posthtml-loader) 进行预处理，然后通过 [posthtml-minifier](https://www.npmjs.com/package/posthtml-minifier) 对html进行压缩


## 3.压缩CSS

**`css-loader`** 允许通过 **`[cssnano](http://cssnano.co/)`** 进行压缩。需要显式的使用 **`minimize`** 选项开启压缩。也可以在css-loader query中传递[cssnano 特定的options](https://cssnano.co/optimisations/)自定义压缩行为。

**`[optimize-css-assets-webpack-plugin](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin)`** 可以用来选择压缩CSS的压缩器。使用 **MiniCssExtractPlugin** 有个问题就是可能导致CSS重复，因为它仅仅是合并字符。这个插件则可以很好的解决这个问题，这个插件是目前最好的压缩CSS的插件

```
# 安装
yarn add -D optimize-css-assets-webpack-plugin css-nano

# 使用
# webpack.parts.js
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

# webpack.config.js 会报错
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
      safe: true, // 已经被废弃 使用postcss需要特别的parser
    },
  }),
  // ...
]);
使用了上面的代码报错，safe已经被废弃， 可能是因为使用了postcss的原因，提示安装 'postcss-safe-parser'


# 更改上面的代码
yarn add -D postcss-safe-parser
# webpack.config.js
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
  // ...
]);
```

### 1.4 压缩图片

一般使用 [imagemin-webpack-plugin](https://www.npmjs.com/package/imagemin-webpack-plugin) 对图片资源进行压缩
