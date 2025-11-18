# ASRClient

用于实现语音识别（ASR，Automatic Speech Recognition）功能的前端控件。用户点击按钮开始录音，控件通过浏览器的 `MediaRecorder API` 获取麦克风音频流，并将音频数据编码为 Base64 后通过 WebSocket 实时发送至后端服务器进行语音识别。识别结果由服务器返回，控件触发 `transtext` 事件将文本内容传递给上层逻辑处理。

**类型**：普通控件（继承自 `bricks.VBox`）

---

## 主要方法

- **`toggle_button()`**  
  切换录音状态（开始/停止），并更新按钮图标。

- **`start_recording()`**  
  异步方法，请求用户授权麦克风权限，启动 `MediaRecorder` 每秒采集音频片段并通过 WebSocket 发送。

- **`stop_recording()`**  
  停止 `MediaRecorder` 录音，关闭媒体流。

- **`response_data(event)`**  
  WebSocket 接收到服务器消息时调用，解析 JSON 数据并派发 `transtext` 事件。

- **`response_log(event)`**  
  默认的日志处理函数，在控制台输出识别结果，可通过重写来自定义日志行为。

---

## 主要事件

- **`start`**  
  当用户点击按钮开始录音时触发，无参数。

- **`stop`**  
  当用户停止录音时触发，无参数。

- **`transtext`**  
  服务器返回识别文本时触发，参数结构如下：
  ```json
  {
    "content": "识别出的文本",
    "speaker": "说话人标识（可选）",
    "start": "起始时间戳",
    "end": "结束时间戳"
  }
  ```

---

## 源码例子

```json
{
  "id": "asr_widget",
  "widgettype": "ASRClient",
  "options": {
    // 开始录音时显示的图标（可选）
    "start_icon": "imgs/start_recording.svg",
    // 停止录音时显示的图标（可选）
    "stop_icon": "imgs/stop_recording.png",
    // WebSocket 连接地址（必须）
    "ws_url": "wss://example.com/api/asr/stream",
    // 图标控件的额外配置（如大小、样式等，可选）
    "icon_options": {
      "width": "50px",
      "height": "50px"
    },
    // 发送给 WebSocket 的附加参数（例如模型类型、语言等）
    "ws_params": {
      "lang": "zh-CN",
      "model": "asr-general"
    }
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "asr_widget",
      "event": "transtext",
      "target": "text_display",
      "dispatch_event": "update_text",
      "params": {
        "from": "ASR"
      },
      "rtdata": {
        "msg": "{content}"
      }
    },
    {
      "actiontype": "script",
      "wid": "asr_widget",
      "event": "start",
      "target": "logger",
      "script": "console.log('ASR recording started...');"
    },
    {
      "actiontype": "script",
      "wid": "asr_widget",
      "event": "stop",
      "target": "logger",
      "script": "console.log('ASR recording stopped.');"
    }
  ]
}
```

> ✅ **说明与注释**：
>
> - `widgettype: "ASRClient"` 表示使用已注册的语音识别控件。
> - `options.ws_url` 必须是一个有效的 WebSocket 地址（`ws://` 或 `wss://`）。
> - `binds` 中监听了 `transtext` 事件，将识别结果动态更新到 ID 为 `text_display` 的控件中。
> - 使用 `{content}` 占位符可在运行时自动替换为实际识别内容（基于 bricks 数据绑定机制）。
> - 可结合 `registerfunction` 调用全局函数进一步处理识别结果，如语义理解、TTS 回复等。

--- 

📌 **应用场景建议**：  
适用于语音输入、实时字幕、语音助手交互等需要前端采集语音并实时获取识别结果的场景。需确保后端支持 WebSocket 流式 ASR 解码。