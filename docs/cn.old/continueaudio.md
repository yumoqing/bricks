# `ContinueAudioPlayer` 技术文档

> 一个基于 Web Audio API 的连续音频播放器组件，支持流式播放、音量控制、暂停/恢复、静音切换和事件回调。

---

## 概述

`bricks.ContinueAudioPlayer` 是一个继承自 `bricks.VBox` 的音频播放类，专为在浏览器中实现无缝连续音频播放而设计。它使用 Web Audio API 解码并播放 Base64 编码或 ArrayBuffer 格式的音频数据，并支持动态控制播放状态与音量。

该组件适用于需要精确时间控制的语音合成（TTS）、实时音频流处理等场景。

---

## 类定义

```js
class ContinueAudioPlayer extends bricks.VBox
```

注册名称：`'ContinueAudioPlayer'`  
注册方式：
```js
bricks.Factory.register('ContinueAudioPlayer', bricks.ContinueAudioPlayer);
```

---

## 构造函数

### `constructor(options)`

初始化播放器实例。

#### 参数

| 参数名     | 类型   | 描述 |
|----------|--------|------|
| `options.ws_url` | `string` | WebSocket 地址（当前未实际使用，保留字段） |
| `options.onStart` | `Function` | 音频开始播放时触发的回调函数 |
| `options.onEnd` | `Function` | 当前音频片段结束播放时触发 |
| `options.onPause` | `Function` | 暂停播放时触发 |
| `options.onResume` | `Function` | 恢复播放时触发 |
| `options.onVolumeChange` | `Function` | 音量变化时触发，参数为新音量值 |

#### 示例

```js
const player = new bricks.ContinueAudioPlayer({
    ws_url: 'wss://example.com/audio',
    onStart: () => console.log('Audio started'),
    onEnd: () => console.log('Audio ended'),
    onPause: () => console.log('Paused'),
    onResume: () => console.log('Resumed'),
    onVolumeChange: (vol) => console.log(`Volume: ${vol}`)
});
```

---

## 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `audioContext` | `AudioContext` | Web Audio 上下文对象 |
| `gainNode` | `GainNode` | 控制音量的增益节点 |
| `nextStartTime` | `Number` | 下一段音频应开始播放的时间（以秒为单位） |
| `started` | `Boolean` | 是否已成功初始化音频上下文 |
| `muted` | `Boolean` | 当前是否处于静音状态 |
| `volume` | `Number` | 当前音量（范围：0.0 - 1.0） |
| `ws_url` | `String` | 存储传入的 WebSocket URL（目前仅作存储用途） |
| `options` | `Object` | 用户传入的配置选项 |

---

## 方法

### `initAudioContext()`

创建并初始化 `AudioContext` 和 `GainNode`，准备音频播放环境。

- 若上下文已被关闭，则可通过调用此方法重新激活。
- 自动设置初始增益值为 `this.volume`。
- 更新 `nextStartTime` 为当前时间，确保后续音频从正确时间点开始。

> ⚠️ 注意：由于浏览器策略限制，**必须在用户交互（如点击）后才能创建或恢复 AudioContext**。

---

### `base64ToArrayBuffer(base64) → ArrayBuffer`

将 Base64 字符串转换为 `ArrayBuffer`，用于 Web Audio API 解码。

#### 参数

| 参数名 | 类型 | 描述 |
|-------|------|------|
| `base64` | `string` | Base64 编码的二进制音频数据 |

#### 返回值

- `{ArrayBuffer}`：可用于 `decodeAudioData` 的原始二进制缓冲区。

#### 示例

```js
const buffer = player.base64ToArrayBuffer("UklGRiQAAABXQVZFZm...");
```

---

### `handleAudioTrack(arrayBuffer)`

解码并播放一段音频数据。

#### 参数

| 参数名 | 类型 | 描述 |
|-------|------|------|
| `arrayBuffer` | `ArrayBuffer` | 包含编码音频数据的二进制缓冲区（如 WAV、MP3 等） |

#### 行为说明

1. 使用 `audioContext.decodeAudioData()` 异步解码音频。
2. 创建 `AudioBufferSourceNode` 并连接到增益节点。
3. 在合适的时间点开始播放（避免重叠）：
   - 开始时间为 `Math.max(currentTime, this.nextStartTime)`
4. 更新 `nextStartTime` 为本次播放结束时间，保证下段音频接续播放。
5. 触发 `onStart` 回调。
6. 播放结束后触发 `onEnd` 回调。

#### 错误处理

若解码失败，会在控制台输出错误日志：

```text
Error decoding audio data: [Error]
```

---

### `pauseAudio()`

