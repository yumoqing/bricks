# `bricks.VideoPlayer` 与 `bricks.Iptv` 技术文档

---

## 概述

本文档介绍基于 `bricks` 框架实现的两个核心类：

- **`bricks.VideoPlayer`**：一个功能完整的自定义视频播放器组件，支持多种视频格式（MP4、HLS `.m3u8`、DASH `.mpd`），并提供播放控制、音量调节、倍速播放、音轨切换和全屏等功能。
- **`bricks.Iptv`**：一个用于 IPTV 频道播放的高级组件，集成 `VideoPlayer`，可动态加载频道数据，并上报播放状态。

该组件依赖外部库：
- [hls.js](https://github.com/video-dev/hls.js) 用于播放 HLS 流（`.m3u8`）
- [dash.js](https://github.com/Dash-Industry-Forum/dash.js) 用于播放 DASH 流（`.mpd`）

### 外部依赖引入建议
```html
<!-- 在页面中引入 -->
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
```

---

## 1. `bricks.VideoPlayer`

### 类定义
```js
bricks.VideoPlayer = class extends bricks.VBox
```

继承自 `bricks.VBox`，表示这是一个容器型 UI 组件，内部包含视频元素及控制栏。

---

### 构造函数：`constructor(opts)`

#### 参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `opts.url` | `String` | 是 | 视频源地址，支持 `.mp4`, `.m3u8`, `.mpd` 或普通流媒体 URL |
| `opts.autoplay` | `Boolean` | 否 | 是否自动播放，默认为 `false` |

#### 示例
```js
const player = new bricks.VideoPlayer({
  url: 'https://example.com/stream.m3u8',
  autoplay: true
});
```

---

### DOM 结构

创建如下 HTML 结构：

```html
<div class="video-container">
  <video class="video-element"></video>
  <div class="controls">
    <div class="progress-container">
      <input type="range" class="progress-bar" value="0" step="0.0001" />
    </div>
    <div class="controls-bottom">
      <button class="play-pause">▶</button>
      <div class="volume-container">
        <button class="mute">🔊</button>
        <input type="range" class="volume" min="0" max="1" step="0.01" value="1" />
      </div>
      <span class="time">00:00 / 00:00</span>
      <div class="speed-container">
        <select class="playback-speed">
          <option value="0.5">0.5x</option>
          <option value="0.75">0.75x</option>
          <option value="1" selected>1x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
      </div>
      <div class="audio-tracks">
        <select class="audio-track-select"></select>
      </div>
      <button class="fullscreen">⛶</button>
    </div>
  </div>
</div>
```

---

### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `this.video` | `HTMLVideoElement` | 内部 `<video>` 元素引用 |
| `this.hls` | `Hls` 或 `null` | hls.js 实例，仅当播放 `.m3u8` 时创建 |
| `this.dashPlayer` | `dashjs.MediaPlayer` 或 `null` | dash.js 播放器实例，仅当播放 `.mpd` 时创建 |
| `this.controls` | `Element` | 控制栏 DOM 引用 |
| `this.playPauseBtn` | `Element` | 播放/暂停按钮 |
| `this.muteBtn` | `Element` | 静音按钮 |
| `this.volumeInput` | `Element` | 音量滑块 |
| `this.progressBar` | `Element` | 进度条 |
| `this.timeDisplay` | `Element` | 时间显示文本 |
| `this.speedSelect` | `Element` | 倍速选择下拉框 |
| `this.audioTrackSelect` | `Element` | 音轨选择下拉框 |
| `this.fullscreenBtn` | `Element` | 全屏按钮 |

---

### 方法

#### `init()`
初始化播放器，在 DOM 加载完成后调用。负责加载视频、绑定事件、更新 UI 并根据 `autoplay` 设置开始播放。

#### `destroy()`
销毁当前播放器实例，释放资源：
- 销毁 Hls 或 Dash 播放器
- 清空 video 的 `src`
- 防止内存泄漏

#### `loadVideo(src)`
动态加载指定视频源。

##### 支持类型：
| 格式 | 判断方式 | 使用技术 |
|------|----------|---------|
| `.m3u8` 或含 `m3u8` 字符串 | `endsWith('.m3u8') || includes('m3u8')` | `hls.js` |
| `.mpd` 或含 `mpd` 字符串 | `endsWith('.mpd') || includes('mpd')` | `dash.js` |
| 其他（如 `.mp4`） | 默认情况 | 原生 `<video>` |

> ⚠️ 调用前会先执行 `destroy()`，确保旧播放器被清理。

#### `onLoaded()`
视频元信息加载完成后的回调，用于刷新 UI 和音轨列表。

#### `bindEvents()`
绑定所有用户交互事件和视频事件，包括：

| 事件目标 | 事件类型 | 功能 |
|--------|--------|------|
| `.play-pause` | `click` | 切换播放/暂停 |
| `.mute` | `click` | 切换静音 |
| `.volume` | `input` | 调节音量 |
| `.progress-bar` | `input` | 拖动进度条跳转时间 |
| `.playback-speed` | `change` | 更改播放速度 |
| `.audio-track-select` | `change` | 切换音轨 |
| `.fullscreen` | `click` | 进入/退出全屏 |
| `video` | `play/pause` | 更新播放按钮图标 |
| `video` | `timeupdate` | 更新进度条和时间显示 |
| `video` | `durationchange` | 更新总时长 |
| `video` | `volumechange` | 同步静音按钮状态 |
| `video` | `loadedmetadata` | 加载音轨信息 |
| `video` | `seeking` | 更新进度条位置 |

#### `updateUI()`
统一刷新所有控件状态。

#### `updatePlayPauseUI()`
根据播放状态更新播放按钮图标：
- 暂停 → `▶`
- 播放中 → `❚❚`

#### `updateMuteUI()`
根据是否静音或音量为 0 来更新静音按钮图标：
- 静音 → `🔇`
- 非静音 → `🔊`

#### `updateProgress()`
更新进度条和时间显示：
- 显示当前时间和总时间（格式化为 `mm:ss` 或 `hh:mm:ss`）
- 进度条值为 `(currentTime / duration)`

#### `updateAudioTracks()`
从 `video.audioTracks` 中读取可用音轨，并填充到下拉菜单中。默认选中已启用的轨道。

若无音轨，则显示“无音轨”选项且禁用。

#### `formatTime(seconds)` → `String`
将秒数转换为可读时间字符串。

##### 示例输出：
- `65` → `"1:05"`
- `3665` → `"1:01:05"`

---

### 控制行为特性

- **自动隐藏控制栏**：点击任意位置显示控制栏，4 秒后自动隐藏。
  - `show_controls()`：显示控制栏
  - `hide_controls()`：隐藏控制栏
- **全屏切换**：兼容 Chrome/Firefox/Safari/Edge 的全屏 API。
  - 图标在全屏状态下变为返回窗口图标（SVG 箭头）
- **响应式设计建议**：CSS 类名可用于样式定制（见下文）

---

## 2. `bricks.Iptv`

### 类定义
```js
bricks.Iptv = class extends bricks.VBox
```

专用于播放 IPTV 频道的组件，自动获取频道信息并使用 `VideoPlayer` 播放。

---

### 构造函数：`constructor(opts)`

#### 参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `iptv_data_url` | `String` | 是 | 获取频道信息的接口地址 |
| `playok_url` | `String` | 否 | 上报“播放成功”的接口 |
| `playfailed_url` | `String` | 否 | 上报“播放失败”的接口 |

> 接口应返回 JSON 数据，至少包含字段：`url`, `tv_name`, `id`

#### 示例
```js
const iptv = new bricks.Iptv({
  iptv_data_url: '/api/channel?id=123',
  playok_url: '/api/report/playok',
  playfailed_url: '/api/report/playfailed'
});
```

---

### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `this.user_data` | `Object` | 存储从服务器获取的频道数据 |
| `this.deviceid` | `String` | 设备唯一标识（通过 `bricks.deviceid('iptv')` 生成） |
| `this.video` | `bricks.VideoPlayer` | 内嵌的视频播放器实例 |
| `this.title_w` | `bricks.Text` | 显示频道名称的文本组件 |

---

### 方法

#### `build_subwidgets()`
异步方法，首次构建子组件：
1. 若未加载 `user_data`，则通过 HTTP 请求获取
2. 创建 `VideoPlayer` 播放器并传入 `user_data.url`
3. 添加标题和播放器到界面
4. 绑定播放成功/失败事件以进行状态上报

#### `report_play_ok()` → `Promise<void>`
播放开始后触发，向 `playok_url` 发送设备 ID 和频道 ID。

#### `report_play_failed()` → `Promise<void>`
播放出错时触发，上报失败记录。

> 注意：这两个方法仅在对应 URL 存在时才发送请求。

#### `setValue(data)`
外部更新频道的方法。可用于切换频道而不重新创建组件。

##### 参数
- `data`: 包含新频道信息的对象，结构同 `user_data`

##### 示例
```js
iptv.setValue({
  id: 'cctv5',
  tv_name: 'CCTV-5 体育频道',
  url: 'https://live.example.com/cctv5.m3u8'
});
```

---

## 事件系统（Event Binding）

`bricks` 框架支持事件绑定机制：

| 自定义事件 | 触发条件 | 用途 |
|-----------|----------|------|
| `domon` | 组件挂载到 DOM 后 | 执行 `init()` 初始化 |
| `domoff` | 组件从 DOM 卸载前 | 执行 `destroy()` 回收资源 |
| `click` | 用户点击组件区域 | 显示控制栏 |
| `play_ok` | 视频开始播放（由 `VideoPlayer` 抛出） | 上报播放成功 |
| `play_failed` | 播放出错（由 `VideoPlayer` 抛出） | 上报播放失败 |

> 注：`play_ok` 和 `play_failed` 需结合业务逻辑手动抛出（当前代码中暂未体现具体抛出点，可能需进一步扩展）

---

## 注册组件（Factory Registration）

以下语句将组件注册至 `bricks.Factory`，便于通过配置或模板动态创建：

```js
bricks.Factory.register('Iptv', bricks.Iptv);
bricks.Factory.register('VideoPlayer', bricks.VideoPlayer);
bricks.Factory.register('Video', bricks.VideoPlayer); // 别名支持
```

这意味着你可以这样使用：
```js
bricks.Factory.create('VideoPlayer', { url: '...' });
bricks.Factory.create('Iptv', { iptv_data_url: '...' });
```

---

## CSS 类名参考（供样式开发）

| 类名 | 用途 |
|------|------|
| `.video-container` | 播放器最外层容器 |
| `.video-element` | `<video>` 元素 |
| `.controls` | 控制栏整体 |
| `.progress-container`, `.progress-bar` | 进度条容器与滑块 |
| `.controls-bottom` | 底部按钮行 |
| `.play-pause`, `.mute`, `.fullscreen` | 各功能按钮 |
| `.volume`, `.playback-speed`, `.audio-track-select` | 输入控件 |
| `.time` | 时间显示区域 |

> 建议添加 CSS 以美化外观，例如半透明背景、hover 效果等。

---

## 使用示例

### 示例 1：直接播放视频
```js
const player = new bricks.VideoPlayer({
  url: 'https://example.com/video.mp4',
  autoplay: true
});
document.body.appendChild(player.dom_element);
```

### 示例 2：播放 HLS 直播流
```js
const player = new bricks.VideoPlayer({
  url: 'https://live.example.com/stream.m3u8',
  autoplay: true
});
container.add_widget(player);
```

### 示例 3：使用 IPTV 组件
```js
const iptv = new bricks.Iptv({
  iptv_data_url: '/api/get_channel?id=101',
  playok_url: '/log/play_start',
  playfailed_url: '/log/play_error'
});
document.getElementById('app').appendChild(iptv.dom_element);
```

---

## 已知限制与注意事项

1. **浏览器兼容性**
   - HLS 播放依赖 `hls.js`，不支持 iOS Safari 原生 HLS（但通常仍可回退）
   - DASH 需要 MSE（Media Source Extensions）支持

2. **跨域问题**
   - 视频源必须允许 CORS，否则无法加载元数据或音轨

3. **移动端体验**
   - 自动隐藏控制栏的时间（40帧 ≈ 0.67秒）可能偏短，建议调整
   - 移动端建议禁用鼠标 hover 行为，改为点击切换显示

4. **错误处理待完善**
   - 当前未监听 `error` 事件来触发 `play_failed`，建议补充：
     ```js
     this.video.addEventListener('error', () => {
       this.fire('play_failed'); // 触发事件
     });
     ```
   - 可增加重试机制或备用源切换逻辑

5. **性能优化**
   - 多次切换视频源时频繁重建播放器，可考虑缓存策略优化

---

## 总结

`bricks.VideoPlayer` 是一个轻量级、多功能、跨平台的视频播放组件，适用于点播与直播场景；  
`bricks.Iptv` 在其基础上封装了频道管理和状态上报能力，适合构建智能电视或 Web 端 IPTV 应用。

两者结合可快速搭建现代化流媒体播放界面，具备良好的扩展性和维护性。

--- 

> ✅ 文档版本：v1.0  
> 📅 最后更新：2025-04-05