# SysCamera

SysCamera 是一个用于从系统摄像头拍照的容器控件，继承自 `SysVideoRecorder`。它本质上是一个媒体录制弹窗控件的特化版本，将“录制视频”功能替换为“单次拍摄照片”，适用于需要用户拍照上传的场景（如头像设置、证件照采集等）。该控件属于**容器控件**。

---

## 主要方法

- **`switch_record()`**  
  重写了父类的录屏/录音切换方法，改为执行拍照操作。停止预览流任务，派发 `shot` 事件并携带拍摄的图片 URL 和 File 对象，随后关闭摄像头。

- **`show_picture()`**  
  继承自 `SysVideoRecorder`，通过 `ImageCapture.takePhoto()` 持续获取当前帧图像，并显示在内置的 Image 控件中，形成实时预览效果。

- **`close_recorder()`**  
  清理资源：取消定时任务、停止媒体流轨道、释放 DOM 元素，最后调用 `dismiss()` 隐藏弹窗。

---

## 主要事件

- **`shot`**  
  当用户点击拍照按钮时触发。携带数据：
  ```json
  {
    "url": "data:image/jpeg;base64,...",  // 图片 Data URL
    "file": FileObject                    // 图片对应的 File 实例
  }
  ```
  可用于上传或展示拍摄结果。

- **`record_started`**（继承）  
  启动预览流时触发，表示摄像头已打开。

- **`record_end`**（继承）  
  不适用此控件，不会触发。

---

## 源码例子

```json
{
  "id": "camera_popup",
  "widgettype": "SysCamera",
  "options": {
    "title": "Take a Photo",           // 弹窗标题
    "width": 400,                      // 弹窗宽度
    "height": 500,                     // 弹窗高度
    "fps": 30                          // 视频预览帧率
  },
  "subwidgets": [],                    // SysCamera 自行管理子控件，无需手动定义
  "binds": [
    {
      "actiontype": "event",
      "wid": "open_camera_btn",        // 假设页面上有一个按钮 ID 为 open_camera_btn
      "event": "click",                // 点击时打开摄像头
      "target": "camera_popup",
      "method": "present"              // 显示弹窗
    },
    {
      "actiontype": "event",
      "wid": "camera_popup",
      "event": "shot",                 // 监听拍照完成事件
      "target": "photo_preview_img",   // 假设有一个 Image 控件用于显示照片
      "method": "set_url",             // 调用 set_url 方法更新图片
      "datawidget": "camera_popup",    // 数据来源是 camera_popup
      "datamethod": "getValue",        // getValue 应返回 { url: ..., file: ... }
      "dataparams": {}
    },
    {
      "actiontype": "script",
      "wid": "camera_popup",
      "event": "shot",
      "script": "console.log('Photo taken:', params.file.name); uploadFile(params.file);",
      "params": {
        "file": "{source.file}"        // 使用表达式注入文件对象
      }
    }
  ]
}
```

> ✅ **注释说明：**
> - `SysCamera` 控件自动构建内部 UI（包括预览区和拍照按钮），开发者只需配置选项并绑定事件。
> - `present()` 方法由 `Popup` 基类提供，用于显示模态窗口。
> - `binds` 中监听 `shot` 事件后，可将图片传递给其他控件或执行上传逻辑。
> - 利用 `script` 类型绑定可以实现复杂业务逻辑，例如调用全局上传函数 `uploadFile`。

---

# WidgetRecorder

WidgetRecorder 是一个用于录制指定 HTML 媒体元素（如 `<video>` 或 `<audio>`）内容的容器控件，继承自 `MediaRecorder`。它允许开发者选择某个播放中的媒体组件进行录制，适用于课程录制、音频剪辑等场景。该控件属于**容器控件**。

---

## 主要方法

- **`open_recorder()`**  
  初始化录制环境。根据 `options.widgetid` 找到目标媒体控件，检查其标签类型（`VIDEO` 或 `AUDIO`），然后调用 `.captureStream()` 获取媒体流，启用录制按钮。

- **`switch_record()`**  
  切换录制状态：开始或停止录制。开始时创建 `MediaRecorder` 实例并启动；停止时触发 `record_end` 事件并传出 Blob URL 和 File。

- **`close_recorder()`**  
  停止录制任务和媒体流，隐藏弹窗。

---

## 主要事件

- **`record_started`**  
  开始录制时触发，可用于禁用按钮或提示用户。

- **`record_end`**  
  录制结束后触发，携带以下数据：
  ```json
  {
    "url": "blob:http://...",       // 可用于 `<audio>` 或 `<video>` 标签播放
    "file": FileObject              // 可用于上传
  }
  ```

---

## 源码例子

```json
{
  "id": "recorder_popup",
  "widgettype": "WidgetRecorder",
  "options": {
    "title": "Record Media",
    "width": 300,
    "height": 200,
    "widgetid": "main_video_player"  // 要录制的目标视频控件 ID
  },
  "subwidgets": [],
  "binds": [
    {
      "actiontype": "event",
      "wid": "start_record_btn",
      "event": "click",
      "target": "recorder_popup",
      "method": "present"
    },
    {
      "actiontype": "event",
      "wid": "recorder_popup",
      "event": "record_end",
      "target": "playback_preview",
      "method": "set_url",
      "datawidget": "recorder_popup",
      "datamethod": "getValue"
    },
    {
      "actiontype": "registerfunction",
      "wid": "recorder_popup",
      "event": "record_end",
      "rfname": "saveUserRecording",
      "params": {
        "userid": 12345,
        "recording": "{source.file}"
      }
    }
  ]
}
```

