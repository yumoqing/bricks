# Camera

**控件用途**：  
`Camera` 是一个用于调用用户设备摄像头的弹窗式控件，支持拍照和视频录制功能。它继承自 `Popup` 控件，属于**容器控件**，可包含子控件（如按钮、图像显示区域等），并通过内置逻辑实现媒体流的获取与处理。

- **类型**：容器控件（继承自 `bricks.Popup`）

---

## 主要方法

| 方法名 | 描述 |
|--------|------|
| `startCamera(vpos)` | 异步启动摄像头，使用指定的视频设备索引（vpos）初始化媒体流并开始预览。 |
| `show_picture()` | 在画布上绘制当前视频帧，并实时更新到 `Image` 子控件中，实现取景器效果。 |
| `switch_camera(btn, event)` | 切换当前使用的摄像头（前后置或多个摄像头之间切换）。 |
| `take_picture(event)` | 拍摄当前画面并触发 `shot` 事件，传出图片的 Data URL。 |
| `switch_recording()` | 切换录制状态：开始或停止视频录制。 |
| `videorecorder_start()` | 启动 `MediaRecorder` 开始录制视频，保存数据片段。 |
| `videorecorder_stop()` | 停止视频录制，并生成 Blob 文件，派发 `recorded` 事件。 |

---

## 主要事件

| 事件名 | 触发时机 | 参数 |
|--------|---------|------|
| `shot` | 拍照完成时触发 | `dataurl`: 当前截图的 JPEG 格式 Data URL 字符串 |
| `recorded` | 视频录制结束时触发 | `file`: 生成的 WebM 格式视频文件对象（File） |
| `dismiss` | 用户点击取消按钮关闭弹窗时触发 | 无参数（由 `del_btn` 的 click 绑定触发） |

---

## 源码例子

```json
{
  "id": "camera_popup",
  "widgettype": "Camera",
  "options": {
    "type": "picture",  // 可选 'picture' 或 'recorder'
    "fps": 60,          // 帧率，默认为60
    "title": "拍照/录像" // 弹窗标题
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "shot_btn",        // 实际ID会自动生成，此处仅为示意
      "event": "shot",
      "target": "image_preview",
      "dispatch_event": "setValue",
      "rtdata": {
        "value": "{data}"       // 动态插入拍摄的图片URL
      }
    },
    {
      "actiontype": "event",
      "wid": "camera_popup",
      "event": "recorded",
      "target": "video_list",
      "dispatch_event": "addItem",
      "rtdata": {
        "item": {
          "name": "录制视频",
          "url": "{data}",
          "type": "video/webm"
        }
      }
    },
    {
      "actiontype": "method",
      "wid": "del_btn",
      "event": "click",
      "target": "camera_popup",
      "method": "dismiss"
    }
  ],
  "subwidgets": [
    // Camera 自身管理子控件，一般无需手动定义 subwidgets
    // 内部已构建：HBox（按钮栏）、Filler（图像展示区）、Svg按钮等
  ]
}
```

> ✅ **注释说明**：
> - `widgettype: "Camera"` 表示使用注册的 Camera 控件。
> - `options.type` 决定是拍照模式还是录像模式：
>   - `"picture"`：显示拍照按钮，点击后触发 `shot` 事件；
>   - `"recorder"`：显示录制控制按钮，支持开始/停止录制，触发 `recorded` 事件。
> - `binds` 中通过事件绑定将拍摄结果传递给其他控件进行后续处理（如显示或上传）。
> - `target` 支持指向其他控件 ID，实现组件间通信。
> - 使用 `{data}` 占位符可在运行时自动替换为事件携带的数据。

--- 

💡 **提示**：  
该控件依赖全局 `bricks.app` 提供的 `start_camera(vpos)` 方法和 `video_devices` 设备列表，需确保平台支持 getUserMedia 并已正确初始化媒体权限。