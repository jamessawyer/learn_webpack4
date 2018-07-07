可以配置webpack的方式有：
  - 使用多个webpack配置文件，然后使用 **`--config`** 参数来指定不同的环境，共享的配置可以通过模块引入的方式
  - 将配置文件传到npm上，形成一个库，比如webpack-blocks
  - 将配置文件集成为一个工具，比如create-react-app
  - 将所有的配置文件都放到一个文件中进行管理，通过 **`--env`** 参数来指定不同的环境

## webpack-merge

webpack-merge 可以拼接数组，合并对象。
```
const merge = require('webpack-merge');

merge(
  {a: [1], b: 5, c: 20},
  {a: [2], b: 10, d: 421}
)
// 返回结果
{ a: [1, 2], b: 10, c: 20, d: 421 }
```

webpack-merge 还可以对字段提供更多的控制选项，比如强制append 或者 prepend 或者 replace
