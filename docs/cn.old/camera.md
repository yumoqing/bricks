# `bricks.Camera` 技术文档

> 一个基于 `bricks.Popup` 的摄像头操作组件，支持拍照和视频录制功能。

---

## 概述

`bricks.Camera` 是 `bricks` UI 框架中的一个类，继承自 `bricks.Popup`，用于在网页中实现摄像头访问、实时预览、拍照以及视频录制功能。它通过调用浏览器的 `MediaDevices.getUserMedia()` 接口获取摄像头流，并结合 HTML5 `<video>` 和 `<canvas>` 实现图像捕获与处理。

该组件支持两种模式：
- **拍照模式（picture）**：单张照片拍摄。
- **录像模式（recorder）**：支持开始/停止录制 WebM 格式的视频。

同时提供切换摄像头设备、删除取消等交互按钮。

---

## 继承关系

```
bricks.Popup
   ↓
bricks.Camera
```

---

## 构造函数

```js
new bricks.Camera(options)
```

### 参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|-------|------|------|--------|------|
| `opts.fps` | Number | 否 | `60` | 视频预览帧率（每秒帧数），影响 `show_picture` 调用频率 |
| `opts.type` | String | 是 | `'picture'` | 模式类型：<br>`'picture'`: 拍照模式<br>`'recorder'`: 录像模式 |
| `opts.auto_dismiss` | Boolean | 否 | `false` | 是否在操作后自动关闭弹窗（内部强制设为 `false`） |

> ⚠️ 注意：`auto_dismiss` 在构造函数中被强制设置为 `false`，以防止误关闭。

---

## 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `this.recordedChunks` | Array | 存储媒体录制过程中产生的数据块（Blob） |
| `this.mediaRecorder` | MediaRecorder \| null | 浏览器原生 `MediaRecorder` 实例，用于视频录制 |
| `this.stream` | MediaStream \| null | 来自摄像头的媒体流对象 |
| `this.video` | HTMLVideoElement | 用于播放摄像头视频流的 `<video>` 元素 |
| `this.imgw` | bricks.Image | 显示当前画面预览的图像控件 |
| `this.shot_btn` | bricks.Svg | 拍照或开始/停止录制的按钮图标 |
| `this.cur_camera_id` | Number | 当前使用的摄像头设备索引（未实际使用，建议优化） |
| `this.task_period` | Number | 帧刷新周期（单位：秒），由 `fps` 计算得出 |
| `this.task` | TaskHandle | 使用 `schedule_once` 创建的定时任务句柄 |
| `this.dataurl` | String | 最近一帧画面的 Data URL（base64 编码的 JPEG 图像） |
| `this.record_status` | String | 录制状态：<br>`''`（初始）<br>`'standby'`（待机）<br>`'recording'`（正在录制） |

---

## 方法

### `constructor(opts)`

初始化摄像头组件，创建 UI 布局并绑定事件。

#### 内部逻辑
1. 设置默认帧率和禁用自动关闭。
2. 调用父类 `super(opts)` 初始化弹窗。
3. 初始化录制相关变量。
4. 创建 UI 结构：
   - 上方填充区域显示实时画面（`this.imgw`）
   - 下方水平工具栏包含：
     - 切换摄像头按钮
     - 拍照 / 录制按钮
     - 删除（关闭）按钮
5. 绑定按钮点击事件：
   - `shot_btn`：根据模式执行 `take_picture` 或 `switch_recording`
   - `switch_btn`：切换摄像头
   - `del_btn`：关闭弹窗
6. 延迟 0.1 秒启动摄像头（`startCamera`）

---

### `async startCamera(vpos?)`

启动摄像头并开始视频流预览。

#### 参数
- `vpos` (Number, 可选)：指定摄像头设备索引（前置/后置）

#### 流程
1. 调用全局应用对象 `bricks.app.start_camera(vpos)` 获取摄像头流。
2. 将流赋值给 `this.stream` 并绑定到 `<video>` 元素。
3. 开始播放视频。
4. 启动周期性任务 `show_picture`，按设定帧率更新预览图。

#### 示例
```js
await this.startCamera(0); // 使用第一个摄像头
```

> ✅ 依赖全局 `bricks.app` 提供 `video_devices` 和 `video_stream`。

---

### `show_picture()`

将当前视频帧渲染到预览区（通过 Canvas 截图）。

#### 步骤
1. 创建临时 `<canvas>`，尺寸匹配视频分辨率。
2. 使用 `drawImage` 将视频当前帧绘制到 canvas。
3. 转换为 JPEG Data URL（质量 95%）。
4. 更新 `this.imgw` 显示新图像。
5. 调用 `schedule_once` 自身，维持帧率循环。

#### 性能提示
- 若 `this.task_period === 0`，则退出循环（如拍照后停止）。
- 使用 `requestAnimationFrame` 类似的调度机制（`schedule_once`）。

---

### `async switch_camera(btn, event)`

切换摄像头设备（例如前后摄像头）。

#### 参数
- `btn`：触发按钮（SVG 图标）
- `event`：点击事件对象（未使用）

#### 行为
1. 检查是否有多个摄像头（`bricks.app.video_devices.length < 2`）。
2. 若只有一个摄像头，则禁用按钮。
3. 否则，递增 `vpos`（`bricks.app.vpos`），循环切换。
4. 调用 `startCamera(vpos)` 重新初始化摄像头。

> 🔄 支持循环切换：0 → 1 → ... → n-1 → 0

---

### `switch_recording()`

控制录像的开始与停止。

#### 行为
| 当前状态 | 动作 |
|---------|------|
| `recording` | 停止录制，按钮变“开始”图标 |
| `standby` 或空 | 开始录制，按钮变“停止”图标 |

