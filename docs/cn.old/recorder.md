# `bricks.MediaRecorder` 技术文档

## 概述

`bricks.MediaRecorder` 是一个基于浏览器 `MediaRecorder API` 的通用媒体录制组件，继承自 `bricks.Popup`。它提供了统一的界面和控制逻辑，支持音频、视频以及特定 DOM 元素（如 `<video>`）的录制功能。

通过继承机制，该类派生出多个具体实现：

- `WidgetRecorder`：录制指定页面中的媒体元素（如 `<video>` 或 `<audio>`）
- `SysAudioRecorder`：录制系统麦克风输入（音频流），并自动转换 WebM 为 WAV 格式
- `SysVideoRecorder`：录制摄像头及麦克风输入（音视频流），实时预览画面
- `SysCamera`：仅拍照模式，用于从摄像头抓取单帧图像

所有子类均通过 `bricks.Factory` 注册，便于在应用中动态创建。

---

## 基础类：`bricks.MediaRecorder`

### 继承关系
```js
class bricks.MediaRecorder extends bricks.Popup
```

### 构造函数
```js
constructor(opts)
```

#### 参数
| 参数名 | 类型 | 必需 | 默认值 | 说明 |
|-------|------|------|--------|------|
| `opts.fps` | Number | 否 | `30` | 帧率（每秒更新次数），用于时间显示刷新频率 |

#### 初始化内容
- 设置任务周期：`this.task_period = 1 / fps`
- 创建 UI 组件：
  - `preview`: 预览区域（VBox）
  - `controls`: 控制栏（HBox）
    - `toggle_record`: 开始/停止按钮（SVG 图标）
    - `timepass`: 显示已录制时间（格式：`HH:MM:SS`）
    - `filler`: 弹性填充空间
    - `cancel`: 取消按钮（删除图标）
- 绑定事件：
  - `toggle_record.click` → `switch_record()`
  - `cancel.click` → `cancel_record()`
- 初始化状态：
  - `record_status = 'standby'`
  - 初始禁用录制按钮
- 调度 `open_recorder()` 在 0.1 秒后执行（异步准备设备）

---

### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `fps` | Number | 每秒帧数，决定 UI 更新频率 |
| `task_period` | Number | 定时任务间隔（秒） |
| `task` | TaskHandle | 当前运行的时间更新定时器 |
| `pic_task` | TaskHandle | （仅视频）图像捕获定时器 |
| `stream` | MediaStream | 获取到的媒体流 |
| `mediaRecorder` | MediaRecorder | 浏览器原生录制实例 |
| `recordedChunks` | Array<Blob> | 存储录制过程中产生的数据块 |
| `mimetype` | String | 媒体 MIME 类型（如 `'audio/wav'`, `'video/mp4'`） |
| `normal_stop` | Boolean | 是否正常结束录制（防止重复触发） |
| `record_status` | String | 状态：`'standby'` 或 `'recording'` |
| `start_time` | Number | 录制开始的时间戳（毫秒） |
| `time_diff` | String | 当前录制时长字符串（`HH:MM:SS`） |

---

### 方法

#### `tick_task()`
定时更新录制时间显示。

```js
tick_task()
```

- 使用 `schedule_once` 循环调用自身，间隔为 `this.task_period`
- 调用 `bricks.timeDiff(this.start_time)` 计算经过时间
- 更新 `this.timepass` 文本

> ⚠️ 注意：必须手动取消任务以避免内存泄漏。

---

#### `async switch_record()`
切换录制状态（开始或停止录制）。

```js
switch_record()
```

行为根据当前 `record_status` 决定：

| 状态 | 动作 |
|------|------|
| `'standby'` | 调用 `start_recorder()`，图标变为“停止” |
| `'recording'` | 调用 `stop_recorder()`，图标恢复为“开始” |

---

#### `cancel_record()`
取消当前录制操作，关闭资源并关闭弹窗。

```js
cancel_record()
```

等价于调用 `close_recorder()`。

---

#### `async open_recorder()`
**虚方法**：由子类重写以打开具体的媒体源。

```js
open_recorder()
```

> 默认实现为空，仅输出调试日志。

