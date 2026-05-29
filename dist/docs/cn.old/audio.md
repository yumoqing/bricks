# `bricks` 音频模块技术文档

本文档为 `bricks` 框架中的音频相关功能模块提供详细说明，包含以下核心类：

- `bricks.formatMs()` —— 时间格式化工具函数
- `bricks.AudioPlayer` —— 音频播放器组件
- `bricks.AudioRecorder` —— 音频录制与上传组件
- `bricks.TextedAudioPlayer` —— 带文本同步的流式音频播放器
- 工厂注册机制（通过 `bricks.Factory`）

---

## 1. 工具函数：`bricks.formatMs(ms, all)`

将毫秒数转换为可读的时间字符串，支持自定义显示粒度。

### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `ms` | `number` | 时间（单位：毫秒） |
| `all` | `boolean?` | 是否强制显示所有时间单位（即使高位为0） |

### 返回值

返回格式化的字符串，形式如：`"h:mm:ss″sss"` 或 `"mm:ss″sss"`

- 小时部分仅在非零时显示
- 分钟和秒根据上下文决定是否显示前导零
- 毫秒固定三位数字补全

### 示例

```js
bricks.formatMs(3661234);     // 输出: "1:01:01″234"
bricks.formatMs(61234, true); // 输出: "01:01″0234"
```

---

## 2. 音频播放器：`bricks.AudioPlayer`

基于 HTML5 `<audio>` 元素封装的高级音频播放控制组件。

### 继承关系

```js
class AudioPlayer extends bricks.JsWidget
```

### 构造选项 (`options`)

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `url` | `string` | 否 | `null` | 初始音频源 URL |
| `autoplay` | `boolean` | 否 | `false` | 是否自动播放 |

### 实例属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `audio` | `HTMLAudioElement` | 内部使用的 `<audio>` DOM 节点 |
| `source` | `HTMLSourceElement` | 动态创建的 `<source>` 节点 |
| `playlist` | `Array<string>` | 待播放的 URL 列表（队列） |
| `url_generator` | `AsyncGenerator` | 流式加载 URL 的异步生成器 |
| `srcList` | `Array<{played: boolean, url: string}>` | 动态加载的音频源列表 |

### 方法

#### `get_status() → string`

获取当前播放状态。

**返回值：**

| 状态 | 说明 |
|------|------|
| `"error"` | 音频加载出错 |
| `"ended"` | 播放结束 |
| `"paused"` | 暂停中 |
| `"loading"` | 数据不足，正在缓冲 |
| `"playing"` | 正在播放 |

---

#### `add_url(url: string)`

向播放队列添加新音频。若当前状态为 `'error'` 或 `'ended'`，立即播放该音频；否则加入队列。

---

#### `set_source(url: string)`

设置音频源并更新 DOM。

> ⚠️ 注意：会同时设置 `this.audio.src` 和内部 `<source>` 元素。

---

#### `set_stream_urls(response: Response)`

从服务器流式接收多个音频 URL（每行一个），用于连续播放场景（如语音合成流）。

##### 参数

- `response`: `fetch` 返回的 `Response` 对象，其 body 应为逐行输出的文本流。

##### 实现逻辑

1. 创建异步生成器 `dyn_urls()` 解析流数据。
2. 使用 `schedule_once()` 异步启动 `load_queue_url()`。
3. 自动预加载并顺序播放音频片段。

---

#### `async load_queue_url()`

内部方法：持续从 `url_generator` 获取新的音频 URL，并维护 `srcList`。

当 `srcList.length < 2` 时触发首次播放。

---

#### `async play_srclist(event?)`

播放 `srcList` 中尚未播放的第一个音频项。

- 若传入事件对象且音频未结束，则不执行。
- 播放完成后通过 `'ended'` 事件继续下一首。

---

#### `play()` / `toggle_play()`

- `play()`: 异步调用原生 `audio.play()`。
- `toggle_play()`: 切换播放/暂停状态。

---

#### `set_url(url)` 

设置音频源并立即开始播放。

等价于：
```js
this.set_source(url);
this.audio.play();
```

---

## 3. 音频录制器：`bricks.AudioRecorder`

实现麦克风录音、可视化、文件上传与下载功能。

### 外部依赖

