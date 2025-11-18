# WebSocket

WebSocket 控件是一个**容器控件**，继承自 `VBox`，用于在 Bricks.js 框架中建立与后端的 WebSocket 长连接。它支持文本、音频（base64 编码）、视频（base64 编码）等类型的数据双向通信，并能根据消息类型自动派发对应的事件。适用于实时通信场景，如语音识别、视频流传输、聊天系统等。

---

## 主要方法

- **`send_text(text)`**  
  发送文本类型的消息到服务器。  
  参数：`text`（字符串）

- **`send_base64_video(b64video)`**  
  发送 base64 编码的视频数据到服务器。  
  参数：`b64video`（字符串，base64 视频数据）

- **`send_base64_audio(b64audio)`**  
  发送 base64 编码的音频数据到服务器。  
  参数：`b64audio`（字符串，base64 音频数据）

- **`send_typedata(type, data)`**  
  发送指定类型和内容的数据包。  
  参数：
  - `type`：自定义消息类型（如 `"command"`）
  - `data`：任意数据对象或字符串

- **`send(d)`**  
  将一个对象格式化为 JSON 并通过 WebSocket 发送。  
  参数：`d`（对象，结构为 `{ type: "...", data: ... }`）

---

## 主要事件

WebSocket 控件会在特定时机派发以下事件，可通过 `binds` 进行监听：

- **`onopen`**  
  WebSocket 连接成功建立时触发。

- **`onclose`**  
  WebSocket 连接关闭时触发。

- **`onerror`**  
  WebSocket 发生错误时触发。

- **`ontext`**  
  收到类型为 `text` 的消息时触发（对应 `d.type === "text"`）。

- **`onbase64audio`**  
  收到 base64 编码的音频数据时触发。

- **`onbase64video`**  
  收到 base64 编码的视频数据时触发。

- **其他自定义类型事件**  
  若收到的消息类型为 `custom`，会自动派发名为 `oncustom` 的事件。

> 注：所有来自服务端的消息需为 JSON 格式，结构为 `{ type: "xxx", data: ... }`

---

## 源码例子

```json
{
  "id": "ws_conn_01",
  "widgettype": "WebSocket",
  "options": {
    "ws_url": "wss://example.com/api/ws",  // WebSocket 服务器地址
    "with_session": true                   // 是否携带会话信息（如 token）
  },
  "subwidgets": [
    {
      "id": "btn_start",
      "widgettype": "Button",
      "options": {
        "label": "开始连接"
      }
    },
    {
      "id": "log_area",
      "widgettype": "TextArea",
      "options": {
        "readonly": true,
        "placeholder": "日志输出区域"
      }
    }
  ],
  "binds": [
    {
      "actiontype": "method",
      "wid": "btn_start",
      "event": "click",
      "target": "ws_conn_01",
      "method": "send_text",
      "params": {
        "text": "Hello from client!"
      },
      "conform": {
        "title": "确认发送",
        "message": "确定要发送消息吗？"
      }
    },
    {
      "actiontype": "event",
      "wid": "ws_conn_01",
      "event": "onopen",
      "target": "log_area",
      "dispatch_event": "setValue",
      "rtdata": {
        "value": "✅ WebSocket 已连接\n"
      }
    },
    {
      "actiontype": "script",
      "wid": "ws_conn_01",
      "event": "ontext",
      "target": "log_area",
      "script": "async function({ target, params }) { const current = target.getValue(); target.setValue(current + '[TEXT] ' + (params || '') + '\\n'); }",
      "datawidget": "ws_conn_01",
      "datamethod": "getValue"  // 实际上 ontext 的数据由事件参数传入，此处仅为示意
    },
    {
      "actiontype": "script",
      "wid": "ws_conn_01",
      "event": "onbase64video",
      "target": "Popup",
      "script": "async function({ params }) { console.log('播放视频:', params); /* 可在此处调用媒体播放控件 */ }",
      "dataparams": {}
    },
    {
      "actiontype": "bricks",
      "wid": "ws_conn_01",
      "event": "onerror",
      "target": "Popup",
      "mode": "replace",
      "options": {
        "widgettype": "MessageBox",
        "options": {
          "title": "WebSocket 错误",
          "content": "连接出现异常，请检查网络或服务状态。",
          "type": "error"
        }
      }
    }
  ]
}
```

### 注释说明

- `widgettype: "WebSocket"` 表示这是一个 WebSocket 容器控件。
- `options.ws_url` 是必须项，指定 WebSocket 服务地址。
- `with_session: true` 会尝试从 `bricks.app.get_session()` 获取会话信息并作为协议参数传递（具体实现取决于应用逻辑）。
- 子控件包括按钮和文本区域，用于用户交互和日志展示。
- `binds` 中定义了多种行为：
  - 点击按钮时向 WebSocket 发送文本；
  - 连接成功时更新日志；
  - 接收到文本消息时追加显示；
  - 接收到视频数据时可通过脚本处理（如播放）；
  - 出错时弹出提示框。

> ⚠️ 注意：实际使用中需确保服务端返回的消息符合 `{ type: "...", data: ... }` 结构，否则可能无法正确触发事件。