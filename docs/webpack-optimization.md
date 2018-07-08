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


## 2.设置环境变量
webpack4之前使用 **`DefinePlugin`** 对 **`process.env.NODE_ENV`** 进行设置不同的变量，webpack4使用 **`mode`** 字段来定义不同的环境变量


## 3.设置Hash

如果不设置hash,客户端不知道如何利用缓存，不能告诉客户端文件发生了改变

webpack使用占位符的形式设置hash:
  - **`[id]`**: 返回块的id
  - **`[path]`**: 返回文件的路径
  - **`[ext]`**: 返回扩展，这个对大多数文件都有效，但是 **MiniCssExtractPlugin** 则是这个规则的一个意外
  - **`[hash]`**: 返回build hash,如果build中发生了改变，hash也会改变
  - **`[chunkhash]`**: 返回一个入口 **chunk-specific** hash.配置中定义的每一个 **`entry`** 都会接受一个自己的hash,如果入口的某部分发生了改变，hash也会改变，**`[chunkhash]`** 比 **`[hash]`** 更加的精细
  - **`[contenthash]`**: 依据content产生的hash

一般只在production阶段使用 **[hash]** 和 **[chunkhash]**,开发时一般不使用使用hash

可以只取部分hash和chunkhash： **`[chunkhash:4]`** 表示只取chunkhash的前4位

注意，对提取之后的CSS文件（一般是使用 MiniCssExtractPlugin） **`contenthash`**, 如果使用 **`chunkhash`** 会导致css和js文件失效

```
# css使用hash
exports.extractCSS = ({ include, exclude, use = [] }) => {
  // 将提取的CSS生成一个文件
  const plugin = new MiniCssExtractPlugin({
    // filename: '[name].css', // 未使用hash
    filename: '[name].[contenthash].css', // 使用contenthash 
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

# js使用hash
const productionConfig = merge([
  {
    output: {
      chunkFilename: '[name].[chunkhash].js',
      filename: '[name].[chunkhash].js',
    },
  },
  // ...
]

# 图片使用hash
const productionConfig = merge([
  {
    output: {
      chunkFilename: '[name].[chunkhash].js',
      filename: '[name].[chunkhash].js',
    },
  },
  // ...
  // production时 对小于 15000字节的图片进行内联
  parts.loadImages({
    options: {
      limit: 15000,
      // name: '[name].[ext]', // 不使用hash
      name: '[name].[hash].[ext]', // 使用hash
    },
  }),
  // ...
]);
```

**有一个问题就是，如果改变了应用的代码，会导致vendor hash也会产生变化，这需要对 `manifest` 进行提取**


## 4.提取manifest

manifest是告诉webpack该如何加载文件的，可以单独提取出来， **然后内联在`index.html`中**，这样避免manifest添加到别的bundle中，要等bundle完全加载完成之后才执行manifest, 这可以提升加载速度。

可以在production配置中，在 **`optimization.runtimeChunk`** 中设置来提取manifest:
```
const productionConfig = merge([
  ...
  {
    optimization: {
      splitChunks: {
        ...
      },
      runtimeChunk: {
        name: 'manifest', // 规范一般是 'manifest', 但是其它任意名字也可以
      }
    }
  }
])
```
yarn run buid
```
# 没有manifest
                             Asset       Size  Chunks             Chunk Names
         0.1860b32cb90834a0fd63.js  186 bytes       0  [emitted]
    vendor.fcc779f3afbf34b9984b.js   98.9 KiB       1  [emitted]  vendor
     main.f18d173b852d38e6f15a.css   12.8 KiB       2  [emitted]  main
      main.0e6f2c39b27b334c944b.js   2.55 KiB       2  [emitted]  main
     0.1860b32cb90834a0fd63.js.map  226 bytes       0  [emitted]
vendor.fcc779f3afbf34b9984b.js.map    238 KiB       1  [emitted]  vendor
  main.0e6f2c39b27b334c944b.js.map   12.7 KiB       2  [emitted]  main
                        index.html  339 bytes          [emitted]

# 提取manifest
                               Asset       Size  Chunks             Chunk Names
           0.1860b32cb90834a0fd63.js  186 bytes       0  [emitted]
    manifest.c3dd9dfe597dd64742f9.js   2.24 KiB       1  [emitted]  manifest
      vendor.3ad1ee8cb1ba05829b10.js   98.9 KiB       2  [emitted]  vendor
       main.f18d173b852d38e6f15a.css   12.8 KiB       3  [emitted]  main
        main.15af7292a23467c20d33.js  428 bytes       3  [emitted]  main
       0.1860b32cb90834a0fd63.js.map  226 bytes       0  [emitted]
manifest.c3dd9dfe597dd64742f9.js.map   11.7 KiB       1  [emitted]  manifest
  vendor.3ad1ee8cb1ba05829b10.js.map    238 KiB       2  [emitted]  vendor
    main.15af7292a23467c20d33.js.map   1.12 KiB       3  [emitted]  main
                          index.html  418 bytes          [emitted]
```
可以看出来 **`manifest.js`** 从 **`main.js`** 里面被提取出来了.

因为我们使用了 **`HtmlWebpackPlugin`**,我们不必自己亲自添加manifest，这个插件将自动添加manifest引用到index.html中.

可以配合**`HtmlWebpackPlugin`**使用以下任意一种插件，可以将manifest内联到html中，这样可以避免一次请求：
  - **`[assets-webpack-plugin 下载量第1](https://www.npmjs.com/package/assets-webpack-plugin)`**
  - **`[inline-manifest-webpack-plugin 下载量第2](https://www.npmjs.com/package/inline-manifest-webpack-plugin)`**
  - **`[html-webpack-inline-chunk-plugin 下载量第3](https://www.npmjs.com/package/html-webpack-inline-chunk-plugin)`**

**可以将比较流行的依赖，比如`React`, 采用CDN的形式，这样可以减小`vendor`的bundle尺寸**


## 5.开启性能budget

webpack 允许定义performance budget,这样对打包尺寸可以进行约束，这个功能默认是被禁用的。

```
// 实际应用中这个限制会放低一点 这样允许尺寸更大
const productionConfig = merge([
  {
    performance: {
      hints: 'warning', // 'error' | 'warning' | false
      maxEntrypointSize: 50000, // 单位bytes, 默认值是250k
      maxAssetSize: 45000, // 单位bytes
    },
  },
])
```

分析工具：
  - [WEBPACK VISUALIZER](https://chrisbateman.github.io/webpack-visualizer/)
  - [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
  - [Webpack Chart](https://alexkuz.github.io/webpack-chart/)

  