> ✅ **注释说明：**
> - 必须传入 `widgetid` 指向一个实际存在的媒体控件。
> - 支持录制 `<video>` 输出 mp4，`<audio>` 输出 wav。
> - `captureStream()` 是现代浏览器支持的标准 API，用于捕获元素播放的内容。
> - 使用 `registerfunction` 可调用注册过的全局函数处理录制结果。

---

# SysAudioRecorder

SysAudioRecorder 是一个用于录制用户麦克风音频的容器控件，继承自 `MediaRecorder`。它可以捕获用户的语音输入并将其转换为 WAV 格式文件，适合语音留言、录音笔记等应用。该控件属于**容器控件**。

---

## 主要方法

- **`open_recorder()`**  
  请求用户授权访问麦克风（`navigator.mediaDevices.getUserMedia`），获取音频流，并启用录制按钮。

- **`blob_convert(webmBlob)`**  
  将浏览器默认生成的 WebM 格式音频解码为 PCM 数据，再编码为标准 WAV 格式，确保兼容性。

- **`encodeWAV(audioBuffer)`**  
  编码 AudioBuffer 为 WAV 文件的二进制格式，构造符合 RIFF/WAVE 规范的 Blob。

- **`interleave(left, right)`**  
  合并左右声道数据，生成立体声 PCM 浮点数组。

- **`writeString(view, offset, string)`**  
  向 DataView 写入 ASCII 字符串，用于构建 WAV 头部信息。

---

## 主要事件

- **`record_started`**  
  麦克风开始录制时触发。

- **`record_end`**  
  停止录制后触发，携带：
  ```json
  {
    "url": "blob:...",           // 可播放的 blob URL
    "file": WAV_File_Object     // 16bit PCM WAV 格式的 File
  }
  ```

---

## 源码例子

```json
{
  "id": "mic_recorder",
  "widgettype": "SysAudioRecorder",
  "options": {
    "title": "Voice Recorder",
    "width": 350,
    "height": 180
  },
  "subwidgets": [],
  "binds": [
    {
      "actiontype": "event",
      "wid": "mic_btn",
      "event": "click",
      "target": "mic_recorder",
      "method": "present"
    },
    {
      "actiontype": "event",
      "wid": "mic_recorder",
      "event": "record_end",
      "target": "audio_player",
      "method": "set_url",
      "datawidget": "mic_recorder",
      "datamethod": "getValue"
    },
    {
      "actiontype": "method",
      "wid": "mic_recorder",
      "event": "record_started",
      "target": "status_label",
      "method": "set_text",
      "rtdata": {
        "text": "Recording..."
      }
    },
    {
      "actiontype": "method",
      "wid": "mic_recorder",
      "event": "record_end",
      "target": "status_label",
      "method": "set_text",
      "rtdata": {
        "text": "Ready"
      }
    }
  ]
}
```

> ✅ **注释说明：**
> - 默认使用 WebM 容器录制，但最终输出为更通用的 WAV 格式。
> - `encodeWAV` 实现了完整的 WAV 文件头封装，保证跨平台播放兼容性。
> - 可结合 `AudioContext` 实现可视化波形图增强用户体验。

---

# SysVideoRecorder

SysVideoRecorder 是一个用于录制用户摄像头及麦克风的容器控件，继承自 `MediaRecorder`。它能同时录制音视频并保存为 MP4 文件，适用于视频通话录制、面试录像等场景。该控件属于**容器控件**。

---

## 主要方法

- **`open_recorder()`**  
  请求音视频权限，获取媒体流，初始化 `ImageCapture` 用于逐帧抓取画面以供预览。

- **`show_picture()`**  
  定期调用 `imageCapture.takePhoto()` 获取当前帧并渲染到 `Image` 控件中，实现低延迟预览。

- **`close_recorder()`**  
  释放所有资源，包括预览任务和媒体流轨道。

---

## 主要事件

- **`record_started`**  
  开始录制时触发。

- **`record_end`**  
  结束录制后触发，携带 MP4 格式的 Blob URL 和 File 对象。

---

## 源码例子

```json
{
  "id": "video_recorder",
  "widgettype": "SysVideoRecorder",
  "options": {
    "title": "Video Recorder",
    "width": 500,
    "height": 600
  },
  "subwidgets": [],
  "binds": [
    {
      "actiontype": "event",
      "wid": "record_video_btn",
      "event": "click",
      "target": "video_recorder",
      "method": "present"
    },
    {
      "actiontype": "event",
      "wid": "video_recorder",
      "event": "record_end",
      "target": "video_preview",
      "method": "set_url",
      "datawidget": "video_recorder",
      "datamethod": "getValue"
    },
    {
      "actiontype": "urlwidget",
      "wid": "video_recorder",
      "event": "record_end",
      "target": "upload_container",
      "mode": "replace",
      "options": {
        "url": "/api/upload_form",
        "params": {
          "type": "video",
          "filename": "user_interview.mp4"
        }
      }
    }
  ]
}
```

> ✅ **注释说明：**
> - 使用 `getUserMedia({audio:true, video:true})` 同时获取音视频流。
> - 预览使用 `ImageCapture` API 提高清晰度和响应速度。
> - 录制完成后可通过 `urlwidget` 动态加载上传表单，实现流程自动化。
> - 输出文件为 `video/mp4` 类型，适配大多数播放器和服务器处理逻辑。