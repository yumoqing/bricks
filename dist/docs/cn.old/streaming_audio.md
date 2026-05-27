# `bricks.StreamAudio` 技术文档

> **模块**：`bricks.StreamAudio`  
> **继承自**：`bricks.VBox`  
> **用途**：实现基于麦克风音频流的实时语音识别（ASR）前端组件，支持启动/停止录音、音频上传与实时文本反馈。

---

## 概述

`bricks.StreamAudio` 是一个用于浏览器端实时语音处理的 UI 组件。它封装了麦克风采集、语音活动检测（VAD）、音频编码上传以及后端流式响应接收的完整流程，适用于在线语音识别（ASR）场景。

该组件通过按钮控制录音启停，使用 `vad.MicVAD` 进行语音端点检测，并将语音片段以 Base64 编码形式发送到指定服务端 URL，同时接收并显示服务端返回的识别结果文本。

---

## 依赖说明

- `bricks.VBox`：布局容器，垂直排列子控件。
- `bricks.Button`：用于触发开始/停止操作。
- `bricks.Filler`：可伸缩填充容器，容纳内容区域。
- `bricks.Text`：显示识别出的文字内容，支持自动换行。
- `vad.MicVAD`：语音活动检测模块（假设为外部导入的 VAD 库）。
- `schedule_once`：延迟执行函数（通常为框架提供的异步调度工具）。
- `btoa`：JavaScript 内置函数，用于二进制数据转 Base64 字符串。
- `TextDecoder` / `ReadableStream`：用于解析流式响应体中的 UTF-8 文本。

---

## 构造函数

```js
constructor(opts)
```

### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `opts` | Object | 是 | 配置选项对象 |

#### 支持的配置项：

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `height` | String | `'100%'` | 容器高度（会被强制设置） |
| `name` | String | `'asr_text'` | 组件名称标识 |
| `url` | String | — | 流式上传的目标服务器地址（必须传入） |

> ⚠️ 注意：`opts.url` 必须在初始化时提供，否则上传无法进行。

### 初始化行为

1. 设置默认高度和名称；
2. 调用父类构造函数（创建 VBox 布局）；
3. 创建内部控件：
   - `this.button`：控制录音启停；
   - `this.filler`：中间填充区；
   - `this.text_w`：显示识别结果的文本控件；
4. 将 `text_w` 添加至 `filler` 中；
5. 将 `button` 和 `filler` 添加为子组件；
6. 绑定按钮点击事件到 `toggle_status` 方法。

---

## 核心方法

### `toggle_status()`

切换录音状态（开始 ↔ 停止）

```js
toggle_status()
```

根据当前是否正在上传 (`this.upstreaming`) 决定调用 `start()` 或 `stop()`。

---

### `start()`

请求开始录音与上传流程。

```js
start()
```

#### 行为：
- 更新按钮文字为 "stop"；
- 使用 `schedule_once` 延迟调用 `_start()`，避免同步阻塞 UI。

---

### `async _start()`

实际执行录音启动逻辑的异步方法。

#### 步骤：
1. 若存在全局 VAD 实例（`bricks.vad`），先停止它（防止冲突）；
2. 初始化新的 `MicVAD` 实例：
   - 配置 `onSpeechEnd` 回调：当检测到语音结束时，调用 `handle_audio(audio)` 发送音频；
3. 启动 VAD 监听；
4. 记录当前实例为全局唯一活跃 VAD（`bricks.vad = this`）；
5. 初始化 `UpStreaming` 实例用于上传音频；
6. 发起连接请求（`.go()`）；
7. 开始接收服务端响应数据（`recieve_data()`）。

> ✅ 支持并发保护：确保同一时间只有一个录音流激活。

---

### `stop()`

请求停止录音与上传。

```js
stop()
```

#### 行为：
- 更新按钮文字为 "start"；
- 延迟调用 `_stop()`。

---

### `async _stop()`

实际停止逻辑。

#### 步骤：
1. 如果有活跃的上传连接（`upstreaming`），调用其 `finish()` 方法通知服务端结束；
2. 清理 `upstreaming` 引用；
3. 暂停 VAD 录音；
4. 解除全局引用（`bricks.vad = null`）。

---

### `async receive_data()`

从服务端流式响应中读取并处理识别结果。

```js
async receive_data()
```

#### 工作流程：
1. 获取响应体的 `reader`（假设 `resp` 已定义且为 `Response.body.getReader()`）；
2. 使用 `TextDecoder` 解码 UTF-8 数据；
3. 循环读取每一行文本（模拟逐行解析 SSE 或 NDJSON 流）；
4. 尝试将每行解析为 JSON；
   - 成功 → 提取 `d.content` 并更新显示文本；
   - 失败 → 输出错误日志；
5. 直到流结束。

> ❗⚠️ 当前代码中 `resp` 变量未定义或作用域错误，应为 `this.resp` 或来自 `this.upstreaming.go()` 的返回值。**此为潜在 bug**。

---

### `handle_audio(audio)`

处理捕获到的音频数据块（通常是 PCM 或 WAV 格式）。

```js
handle_audio(audio)
```

#### 功能：
- 打印调试信息；
- 将原始音频数据转换为 Base64 字符串；
- 调用 `this.upstreaming.send(b64audio)` 发送到服务端。

> 🔍 说明：音频格式需与服务端兼容（如小端 PCM、16kHz 单声道等）。

---

## 注册与别名

```js
bricks.Factory.register('StreamAudio', bricks.StreamAudio);
bricks.Factory.register('ASRText', bricks.StreamAudio);
```

允许通过两种标签创建该组件：
- `<widget type="StreamAudio">`
- `<widget type="ASRText">`

便于不同项目或历史兼容使用。

---

## 示例用法

```html
<widget type="ASRText" url="/api/asr/stream"></widget>
```

或通过 JS 创建：

```js
const asrWidget = new bricks.StreamAudio({
  url: '/api/asr/upload',
  name: 'my_asr'
});
document.body.appendChild(asrWidget.dom);
```

---

## 状态属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `upstreaming` | UpStreaming \| null | 当前上传连接实例 |
| `vad` | MicVAD \| null | 语音活动检测实例 |
| `resp_text` | String | 累积的响应文本（暂未使用） |
| `resp` | Response | 服务端响应对象（可能需要修正作用域） |

---

## 已知问题与改进建议

| 问题 | 描述 | 建议修复 |
|------|------|----------|
| `resp` 未定义 | `receive_data()` 中直接使用 `resp.body`，但无声明 | 应从 `this.upstreaming.go()` 返回值获取响应对象 |
| `reader.readline()` 不存在 | 原生 `ReadableStreamDefaultReader` 不提供 `.readline()` | 需自行实现逐行读取逻辑或引入辅助库 |
| 错误拼写 | `recieve_data` 函数名拼写错误（应为 `receive`） | 重命名函数及所有调用处 |
| 异常处理不足 | 接收流过程中缺少中断和重连机制 | 添加网络错误监听与重试逻辑 |

---

## 总结

`bricks.StreamAudio` 是一个功能完整的语音输入前端组件，适合集成于语音助手、实时字幕、语音搜索等系统中。虽然目前存在少量代码瑕疵，但整体结构清晰、职责分明，易于扩展和维护。

建议结合后端 ASR 服务（如 WebSocket + Whisper 或自研引擎）共同部署使用。

--- 

📌 **版本**：1.0  
📅 **最后更新**：2025-04-05