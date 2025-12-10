# 安装bricks

## 下载bricks
执行以下命令
```
git clone https://git.kaiyauncloud.cn/yumoqing/bricks
```
执行完成后bricks的源码存放在bricks目录中

## 构建和安装
执行以下命令
```
cd bricks
cd bricks
./build.sh
cd ..
ln -s `pwd`/dist $(web根目录}/bricks
```
命令执行完成后，构建完成的目标文件在bricks/dist目录中

并将bricks/dist目录复制或链接到web服务器的根文件目录中

## 依赖
bricks框架目前引用如下软件包

* marked.min.js Markdown解析和展示包

* recorder.wav.min.js 跨平台的录音软件包

* video.min.js 跨平台的视频播放软件包

* videojs-ie8.min.js video视频播放器ie8兼容包

* xterm.js web终端软件包

bricks把依赖的第三方软件包放在/bricks/3parties目录下

