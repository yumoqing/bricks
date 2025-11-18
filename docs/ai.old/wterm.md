# Wterm

Wterm 是一个基于 Web Terminal 的控件，用于在浏览器中嵌入一个可交互的终端界面（如 SSH、Shell 等），通过 WebSocket 与后端服务通信。该控件继承自 `bricks.JsWidget`，属于**普通控件**（非容器控件），不支持包含子控件。

---

## 主要方法

| 方法名              | 参数说明 | 功能描述 |
|---------------------|---------|--------|
| `open()`            | 无      | 异步初始化终端实例并建立 WebSocket 连接，加载 FitAddon 并绑定事件 |
| `destroy()`         | 无      | 销毁控件时调用，清理定时任务、解绑事件、关闭 WebSocket 和终端实例 |
| `close_websocket()` | 无      | 安全关闭 WebSocket 连接，清除事件监听器 |
| `close_terminal()`  | 无      | 销毁 xterm.js 终端实例 |
| `send_data(d)`      | `d`: 要发送的数据字符串 | 向服务器发送输入数据（键盘输入） |
| `send_term_size()`  | 无      | 向服务器发送当前终端尺寸（行、列、宽高） |
| `send_heartbeat()`  | 无      | 发送心跳消息以维持连接 |
| `heartbeat()`       | 无      | 心跳逻辑：若连接正常则发送心跳，并递归调度下一次心跳 |
| `term_resize()`     | 无      | 响应元素大小变化事件，调整终端布局 |
| `charsize_sizing()` | 无      | 根据全局字体大小设置终端字号 |

---

## 主要事件

| 事件名           | 触发时机 | 携带数据 | 备注 |
|------------------|--------|--------|------|
| `domon`          | 控件被挂载到 DOM 时触发 | 无 | 自动调用 `send_term_size()` |
| `domoff`         | 控件从 DOM 卸载前触发 | 无 | 自动调用 `destroy()` 清理资源 |
| `element_resize` | 控件所在 DOM 元素尺寸改变时触发 | 无 | 绑定后自动调整终端显示 |
| `terminal-data`  | （未显式派发）终端收到服务器数据时 | 解析后的消息对象 | 在 `onmessage` 中处理 |

---

## 源码例子

```json
{
  "id": "my_terminal",
  "widgettype": "Wterm",
  "options": {
    "ws_url": "wss://example.com/api/terminal",  // WebSocket 地址
    "ping_timeout": 19,                          // 心跳间隔秒数，默认19秒
    "term_options": {                            // 传递给 xterm.js 的配置项
      "cursorBlink": true,
      "theme": {
        "background": "#1e1e1e",
        "foreground": "#ffffff"
      }
    }
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "btn_connect",
      "event": "click",
      "target": "my_terminal",
      "method": "open",
      "params": {}
    },
    {
      "actiontype": "method",
      "wid": "btn_disconnect",
      "event": "click",
      "target": "my_terminal",
      "method": "close_websocket",
      "params": {}
    },
    {
      "actiontype": "script",
      "wid": "my_terminal",
      "event": "domon",
      "target": "my_terminal",
      "script": "console.log('Terminal mounted and ready.');",
      "params": {}
    },
    {
      "actiontype": "event",
      "wid": "my_terminal",
      "event": "domoff",
      "target": "global_event_bus",
      "dispatch_event": "terminal_closed",
      "params": {
        "terminal_id": "my_terminal"
      }
    }
  ]
}
```

### 注释说明：

- `"id"`: 控件唯一标识符。
- `"widgettype": "Wterm"`: 使用已注册的 `Wterm` 控件类型。
- `"options.ws_url"`: 必须为有效的 WebSocket URL，服务端需支持文本协议通信。
- `"options.ping_timeout"`: 设置心跳频率（秒），防止连接超时断开。
- `"term_options"`: 可选地传递给 xterm.js 的渲染和行为参数。
- `binds`:
  - 当按钮 `"btn_connect"` 被点击时，调用终端的 `open()` 方法启动连接。
  - 当 `"btn_disconnect"` 点击时，主动关闭 WebSocket。
  - 控件挂载时输出日志信息（可用于调试）。
  - 控件卸载时向全局事件总线派发 `terminal_closed` 事件，通知其他模块。

> ⚠️ 注意：使用此控件前需确保页面已引入 [xterm.js](https://xtermjs.org/) 及其 FitAddon 插件，并正确配置路径。

--- 

✅ **适用场景**：远程终端访问、Web SSH 客户端、运行日志流展示、运维操作面板等需要终端交互功能的系统。