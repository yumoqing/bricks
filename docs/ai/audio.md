# AudioPlayer

用于播放音频文件的普通控件，继承自 `JsWidget`。支持本地或远程音频资源播放、自动播放、播放控制（暂停/继续）、播放队列管理以及通过流式响应动态加载多个音频片段。

**类型：** 普通控件（非容器控件）

---

## 主要方法

- `play()`  
  异步方法，开始播放当前音频。如果音频已暂停，则恢复播放。

- `toggle_play()`  
  异步方法，切换播放/暂停状态。若当前为暂停状态则播放，否则暂停。

- `set_url(url)`  
  设置音频源并立即开始播放。参数 `url` 为音频文件的 URL 地址。

- `set_source(url)`  
  设置音频源（仅更新 `<source>` 标签和 `audio.src`），不自动播放。

- `add_url(url)`  
  将指定 URL 添加到播放列表末尾。如果当前音频处于“错误”或“结束”状态，则立即切换播放该音频；否则加入队列等待自动播放下一首。

- `get_status()`  
  获取当前播放器的状态，返回值为以下之一：
  - `"playing"`：正在播放
  - `"paused"`：已暂停
  - `"loading"`：加载中（数据不足）
  - `"ended"`：播放结束
  - `"error"`：发生错误

- `set_stream_urls(response)`  
  接收一个 `Response` 对象（如从 `fetch` 流式接口获取），解析其流中的每一段音频 URL，并逐个播放。适用于服务器推送多个音频片段的场景。

- `play_srclist(event)`  
  内部异步方法，用于从 `srcList` 中按顺序播放未播放过的音频片段。

---

## 主要事件

- `ended`  
  当所有音频播放完毕（包括播放列表中的最后一个）时触发。可用于通知上层组件播放完成。

---

## 源码例子

```json
{
  "id": "player1",
  "widgettype": "AudioPlayer",
  "options": {
    "url": "/audio/intro.mp3",     // 初始音频URL
    "autoplay": true               // 是否自动播放
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "btn_toggle",
      "event": "click",
      "target": "player1",
      "method": "toggle_play",
      "params": {}
    },
    {
      "actiontype": "method",
      "wid": "btn_next",
      "event": "click",
      "target": "player1",
      "method": "add_url",
      "params": {
        "url": "/audio/chapter2.mp3"
      }
    },
    {
      "actiontype": "script",
      "wid": "player1",
      "event": "ended",
      "target": "Popup",
      "script": "bricks.alert('播放完成！');"
    }
  ]
}
```

> **注释说明：**
> - 此控件 ID 为 `player1`，初始加载并自动播放 `/audio/intro.mp3`。
> - 点击 ID 为 `btn_toggle` 的按钮会调用 `toggle_play()` 方法实现播放/暂停切换。
> - 点击 `btn_next` 按钮将添加新的音频到播放队列。
> - 当音频播放结束后，弹出提示框告知用户“播放完成”。

---

# AudioRecorder

音频录制控件，继承自 `HBox`（水平布局容器控件）。提供麦克风录音功能，支持 WAV 格式录音、实时录音时长显示、录音开始/结束事件派发，并可配置上传 URL 实现录音文件自动上传。

**类型：** 容器控件（继承自 HBox，包含子控件）

---

## 主要方法

- `start_recording()`  
  开始录音。若尚未打开麦克风权限，则先请求授权并初始化录音器。

- `stop_recording()`  
  停止录音，生成 Blob 对象并派发 `record_ended` 事件，携带录音数据与播放 URL。

- `pause_recording()`  
  暂停录音（如有支持）。

- `resume_recording()`  
  恢复暂停的录音。

- `upload()`  
  异步方法，将最近一次录音的数据通过 FormData 上传至 `upload_url` 配置的地址，使用 POST 请求发送文件 `recorder.wav`。

- `download()`  
  下载当前录音文件，生成临时链接并触发浏览器下载行为。

- `recOpen()` / `recClose()`  
  内部方法，用于打开/关闭麦克风访问权限及初始化 Recorder 实例。

---

## 主要事件

- `record_started`  
  当录音开始前触发，可用于 UI 更新（如切换图标、启用播放预览等）。

- `record_ended`  
  录音停止后触发，携带数据对象 `{ data: Blob, url: string, duration: number }`，可用于预览或上传。

