# bricks开发和测试

## 环境准备

### 后台服务器安装部署
与bricks框架同时开发的[gadget](https://git.kaiyuancloud.cn/yumoqing/gadget)的后台服务器，是一个python开发的后台应用服务器。

请按照gadget服务器的安装说明部署后台应用服务器


或者部署其他后台服务器，后台服务器需满足[对后台服务器要求](server.md)

### 将bricks的目标文件复制或链接到后台服务器的web文档根目录下

### index.html

请参照/bricks/header.tmpl和/bricks/footer.tmpl内容，编写项目的index.html文件

将项目的root控件放在index.html中，

其中，可以添加项目自身的css文件，项目自己的javascript

可设置的内容请参看[index.html文件内容](index_html.md)

### 用户界面编写

以".ui"后缀的文件命名编写控件描述文件。文件内容请参看[控件描述文件](descjson.md)

并保存在后台服务器的web文件目录下

### 界面调试
用控件文件的url直接调试界面


