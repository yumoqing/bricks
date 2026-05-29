# ASRClient

控件功能：实现语音识别客户端功能，通过 WebSocket 与服务器通信，实时发送音频数据并接收识别结果。提供开始/停止录音的交互按钮，并触发相应的事件。

类型：普通控件  
父类控件：`bricks.VBox`

## 初始化参数

- `start_icon` (String, 可选)  
  开始录音状态下的图标路径，默认为 `imgs/start_recording.svg`。

- `stop_icon` (String, 可选)  
  停止录音状态下的图标路径，默认为 `imgs/stop_recording.svg`。

- `ws_url` (String, 必填)  
  WebSocket 服务地址，用于建立与语音识别后端的连接。

- `icon_options` (Object, 可选)  
  图标控件的配置选项，将传递给 `bricks.Svg` 实例，可自定义图标显示样式。

- `ws_params` (Object, 可选)  
  发送至 WebSocket 服务器的额外参数，在发送音频数据时合并使用。

## 主要事件

- `start`  
  触发时机：用户点击图标开始录音时。  
  参数：无  

- `stop`  
  触发时机：用户点击图标停止录音时。  
  参数：无  

- `transtext`  
  触发时机：从服务器接收到语音识别结果时。  
  参数：  
  ```json
  {
    "content": "识别出的文本内容",
    "speaker": "说话人标识（如支持）",
    "start": "该段语音起始时间戳",
    "end": "该段语音结束时间戳"
  }
  ```
  说明：此事件由 `response_data` 方法解析服务器消息后派发，供上层组件处理识别结果。
