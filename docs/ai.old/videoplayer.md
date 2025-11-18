# VideoPlayer

用于播放视频内容，支持多种格式（MP4、HLS `.m3u8`、DASH `.mpd`），具备完整的播放控制功能。类型：普通控件，继承自 `VBox`。

## 主要方法

- **`loadVideo(src)`**  
  加载指定的视频源，自动判断是 MP4、HLS 还是 DASH 格式，并初始化对应的播放器（原生 `<video>`、Hls.js 或 dash.js）。

- **`init()`**  
  初始化播放器，在 DOM 挂载后调用，加载视频并绑定事件。

- **`destroy()`**  
  销毁当前播放器实例，释放 Hls 或 dash.js 资源，清空视频源。

- **`bindEvents()`**  
  绑定所有 UI 控件与视频元素的交互事件，如播放/暂停、音量、全屏等。

- **`updateUI()`**  
  更新播放器界面状态（播放按钮、静音、进度条时间等）。

- **`show_controls()` / `hide_controls()`**  
  显示或隐藏控制栏，点击视频时显示，4秒无操作后自动隐藏。

- **`setValue(url)`**  
  动态设置播放地址并重新加载视频（可用于切换频道或视频源）。

- **`set_url(newUrl)`**  
  外部调用接口，用于更新播放地址（等价于 `setValue` 的快捷方式）。

## 主要事件

- **`play_ok`**  
  当视频成功开始播放时触发（内部通过监听 `playing` 事件派发），可用于上报播放成功日志。

- **`play_failed`**  
  视频加载失败或无法播放时触发，可用于错误上报。

> 注：这两个事件由 `Iptv` 控件监听并用于上报播放状态。

## 源码例子

```json
{
  "id": "my_video_player",
  "widgettype": "VideoPlayer",
  "options": {
    "url": "https://example.com/video/stream.m3u8",  // 支持 .m3u8 (HLS), .mpd (DASH), .mp4 等
    "autoplay": true  // 是否自动播放
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "my_video_player",
      "event": "play_ok",
      "target": "logger_widget",
      "dispatch_event": "log_message",
      "params": {
        "message": "视频播放成功"
      }
    },
    {
      "actiontype": "event",
      "wid": "my_video_player",
      "event": "play_failed",
      "target": "alert_popup",
      "dispatch_event": "show",
      "params": {
        "title": "播放失败",
        "content": "无法加载该视频流，请检查网络或资源地址。"
      }
    },
    {
      "actiontype": "method",
      "wid": "control_btn_playpause",
      "event": "click",
      "target": "my_video_player",
      "method": "setValue",
      "params": {
        "url": "https://another-example.com/live/stream.mpd"  // 切换为 DASH 流
      }
    }
  ]
}
```

> ✅ **注释说明：**
> - 使用 `VideoPlayer` 播放 HLS/DASH/MP4 视频流；
> - 支持通过事件绑定实现播放成功/失败的日志记录和提示；
> - 可通过外部按钮点击动态调用 `setValue` 方法更换视频源；
> - 自动检测格式并使用 Hls.js 或 dash.js 渲染（需提前引入对应库）；
> - 包含播放、暂停、音量、倍速、音轨选择、全屏等功能；
> - 控制栏在无操作 4 秒后自动隐藏，点击画面可重新显示。

---

# Iptv

专为 IPTV 场景设计的容器控件，封装了用户认证、频道信息获取与视频播放逻辑。类型：容器控件，继承自 `VBox`。

## 主要方法

- **`build_subwidgets()`**  
  异步构建子控件：首先请求服务器获取用户频道数据，然后创建 `VideoPlayer` 和标题 `Text` 控件并添加到界面中。

- **`report_play_ok()`**  
  当播放成功时向服务器上报“播放成功”事件（例如用于统计收视率）。

- **`report_play_failed()`**  
  当播放失败时向服务器上报“播放失败”事件。

- **`setValue(data)`**  
  外部传入新的频道数据，动态更新当前播放内容（包括标题和视频地址）。

## 主要事件

- **`play_ok`**  
  被 `VideoPlayer` 子控件触发，表示播放已开始，本控件会进一步上报给服务端。

- **`play_failed`**  
  播放异常时触发，用于错误追踪和上报。

## 源码例子

```json
{
  "id": "iptv_container",
  "widgettype": "Iptv",
  "options": {
    "iptv_data_url": "/api/iptv/channel",     // 获取频道信息的接口
    "playok_url": "/api/report/playok",        // 上报播放成功的 URL
    "playfailed_url": "/api/report/playfailed" // 上报播放失败的 URL
  },
  "subwidgets": [],  // 动态生成，无需手动填写
  "binds": [
    {
      "actiontype": "urlwidget",
      "wid": "channel_list_item",
      "event": "click",
      "target": "iptv_container",
      "action": "replace",
      "options": {
        "url": "/api/iptv/channel",
        "params": {
          "channel_id": "{channel_id}"  // 来自动态数据
        },
        "method": "GET"
      }
    },
    {
      "actiontype": "method",
      "wid": "btn_change_channel",
      "event": "click",
      "target": "iptv_container",
      "method": "setValue",
      "dataparams": {
        "tv_name": "CCTV-5 体育频道",
        "url": "https://live.cctv.com/cctv5.m3u8",
        "id": "cctv5"
      }
    }
  ]
}
```

> ✅ **注释说明：**
> - `Iptv` 是一个高级封装控件，适用于需要鉴权、播放上报的直播场景；
> - 初始化时会从 `iptv_data_url` 获取频道信息（包含 `url`, `tv_name`, `id` 等字段）；
> - 成功播放时自动调用 `playok_url` 上报设备 ID 和频道 ID；
> - 播放失败也会尝试上报错误；
> - 支持通过 `setValue` 方法直接切换频道内容；
> - 可结合列表项点击动态加载不同频道（使用 `urlwidget` 绑定）；
> - 实际渲染结构为：顶部标题 + 下方 VideoPlayer；
> - 需确保页面已引入 Hls.js 或 dash.js 库以支持流媒体协议。