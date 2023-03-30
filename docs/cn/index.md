# bricks
像搭积木一样的编写前端应用，bricks希望提供开发者所需的底层显示控件，开发应用时采用简单的组装和插拔方式完成应用的开发

使用bricks开发应用的好处
* 质量和性能可控，开发者开发的应用质量和性能依赖bricks提供的提供底层控件。
* 简单的开发方式，开发者以编写json数据文件的形式开发前端应用，以后可以提供一个可视化开发平台

## Bricks控件描述文件
Bricks使用json格式描述控件，具体格式要求请看[控件描述文件](descjson.md)

## BricksApp
Bricks应用类，参见[BricksApp](bricksapp.md)

## bricks主要函数
### widgetBuild
创建控件函数，详细说明请看[这里](bricks.md)

### getWigetById
从DOM树查找控件，详细说明请看[这里](bricks.md)

## bricks控件
Bricks的所有控件均继承自JsWidget，控件间的继承关系请看[控件继承树](inherittree.md)

控件是bricks的基础，每个控件实现了特定显示功能或布局能力，开发者使用这些控件来构建应用

bricks的开发理念是：应用开发可分为底层控件的开发以及操控底层控件来搭建应用。

通过这样分工，让精通底层开发的人员专心开发底层控件，而精通操控控件的人员专心搭建应用，从而提高开发效率和开发质量，希望大家参与进来一起做。

关于控件更多的信息，请看[控件](widgettypes.md)

## 依赖
如果要使用Markdown，需要引用marked模块，

如果用到图表， 需要引用echarts

* [Marked](https://github.com/markedjs/marked)

* [echarts](https://echarts.apache.org/zh/index.html)

## build
bricks 使用uglifyjs 压缩
在bricks目录下执行
```
./build.sh
```
命令执行完后在项目的dist目录下会生成bricks.js 和bricks.min.js，并将examples和docs目录复制到本机到wwwroot目录

按照开发者本地web服务器的配置，请修改build.sh的目标路径。
## 引用
```
<link rel="stylesheet" href="/bricks/css/bricks.css" />
<script src="/bricks/bricks.js"></script>

```
## 例子
配置好本地服务器后，可以使用build.sh将bricks项目内容复制到本地网站后台，之后在网站的examples目录中查看bricks提供的例子程序

