**``**  

## html-webpack-plugin
**`html-webpack-plugin`**: 生成应用html入口文件，还可以在多页应用中使用， 另外还有一个简洁版的 **`mini-html-webpack-plugin`**, 还有一些成品，比如 **`html-webpack-template`** 和 **`html-webpack-template-pug`**

还有一些可以扩展 html-webpack-plugin 的插件：
  - **`favicons-webpack-plugin`**：产生favicons
  - **`script-ext-html-webpack-plugin`**: 增强对scripts标签的控制，允许进一步调整script加载
  - **`style-ext-html-webpack-plugin`**: 将css引用转换为内联css,作为初次payload的一部分，这个插件可以用于快速向哭护短提供关键(重要的)CSS
  - **`resource-hints-webpack-plugin`**: 给 html 提供 [resource hints](https://www.w3.org/TR/resource-hints/)，加速加载时间
  - **`preload-webpack-plugin`**: 对scripts开启 **`rel=preload`** 的能力，帮助懒加载，这个插件和现有的 **Building** （构建）部分的技术可以很好的结合
  - **`webpack-cdn-plugin`**: 允许指定哪些依赖通过CDN加载。这个技术可用于加载比较流行的库
  - **`dynamic-cdn-webpack-plugin`**: 同上

## webpack-dev-server (WDS)

WDS 是运行在 **内存** 中的开发服务器(WDS is a development server running in-memory),致辞热模块加载(Hot Module Replacement,又称HMR)。这个插件一般只用于开发模式

使用方式：
```
# 方式1：
# 使用package.json 的 scripts
"scripts": {
  "start": "webpack-dev-server --mode development"
}

# 方式2
# 使用webpack配置
module.exports = {
  // ...
  devSercer: {
    stats: "error-only", // 只显示错误 减少输出
    host: process.env.HOST, // 0.0.0.0 对所有的网络设备都可以访问， 默认是 localhost 
    port: process.env.PORT, // 默认是 8080
    open: true, // 打开浏览器
    overlay: true, // 显示错误
  }
}
```

如果需要更好的错误显示，可以使用
  - **`[error-overlay-webpack-plugin](https://www.npmjs.com/package/error-overlay-webpack-plugin)`**:

**从网络中访问开发服务，可以通过环境变量自定义host和port：**
  - Unix中使用 **`export PORT=3000`**
  - Windows中使用 **`SET PORT=3000`**

为了能够访问服务，需要配置设备ip：
  - Unix中使用 **`ifconfig | grep inet`**
  - Windows中使用 **`ipconfig`**

可以使用 **`[node-ip](https://www.npmjs.com/package/node-ip)`** 这个库进行处理

> **nodemon**

使用nodemon之后，如果编辑了 **`webpack.config.js`** 等配置文件之后不再需要重启命令行

```
yarn add -D nodemon

# 使用之前
module.exports = {
  // ...
  "start": "webpack-dev-server --mode development"
}

# 使用nodemon,
# 只用之后 如果我们再次编辑webpack等配置文件 node会自动重启
module.exports = {
  // ...
  "start": "nodemon --watch webpack.config.js \"webpack-dev-server --mode development\""
}
```

> 相关插件

使用Expres作为服务器可能用到的插件有：
  - webpack-hot-middleware
  - webacp-iosmorphic-dev-middleware

> webpack-dev-server 的其它特点


  - **`devServer.contentBase`**: 假如你没有动态的产生 **`index.html`** 文件，更偏向于在特殊的路径中维护， **`contentBase`** 可以是一个路径（比如 **`build`**）, 也可以是一个数组路径（比如 **`["build", "images"]`**）, 默认值是项目的根路径
  - **`devServer.proxy`**: 如果使用多个开发服务器，则需要在WDS中设置代理，这个代理接受一个代理映射对象（比如： **`{'/api': 'http://localhost:3000/api'}`**）,其将匹配的查询解析到另一个服务器。默认情况下禁用代理设置
  - **`devServer.headers`**: 对请求添加自定义headers

> 开发插件

对开发开发有用的插件：
  - **`case-sensitive-paths-webpack-plugin`**: 对大小写敏感的开发环境有用，比如Linux， macos和windows则对大小写不敏感
  - **`react-dev-utils`**: 包含开发create react app 包含的webpack工具，可以用于react之外
  - **`start-server-webpack-plugin`**: 在webpack build完成之后开启服务器

> 输出插件

可以使webpack输出更加的醒目：
  - **`friendly-errors-webpack-plugin`**: 提升webpack错误报告，可以捕获常见错误，以友好的方式显示
  - **`webpack-dashboard`**: 完整的基于命令行的显示工具


## clean-webpack-plugin 清理目录

```
yarn add -D clean-webpack-plugin
```
这个用来清理目录：

```
const CleanWebpackPlugin = require('clean-webpack-plugin');

/*
 * path {string} 要被清理的路径
 */
exports.clean = path => ({
  plugins: [new CleanWebpackPlugin([path])],
});
```

## copy-webpack-plugin

复制单个文件或者整个目录到build目录
[copy-webpack-plugin - webpack docs](https://webpack.docschina.org/plugins/copy-webpack-plugin/)

使用方式：
```
/*
 * pattern {object} 从哪里复制到哪里 {from: 'source', to: 'dest'}
 */
new CopyWebpackPlugin([patterns], options)
```
