## loader的匹配规则

  - **`test`**：{RegExp | string | function | object | array}, 结合 **`include`** 和 **`exclude`** 完成匹配规则
  - **`include`**：类型同上，包含需要匹配的路径
  - **`exclude`**：类型同上，排除不需要匹配的路径
  - **`resource: /inline/`**：匹配资源路径，包含query,比如 **`/path/foo.inline.js | /path/bar.png?inline`**
  - **`issuer: /bar.js/`**：从匹配的resource中匹配.比如从 **`/path/bar.js`** 请求了 **`/path/foo.png`** 将匹配
  - **`resourcePath: /inline/`**：不适用query的匹配资源路径，比如 **`/path/foo.inline.png`**
  - **`resourceQuery: /inline/`**：根据query匹配资源，比如 **`/path/foo.png?inline`**

基于bool类型的字段可以进一步约束匹配规则：
  - **`not`**：{RegExp | string | function | object | array}, 不要匹配某个条件
  - **`and`**：{array}, 必须匹配数组里面的每一个条件
  - **`or`**：{array}, 匹配数组中的任意一个条件即可

> 基于 **resourceQuery** 来加载

**`oneOf`** 字段可以使得webpack能够基于相对匹配的资源来调用特定的loader

```
{
  test: /\.png$/,
  oneOf: [
    {
      resourceQuery: /inline/,
      use: 'url-loader',
    },
    {
      resourceQuery: /external/,
      use: 'file-loader',
    },
  ],
},
```
如果想要给filename插入 **context** 信息,则规则应该使用 **`resourcePath`**, 而不是 **`resourceQuery`**


> 基于 issuer 加载


issuer可用于根据资源的导入位置控制行为。在下面改编自css-loader issue 287的示例中，当webpack从JavaScript导入中捕获CSS文件时，应用style-loader：

```
{
  test: /\.css$/,
  rules: [
    {
      issuer: /\.js$/, // 从js中导入的css文件，使用 style-loader加载
      use: 'style-loader'.
    },
    {
      use: 'css-loader',
    },
  ],
},
```
另一种方式是，混合使用 **`issuer`** 和 **`not`** :
```
{
  test: /\.css$/,
  rules: [
    // 从其它模块导入的CSS，添加到DOM中
    {
      issuer: { not: /\.css$/ },
      use: 'style-loader',
    },
    // 使用css-loader,对引入的CSS返回css
    {
      use: 'css-loader',
    },
  ],
},
```



## 样式相关的loaders

**``**

> **`css-loader`**

用来遍历可能遇到的 **`@import`** 和 **`url()`**, 把遇到的这些字符当做ES2015中的 **`import`**, 如果 **`@import`** 引入的是外部资源，css-loader会跳过，因为webpack只能处理内部资源。



> **`style-loader`**

通过 html **`style`** 标签插入样式，也可以自定义行为，也可以实现HMR。匹配到的文件可以被 **`file-loader`** 或 **`url-loader`** 处理

> **`MiniCssExtractPlugin`**

因为在产品阶段使用内联样式不太好，可以通过这个插件产生单独的CSS文件。可以将多个CSS文件合并成一个，因为这个功能，它带有一个loader(**`MiniCssExtractPlugin.loader`**)对CSS进行提取，然后合并提取结果，最后生成一个单独的文件

```
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// css
exports.loadCSS = ({ include, exclude, use = [] }) => {
  // 将提取的CSS生成一个文件
  const plugin = new MiniCssExtractPlugin({
    filename: '[name].css',
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
```

如果想要生成的文件输出到指定的目录下，可以在filename中传入一个路径： **`filename: 'styles/[name].css'`**

> postcss-loader

一般还需要安装其它相关插件：
  - **`precss`**: 可以使用SCSS类似的可以嵌套的css语法
  - **`postcss-cssnext`**: **这个插件可以使用未来CSS语法，注意这个插件自带`autoprefixer`, 因此使用这个插件之后，不需要再设置autoprefixer**


**注意事项：**

> 1.css-loader 对绝对路径的处理

**`css-loader`** 默认只能处理相对路径，而不能处理绝对路径(比如 **`url("/static/img/demo.png")`**),如果想要使用这种引入方式，则必须将文件拷贝到项目中，但可以使用一些插件解决这个问题
  - **`copy-webpack-plugin`**: 使用这个插件webpack-dev-server可以对引入进行识别
  - **`resolve-url-loader`**: 如果使用 Sass或者less，这个加载器支持相对引入到环境中

> 2.css-loader 引入方式的处理

如果你想以特定的方式处理css-loader导入，你应该将 **`importLoaders`** 选项设置为一个数字，该数字告诉加载器在找到的导入之前应该对css-loader执行多少个加载器.

如果你通过@import语句从CSS导入其他CSS文件，并希望通过特定的加载器处理导入，则此技术至关重要

比如：
```
# 在某个css中引入
@import "./variables.sass";
```
为了处理sass文件，则需要进行配置：

```
{
  test: /\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
      },
    },
    'sass-loader',
  ],
}
```

如果向链中添加了更多的加载器（例如**`postcss-loader`**），则必须相应地调整importLoaders选项

> 3.从 node_modules 路径下加载

