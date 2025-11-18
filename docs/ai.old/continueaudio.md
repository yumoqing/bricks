# ContinueAudioPlayer

该控件是一个**容器控件**，继承自 `bricks.VBox`，用于在浏览器中连续播放通过 WebSocket 或 Base64 编码传输的音频数据。它基于 Web Audio API 实现高精度、低延迟的音频播放控制，支持暂停、恢复、重新开始、音量调节和静音功能。适用于语音播报、实时通信、在线教育等需要无缝播放多个音频片段的场景。

---

## 主要方法

- **`initAudioContext()`**  
  初始化 Web Audio API 的上下文（AudioContext）和增益节点（GainNode），为后续音频播放做准备。

- **`base64ToArrayBuffer(base64)`**  
  将 Base64 编码的音频字符串转换为 ArrayBuffer，供 `decodeAudioData` 使用。

- **`handleAudioTrack(arrayBuffer)`**  
  解码并播放传入的音频数据（ArrayBuffer），自动管理播放时间线，确保多个音频连续播放不重叠。

- **`pauseAudio()`**  
  暂停当前播放的音频（实际是挂起 AudioContext）。

- **`resumeAudio()`**  
  恢复被暂停的音频播放。

- **`restart()`**  
  关闭当前 AudioContext 并重新初始化，从头开始播放。

- **`setVolume(value)`**  
  设置音量（0.0 ~ 1.0），自动更新增益节点，并触发 `onVolumeChange` 事件。

- **`toggleMute()`**  
  切换静音状态，同时更新增益值并发出音量变化事件。

- **`emit(eventName, ...args)`**  
  触发配置中的回调函数，如 `onStart`、`onEnd` 等。

---

## 主要事件

这些事件可通过 `options` 配置传入回调函数，在特定时刻执行逻辑：

- **`onStart`**：当一个音频轨道开始播放时触发。
- **`onEnd`**：当一个音频轨道播放结束后触发。
- **`onPause`**：调用 `pauseAudio` 成功后触发。
- **`onResume`**：调用 `resumeAudio` 成功后触发。
- **`onVolumeChange`**：音量或静音状态改变时触发，参数为当前有效音量（静音时为 0）。

---

## 源码例子

```json
{
  "id": "audioPlayerContainer",
  "widgettype": "ContinueAudioPlayer",
  "options": {
    "ws_url": "wss://example.com/audio-stream",  // 可选：WebSocket 地址（若使用流式接收）
    "onStart": "function() { console.log('音频开始播放'); }",
    "onEnd": "function() { console.log('音频播放结束'); }",
    "onPause": "function() { bricks.getWidget('playBtn').setValue('▶️ 播放'); }",
    "onResume": "function() { bricks.getWidget('playBtn').setValue('⏸️ 暂停'); }",
    "onVolumeChange": "function(vol) { bricks.getWidget('volumeSlider').setValue(vol); }"
  },
  "subwidgets": [
    {
      "id": "controlBar",
      "widgettype": "HBox",
      "subwidgets": [
        {
          "id": "playBtn",
          "widgettype": "Button",
          "options": {
            "value": "▶️ 播放",
            "onClick": "function() { var player = bricks.getWidget('audioPlayerContainer'); if (player.audioContext.state === 'running') { player.pauseAudio(); } else { player.resumeAudio(); } }"
          }
        },
        {
          "id": "restartBtn",
          "widgettype": "Button",
          "options": {
            "value": "🔁 重新开始",
            "onClick": "function() { bricks.getWidget('audioPlayerContainer').restart(); }"
          }
        },
        {
          "id": "muteBtn",
          "widgettype": "Button",
          "options": {
            "value": "🔊 静音",
            "onClick": "function() { var player = bricks.getWidget('audioPlayerContainer'); player.toggleMute(); this.setValue(player.muted ? '🔇 取消静音' : '🔊 静音'); }"
          }
        },
        {
          "id": "volumeSlider",
          "widgettype": "Slider",
          "options": {
            "min": 0,
            "max": 1,
            "step": 0.01,
            "value": 1,
            "onChange": "function(val) { bricks.getWidget('audioPlayerContainer').setVolume(val); }"
          }
        }
      ]
    }
  ],
  "binds": [
    {
      "actiontype": "method",
      "wid": "externalStartTrigger",
      "event": "click",
      "target": "audioPlayerContainer",
      "method": "resumeAudio",
      "conform": {
        "title": "确认播放",
        "message": "确定要开始播放音频吗？",
        "confirmButtonText": "确定",
        "cancelButtonText": "取消"
      }
    },
    {
      "actiontype": "script",
      "wid": "dataReceiver",
      "event": "audioDataReady",
      "target": "audioPlayerContainer",
      "datascript": "return base64EncodedAudioChunk;",  // 假设外部脚本提供了此变量
      "script": "const buf = widget.base64ToArrayBuffer(rtdata); widget.handleAudioTrack(buf);"
    }
  ]
}
```

> ✅ **注释说明：**
>
> - `ContinueAudioPlayer` 本身作为容器，包含一组控制按钮（播放/暂停、重启、静音、音量滑块）。
> - `binds` 中定义了两个行为：
>   1. 点击外部元素 `externalStartTrigger` 时，调用播放器的 `resumeAudio` 方法，带确认弹窗。
>   2. 当 `dataReceiver` 组件触发 `audioDataReady` 事件时，执行脚本将 Base64 数据转为 ArrayBuffer 并交给播放器处理。
> - 所有 UI 控件通过 ID 获取实例并与 `ContinueAudioPlayer` 实例交互。
> - 回调函数使用字符串形式的 `function(){}` 写法，符合 Bricks.js 对 options 中函数的序列化要求。

--- 

💡 **提示：**  
要实现真正的“持续”播放，需保证不断向 `handleAudioTrack` 方法传入新的音频数据块（ArrayBuffer）。可结合 WebSocket 接收流式音频并解码推送至此控件。