必须引入第三方库 [Recorder.js](https://gitee.com/xiangyuecn/Recorder)，支持 WAV 格式录音。

```html
<script src="https://cdn.jsdelivr.net/npm/recorder-js"></script>
```

### 继承关系

```js
class AudioRecorder extends bricks.HBox
```

### 构造选项 (`opts`)

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `upload_url` | `string` | 否 | `null` | 录音结束后上传的目标地址 |
| `start_icon` | `string` | 否 | 内置 SVG | 开始按钮图标路径 |
| `stop_icon` | `string` | 否 | 内置 SVG | 停止按钮图标路径 |
| `icon_rate` | `number` | 否 | `undefined` | 图标缩放比例 |

### 事件系统

通过 `this.dispatch()` 触发以下自定义事件：

| 事件名 | 触发时机 | 携带参数 |
|--------|----------|---------|
| `record_started` | 开始录音 | 无 |
| `record_ended` | 结束录音 | `{data: Blob, url: string, duration: number}` |
| `uploaded` | 成功上传后 | 服务器返回结果 |

可通过 `bind()` 监听这些事件。

### 主要组件

- `rec_btn`: 使用 `bricks.Svg` 显示切换式按钮（开始/停止）
- `rec_time`: 显示已录制时长（调用 `bricks.formatMs()`）
- `wave`: （预留）波形图显示区域（需额外包支持）

### 核心方法

#### `recOpen()` / `recClose()`

打开或关闭麦克风权限。

- 调用 `Recorder.open()` 请求用户授权。
- 成功后设置 `this.rec` 实例并派发 `record_started`。
- 失败时打印调试信息。

---

#### `start_recording()` / `stop_recording()`

开始或停止录音。

- `start_recording`: 若已授权则直接开始，否则先调用 `recOpen()`。
- `stop_recording`: 调用 `rec.stop()` 获取 `Blob` 和时长，生成本地 URL 并派发 `record_ended`。

---

#### `on_process(buffers, powerLevel, ...)` 

录音过程中的实时回调（约每秒12次）。

当前用途：
- 更新录音时长显示（`bufferDuration`）
- 可扩展用于绘制音量条或波形图（注释中示例）

---

#### `upload() → Promise<void>`

将录音文件以 `FormData` 形式上传至 `upload_url`。

使用 `bricks.jpost()` 发送请求，附带运行中提示（`bricks.Running`）。

成功后派发 `uploaded` 事件。

---

#### `download()`

触发浏览器下载当前录音文件（WAV 格式），文件名为 `recorder-{timestamp}.wav`。

> ⚠️ 下载完成后自动释放 `ObjectURL` 防止内存泄漏。

---

## 4. 文本同步音频播放器：`bricks.TextedAudioPlayer`

专为“语音+字幕”场景设计的垂直布局播放器，支持流式 JSON 数据驱动。

### 继承关系

```js
class TextedAudioPlayer extends bricks.VBox
```

### 组件结构

- 上方：`AudioPlayer` 控件
- 下方：`VScrollPanel` 包含 `Text` 组件用于显示文本内容

### 核心特性

支持通过流式响应动态加载语音与对应文本，实现边生成边播放的效果（适用于 TTS + 字幕同步）。

### 方法

#### `set_stream_urls(response: Response)`

解析流式 JSON 响应，每一行为一个 `{audio: base64, text: string}` 对象。

使用辅助函数 `streamResponseJson(response, callback)` 逐条处理。

---

#### `load_stream_data(json)`

接收到单条流数据后的处理逻辑：

1. 存入 `streaming_buffer` 队列；
2. 若当前空闲（`wait_play === true`），立即触发 `playnext()`。

---

#### `playnext()`

从缓冲区取出下一条数据：

- 提取 `audio` 字段并转为 URL（`base64_to_url()`）；
- 设置播放器源并更新文本显示；
- 播放完毕后等待 `'ended'` 事件再次调用自身。

当数据耗尽时清空界面。

---

## 5. 工厂注册

所有组件均通过 `bricks.Factory` 注册，可在模板中使用标签方式实例化。

```js
bricks.Factory.register('AudioPlayer', bricks.AudioPlayer);
bricks.Factory.register('AudioRecorder', bricks.AudioRecorder);
bricks.Factory.register('TextedAudioPlayer', bricks.TextedAudioPlayer);
```

### 示例用法（假设支持声明式语法）

```html
<widget type="AudioPlayer" url="demo.mp3" autoplay="true"/>
<widget type="AudioRecorder" upload_url="/api/upload-audio"/>
<widget type="TextedAudioPlayer"/>
```

---

## 6. 辅助函数与约定

### `base64_to_url(base64str) → string`

将 Base64 编码的音频数据转换为 `ObjectURL`，供 `<audio>` 使用。

> ✅ 实际代码中需确保此函数存在。

---

### `schedule_once(fn, delay)`

延迟执行一次函数（通常为 `setTimeout(fn, delay * 1000)` 封装）。

---

### `bricks.debug(msg, ...args)`

框架级调试日志输出。

---

### `bricks.is_mobile() → boolean`

判断是否运行在移动设备上，影响下载行为处理。

---

## 7. 使用场景建议

| 场景 | 推荐组件 |
|------|----------|
| 普通音频播放 | `AudioPlayer` |
| 用户录音上传 | `AudioRecorder` |
| AI语音对话（TTS+字幕） | `TextedAudioPlayer` + 流式 API |
| 连续播放多个短音频 | `AudioPlayer.set_stream_urls()` |

---

## 8. 注意事项

1. **跨域限制**：录音上传、音频源加载需注意 CORS。
2. **HTTPS 要求**：现代浏览器要求 `getUserMedia()` 在安全上下文中运行（HTTPS 或 localhost）。
3. **移动端兼容性**：iOS Safari 对自动播放和 `ObjectURL` 支持有限，建议用户交互后触发播放。
4. **内存管理**：使用 `URL.revokeObjectURL()` 及时释放资源。
5. **错误处理**：建议监听 `error` 事件并在 UI 中反馈。

---

## 9. 示例代码

### 初始化一个播放器

```js
const player = new bricks.AudioPlayer({
    url: 'music.mp3',
    autoplay: true
});
document.body.appendChild(player.dom_element);
```

### 创建录音器并绑定上传

```js
const recorder = new bricks.AudioRecorder({
    upload_url: '/api/v1/audio-upload',
    icon_rate: 1.2
});
recorder.bind('uploaded', (res) => {
    console.log('Upload success:', res);
});
document.body.appendChild(recorder.dom_element);
```

### 流式语音播放（AI 回复）

```js
fetch('/api/stream-tts', { method: 'POST', body: prompt })
.then(response => {
    const tap = new bricks.TextedAudioPlayer();
    tap.set_stream_urls(response);
    document.body.appendChild(tap.dom_element);
});
```

---

> 📚 文档版本：v1.0  
> © 2025 bricks Framework Team