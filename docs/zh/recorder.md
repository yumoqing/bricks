# SysCamera

**控件功能**: 用于通过系统摄像头拍摄静态照片，支持实时预览并可在拍照后将图片以 `data URL` 和 `File` 对象形式返回。  
**类型**: 普通控件  
**父类控件**: `bricks.SysVideoRecorder`

## 初始化参数

- 无显式自定义初始化参数（继承自父类 `MediaRecorder`）。
- 实际使用时需在创建实例时传入 `widgetid` 等可能被父类使用的选项（但本类未直接使用）。

## 主要事件

- **`shot`**  
  触发时机：用户点击录制按钮进行拍照后触发。  
  回调数据：  
  ```js
  {
    url: string,   // 图片的 data URL，可用于 `<img>` 显示
    file: File     // 文件对象，可用于上传或保存
  }
  ```

---

# WidgetRecorder

**控件功能**: 录制页面中指定 widget（如 `<video>` 或 `<audio>` 元素）的媒体流内容，支持音频或视频录制。  
**类型**: 普通控件  
**父类控件**: `bricks.MediaRecorder`

## 初始化参数

- `widgetid` *(String)*: 要录制的 widget 的唯一标识 ID，用于通过 `bricks.getWidgetById()` 获取对应 DOM 元素。

## 主要事件

- **`record_started`**  
  触发时机：开始录制时触发。  
  回调数据：无。

- **`record_end`**  
  触发时机：正常停止录制后触发。  
  回调数据：  
  ```js
  {
    url: string,   // 媒体文件的 object URL，可用于播放
    file: File     // 生成的文件对象（wav 音频或 mp4 视频）
  }
  ```

---

# SysAudioRecorder

**控件功能**: 使用系统麦克风录制音频，支持将 WebM 格式音频自动转换为 WAV 格式输出，适用于需要高质量音频采集的场景。  
**类型**: 普通控件  
**父类控件**: `bricks.MediaRecorder`

## 初始化参数

- 无额外初始化参数，所有配置由内部逻辑设定。

## 主要事件

- **`record_started`**  
  触发时机：麦克风开启并开始录音时触发。  
  回调数据：无。

- **`record_end`**  
  触发时机：录音正常结束且完成格式转换后触发。  
  回调数据：  
  ```js
  {
    url: string,   // 转换后的 WAV 文件的 object URL
    file: File     // WAV 格式的 File 对象（便于上传或处理）
  }
  ```

---

# SysVideoRecorder

**控件功能**: 使用系统摄像头和麦克风录制音视频，支持实时视频预览，并在录制结束后输出 MP4 视频文件。  
**类型**: 普通控件  
**父类控件**: `bricks.MediaRecorder`

## 初始化参数

- 无额外初始化参数，使用默认媒体设备权限请求（包含音视频）。

## 主要事件

- **`record_started`**  
  触发时机：成功获取摄像头/麦克风流并启动录制时触发。  
  回调数据：无。

- **`record_end`**  
  触发时机：录制停止并生成视频文件后触发。  
  回调数据：  
  ```js
  {
    url: string,   // 视频文件的 object URL
    file: File     // MP4 格式的 File 对象
  }
  ```
