# `bricks.WebSocket` 技术文档

> 基于 WebSocket 的通信组件，继承自 `bricks.VBox`，用于在前端与后端之间建立双向实时通信通道。支持文本、Base64 编码的音视频数据等消息类型的发送与接收。

---

## 概述

`bricks.WebSocket` 是一个封装了原生 WebSocket 功能的类，提供了更便捷的事件处理机制和数据封装方法。它允许开发者通过简单的配置连接到指定的 WebSocket 服务，并支持会话认证（session）以及多种类型的消息收发。

该类通过 `bricks.Factory.register` 注册为可复用组件，适用于 bricks UI 框架体系。

---

## 继承关系

- **父类**: `bricks.VBox`
- **子类**: `bricks.WebSocket`

---

## 构造函数

```js
new bricks.WebSocket(options)
```

### 参数

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `options.ws_url` | `String` | ✅ | WebSocket 服务器地址（如：`ws://localhost:8080/ws`） |
| `options.with_session` | `Boolean` | ❌ | 是否携带当前应用会话信息进行连接，默认为 `false` |

### 示例

```js
var ws = new bricks.WebSocket({
    ws_url: 'ws://example.com/ws',
    with_session: true
});
```

> 当 `with_session: true` 时，系统将调用 `bricks.app.get_session()` 获取会话标识并作为协议参数传递给 WebSocket 构造函数（注意：代码中存在拼写错误 `sessopn` 应为 `session`）。

---

## 事件回调

`bricks.WebSocket` 支持以下事件监听，可通过 `on(event, handler)` 方法绑定：

| 事件名 | 触发时机 | 回调参数 |
|--------|----------|-----------|
| `onopen` | WebSocket 连接成功打开时 | 无 |
| `onclose` | WebSocket 连接关闭时 | 无 |
| `onerror` | WebSocket 发生错误时 | 错误对象 |
| `ontext` | 接收到类型为 `text` 的消息时 | 文本数据 |
| `onbase64audio` | 接收到 Base64 编码的音频数据时 | Base64 字符串 |
| `onbase64video` | 接收到 Base64 编码的视频数据时 | Base64 字符串 |
| `on{type}` | 接收到任意自定义类型 `{type}` 的消息时 | 数据体 |

> 所有事件均通过 `this.dispatch(eventname, data)` 触发，可使用标准事件监听机制订阅。

---

## 方法说明

### `on_open(e)`

WebSocket 连接打开时的内部处理函数。

- 触发 `onopen` 事件
- 控制台输出 `"open"`

### `on_close(e)`

WebSocket 连接关闭时的内部处理函数。

- 触发 `onclose` 事件
- 控制台输出 `"close"`

### `on_error(e)`

WebSocket 发生错误时的内部处理函数。

- 触发 `onerror` 事件
- **⚠️ Bug 提示**：日志中 `console.log(error)` 应为 `console.log(e)`，否则会抛出未定义变量异常。

### `on_message(e)`

处理接收到的消息。

#### 流程：
1. 解析 `e.data` 为 JSON 对象，格式应为：
   ```json
   {
     "type": "text",
     "data": "Hello World"
   }
   ```
2. 根据 `type` 动态生成事件名（如 `type: "text"` → 事件 `ontext`）
3. 使用 `this.dispatch(eventname, d.data)` 派发事件

> 支持扩展任意消息类型，只需确保服务端发送的数据结构符合规范。

---

### `send_text(text)`

发送纯文本消息。

#### 参数
- `text` (`String`)：要发送的文本内容

#### 示例
```js
ws.send_text("Hello from client");
```

#### 发送格式
```json
{ "type": "text", "data": "Hello from client" }
```

---

### `send_base64_video(b64video)`

发送 Base64 编码的视频数据。

#### 参数
- `b64video` (`String`)：Base64 编码的视频字符串（不含前缀如 `data:video/mp4;base64,`）

#### 示例
```js
ws.send_base64_video(videoBase64Data);
```

#### 发送格式
```json
{ "type": "base64video", "data": "...base64..." }
```

---

### `send_base64_audio(b64audio)`

发送 Base64 编码的音频数据。

#### 参数
- `b64audio` (`String`)：Base64 编码的音频字符串

#### 示例
```js
ws.send_base64_audio(audioBase64Data);
```

#### 发送格式
```json
{ "type": "base64audio", "data": "...base64..." }
```

---

### `send_typedata(type, data)`

发送指定类型的消息（通用接口）。

#### 参数
- `type` (`String`)：消息类型（如 `"custom"`）
- `data` (`Any`)：任意可序列化数据

#### 返回值
- `undefined`（但调用了 `send(d)`）

> **⚠️ Bug 提示**：方法体内 `return send(d);` 应为 `return this.send(d);`，否则 `send` 函数无法正确调用。

---

### `send(d)`

底层消息发送方法，负责序列化并发送数据。

#### 参数
- `d` (`Object`)：消息对象，格式如下：
  ```js
  {
    type: String,
    data: Any
  }
  ```

#### 行为
1. 使用 `JSON.stringify(d)` 序列化对象
2. 调用 `this.ws.send(s)` 发送字符串

---

## 已知问题 / 注意事项

| 问题 | 说明 | 建议修复 |
|------|------|---------|
| `sessopn` 拼写错误 | `constructor` 中 `sessopn` 应为 `session` | 更正为 `this.ws = new WebSocket(this.ws_url, session);` |
| `console.log(error)` 错误引用 | `on_error` 方法中变量名错误 | 改为 `console.log(e);` |
| `send_typedata` 调用错误 | `send(d)` 应为 `this.send(d)` | 修正为 `return this.send(d);` |
| 缺少连接状态管理 | 未暴露 `readyState` 或重连机制 | 可增加 `isConnected()` 方法 |

---

## 使用示例

```js
// 创建 WebSocket 实例
var ws = new bricks.WebSocket({
    ws_url: 'ws://localhost:3000/ws',
    with_session: true
});

// 绑定事件
ws.on('onopen', function() {
    console.log('Connected!');
    ws.send_text('Client ready');
});

ws.on('ontext', function(data) {
    console.log('Received text:', data);
});

ws.on('onbase64video', function(videoData) {
    document.getElementById('video').src = 'data:video/webm;base64,' + videoData;
});
```

---

## 注册为工厂组件

```js
bricks.Factory.register('WebSocket', bricks.WebSocket);
```

允许通过工厂模式创建实例：

```js
var instance = bricks.Factory.create('WebSocket', { ws_url: '...' });
```

---

## 总结

`bricks.WebSocket` 是一个轻量级、易于集成的 WebSocket 封装组件，适合用于实时通信场景（如聊天、音视频流推送、远程控制等）。尽管存在少量代码缺陷，但整体设计清晰，具备良好的扩展性和事件驱动特性。

建议在实际使用前修复上述指出的问题以保证稳定性。