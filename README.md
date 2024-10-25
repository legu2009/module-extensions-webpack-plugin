# module-extensions-webpack-plugin

## Getting Started

```console
npm install module-extensions-webpack-plugin --save-dev
```

**webpack.config.js**

```js
new ModuleExtensionsPlugin({
    extensions: ['tenant', 'customized'],
    include: (importFilePath, filePath) => importFilePath.indexOf(srcPath) === 0
})
```

类似taro框架，按照extensions配置，
import 'a.js', 尝试 import 'a.tenant.js' 和 'a.customized.js'，如果存在则使用，否则使用'a.js'。
同一级目录，在'a.tenant.js'，'a.customized.js'，'a.js'文件之间引用，不再进行扩展判断。


Similar to the Taro framework, according to the extensions configuration, 
when importing 'a.js', it will attempt to import 'a.tenant.js' and 'a.customized.js'. If they exist, it will use them; otherwise, it will use 'a.js'.
In the same directory, there will be no further extension checks between 'a.tenant.js', 'a.customized.js', and 'a.js'.
