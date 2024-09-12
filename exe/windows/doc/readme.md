# QuoteX
V0.1.0-Beta Build 20240910

最新版本：[C++](https://github.com/universal-exchange/quotex/tree/main/exe/windows/bin)、[Python](https://github.com/universal-exchange/quotex/tree/main/exe/windows/bin/quotex_py/0.1.0)、[JavaScript](https://github.com/universal-exchange/quotex/tree/main/exe/windows/bin/quotex_js/0.1.0)

### 项目概述
行情服务特性：
+ 基于 CyberX 高性能分布式异构计算框架 灵活构建；
+ 提供适配 C++、Python、JavaScript 等开发语言的接口和示例；
+ 广泛支持国内国外证券经纪商各类股票、期货、期权、指数、基金等的行情接口；
+ 灵活支持直接逐笔推送、行情中心处理、行情服务代理等不同时效性和扩展性的架构模式。

行情插件简介：
+ quotex_center：
  + 行情中心插件。
  + 接收子级行情代理插件推送的行情数据，对其进行加工处理，接受上层应用调用。
  + 使用示例：test_quotex_center（[Python](https://github.com/universal-exchange/quotex/tree/main/exe/windows/bin/quotex_py/0.1.0/test_quotex_center.py)、[JavaScript](https://github.com/universal-exchange/quotex/tree/main/exe/windows/bin/quotex_js/0.1.0/test_quotex_center.js)）
###
+ quotex_client_stock_ltp：
  + 推送股票行情代理插件。
  + 代理接收 quotex_server 行情服务推送的 LTS 股票类实时行情数据。
  + 使用示例：详见前述 quotex_center 插件示例。
###
+ quotex_client_future_ctp：
  + 上期期货行情代理插件。
  + 代理接收 quotex_server 行情服务推送的 CTP 期货类实时行情数据。
  + 使用示例：详见前述 quotex_center 插件示例。
###

### 安装框架（建议安装最新版本）
Windows 环境需要安装 [The Visual C++ Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170) for Visual Studio 2015-2022（Platform：X64，Version >= 14.40.33810.0）。

#### C++:
```bash
```

#### Python:
```bash
pip install cyberx
```

#### JavaScript:
```bash
npm install cyberx-js
```

### 运行示例（建议运行最新版本）
#### C++:

```c++

```

#### Python:

```python

```

#### JavaScript:

```javascript

```

### 其他说明
+ 目前暂只支持 Windows 环境运行，Linux 后续有时间会支持，MacOS 没有计划。

### 更新日志
请参考 [更新日志](https://github.com/universal-exchange/quotex/blob/main/changes.txt) 文件。

### 联系作者
WeChat：xrd_ustc，~~QQ：277195007~~，~~E-mail：xrd@ustc.edu~~

© 2012-2024 Rendong Xu All Rights Reserved.
