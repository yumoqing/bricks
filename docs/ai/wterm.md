# Wterm

控件功能：基于 xterm.js 实现的 Web 终端控件，用于在浏览器中嵌入一个可通过 WebSocket 与后端交互的终端界面。支持终端尺寸自适应、心跳保活、输入输出数据传输等功能。  
类型：普通控件  
父类控件：`bricks.JsWidget`

## 初始化参数

- `ws_url` (String, 必需)  
  WebSocket 连接地址，用于与后端终端服务建立通信。

- `ping_timeout` (Number, 可选，默认值: 19)  
  心跳间隔时间（秒），用于定时向服务器发送心跳消息以保持连接活跃。

> 其他可继承自 `JsWidget` 的通用选项也适用，如布局、样式等。

## 主要事件

- `domon`  
  当控件被挂载到 DOM 时触发，自动调用 `send_term_size()` 向服务器发送当前终端尺寸。

- `domoff`  
  当控件从 DOM 中移除时触发，执行资源清理操作，包括关闭 WebSocket 连接、销毁终端实例等。

- `element_resize`  
  当控件所在元素尺寸发生变化时触发，用于调整终端显示区域并重新适配尺寸（通过 `FitAddon`）。

- `terminal_input`（隐式事件）  
  用户在终端中输入字符时，由 `term.onData` 触发，将输入内容通过 WebSocket 发送给服务器。

- `terminal_resize`  
  终端行列数变化时触发（由 `term.onResize` 监听），自动调用 `send_term_size()` 同步最新尺寸至服务器。

- `websocket_message`  
  收到 WebSocket 消息时处理不同类型的数据：
  - `data`: 将内容写入终端显示。
  - `heartbeat`: 心跳响应，表示连接正常。
  - 其他类型：打印日志用于调试。

- `websocket_open/close/error`  
  WebSocket 生命周期事件，分别处理连接建立、关闭和错误情况，确保资源正确释放。