- `uploaded`  
  成功上传录音后触发，携带服务器返回结果 `ret`。

---

## 源码例子

```json
{
  "id": "recorder1",
  "widgettype": "AudioRecorder",
  "options": {
    "upload_url": "/api/upload_audio",   // 录音上传地址
    "start_icon": "imgs/start_recording.svg",  // 开始录音图标
    "stop_icon": "imgs/stop_recording.svg",    // 停止录音图标
    "icon_rate": 2                           // SVG 图标缩放比例
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "recorder1",
      "event": "record_started",
      "target": "status_text",
      "dispatch_event": "set_text",
      "params": {
        "text": "正在录音..."
      }
    },
    {
      "actiontype": "event",
      "wid": "recorder1",
      "event": "record_ended",
      "target": "status_text",
      "dispatch_event": "set_text",
      "params": {
        "text": "录音结束，正在上传..."
      }
    },
    {
      "actiontype": "registerfunction",
      "wid": "recorder1",
      "event": "uploaded",
      "rfname": "onAudioUploaded",
      "params": {
        "recorderId": "recorder1"
      }
    },
    {
      "actiontype": "method",
      "wid": "btn_download",
      "event": "click",
      "target": "recorder1",
      "method": "download",
      "params": {}
    }
  ]
}
```

> **注释说明：**
> - 控件 ID 为 `recorder1`，使用自定义图标进行视觉反馈。
> - 录音开始时，向 `status_text` 文本控件派发 `set_text` 事件更新状态。
> - 录音结束后提示“正在上传”，并在上传成功后调用全局注册函数 `onAudioUploaded` 处理后续逻辑。
> - 提供一个下载按钮 `btn_download`，允许用户手动下载录音文件。

---

# TextedAudioPlayer

带文本同步显示的音频播放器，继承自 `VBox`（垂直容器控件）。常用于语音朗读+字幕同步场景。能够接收流式 JSON 数据，其中包含音频 Base64 编码片段和对应文本内容，实现边接收边播放边展示文本的效果。

**类型：** 容器控件（可包含子控件）

---

## 主要方法

- `set_stream_urls(response)`  
  接收一个 `Response` 流对象，从中读取 JSON 数据流（每个 JSON 包含 `audio` 和 `text` 字段），解码后缓存至内部队列。

- `load_stream_data(json)`  
  内部异步方法，处理每一个流式到达的 JSON 数据块，将其推入播放缓冲区，并尝试触发播放。

- `playnext()`  
  从缓冲区取出下一条音频+文本数据，设置音频播放，并更新文本区域内容。当播放完当前音频后自动触发下一首。

---

## 主要事件

无自定义事件对外暴露，但内部监听 `AudioPlayer` 的 `ended` 事件以驱动连续播放。

---

## 源码例子

```json
{
  "id": "texted_player",
  "widgettype": "TextedAudioPlayer",
  "options": {
    "height": "300px",
    "width": "100%"
  },
  "subwidgets": [],
  "binds": [
    {
      "actiontype": "urlwidget",
      "wid": "btn_start_read",
      "event": "click",
      "target": "texted_player",
      "options": {
        "url": "/api/stream-audio-text",
        "method": "POST",
        "params": {
          "text": "{{input_text}}"
        }
      },
      "mode": "replace"
    },
    {
      "actiontype": "method",
      "wid": "texted_player",
      "event": "ended",
      "target": "bricks",
      "method": "notify",
      "params": {
        "message": "全部朗读完成"
      }
    }
  ]
}
```

> **注释说明：**
> - 控件 ID 为 `texted_player`，是一个垂直布局容器，内部包含一个 `AudioPlayer` 和一个带滚动的文本区域。
> - 点击 `btn_start_read` 按钮时，向 `/api/stream-audio-text` 发起 POST 请求，传入动态文本内容（例如来自输入框的 `input_text`）。
> - 服务器以流式 JSON 响应返回多个 `{ audio: base64str, text: '...' }` 数据块，客户端逐步播放音频并同步显示文本。
> - 所有内容播放完成后，调用 `bricks.notify` 显示完成通知。

--- 

> ✅ **备注：**
> 上述三个控件均已通过 `bricks.Factory.register` 注册，可在 `.ui` 文件中直接使用 `widgettype` 调用。  
> 使用时需确保引入依赖库：[Recorder.js](https://gitee.com/xiangyuecn/Recorder) 用于录音功能。