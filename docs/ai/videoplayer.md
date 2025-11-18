以下是根据你提供的源码中定义的两个控件 `VideoPlayer` 和 `Iptv`，按照要求编写的 **Markdown 格式控件文档**：

---

# VideoPlayer

**控件功能**：一个支持多种视频格式（MP4、HLS `.m3u8`、DASH `.mpd`）的视频播放器控件，内置播放控制条，支持播放/暂停、音量调节、倍速播放、音轨切换和全屏功能。  
**类型**：普通控件  
**父类控件**：`bricks.VBox`

## 初始化参数

| 参数名     | 类型    | 说明 |
|----------|--------|------|
| `url`     | String | 视频资源地址，支持 `.mp4`、`.m3u8`（HLS）、`.mpd`（DASH）格式 |
| `autoplay`| Boolean | 是否自动播放，默认为 `false` |

> 示例：
> ```js
> new bricks.VideoPlayer({
>   url: 'https://example.com/video.m3u8',
>   autoplay: true
> });
> ```

## 主要事件

| 事件名         | 触发条件 |
|--------------|--------|
| `domon`       | 控件被挂载到 DOM 时触发，用于初始化播放器 |
| `domoff`      | 控件从 DOM 中移除时触发，用于销毁播放器资源 |
| `click`       | 点击播放区域时显示控制栏，并启动隐藏倒计时 |
| `play_ok`     | （由 `Iptv` 使用）视频成功开始播放时可通过外部监听上报 |
| `play_failed` | （由 `Iptv` 使用）视频加载失败或无法播放时触发上报 |

> 注意：`play_ok` 和 `play_failed` 并非直接由 `VideoPlayer` 派发，而是通过其子类或组合控件（如 `Iptv`）在状态判断后手动调用。

---

# Iptv

**控件功能**：专用于 IPTV 场景的播放控件，可动态获取频道信息并自动加载 `VideoPlayer` 进行播放，同时支持播放成功/失败时向服务器上报状态。  
**类型**：容器控件  
**父类控件**：`bricks.VBox`

## 初始化参数

| 参数名           | 类型    | 说明 |
|------------------|--------|------|
| `iptv_data_url`   | String | 获取频道数据的接口 URL，返回包含 `url`、`tv_name`、`id` 等字段的 JSON 数据 |
| `playok_url`      | String | 播放成功时上报的接口地址（可选） |
| `playfailed_url`  | String | 播放失败时上报的接口地址（可选） |

> 示例：
> ```js
> new bricks.Iptv({
>   iptv_data_url: '/api/iptv/channel',
>   playok_url: '/api/report/playok',
>   playfailed_url: '/api/report/playfailed'
> });
> ```

## 主要事件

| 事件名         | 触发条件 |
|--------------|--------|
| `play_ok`     | 当内部 `VideoPlayer` 成功播放时，向 `playok_url` 发起 GET 请求进行上报 |
| `play_failed` | 当 `VideoPlayer` 播放失败时，向 `playfailed_url` 发起 GET 请求进行上报 |

> 说明：这两个事件是通过监听 `VideoPlayer` 的底层行为（如元数据加载完成且未出错）间接触发的，目前依赖于业务逻辑判断。

### 方法说明

- `setValue(data)`：更新当前播放频道的数据（如更换频道），会同步更新标题和视频源。
  - 参数 `data`: 包含 `url`, `tv_name`, `id` 的对象
  - 示例：
    ```js
    iptvWidget.setValue({
      id: "cctv1",
      tv_name: "CCTV-1 综合",
      url: "https://live.example.com/cctv1.m3u8"
    });
    ```

--- 

> ✅ **备注**：  
> - `VideoPlayer` 使用 [hls.js](https://github.com/video-dev/hls.js) 支持 HLS 流，需引入对应库；使用 [dash.js](https://github.com/Dash-Industry-Forum/dash.js) 支持 DASH 流。  
> - `Iptv` 控件依赖 `HttpJson` 和 `HttpText` 发起网络请求，请确保相关模块已注册可用。  
> - 所有控件均通过 `bricks.Factory.register` 注册，可在配置系统中以字符串形式创建。