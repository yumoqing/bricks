# VideoBox

**控件功能**：用于在页面中创建并管理 `<video>` 元素，支持设置音视频流（MediaStream），常用于本地或远程视频渲染。  
**类型**：普通控件（UI 控件）  
**父类控件**：`bricks.JsWidget`

## 初始化参数

无显式构造函数，调用 `create()` 方法时自动创建 DOM 元素并设置默认属性：
- `autoplay: true`：自动播放
- `muted: true`：静音播放

## 主要事件

无自定义事件暴露，但内部使用原生 `<video>` 元素事件（如 `play`, `pause` 等）。提供以下方法供外部控制：
- `set_stream(stream)`：设置 MediaStream 到 video 元素
- `get_stream()`：获取当前绑定的 MediaStream

---

# Signaling

**控件功能**：实现 WebSocket 信令通道，用于登录、心跳、消息收发及会话管理，是 WebRTC 多端通信的核心协调模块。支持注册不同类型会话的消息处理器。  
**类型**：普通控件（非 UI 模块）  
**父类控件**：无（独立类）

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `signaling_url` | String | WebSocket 服务地址 |
| `info` | Object | 当前客户端身份信息（如用户ID等），随每条消息发送 |
| `connect_opts` | Object | 连接选项，传递给会话处理器 |
| `onclose` | Function | WebSocket 关闭时回调 |
| `onlogin` | Function | 登录成功后返回在线用户列表时触发 |
| `onopen` | Function | WebSocket 打开时回调（可选） |
| `heartbeat_period` | Number | 心跳周期（秒），0 表示不启用 |

## 主要事件

通过 `recvdata_handler` 分发接收到的数据，关键消息类型如下：
- `online`: 登录响应，包含当前在线用户列表
- `new_session`: 创建新会话请求
- 自定义 sessiontype 消息：由 `add_sessionhandler()` 注册的处理器处理

支持动态注册会话处理器：
- `add_sessionhandler(sessiontype, handlerClass)`：为特定会话类型注册处理器类
- `add_handler(key, handler)`：为指定 sessionid 添加消息处理器

---

# RTCP2PConnect

**控件功能**：封装 WebRTC 点对点连接逻辑，包括媒体流处理、数据通道、信令交互、ICE 协商等，实现音视频通话与数据传输。  
**类型**：普通控件（通信模块）  
**父类控件**：无（独立类）

## 初始化参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `signaling` | Signaling 实例 | 上层信令实例，用于发送接收信令消息 |
| `session` | Object | 当前会话对象 `{sessionid, sessiontype}` |
| `opts` | Object | 配置项，结构如下： |

```js
{
  ice_servers: [],           // STUN/TURN 服务器配置
  peer_info: {},             // 对端信息（用于 callrequest）
  auto_callaccept: true,     // 是否自动接受呼叫
  media_options: {            // getUserMedia 参数
    video: true,
    audio: true
  },
  data_connect: true,        // 是否建立 datachannel
  on_pc_connected: Function, // PeerConnection 成功连接回调
  on_pc_disconnected: Function, // PeerConnection 断开回调
  on_dc_open: Function,      // DataChannel 打开回调
  on_dc_close: Function,     // DataChannel 关闭回调
  on_dc_message: Function    // 收到 DataChannel 消息回调
}
```

## 主要事件

通过内置 handler 监听并响应以下信令消息类型：
- `sessioncreated`：会话创建成功，启动连接流程
- `callrequest`：收到呼叫请求，若 auto_accept 则自动响应
- `callaccepted`：对方接受呼叫，开始 SDP 协商
- `offer`：收到 SDP Offer，回复 Answer
- `answer`：收到 SDP Answer，完成协商
- `icecandidate`：收到 ICE 候选，添加到 PeerConnection
- `sessionquit`：会话结束，关闭连接

其他运行时事件：
- `oniceconnectionstatechange`：ICE 状态变化
- `onconnectionstatechange`：连接状态变化（connected/disconnected）
- `ondatachannel` / `ontrack`：远程数据通道或媒体轨道到达

---

✅ **总结说明**：
- `VideoBox` 是可视化控件，用于展示视频流。
- `Signaling` 是信令中枢，负责与服务器通信。
- `RTCP2PConnect` 是 WebRTC 连接控制器，处理点对点连接全流程。

三者协同工作，构成完整的实时通信系统。
