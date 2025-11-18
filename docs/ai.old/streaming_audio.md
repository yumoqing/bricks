# StreamAudio

本控件用于实现基于 Web Audio API 的实时语音采集与流式传输功能，通常用于语音识别（ASR）场景。类型为**容器控件**，继承自 `bricks.VBox`，具备垂直布局能力，并内置按钮控制录音启停、文本显示识别结果。

---

## 主要方法

- `toggle_status()`  
  切换录音状态：若正在录音则调用 `stop()`，否则调用 `start()`。

- `start()`  
  启动录音流程，更新按钮文字为“stop”，并延迟调用 `_start` 方法。

- `_start()` *(异步)*  
  实际启动逻辑：
  - 若存在其他 VAD 实例，则先停止；
  - 创建新的 MicVAD 实例，监听语音结束事件；
  - 启动 UpStreaming 流式上传连接到指定服务器 URL；
  - 开始接收服务端返回的识别结果。

- `stop()`  
  停止录音，将按钮文字改回“start”，并延迟执行 `_stop`。

- `_stop()` *(异步)*  
  结束上传流、暂停 VAD 录音，并清理全局引用。

- `receive_data()` *(异步)*  
  持续从服务端响应流中读取数据行，解析 JSON 并更新显示文本内容。

- `handle_audio(audio)`  
  处理捕获到的音频片段，将其转为 Base64 编码后通过 `UpStreaming` 发送至服务端。

---

## 主要事件

- `click` 事件绑定在内部的 `Button` 控件上，触发 `toggle_status` 方法以切换录音状态。
- 自定义语音事件由 `MicVAD` 触发 `onSpeechEnd` 回调，交由 `handle_audio` 处理。
- 数据接收过程中会持续处理来自服务端的流式消息，无显式事件暴露给外部。

---

## 源码例子

```json
{
  "id": "stream_audio_widget",
  "widgettype": "StreamAudio",
  "options": {
    "url": "/api/asr/stream",  // 指定 ASR 流式识别接口地址
    "name": "asr_text"         // 可选，用于标识该组件名称
  },
  "subwidgets": [],             // 本控件自行管理子控件，无需手动定义
  "binds": [
    {
      "actiontype": "method",
      "wid": "stream_audio_widget",
      "event": "click",
      "target": "stream_audio_widget",
      "method": "toggle_status",
      "params": {},
      "conform": null
    },
    {
      "actiontype": "event",
      "wid": "stream_audio_widget",
      "event": "speech_end",
      "target": "Popup",
      "dispatch_event": "show_notification",
      "params": {
        "message": "语音片段已发送"
      }
    }
  ]
}
```

> ✅ **注释说明：**
> - `widgettype: "StreamAudio"` 表示使用注册的 StreamAudio 控件；
> - `options.url` 是必须项，指明音频流上传的目标后端接口；
> - `binds` 中第一个条目确保点击按钮时触发状态切换；
> - 第二个 `event` 类型的 bind 演示了如何在语音结束时向弹窗系统派发通知事件；
> - 控件自动创建内部结构（按钮、填充器、文本框），开发者无需关心 `subwidgets` 细节；
> - 此控件也兼容别名 `"ASRText"`，因在工厂中做了双重注册。

--- 

> 💡 提示：使用此控件前需确保浏览器支持 Web Audio API 和 `MediaRecorder`，且后端 `/api/asr/stream` 支持 WebSocket 或 ReadableStream 流式交互。