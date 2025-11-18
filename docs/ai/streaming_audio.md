```markdown
# StreamAudio

控件功能：实现音频流的实时采集、语音活动检测（VAD）触发、音频上传以及接收服务器返回的识别文本结果，常用于语音识别场景。  
类型：容器控件  
父类控件：bricks.VBox

## 初始化参数

- `opts` {Object} - 配置选项对象，继承自 VBox 并扩展以下属性：
  - `name` {string} 可选 - 控件名称，默认为 `'asr_text'`。
  - `height` {string} - 固定高度为 `'100%'`，不可覆盖。
  - 其他 VBox 支持的通用参数（如 layout 等）。

> 注意：构造函数中会自动设置 `height='100%'` 和默认 `name`，并创建内部子控件（按钮、填充器、文本显示等）。

## 主要事件

无直接对外暴露的自定义事件，但通过绑定和回调机制处理以下行为：

- **按钮点击事件**：`click` 事件绑定在内部 `this.button` 上，触发 `toggle_status()` 方法，用于开始或停止音频流采集。
- **语音结束事件**：由 `vad.MicVAD` 的 `onSpeechEnd(audio)` 回调触发，调用 `handle_audio(audio)` 将音频数据编码并发送。
- **数据接收事件**：在 `receive_data()` 中通过 `reader.readline()` 持续读取服务端响应流，每收到一条 JSON 数据即更新显示文本。

---

# ASRText

控件功能：与 `StreamAudio` 完全相同，是其别名控件，用于更语义化地表示语音识别文本输出组件。  
类型：容器控件  
父类控件：bricks.VBox（实际继承关系同 StreamAudio）

## 初始化参数

同 `StreamAudio`。

## 主要事件

同 `StreamAudio`。
```