暂停所有正在播放的音频。

- 调用 `audioContext.suspend()` 挂起上下文。
- 成功后触发 `onPause` 回调。

> 📝 仅当 `audioContext.state === 'running'` 时有效。

---

### `resumeAudio()`

恢复被暂停的音频播放。

- 调用 `audioContext.resume()` 恢复上下文运行。
- 成功后触发 `onResume` 回调。

> 📝 仅当 `audioContext.state === 'suspended'` 时有效。

---

### `restart()`

停止当前播放，关闭音频上下文，并重新初始化，实现“重新开始”。

#### 行为流程

1. 如果上下文存在且未关闭，先调用 `close()`。
2. 关闭完成后调用 `initAudioContext()` 重建上下文。
3. 重置播放时间线。

> ✅ 可用于重置播放状态或应对长时间运行后的资源释放问题。

---

### `setVolume(value)`

设置播放音量。

#### 参数

| 参数名 | 类型 | 范围 | 描述 |
|-------|------|------|------|
| `value` | `number` | `0.0 ~ 1.0` | 目标音量值 |

#### 功能

- 自动限制输入值在 `[0, 1]` 范围内。
- 更新 `this.volume`。
- 如果已初始化 `gainNode`，则更新其 `gain.value`（若已静音则保持为 0）。
- 触发 `onVolumeChange` 事件。

#### 示例

```js
player.setVolume(0.75); // 设置音量为 75%
```

---

### `toggleMute()`

切换静音状态。

- 若当前非静音，则进入静音状态（`gain.value = 0`）。
- 若当前静音，则恢复至原音量（`gain.value = this.volume`）。
- 切换后更新 `this.muted` 并触发 `onVolumeChange`。

---

### `emit(eventName, ...args)`

触发指定事件回调（如果定义了对应函数）。

#### 参数

| 参数名 | 类型 | 描述 |
|-------|------|------|
| `eventName` | `string` | 回调函数名（对应 `options[eventName]`） |
| `...args` | any | 传递给回调的参数 |

#### 示例

```js
this.emit('onStart'); // 调用 options.onStart()
```

---

## 使用示例

```js
// 创建播放器实例
const audioPlayer = new bricks.ContinueAudioPlayer({
    onStart: () => console.log("▶️ 开始播放"),
    onEnd: () => console.log("⏹️ 播放结束"),
    onVolumeChange: (v) => console.log(`🔊 音量: ${v}`)
});

// 假设你有一段 Base64 音频数据
const base64Audio = "UklGRiQAAABXQVZFZm1...";
const buffer = audioPlayer.base64ToArrayBuffer(base64Audio);

// 播放音频
audioPlayer.handleAudioTrack(buffer);

// 控制操作
audioPlayer.setVolume(0.5);        // 调整音量
audioPlayer.toggleMute();          // 切换静音
audioPlayer.pauseAudio();          // 暂停
audioPlayer.resumeAudio();         // 恢复
audioPlayer.restart();             // 重启播放器
```

---

## 浏览器兼容性

| 浏览器 | 支持情况 |
|--------|----------|
| Chrome | ✅ 支持 |
| Firefox | ✅ 支持 |
| Safari | ⚠️ 需要 `webkitAudioContext` 兼容写法（已内置处理） |
| Edge | ✅ 支持 |
| iOS Safari | ✅（注意自动播放策略） |

> 🔐 **注意**：出于安全策略，大多数现代浏览器要求 **用户手势（如点击）** 后才能启动音频上下文。

---

## 注意事项

1. **自动播放限制**  
   大多数浏览器禁止页面加载时自动播放音频。建议在用户点击事件中初始化或调用 `handleAudioTrack`。

2. **内存管理**  
   长时间连续播放大量音频可能导致内存占用上升，请合理管理音频数据生命周期。

3. **跨域音频数据**  
   所有音频数据需满足同源策略或 CORS 要求，否则无法解码。

4. **精度同步**  
   利用 `AudioContext.currentTime` 实现高精度播放调度，适合多段连续播放场景。

---

## 图解工作流程

```
[Base64] 
   ↓ base64ToArrayBuffer()
[ArrayBuffer]
   ↓ handleAudioTrack()
decodeAudioData() → AudioBuffer
   ↓ createBufferSource()
[Source Node] → gainNode → destination
   ↑
startTime = max(now, nextStartTime)
   ↓
nextStartTime += duration
```

---

## 许可与归属

© 2025 Bricks Framework. All rights reserved.  
开源协议：请参考项目 LICENSE 文件。

--- 

📌 **提示**：结合 WebSocket 或 Fetch 流式传输，可实现 TTS 实时语音播报系统。