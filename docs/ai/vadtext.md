# VadText

用于实现语音识别（ASR）功能的复合控件，结合了麦克风音频采集、端点检测（VAD）、音频播放和文本显示功能。用户点击按钮开始录音，当检测到语音结束时自动发送音频至后端进行识别，并将识别结果实时追加显示在文本区域中。

**类型：** 普通控件（继承自 `bricks.VBox`）

---

## 主要方法

- `start()`  
  启动语音识别流程，初始化 MicVAD 实例并开始监听麦克风输入。

- `_start()` *(async)*  
  异步内部方法，创建 `MicVAD` 实例并设置 `onSpeechEnd` 回调，在检测到语音结束后触发 `audio_ready` 事件。

- `stop()`  
  停止当前的语音识别过程，暂停 VAD 并清理状态。

- `_stop()` *(async)*  
  异步停止逻辑，调用 VAD 的 `pause()` 方法，清除引用，并在有文本内容时派发 `changed` 事件。

- `toggle_status()`  
  切换录音状态：若正在录音则停止，否则启动录音。

- `handle_audio(audio)` *(async)*  
  处理 VAD 捕获的音频数据：
  - 将 `Float32Array` 格式的音频转换为 WAV ArrayBuffer
  - 编码为 Base64 数据 URL 并在内嵌播放器中播放
  - 发送 Base64 音频到指定 URL 进行 ASR 识别
  - 更新识别文本并触发界面刷新

- `arrayBufferToBase64(buffer)`  
  将 ArrayBuffer 转换为 Base64 字符串，用于构建 `data:` URL。

- `getValue()`  
  获取当前控件的输出值，返回一个对象，键为 `this.name`，值为累计识别文本。

---

## 主要事件

- `audio_ready`  
  当 VAD 检测到一段语音结束并捕获音频数据后触发，携带原始音频数据（`Float32Array`），用于后续处理。

- `changed`  
  当一次录音完成且识别出文本内容不为空时触发，携带当前完整识别结果（通过 `getValue()` 获取）。通常用于表单提交或数据同步。

---

## 源码例子

```json
{
  "id": "vad_text_widget",
  "widgettype": "VadText",
  "options": {
    "url": "/api/asr/recognize",     // ASR服务接口地址
    "model": "whisper-small",        // 可选模型参数
    "name": "user_speech"            // 表单字段名，getValue时使用
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "vad_text_widget",
      "event": "changed",
      "target": "form_container",
      "dispatch_event": "field_changed",
      "params": {
        "source": "vad_text_widget"
      },
      "rtdata": {
        "component": "asr_input"
      }
    },
    {
      "actiontype": "bricks",
      "wid": "vad_text_widget",
      "event": "audio_ready",
      "target": "status_label",
      "mode": "replace",
      "options": {
        "widgettype": "Label",
        "options": {
          "text": "正在识别..."
        }
      }
    }
  ]
}
```

> **注释说明：**
> - `widgettype: "VadText"` 是注册过的自定义控件。
> - `options.url` 是必须项，指向后端提供 ASR 功能的 API 接口。
> - `binds` 中第一个绑定监听 `changed` 事件，向父容器派发 `field_changed` 自定义事件，可用于通知表单更新。
> - 第二个绑定在 `audio_ready` 触发时替换某个标签控件的内容，提示“正在识别”，增强用户体验。
> - 此控件适合嵌入表单、语音助手、语音输入等场景。