子类应在此方法中：
- 请求用户权限（如麦克风/摄像头）
- 获取 `MediaStream`
- 设置 `this.stream`
- 解除录制按钮禁用状态

---

#### `async start_recorder()`
启动实际录制流程。

##### 步骤：
1. 设置 `normal_stop = false`
2. 实例化 `MediaRecorder` 并绑定事件：
   - `ondataavailable`: 收集数据块到 `recordedChunks`
   - `onstop`: 处理最终文件生成与事件分发
3. 记录 `start_time`
4. 启动定时器更新时间显示
5. 调用 `mediaRecorder.start()`
6. 触发 `record_started` 事件

##### 事件分发
- `record_started`: 录制开始时触发

---

#### `async blob_convert(blob)`
**可扩展方法**：允许子类对录制结果 Blob 进行格式转换。

```js
blob_convert(blob) → Promise<Blob>
```

默认直接返回原始 Blob。

> 示例：`SysAudioRecorder` 中将 WebM 转换为 WAV。

---

#### `stop_recorder()`
停止录制，并标记为正常终止。

##### 行为：
- 设置 `normal_stop = true`
- 更新时间显示
- 调用 `mediaRecorder.stop()`
- 调用 `close_recorder()`

---

#### `close_recorder()`
清理资源并关闭弹窗。

##### 清理项：
- 取消 `task` 和 `pic_task`（如有）
- 停止 `mediaRecorder`（若存在）
- 停止 `stream` 所有轨道
- 调用 `dismiss()` 关闭弹窗

> 若正在录制，会强制中断。

---

## 子类详解

---

### `bricks.WidgetRecorder`

> 录制页面中某个媒体元素（如 `<video>` 或 `<audio>`）

#### 继承链
```js
class WidgetRecorder extends MediaRecorder
```

#### `open_recorder()`
- 根据 `opts.widgetid` 查找目标组件
- 检查其 DOM 标签类型：
  - `<video>` → `mimetype = 'video/mp4'`
  - `<audio>` → `mimetype = 'audio/wav'`
- 调用 `captureStream()` 获取流
- 启用录制按钮

⚠️ 错误处理：非媒体元素抛出异常

---

### `bricks.SysAudioRecorder`

> 录制麦克风输入，支持 WebM → WAV 自动转换

#### 继承链
```js
class SysAudioRecorder extends MediaRecorder
```

#### `open_recorder()`
- 请求麦克风权限（`getUserMedia({ audio: true })`）
- 设置 `mimetype = 'audio/webm'`
- 获取音频流并启用按钮

#### `blob_convert(webmBlob)`
将 WebM 编码的音频解码为 PCM，再编码为标准 WAV 格式 Blob。

##### 流程：
1. `webmBlob.arrayBuffer()` → 获取二进制数据
2. 使用 `AudioContext.decodeAudioData()` 解码为 `AudioBuffer`
3. 调用 `encodeWAV()` 生成 WAV 文件头 + 数据
4. 返回新的 `Blob(type='audio/wav')`

#### `encodeWAV(audioBuffer)`
手动构建 WAV 文件二进制结构，包含 RIFF 头信息。

| 参数 | 值 |
|------|----|
| 采样率 | 来自 `audioBuffer.sampleRate` |
| 声道数 | `audioBuffer.numberOfChannels` |
| 位深 | 16-bit PCM |
| 格式 | 小端序（little-endian） |

使用 `DataView` 写入头部字段。

#### `interleave(left, right)`
交错左右声道数据，生成立体声 PCM 数组。

#### `writeString(view, offset, string)`
辅助函数：向 `DataView` 写入 ASCII 字符串。

---

### `bricks.SysVideoRecorder`

> 录制摄像头+麦克风，带实时预览

#### 继承链
```js
class SysVideoRecorder extends MediaRecorder
```

#### `open_recorder()`
- 请求音视频权限：`{ audio: true, video: true }`
- 设置 `mimetype = 'video/mp4'`
- 创建 `ImageCapture(track)` 对象用于逐帧捕获
- 添加 `bricks.Image` 到预览区
- 启动 `show_picture()` 循环任务