#### 触发方法
- `videorecorder_start()`：开始录制
- `videorecorder_stop()`：停止录制

---

### `videorecorder_start()`

使用 `MediaRecorder API` 开始录制视频。

#### 异常
- 如果 `this.stream` 未初始化，抛出错误。

#### 配置
- 使用 `new MediaRecorder(stream)`
- 数据格式：`video/webm`
- 监听 `ondataavailable`：收集每个 chunk 到 `recordedChunks`
- 监听 `onstop`：
  - 合并所有 chunks 成一个 Blob
  - 创建 File 对象：`recorded_video.webm`
  - 创建 Object URL（仅供调试日志）
  - 触发 `recorded` 事件，携带生成的 `File`

#### 示例输出
```js
dispatch('recorded', file); // file.type === "video/webm"
```

---

### `videorecorder_stop()`

手动停止媒体录制。

```js
this.mediaRecorder.stop();
```

> 自动触发 `onstop` 回调，完成文件合成与事件派发。

---

### `take_picture(event)`

执行拍照操作。

#### 参数
- `event`：点击事件，调用 `stopPropagation()` 防止冒泡

#### 行为
1. 取消当前预览任务（`task.cancel()`）。
2. 停止帧更新（`task_period = 0`）。
3. 派发 `shot` 事件，携带最近一帧的 Data URL。

#### 示例响应
```js
camera.bind('shot', function(dataurl) {
    const img = document.createElement('img');
    img.src = dataurl;
    document.body.appendChild(img);
});
```

---

## UI 结构

```text
+----------------------------------+
|               [Preview]          |
|         (bricks.Image: imgw)     |
+----------------------------------+
| [Switch]   [Action]     [Delete] |
| (SVG)       (SVG)        (SVG)  |
+----------------------------------+
```

- 使用 `bricks.HBox` 水平布局底部按钮栏
- 使用 `bricks.Filler` 占位扩展空间
- 所有按钮均为 `bricks.Svg` 组件，加载 SVG 资源图标

---

## 事件

| 事件名 | 触发时机 | 携带数据 |
|-------|----------|---------|
| `shot` | 用户拍照完成 | `dataurl`（JPEG base64 字符串） |
| `recorded` | 视频录制结束 | `File` 对象（WebM 格式） |

可通过 `bind()` 方法监听：

```js
const camera = new bricks.Camera({ type: 'picture' });
camera.bind('shot', (dataurl) => {
    console.log('Photo taken:', dataurl);
});
camera.open();
```

---

## 图标资源（SVG）

| 按钮 | 图标路径 | 提示文字 |
|------|--------|--------|
| 拍照 | `imgs/camera.svg` | Take a picture |
| 开始录制 | `imgs/start_recording.svg` | Start or stop record video |
| 停止录制 | `imgs/stop_recording.svg` | Recording... |
| 切换摄像头 | `imgs/switch-camera.svg` | switch camera |
| 删除/取消 | `imgs/delete.svg` | canel it（应为 cancel） |

> 图标路径通过 `bricks_resource()` 解析，通常指向 `/resources/...`

---

## 依赖项

| 依赖 | 说明 |
|------|------|
| `bricks.Popup` | 父类，提供弹窗基础功能 |
| `bricks.Svg` | SVG 图标按钮 |
| `bricks.Image` | 图像显示控件 |
| `bricks.HBox`, `bricks.Filler` | 布局容器 |
| `bricks.app` | 全局应用对象，需提供：<br>- `video_devices`: 摄像头设备列表<br>- `vpos`: 当前设备索引<br>- `start_camera(vpos)`: 启动摄像头方法<br>- `video_stream`: 摄像头媒体流 |
| `schedule_once(fn, delay)` | 自定义异步调度函数（类似 `setTimeout`，但可能集成任务队列） |
| `bricks_resource(path)` | 资源路径解析函数 |

---

## 注册

```js
bricks.Factory.register('Camera', bricks.Camera);
```

允许通过工厂方式创建实例：

```js
bricks.Factory.create('Camera', { type: 'recorder' });
```

---

## 使用示例

### 拍照模式
```js
const camera = new bricks.Camera({
    type: 'picture',
    fps: 30
});
camera.bind('shot', (dataurl) => {
    document.getElementById('result').src = dataurl;
});
camera.open();
```

### 录像模式
```js
const recorder = new bricks.Camera({
    type: 'recorder',
    fps: 25
});
recorder.bind('recorded', (file) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video.webm';
    a.click();
});
recorder.open();
```

---

## 注意事项 & 改进建议

| 问题 | 建议 |
|------|------|
| `record_status == ''` 应为 `=` | 修复拼写错误，避免逻辑 bug |
| `task.cancel()` 中 `task` 应为 `this.task` | 修复变量引用错误 |
| `tip:'canel it'` 拼写错误 | 改为 `'cancel it'` |
| `this.cur_camera_id` 未更新 | 在 `switch_camera` 中同步更新 |
| 不支持分辨率配置 | 可扩展 `opts.constraints` 传入 `getUserMedia` |
| WebM 兼容性有限 | 可检测支持 MIME 类型，降级为 MP4（若支持） |
| 缺少错误处理 UI | 添加摄像头权限失败提示 |

---

## 版本信息

- **作者**：未知（来自 `bricks` 框架）
- **最后修改**：根据代码推断为现代浏览器环境开发
- **兼容性**：需支持 `MediaDevices`, `MediaRecorder`, `Canvas` 的现代浏览器（Chrome/Firefox/Edge）

---

📌 **总结**：  
`bricks.Camera` 是一个功能完整、结构清晰的前端摄像头操作组件，适用于需要拍照或短时间录像的应用场景，如头像上传、短视频录制等。配合 `bricks` 框架可快速集成至项目中。