可以从node_modules中直接加载文件，比如：
```
# '~' 表示告诉webpack这不是一个相对import
# 如果包含 '~'，则默认从 node_modules 开始查询， 也可以通过webpack中 'resolve.modules' 字段进行配置
@import '~bootstrap/less/bootstrap';

# 如果使用的是 postcss-loader 可以省略 '~'
# postcss可以解析这种引入
@import 'bootstrap/less/bootstrap';
```

> 4.sourceMaps

如果想开启css sourceMaps,则需要开启 **`sourceMap`** 选项，并将 **`output.publicPath`**设置为一个指向开发服务的绝对url.如果有多个链式loaders，则需要分别的开启source maps

[css-loader issue #29](https://github.com/webpack-contrib/css-loader/issues/29)


## 图片字体等资源的加载

**``**

**`url-loader`** 可以将图片资源转换为base64，使用内联的方式减少http请求次数，在开发阶段使用这个完全足够;
**`file-loader`**输出图片字体文件，返回图片字体路径，而不是选择内联的方式

> url-loader

这个加载器 options里面有一个 **`limit`** 字段，表示对图片尺寸的限制，如果达到该尺寸了，就将图片处理的工作移交给 **`file-loader`** 进行处理，这样就可以将小尺寸的图片进行内联，大尺寸的图片则生成单独的文件。如果使用了 **`limit`** 字段，则url-loader会隐式的调用file-loader，但是也可以使用除了file-loader以外的加载器，使用 **`fallback: 'some-loader'`**, 默认是使用file-loader对超出尺寸的图片进行处理的

例如将小于 **`25kb`** 的图片进行内联
```
{
  test: /\.(jpg|png)$/,
  use: {
    loader: 'url-loader',
    options: {
      limit: 25000,
    },
  },
},
```

> file-loader

如果想要完全的不使用内联的方式，也可以直接使用file-loader。
默认情况下，file-loader使用原始扩展名返回文件内容的MD5哈希值：

```
{
  test: /\.(jpg|png)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: '[path][name].[hash].[ext]',
    },
  },
},

// 如果想要将生成的图片放在某个路径下
// 在name中指定路径即可
{
  test: /\.(jpg|png)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: './images/[hash].[ext]', // 放在 'images' 文件夹下
    },
  },
},
```
**注意不要在图片的加载上同时使用url-loader 和 file-loader, 如果url-loader 的 `limit` 字段还不够的话，可以使用 `include` 字段进一步的控制**

> 图片优化

可以使用下面一些loaders或者plugins对图片进行压缩：
  - **`image-webpack-loader`**
  - **`svgo-loader`**: 只对svg格式图片进行优化
  - **`imagemin-webpack-plugin`**

使用loaders需要注意需要将在其它loaders之前进行调用

> 图片占位符loaders

下面2个loaders用于提升图片加载时的用户体验：
  - **`[image-trace-loader](https://github.com/EmilTholin/image-trace-loader)`**: 这个加载图片，将结果以 **`image/svg+xml`** URL编码数据的形式暴露，可以配合 file-loader 和 url-loader 在真的图片加载完成之前显示一个占位图片
  - **`[lqip-loader](https://github.com/zouhir/lqip-loader#readme)`**: 这个用于在图片加载完成之前提供图片的模糊效果

> 图片引用

webpack可以根据url-loader的配置，在样式文件中使用 **`@import | url()`** 的图片可以被挑选出来。在代码中我们可以引用这些图片，但是必须要显式的引入：

```
import src from './avatar.png';

const Profile = () => <img src={src} />
```

如果使用react, 可以使用 **`[babel-plugin-transform-react-jsx-img-import](https://github.com/gvelo/babel-plugin-transform-react-jsx-img-import#readme)`** 自动的产生 **`require`**,这样就可以直接的使用图片了：
```
const Profile = () => <img src="avatar.png" />
```

也可以动态的引入图片，在代码拆分中会讲到如何动态引入：
```
const src = require(`./avatars/${avatar}`);
```

> css-loader 和 sourceMap

如果使用图片，并且css-loader中的 **`sourceMap`** 开启，则必须将 **`output.publicPath`** 设置为一个绝对值指向开发服务器，否则图片将不会正常工作，相关issue连接
  - [Generated image urls *must* be absolute for style!css?sourceMap to work? #55](https://github.com/webpack-contrib/style-loader/issues/55)


> 字体加载

```
// 使用file-loader
{
  test: /\.(tff|eot|woff|woff2)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: 'fonts/[name].[ext]', // 将字体存放在 fonts 文件夹中
    },
  },
}

// 然后css定义字体
// 想要优先使用的字体放在最前面，比如woff2优先考虑
@font-face {
  font-family: "myfontfamily";
  src: url("./fonts/myfontfile.woff2") format("woff2"),
    url("./fonts/myfontfile.woff") format("woff"),
    url("./fonts/myfontfile.eot") format("embedded-opentype"),
    url("./fonts/myfontfile.ttf") format("truetype");
    /* Add other formats as you see fit */
}


// 使用url-loader 产生内联样式
{
  // Match woff2 and patterns like .woff?v=1.1.1.
  test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
  use: {
    loader: "url-loader",
    options: {
      limit: 50000, // 50kb内联 否则产生单独的文件
      mimetype: "application/font-woff",
      name: "./fonts/[name].[ext]", // Output below ./fonts
      publicPath: "../", // Take the directory into account
    },
  },
},
```