#### `show_picture()`
- 调用 `imageCapture.takePhoto()` 获取当前帧 Blob
- 转换为 Data URL 并设置给 `imgw`
- 创建 `File` 对象供后续使用
- 递归调度下一次拍摄

> 实现了类似“摄像机取景器”的效果

#### `close_recorder()`
重写以额外清理 `pic_task`。

---

### `bricks.SysCamera`

> 专用拍照工具，从摄像头抓拍一张照片

#### 继承链
```js
class SysCamera extends SysVideoRecorder
```

#### `switch_record()`
重写行为为“拍照”而非录制：

##### 动作：
- 阻止事件冒泡（`event.stopPropagation()`）
- 停止 `pic_task`
- 设置 `task_period = 0` 防止继续更新
- 分发 `shot` 事件，携带：
  ```js
  {
    url: this.dataurl,   // 图像 Data URL
    file: this.imgfile   // 图像 File 对象
  }
  ```
- 调用 `close_recorder()` 关闭

> 不进行任何视频录制，仅抓取一帧

---

## 工厂注册

以下类通过 `bricks.Factory` 注册，可在配置中通过名称实例化：

```js
bricks.Factory.register('SysCamera', bricks.SysCamera);
bricks.Factory.register('WidgetRecorder', bricks.WidgetRecorder);
bricks.Factory.register('SysAudioRecorder', bricks.SysAudioRecorder);
bricks.Factory.register('SysVideoRecorder', bricks.SysVideoRecorder);
```

示例使用方式（假设框架支持）：
```json
{
  "type": "SysAudioRecorder",
  "opts": {
    "fps": 25
  }
}
```

---

## 事件列表

| 事件名 | 触发时机 | 传递数据 |
|--------|----------|---------|
| `record_started` | 录制开始时 | 无 |
| `record_end` | 录制正常结束 | `{ url: string, file: File }` |
| `shot` | （SysCamera）拍照完成 | `{ url: string, file: File }` |

> 使用 `this.dispatch(eventName, data)` 触发

---

## 工具函数依赖

| 函数 | 来源 | 用途 |
|------|------|------|
| `bricks_resource(path)` | 全局函数 | 解析静态资源路径 |
| `schedule_once(fn, delay)` | 全局函数 | 延迟执行函数（支持取消） |
| `bricks.timeDiff(timestamp)` | 工具模块 | 将时间戳差值转为 `HH:MM:SS` 字符串 |
| `bricks.getWidgetById(id, app)` | 框架 API | 根据 ID 获取组件实例 |

---

## 使用示例

### 启动音频录制
```js
const recorder = new bricks.SysAudioRecorder({
  fps: 30
});
recorder.bind('record_end', (data) => {
  console.log('录音完成:', data.file);
  const audio = document.createElement('audio');
  audio.src = data.url;
  audio.controls = true;
  document.body.appendChild(audio);
});
recorder.present(); // 显示录制界面
```

### 抓拍摄像头照片
```js
const camera = new bricks.SysCamera();
camera.bind('shot', ({ file }) => {
  console.log('照片已拍摄:', file);
});
camera.present();
```

---

## 注意事项

1. **权限请求**：`getUserMedia` 需要在安全上下文（HTTPS）中运行，且用户需授权。
2. **兼容性**：`MediaRecorder` 在部分旧浏览器中不支持或需前缀。
3. **内存管理**：长时间录制可能导致大量 `recordedChunks` 占用内存，建议限制最大时长。
4. **格式支持**：不同浏览器支持的 `mimeType` 不同，应做检测回退。
5. **跨域问题**：`captureStream()` 对 `<video>` 要求同源或 CORS 允许。

---

## 总结

`bricks.MediaRecorder` 提供了一个模块化、可扩展的媒体录制架构，适用于多种场景：

| 类 | 用途 | 输出格式 |
|-----|------|---------|
| `WidgetRecorder` | 录屏（特定元素） | MP4 / WAV |
| `SysAudioRecorder` | 录音 | WAV（经转换） |
| `SysVideoRecorder` | 录像 | MP4 |
| `SysCamera` | 拍照 | JPEG |

结合 `bricks` 框架的组件系统与事件机制，可轻松集成至可视化编辑器或交互式应用中。