# WebSocket

控件功能：用于建立与后端的 WebSocket 连接，支持发送和接收文本、Base64 编码的音视频数据，并提供多种事件回调。  
类型：普通控件  
父类控件：bricks.VBox

## 初始化参数

| 参数名       | 类型    | 说明 |
|--------------|--------|------|
| ws_url       | string | WebSocket 服务器的连接地址（如 `ws://example.com/socket`） |
| with_session | boolean | 是否携带当前会话信息；若为 `true`，则从 `bricks.app.get_session()` 获取 session 并传入 WebSocket 构造函数（注：源码中拼写错误 `sessopn` 应为 `session`） |

> 示例：
> ```js
> new bricks.WebSocket({
>   ws_url: "ws://localhost:8080/ws",
>   with_session: true
> });
> ```

## 主要事件

| 事件名           | 触发时机 |
|------------------|--------|
| onopen           | WebSocket 连接成功打开时触发 |
| onmessage        | 收到服务器发送的消息时触发（原始消息） |
| onerror          | WebSocket 发生错误时触发 |
| onclose          | WebSocket 连接关闭时触发 |
| ontext           | 收到类型为 `text` 的消息时触发（由 `on_message` 解析后派发） |
| onbase64audio    | 收到类型为 `base64audio` 的消息时触发 |
| onbase64video    | 收到类型为 `base64video` 的消息时触发 |

> 其他自定义类型可通过 `ontypedata` 方式动态派发，格式为 `on + type`。

### 事件数据说明

- 所有通过 `onmessage` 解析并派发的事件数据均来自 JSON 格式的 `e.data`，结构如下：
  ```json
  {
    "type": "text",
    "data": "Hello"
  }
  ```
  控件根据 `type` 字段自动派发对应的事件（如 `ontext`），并将 `data` 作为参数传递给事件处理器。
