# Bricks Video 模块技术文档

> 基于 `video.js` 实现的视频播放组件及 IPTV 集成控件

---

## 概述

本模块提供了两个核心类：

- **`bricks.Video`**：基于 [Video.js](https://videojs.com) 的视频播放组件，封装了常见播放控制逻辑和事件处理。
- **`bricks.Iptv`**：IPTV 专用容器组件，集成频道信息展示与播放状态上报功能。

该模块适用于 Web 端流媒体（如 HLS、MP4）播放场景，支持自动播放、全屏、错误监听以及播放成功/失败回调上报。

---

## 依赖说明

- **[Video.js](https://videojs.com)**：必须在全局环境中加载 Video.js 库。
- `window.bricks`：基础框架对象，提供布局系统 (`Layout`, `VBox`)、HTTP 工具 (`HttpJson`, `HttpText`) 和事件调度机制。
- `schedule_once(fn, delay)`：延迟执行函数（单位：秒），用于异步初始化。

---

## 1. `bricks.Video` 类

继承自 `bricks.Layout`，封装 Video.js 播放器实例。

### 构造函数

```js
new bricks.Video(opts)
```

#### 参数 `opts`

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| `url` | String | 是 | 视频资源 URL |
| `type` | String | 否 | MIME 类型（如 `'video/mp4'`），若未提供则自动推断 |
| `autoplay` | Boolean | 否 | 是否自动播放，默认 `false` |
| `fullscreen` | Boolean | 否 | 是否进入全屏模式，默认不启用 |

#### 示例

```js
const video = new bricks.Video({
    url: 'https://example.com/stream.m3u8',
    autoplay: true,
    fullscreen: true
});
```

---

### 样式设置

构造时自动应用以下 CSS 类和样式：

```js
this.set_csses('video-js', 'vjs-big-play-centered', 'vjs-fluid');
this.set_style('object-fit', 'contain');
this.set_style('width', '100%');
this.set_style('height', '100%');
```

> ⚠️ 注意：需确保引入 Video.js 的 CSS 文件以正确渲染 UI。

---

### 事件系统

通过 `dispatch()` 触发以下自定义事件：

| 事件名       | 触发条件             | 回调参数格式                     |
|------------|--------------------|------------------------------|
| `play_ok`     | 视频开始播放           | `{ src: 当前视频URL }`         |
| `play_end`    | 视频播放结束           | `{ src: 当前视频URL }`         |
| `play_failed` | 播放出错（网络/解码等）   | `{ src: 当前视频URL }`         |

可通过 `bind(event, handler)` 监听这些事件。

---

### 方法列表

#### `create()`

创建原生 `<video>` 元素并赋值给 `this.dom_element`，启用播放控件。

#### `create_player()`

初始化 Video.js 播放器实例，并绑定事件监听器。

##### 播放器配置项

```js
{
    controls: true,
    autoplay: opts.autoplay || false,
    preload: "auto",
    muted: true,
    crossorigin: 'anonymous',
    nativeTextTracks: false
}
```

> 🔊 **静音策略**：初始静音，1 秒后调用 `unmuted()` 解除静音并设音量为 100%。

#### `disable_captions()`

禁用所有字幕轨道（text tracks），防止默认字幕弹出。

#### `set_source(url, vtype)`

动态更换视频源。

- `url`: 新视频地址
- `vtype`: MIME 类型（可选）

内部会更新 `cur_url` 和 `cur_vtype`，并调用 `player.src()` 切换源。

#### `guess_type(url)`

根据文件扩展名推测 MIME 类型：

| 扩展名 | 类型 |
|-------|------|
| `.m3u8` | `application/x-mpegURL` |
| `.mp4`  | `video/mp4` |
| `.avi`  | `video/avi` |
| `.webm` | `video/webm` |

> 默认返回 `application/x-mpegURL`（HLS 流）

#### `play()`

手动触发播放（调用 `player.play()`）。

#### `unmuted()`

解除静音并设置音量为最大值（1.0）。延迟执行以绕过浏览器自动静音限制。

---

## 2. `bricks.Iptv` 类

继承自 `bricks.VBox`，用于构建完整的 IPTV 播放界面。

### 构造函数

```js
new bricks.Iptv(opts)
```

#### 支持的选项字段

| 字段名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| `iptv_data_url` | String | 是 | 获取频道数据的接口地址 |
| `playok_url` | String | 否 | 播放成功后上报的 URL |
| `playfailed_url` | String | 否 | 播放失败后上报的 URL |

> 💡 所有 URL 接口均使用 GET 请求传参。

---

### 内部结构

- 上方：`bricks.Text` 显示当前频道名称
- 下方：`bricks.Video` 实例进行播放

---

### 核心方法

#### `build_subwidgets()`

异步加载 IPTV 频道数据并初始化子组件：

1. 调用 `HttpJson().httpcall(iptv_data_url)` 获取频道信息
2. 缓存 `deviceid`（通过 `bricks.deviceid('iptv')`）
3. 创建 `Video` 和 `Text` 组件并添加到布局中
4. 绑定播放事件回调

##### 返回数据示例（user_data）

```json
{
    "id": "ch_001",
    "tv_name": "CCTV-1 综合频道",
    "url": "https://live.example.com/cctv1.m3u8"
}
```

#### `report_play_ok()`

当收到 `play_ok` 事件时调用，向 `playok_url` 发送设备和频道 ID 上报。

##### 请求参数

```json
{
    "deviceid": "设备唯一标识",
    "channelid": "当前频道ID"
}
```

#### `report_play_failed()`

播放失败时调用，向 `playfailed_url` 上报异常。

参数同上。

#### `setValue(data)`

外部更新频道内容的方法。

- 更新显示标题
- 更换播放地址

```js
iptv_widget.setValue({
    id: 'ch_002',
    tv_name: '湖南卫视',
    url: 'https://live.example.com/hunantv.m3u8'
});
```

---

## 使用示例

### 注册组件（已内置）

```js
bricks.Factory.register('Video', bricks.Video);
bricks.Factory.register('Iptv', bricks.Iptv);
```

### 实例化 IPTV 播放器

```js
const iptv = new bricks.Iptv({
    iptv_data_url: '/api/iptv/channel/current',
    playok_url: '/api/report/playok',
    playfailed_url: '/api/report/playfail'
});

// 添加到页面
document.body.appendChild(iptv.get_dom());
```

---

## 日志输出

模块在关键节点输出日志至控制台，便于调试：

- `build_subwidgets called`
- `this.user_data = ...`
- `report playok ok / failed`
- 错误提示等

---

## 注意事项

1. **跨域问题**：建议服务器配置 CORS 头部，或使用代理避免跨域限制。
2. **自动播放限制**：现代浏览器禁止无用户交互下的有声音频自动播放，因此采用“先静音播放 → 延迟取消静音”策略。
3. **HLS 支持**：`.m3u8` 依赖浏览器对 MSE 的支持或 Video.js 的 hls.js 插件。
4. **延迟初始化**：使用 `schedule_once(..., 0.1)` 避免 DOM 渲染未完成导致的问题。

---

## 版本兼容性

- 浏览器：Chrome / Firefox / Safari / Edge（现代版本）
- Video.js 版本：≥7.x 或 ≥8.x（推荐最新版）
- 不支持 IE11 及以下

---

## 开发维护

- 作者：Bricks Framework Team
- 官网参考：[https://videojs.com](https://videojs.com)

--- 

✅ **建议生产环境压缩代码并开启 Source Map 以便调试。**