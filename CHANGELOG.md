# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.8](https://github.com/wuhonglei/Similo2-JS/compare/v1.0.7...v1.0.8) (2023-09-20)


### Features

* 提供获取常见 selector 的方法 ([8545626](https://github.com/wuhonglei/Similo2-JS/commit/8545626b1138cf0cd526d09ddaf846366ea86638))

### [1.0.7](https://github.com/wuhonglei/Similo2-JS/compare/v1.0.6...v1.0.7) (2023-09-20)


### Features

* 寻找邻居文本时，允许排除指定容器 ([c239c35](https://github.com/wuhonglei/Similo2-JS/commit/c239c358dc388a2d60a17bdf34a42e48ca05a9f0))

### [1.0.6](https://github.com/wuhonglei/Similo2-JS/compare/v1.0.5...v1.0.6) (2023-09-20)


### Bug Fixes

* 解决 window 暴露的全局变量属性名称错误问题 ([0207ff8](https://github.com/wuhonglei/Similo2-JS/commit/0207ff8ea6f32d2685af1bc10d79a0e0d2f82f98))

### [1.0.5](https://github.com/wuhonglei/Similo2-JS/compare/v1.0.4...v1.0.5) (2023-09-20)


### Features

* 临时新增 tag 标签比较函数(未使用,没有效果) ([8eeb9f6](https://github.com/wuhonglei/Similo2-JS/commit/8eeb9f6aaa94157d14cd5f457e1108dccd39ddbc))
* 将 window 暴露的对象由 Silimon 改为Silimo ([ec68879](https://github.com/wuhonglei/Similo2-JS/commit/ec68879adcf292076c079796957f010203c35211))

### [1.0.4](https://github.com/wuhonglei/Similo2-JS/compare/v1.0.3...v1.0.4) (2023-09-19)


### Features

* 返回最佳匹配的相似度(分数百分比) ([a99f6b1](https://github.com/wuhonglei/Similo2-JS/commit/a99f6b13a3ff49e1b60f0d250104a303abd5571d))

### [1.0.3](https://github.com/wuhonglei/Similo2-JS/compare/v1.0.2...v1.0.3) (2023-09-19)


### Features

* 允许获取隐藏的候选元素 ([ea312f6](https://github.com/wuhonglei/Similo2-JS/commit/ea312f60786ad41d64b831432f74eae1a0f435bb))

### [1.0.2](https://github.com/wuhonglei/Similo2-JS/compare/v1.0.1...v1.0.2) (2023-09-18)


### Features

* 暴露 elementIsVisible 组件 ([e4d9c59](https://github.com/wuhonglei/Similo2-JS/commit/e4d9c59f5a379b566a27d6c62662c2f7701f11d4))

### [1.0.1](https://github.com/wuhonglei/Similo2-JS/compare/v1.0.0...v1.0.1) (2023-09-18)


### Features

* 暴露 getIdXPath, getXPath 方法 ([1164f2c](https://github.com/wuhonglei/Similo2-JS/commit/1164f2cbbd57927e0ee960c1b8f741966cf9138f))

## 1.0.0 (2023-09-18)


### Features

* rollup 单独打包 property, similarity ([a5d34d9](https://github.com/wuhonglei/Similo2-JS/commit/a5d34d9ca655ed6fb6241433e00a0f036c5d6114))
* 丰富 findSimilarProperty 函数的返回值 ([8f2f729](https://github.com/wuhonglei/Similo2-JS/commit/8f2f7290425b6703e00441d653d633e8fbeaf2b5))
* 优化 robula 代码生成 ([e03c45f](https://github.com/wuhonglei/Similo2-JS/commit/e03c45f9fadc3e317a9da04f6fb09f8e7774ca55))
* 优化了 class、text 匹配算法 ([425b9da](https://github.com/wuhonglei/Similo2-JS/commit/425b9da378238544a90b9415d8558600bed7a74d))
* 优化并发录制的状态记录 ([18cb33a](https://github.com/wuhonglei/Similo2-JS/commit/18cb33ac706218f1af906dae4068e013d347e8ac))
* 优化测试数据中的 visibleText 取值 ([a14b1e0](https://github.com/wuhonglei/Similo2-JS/commit/a14b1e031e6a66d82f0b60359bcde0d038ef28f4))
* 优化邻居节点的判断条件 ([5bd575a](https://github.com/wuhonglei/Similo2-JS/commit/5bd575ac6e617773c3c574adfc9e539f209e9739))
* 保存实验数据 ([559d878](https://github.com/wuhonglei/Similo2-JS/commit/559d878e62134206c94c320092170ec71930a064))
* 修改测试报告输出配置 ([f1d526a](https://github.com/wuhonglei/Similo2-JS/commit/f1d526ad43e3f79eae502a646c3b5c2ce9a9f2e2))
* 增加断点续传能力 ([0115b34](https://github.com/wuhonglei/Similo2-JS/commit/0115b34f72355d9479c6331cfa7e3a469541ef9e))
* 完成 Similo2 元素属性获取 ([f256bc2](https://github.com/wuhonglei/Similo2-JS/commit/f256bc2558c7959b584452d78cd2ce8a4fdcdcb8))
* 完成相似度比较的功能 ([00f90c5](https://github.com/wuhonglei/Similo2-JS/commit/00f90c52d5f8ce1aaee538a30fa5b4d6702b1eee))
* 调整 grab 代码，允许抓取所有网页 ([5452571](https://github.com/wuhonglei/Similo2-JS/commit/5452571dec7b98babad8d6577cd743e570573506))
* 调整 visibleText 记录类型为 string[] ([7dfad21](https://github.com/wuhonglei/Similo2-JS/commit/7dfad214fd8bf6b868031dfdd5e98894a1d6b175))
* 调整代码中文件引用路径 ([876d89b](https://github.com/wuhonglei/Similo2-JS/commit/876d89bd948bff2b90021be5dfc4f9446f55a53d))
* 调整数据文件夹层级结构 ([e5f48e6](https://github.com/wuhonglei/Similo2-JS/commit/e5f48e6c0db75de675bb03033cc7d6ffa98cf17c))


### Bug Fixes

* location 为空异常处理 ([d9bc8b7](https://github.com/wuhonglei/Similo2-JS/commit/d9bc8b7115a00a367964327e805c5f4a6a26cd50))
* 代码兼容处理 ([642fd02](https://github.com/wuhonglei/Similo2-JS/commit/642fd0275a73044236455246fd95338861e931d5))
* 优化 ts 配置 ([d4224b3](https://github.com/wuhonglei/Similo2-JS/commit/d4224b353dc424127c1802a6faaa488c5a388728))
* 优化 xpath 获取函数嵌套字符的处理 ([8c6554d](https://github.com/wuhonglei/Similo2-JS/commit/8c6554d4e8fabf367eff55e9534b8c814e7df33d))
* 兼容 app 属性路径不存在的情况 ([f97b194](https://github.com/wuhonglei/Similo2-JS/commit/f97b19430fd97421040e336dc2adb54e0d473dd6))
* 解决 aus、robula 选择器的 bug ([2f26286](https://github.com/wuhonglei/Similo2-JS/commit/2f2628648578be4ecb3db61e380bec5b775f14cf))
* 解决抓取 JavaScript 注入失败的异常退出问题 ([992df39](https://github.com/wuhonglei/Similo2-JS/commit/992df39af737fd8f99380cd9478669f0963962ed))
