# ContinueAudioPlayer

**控件功能**：  
`ContinueAudioPlayer` 是一个用于连续播放音频的 Web Audio API 控件，支持通过 WebSocket 接收音频数据（如 Base64 编码的音频片段），并实现无缝续播。具备播放、暂停、恢复、重启、音量调节和静音切换等功能。

**类型**：普通控件  
**父类控件**：`bricks.VBox`

## 初始化参数

| 参数名       | 类型     | 说明 |
|------------|--------|----|
| `ws_url`   | string | （可选）WebSocket 服务地址，用于接收音频流数据（当前控件未直接实现 WebSocket 连接逻辑，需外部使用）。 |
| `onStart`  | function | 音频开始播放时触发的回调函数。 |
| `onEnd`    | function | 当前音频轨道播放结束时触发的回调函数。 |
| `onPause`  | function | 暂停播放时触发的回调函数。 |
| `onResume` | function | 恢复播放时触发的回调函数。 |
| `onVolumeChange` | function | 音量变化或静音状态改变时触发，参数为当前输出音量值（0 或实际音量）。 |

> 示例：
> ```js
> new bricks.ContinueAudioPlayer({
>   ws_url: 'wss://example.com/audio-stream',
>   onStart: () => console.log('Audio started'),
>   onEnd: () => console.log('Audio ended'),
>   onPause: () => console.log('Paused'),
>   onResume: () => console.log('Resumed'),
>   onVolumeChange: (vol) => console.log('Volume:', vol)
> });
> ```

## 主要事件

| 事件名             | 触发条件 |
|------------------|--------|
| `onStart`        | 调用 `handleAudioTrack` 成功解码并开始播放音频时触发。 |
| `onEnd`          | 当前音频源播放完毕（`source.onended`）时触发。 |
| `onPause`        | 调用 `pauseAudio` 并成功暂停音频上下文后触发。 |
| `onResume`       | 调用 `resumeAudio` 并成功恢复音频上下文后触发。 |
| `onVolumeChange` | 调用 `setVolume` 或 `toggleMute` 导致输出音量变化时触发，传递当前有效音量值（静音时为 0）。 |