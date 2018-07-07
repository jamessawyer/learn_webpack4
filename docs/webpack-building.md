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
