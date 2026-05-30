# `bricks.ASRClient` 技术文档

> 基于 WebSocket 的语音识别客户端组件，用于实时音频流传输与文本识别结果接收。

---

## 概述

`bricks.ASRClient` 是一个基于 `bricks.VBox` 的类，封装了浏览器端的语音识别功能。它通过调用 Web Audio API 获取用户麦克风输入，并使用 WebSocket 将音频数据以 Base64 编码形式发送至后端 ASR（自动语音识别）服务。同时监听服务器返回的识别结果，并触发相应事件。

该组件提供了一个可点击的图标按钮来控制录音的开始与停止，支持自定义图标、WebSocket 地址和附加参数。

---

## 继承关系

- **继承自**：`bricks.VBox`
- **注册名称**：`ASRClient`（可通过 `bricks.Factory.create('ASRClient', options)` 创建）

```js
bricks.Factory.register('ASRClient', bricks.ASRClient);
```

---

## 构造函数

### `constructor(opts)`

#### 参数

| 参数名         | 类型     | 说明 |
|----------------|----------|------|
| `opts`         | Object   | 配置选项对象，见下表 |

##### `opts` 配置项

| 属性名         | 类型     | 默认值 | 说明 |
|----------------|----------|--------|------|
| `start_icon`   | String   | `'imgs/start_recording.svg'` | 开始录音时显示的图标路径（SVG/PNG） |
| `stop_icon`    | String   | `'imgs/stop_recording.svg'`  | 停止录音时显示的图标路径（SVG/PNG） |
| `ws_url`       | String   | 必填   | WebSocket 服务器地址，例如：`wss://asr.example.com/ws` |
| `icon_options` | Object   | `{}`   | 传递给内部 `bricks.Svg` 图标组件的额外配置 |
| `ws_params`    | Object   | `{}`   | 发送至 WebSocket 服务的附加参数，在每次发送音频时合并使用 |

---

## 事件

`ASRClient` 支持以下自定义事件，可通过 `.bind()` 方法监听：

| 事件名       | 触发时机                     | 参数格式（`event.params`） |
|--------------|------------------------------|----------------------------|
| `start`      | 用户点击开始录音             | 无参数                     |
| `stop`       | 用户点击停止录音             | 无参数                     |
| `transtext`  | 接收到服务器返回的识别文本   | `{ content, speaker, start, end }` |

示例：
```js
asr.bind('transtext', function(e) {
    console.log('识别结果:', e.params.content);
});
```

---

## 属性

| 属性名        | 类型          | 说明 |
|---------------|---------------|------|
| `status`      | String        | 当前状态：`'start'` 或 `'stop'` |
| `icon`        | `bricks.Svg`  | 控制按钮图标实例 |
| `socket`      | `WebSocket`   | 连接到 ASR 服务的 WebSocket 实例 |
| `stream`      | `MediaStream` | 来自 `getUserMedia` 的音频流 |
| `mediaRecorder` | `MediaRecorder` | 浏览器原生媒体录制对象，每秒收集并发送音频块 |

---

## 方法

### `toggle_button()`

切换录音状态（开始 ↔ 停止），并更新按钮图标。

- 若当前为 `'stop'`，则切换为 `'start'` 并调用 `start_recording()`
- 若当前为 `'start'`，则切换为 `'stop'` 并调用 `stop_recording()`

绑定在图标的 `click` 事件上。

---

### `async start_recording()`

启动麦克风录音并开始向服务器发送音频数据。

#### 行为流程：

1. 调用 `navigator.mediaDevices.getUserMedia({ audio: true })` 请求麦克风权限。
2. 创建 `MediaRecorder` 实例处理音频流。
3. 设置 `ondataavailable` 回调：每 1 秒生成一段音频 Blob。
4. 使用 `blobToBase64()` 工具将 Blob 转为 Base64 字符串。
5. 构造消息体并发送至 WebSocket 服务器：
    ```json
    {
      "type": "audiobuffer",
      "data": "base64string...",
      ...ws_params
    }
    ```

> ⚠️ 注意：需确保页面运行在 HTTPS 环境或本地开发环境（localhost），否则无法获取麦克风权限。

---

### `stop_recording()`

停止 `MediaRecorder` 录音，关闭音频流轨道。

```js
this.mediaRecorder.stop();
// 同时会释放麦克风资源
```

---

### `response_data(event)`

处理来自 WebSocket 的服务器响应。

#### 参数

- `event.data`: 服务器返回的 JSON 字符串

#### 动作

1. 解析 JSON 数据
2. 触发 `transtext` 事件并将解析后的数据作为参数分发

```js
this.dispatch('transtext', parsedData);
```

---

### `response_log(event)`

调试方法：将接收到的识别结果输出到控制台。

```js
console.log('response data=', event.params);
```

可通过重写此方法实现日志收集或 UI 更新。

---

## 内部依赖

| 工具/函数           | 说明 |
|----------------------|------|
| `bricks_resource(path)` | 解析资源路径的工具函数，通常用于构建静态资源 URL |
| `blobToBase64(blob)`    | 异步将 Blob 转换为 Base64 编码字符串 |
| `objcopy(obj)`          | 深拷贝对象（防止修改原始 `ws_params`） |

> 示例 `blobToBase64` 实现：
> ```js
> function blobToBase64(blob) {
>   return new Promise((resolve, reject) => {
>     const reader = new FileReader();
>     reader.onload = () => resolve(reader.result.split(',')[1]);
>     reader.onerror = reject;
>     reader.readAsDataURL(blob);
>   });
> }
> ```

---

## 使用示例

```js
var asr = new bricks.ASRClient({
    ws_url: 'wss://your-asr-server.com/asr',
    start_icon: 'imgs/mic-on.svg',
    stop_icon: 'imgs/mic-off.svg',
    ws_params: {
        lang: 'zh-CN',
        model: 'conversational'
    }
});

// 监听识别结果
asr.bind('transtext', function(e) {
    document.getElementById('output').innerHTML += '<p>' + e.params.content + '</p>';
});

// 插入到 DOM 容器
document.body.appendChild(asr.render());
```

---

## 注意事项

1. **安全性要求**：必须在安全上下文（HTTPS 或 localhost）中运行才能访问麦克风。
2. **浏览器兼容性**：需要支持 `MediaRecorder` API 和 `WebSocket`。
3. **性能建议**：每秒发送一次音频块，避免频繁请求；建议使用 Opus 编码压缩音频。
4. **错误处理**：未对 `getUserMedia` 失败做降级处理，建议外层捕获异常。

---

## 版本信息

- **作者**：Bricks Framework Team
- **版本**：1.0
- **最后更新**：2025年4月5日

--- 

📌 *文档结束*