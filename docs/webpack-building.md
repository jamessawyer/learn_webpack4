## 拆包（Bundling Spliting）
拆包的作用是，将通用的包拆出来，这样就不需要每次都加载，比如vendor包，每个页面用的都差不多，缓存下来不必要每个页面都去加载一次。

使用webpack4的 **`optimization.splitChunks.cacheGroups`**，缓存的一个缺点是，怎么使其无效，一般做法就是给文件名添加 **Hash**。 除了拆包还可以通过 **code spliting（代码拆分，实现懒加载）**的方式

简写：
```
{
  optimization: {
    splitChunks: {
      chunks: 'initial',
    },
  },
},
```

如果需要更多的控制：
```
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
```

> webpack中不同类型的chunk

3中类型的chunk:
  - **`Entry chunks`**: 包含webpack runtime和modules
  - **`Normal chunks`**: 普通的块，不包含webpack runtime。能够在应用运行时动态的加载.将会产生一个合适的包装(比如JSONP)，多用于代码拆分
  - **`Initial chunks`**: 这个是应用初始加载时间的 normal chunks。作为用户，不需要关心这些，重要的是entry chunks和normal chunks之间的拆分


## 代码拆分(code spliting) 懒加载

懒加载可能的方式：
  - 用户进入应用新的页面时，加载需要的数据
  - 用户触发某个动作，比如滚动，点击某个按钮时进行加载
  - 或者预测用户将要进行的行为，提前加载数据，则用户操作时数据已经存在了


代码拆分在webpack中可以以2种方式完成：
  1. **`import`** 语法, webpack4推荐用法
  2. **`require.ensure`** 语法，已废弃

**在拆分点中还可以存在拆分点**，可以根据拆分点来组织应用结构，这样做的好处是应用初次加载的数据量会很小

> 动态 import

动态的import语法需要进行Babel设置, **动态imports定义为Promise类型**：
```
// !!!
// optional name 允许将多个拆分点放到一个单一的bundle中
// 只要名字一样，它们都会被组织在一起
// 默认情况下 每个拆分点都会单独的打一个bundle
import(/* webpackChunkName: 'optional-name' */ './module').then(
  module => {...}
).catch(
  error => {...}
)
```

**也允许组合，可以并行加载多个资源**：
```
// 对一个请求创建单独的卜ndles
// 如果只想要一个bundle, 可以使用naming 或者定义一个中间模块 import
Promise.all([
  import('lunr),
  import('../search_index.json),
]).then(([lunr, search]) => {
  return {
    index: lunr.Index.load(search.index),
    lines: search.lines,
  };
});
```

> 配置代码拆分

上面说了要实现代码拆分需要设置babel

```
// 安装插件支持 动态 import 语法
yarn add -D babel-plugin-syntax-dynamic-import

// .babelrc
{
  "plugins": ["syntax-dynamic-import"]
}
```

如果使用了ESLINT， 则需要安装 **`babel-eslint`**，设置 **`parser: "babel-eslint"`**,另外eslint配置中再设置 **`parserOptions.allowImportExportEverywhere: true`**

```
# .eslintrc
{
  "parser": "babel-eslint",
  // ...
  "parserOptions": {
    "allowImportExportEverywhere": true
  }
}
```
**如果想要调整chunk的名字，可以设置 `output.chunkFilename`, 例如： `chunk.[id].js`, 添加了'chunk'作为前缀**

> 在React 中使用代码拆分

```
import React, {Component} from 'react';

// 在代码的某个地方使用带有懒加载的模块
<AsyncComponent loader={() => import('./SomeComponent')} />

class AsyncComponent extends Component {
  state = {
    LazyComponent: null;
  }

  componentDidMount() {
    this.props.loader().then(
      LazyComponent => this.setState({ LazyComponent })
    );
  }

  render() {
    const { LazyComponent } = this.state;
    const { Placehorder, ...props } = this.props;

    return LazyComponent ? <LazyComponent {...props} /> : <Placholder />;
  }
}

AsyncComponent.propTypes = {
  loader: PropTypes.func.isRequired,
  Placeholder: PropTypes.node.isRequired,
};
```

  - **`[react-async-component](https://github.com/ctrlplusb/react-async-component#readme)`** 库包含了一个 **`createAsyncComponent`** 的方法实现了上面的逻辑,并且提供了服务端的渲染。
  - **`[loadable-components](https://github.com/smooth-code/loadable-components#readme)`** 库也是一个类似的库。

> 禁用代码拆分

代码拆分在服务端渲染可能会出问题，有时候希望禁用，可以设置如下：将 **`webpack.optimize.LimitChunkCountPlugin`** 的 **`maxChunks`** 设置为 **`1`**

```
const webpack = require("webpack");

...
module.exports = {
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
};
```

## sourceMaps

可以分成2大类：
  - 内联sourceMaps: 多用于开发阶段
  - 独立的sourceMaps: 多用于产品阶段

sourceMaps的选择一般从2个方面考虑：
  - 速度
  - 质量

内联sourceMaps:
  - devtool: 'eval': 快速质量低
  - devtool: 'cheap-eval-source-map': 相对快速 质量稍高
  - devtool: 'cheap-module-eval-source-map': 速度稍慢，质量更高 **开发时推荐**
  - devtool: 'eval-source-map': 质量最高的内联sourceMap,速度最慢

分离的sourceMap:
  - devtool: 'cheap-source-map': 快速质量低,缺少列号映射
  - devtool: 'cheap-module-source-map': 相对快速 质量稍高 每行都是单一映射
  - devtool: 'hidden-source-map': 和 'source-map'一样，除了这个不写入引用
  - devtool: 'nosources-source-map': 不写入 sourcesContent,但是仍可追踪，对不想向客户端暴露源代码很有用
  - devtool: 'source-map': 最慢但是质量最好的

除了使用上面的 **`devtool`** 配置对产生sourceMaps有影响外，output中的配置也可以：
```
{
  output: {
    // 修改产生的sourceMaps的文件名
    // 可以使用 [file] | [id] | [hash]
    sourceMapFilename: '[file].map',  // 默认

    // source map 文件名模板
    // 默认格式依赖 devtool 选项 一般不适用
    devtoolModuleFilenameTemplate: 'webapck:///[resource-path]?[loaders]'
  }
}
```

**如果使用了 `UglifyJsPlugin`,仍希望产生sourceMaps, 则需要对这个插件开启 `sourceMap: true` 选项**

如果想要更多sourceMap的控制，可以使用 [SourceMapDevToolPlugin](https://webpack.js.org/plugins/source-map-dev-tool-plugin/)
