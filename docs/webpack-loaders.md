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
