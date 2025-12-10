# Bricks WebRTC 通信框架技术文档

本文档描述了 `bricks` 框架中用于实现点对点（P2P）实时音视频通信的核心模块，包括：

- `bricks.VideoBox`：用于播放媒体流的视频组件。
- `bricks.Signaling`：信令服务客户端，通过 WebSocket 与服务器通信。
- `bricks.RTCP2PConnect`：基于 WebRTC 的 P2P 连接管理器。

---

## 1. `bricks.VideoBox`

一个封装了 `<video>` 元素的 JavaScript 组件，用于显示媒体流（如摄像头或屏幕共享流）。

### 类定义
```js
class bricks.VideoBox extends bricks.JsWidget
```

### 方法

#### `create()`
创建并初始化 `<video>` DOM 元素，并设置自动播放和静音属性。

**行为：**
- 创建 `video` 元素。
- 设置 `autoplay` 和 `muted` 属性为 `true`。

> ⚠️ 注意：由于现代浏览器的安全策略，`autoplay` 只能在用户交互后生效，且必须配合 `muted` 才能无提示播放。

#### `get_stream() → MediaStream`
获取当前绑定到该视频元素的媒体流。

**返回值：**
- `{MediaStream}` 当前播放的媒体流对象。

#### `set_stream(stream: MediaStream)`
将指定的媒体流绑定到 `<video>` 元素上进行播放。

**参数：**
- `stream`: `{MediaStream}` 要播放的媒体流。

**行为：**
- 将 `stream` 赋值给内部变量 `this.stream`。
- 设置 `this.dom_element.srcObject = stream`，触发视频播放。

---

## 2. `bricks.Signaling`

信令客户端类，负责与信令服务器建立 WebSocket 连接，处理登录、心跳、消息收发及会话分发。

### 构造函数
```js
new bricks.Signaling(opts)
```

**参数 `opts`：**

| 参数 | 类型 | 描述 |
|------|------|------|
| `signaling_url` | `String` | WebSocket 信令服务器地址 |
| `info` | `Object` | 客户端信息（如用户 ID、设备信息等），在发送数据时附加为 `msgfrom` 字段 |
| `connect_opts` | `Object` | 传递给后续连接模块的通用配置选项 |
| `onclose` | `Function` | WebSocket 关闭时的回调函数 |
| `onopen` | `Function` | WebSocket 成功打开时的回调函数（可选） |
| `onlogin` | `Function(onlinePeers)` | 登录成功后接收在线用户列表的回调 |
| `heartbeat_period` | `Number` | 心跳周期（秒），若不设则不启用 |

### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `socket` | `WebSocket` | 当前 WebSocket 实例 |
| `peers` | `Object` | 存储当前在线用户的映射表（key: peer.id） |
| `sessions` | `Object` | 已建立的会话记录（未使用） |
| `handlers` | `Object` | 每个会话 ID 对应的消息处理器 |
| `sessionhandlers` | `Object` | 按会话类型注册的处理器构造函数 |
| `hb_task` | `TaskHandle` | 心跳定时任务句柄（由 `schedule_once` 返回） |
| `heartbeat_period` | `Number` | 心跳间隔时间（秒） |

### 方法

#### `init_websocket()`
初始化 WebSocket 连接：
- 使用 `bricks.app.get_session()` 获取会话凭证作为子协议。
- 绑定事件监听器：
  - `onmessage` → `signaling_recvdata`
  - `onopen` → `login`
  - `onclose` / `onerror` → `reconnect`

#### `reconnect()`
WebSocket 断开后的处理逻辑：
- 清除心跳任务。
- 触发 `onclose` 回调。
- **注意：当前未实现自动重连机制。**

#### `signaling_recvdata(event)`
异步处理从 WebSocket 接收到的数据包。

**流程：**
1. 解析 JSON 数据。
2. 若包含 `data.session`，查找对应会话处理器：
   - 若首次收到，则根据 `sessiontype` 实例化对应的处理器类。
   - 注册该会话的 `recvdata_handler`。
3. 否则调用默认 `recvdata_handler` 处理全局消息。

#### `add_handler(key, handler)`
注册某个 `sessionid` 的消息处理器。

#### `add_sessionhandler(sessiontype, handlerClass)`
注册某种会话类型的处理器类（构造函数）。例如：
```js
signaling.add_sessionhandler('p2p', bricks.RTCP2PConnect);
```

#### `recvdata_handler(data)`
默认消息处理器，处理非会话级消息。

**支持的消息类型：**
- `online`: 更新在线用户列表，并触发 `onlogin(online)` 回调。

> ❗ 未处理其他消息类型时仅打印日志。

#### `new_session(sessiontype, peer)`
发起一个新的会话请求。

**步骤：**
1. 查找 `sessiontype` 对应的处理器类。
2. 生成唯一 `sessionid`。
3. 发送 `{ type: 'new_session', session }` 到服务器。
4. 创建处理器实例并注册其 `recvdata_handler`。
5. 返回处理器实例（通常是 `RTCP2PConnect` 实例）。

#### `login()`
向服务器发送登录请求。

**行为：**
- 发送 `{ type: 'login' }`。
- 如果设置了 `heartbeat_period > 0`，启动周期性心跳任务。

#### `logout()`
发送登出请求 `{ type: 'logout' }`。

#### `send_data(d)`
将对象序列化为 JSON 并通过 WebSocket 发送。

**附加字段：**
- `d.msgfrom = this.info`（标识发送者）

#### `socket_send(s)`
直接发送原始字符串（底层接口，一般不推荐直接使用）。

---

## 3. `bricks.RTCP2PConnect`

WebRTC P2P 连接控制器，处理音视频通话和数据通道通信。

### 构造函数
```js
new bricks.RTCP2PConnect(signaling, session, opts)
```

**参数：**

| 参数 | 类型 | 描述 |
|------|------|------|
| `signaling` | `bricks.Signaling` | 信令客户端实例 |
| `session` | `Object` | 会话元信息 `{ sessionid, sessiontype }` |
| `opts` | `Object` | 配置项，见下表 |

**`opts` 配置说明：**

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `ice_servers` | `Array` | 必需 | ICE 服务器配置（STUN/TURN） |
| `peer_info` | `Object` | 必需 | 对端用户信息（含 `.id`） |
| `auto_callaccept` | `Boolean` | `false` | 是否自动接受呼叫 |
| `media_options` | `Object` | `{ video: true, audio: true }` | 媒体采集选项 |
| `data_connect` | `Boolean` | `false` | 是否启用数据通道 |
| `on_pc_connected(peer)` | `Function` | - | 连接建立成功回调 |
| `on_pc_disconnected(peer)` | `Function` | - | 连接断开回调 |
| `on_dc_open(dc)` | `Function` | - | 数据通道开启回调 |
| `on_dc_close(dc)` | `Function` | - | 数据通道关闭回调 |
| `on_dc_message(dc, data)` | `Function` | - | 收到数据通道消息回调 |

### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `id` | `String` | 本地唯一标识（UUID） |
| `signaling` | `Signaling` | 信令客户端引用 |
| `session` | `Object` | 当前会话信息 |
| `requester` | `Boolean` | 是否为主叫方 |
| `peers` | `Object` | 所有远程连接的 `PeerConnection` 管理对象 |
| `signal_handlers` | `Object` | 信令消息处理器映射 |
| `local_stream` | `MediaStream` | 本地摄像头流 |
| `localVideo` | `VideoBox` | 本地视频预览组件 |
| `local_screen` | `MediaStream` | 屏幕共享流（可选） |

---

### 核心方法

#### `add_handler(type, f)`
注册信令消息处理器（如 `'offer'`, `'answer'` 等）。

#### `get_handler(type) → Function`
获取指定类型的消息处理器。

#### `p2pconnect(peer)`
尝试与指定对端建立 P2P 连接。

**流程：**
1. 获取本地媒体流（如果尚未获取）。
2. 若已存在连接则跳过。
3. 调用 `createPeerConnection(peer)` 创建新的 `RTCPeerConnection`。

#### `h_sessioncreated(data)`
当会话创建完成时触发。

**行为：**
- 自动调用 `p2pconnect`。
- 若有 `peer_info`，主动发送 `callrequest` 请求呼叫。

#### `h_callrequest(data)`
收到呼叫请求。

**行为：**
- 若 `auto_callaccept === true`（或硬编码为 `true`），自动响应：
  - 建立连接。
  - 发送 `callaccepted` 消息。

#### `h_callaccepted(data)`
对方接受呼叫。

**行为：**
- 创建数据通道（如果启用）。
- 发送 SDP Offer。

#### `h_offer(data)`
收到远程 Offer。

**流程：**
1. 设置 `remoteDescription`。
2. 创建 Answer。
3. 设置 `localDescription`。
4. 发送 Answer 回去。
5. 如果不是主叫方，再发送一次 Offer（可能存在设计问题，需确认逻辑）。

#### `h_answer(data)`
收到远程 Answer。

**行为：**
- 设置 `remoteDescription`。

#### `h_icecandidate(data)`
收到 ICE 候选地址。

**行为：**
- 添加到 `RTCPeerConnection` 中。

#### `h_sessionquit(data)`
收到会话结束通知。

**行为：**
- 关闭对应 `RTCPeerConnection`。

#### `send_offer(peer, initial = false)`
创建并发送 SDP Offer。

**参数：**
- `peer`: 目标用户。
- `initial`: 是否是首次呼叫（决定角色：`requester` / `responser`）

**流程：**
1. 创建 Offer。
2. 设置 `localDescription`。
3. 通过信令发送 Offer。

#### `send_candidate(peer, event)`
ICE 候选事件触发时调用，转发候选地址给远端。

> ✅ 使用 `bind(this, peer)` 绑定上下文。

#### `signaling_send(d)`
封装信令消息，附带当前 `session` 信息后发送。

#### `recvdata_handler(data)`
统一入口处理所有信令消息：
- 查找对应处理器并执行。
- 未处理则输出警告日志。

---

### 连接状态监听

#### `ice_statechange(peer, event)`
ICE 连接状态变化时的日志输出。

#### `connection_statechange(peer, event)`
连接状态变化处理：
- `disconnected`: 触发 `peer_close()` 和 `on_pc_disconnected` 回调。
- `connected`: 触发 `on_pc_connected` 回调。

---

### 数据通道（DataChannel）

#### `dc_accepted(peer, event)`
收到远程数据通道请求。

**行为：**
- 保存 `event.channel`。
- 调用 `dc_created()` 初始化。

#### `dc_created(peer, dc)`
初始化数据通道事件监听器：
- `onmessage` → `datachannel_message`
- `onopen` → `datachannel_open`
- `onclose` → `datachannel_close`

#### `datachannel_message(peer, event)`
收到数据通道消息。

**行为：**
- 触发 `on_dc_message(dc, event.data)` 回调。

#### `datachannel_open/close(peer)`
分别在数据通道打开/关闭时触发相应回调。

#### `createDataChannel(peer)`
主动创建数据通道（用于主叫方）。

---

### 媒体流控制

#### `createPeerConnection(peer)`
创建并配置 `RTCPeerConnection` 实例。

**关键操作：**
- 使用传入的 `iceServers`。
- 添加本地媒体轨道（如有）。
- 绑定以下事件：
  - `onicecandidate`
  - `oniceconnectionstatechange`
  - `onconnectionstatechange`
  - `ondatachannel`（注意：拼写错误应为 `ondatachannel`）
  - `ontrack` → 将远端流绑定到 `VideoBox`

> 🛠️ Bug 提示：`pc.ondatachanel` 应为 `pc.ondatachannel`

#### `changeLocalVideoStream(peer, new_stream)`
动态更换本地视频流（如切换摄像头或屏幕共享）。

**流程：**
1. 移除旧的视频 Track。
2. 添加新流中的视频 Track。
3. 重新发送 Offer 以更新协商。

#### `getLocalStream()`
获取本地摄像头和屏幕共享流。

**行为：**
- 调用 `getUserMedia(media_options)` 获取摄像头流。
- 调用 `getDisplayMedia({ video: true })` 获取屏幕共享流（音频可选）。
- 分别赋值给 `this.local_stream` 和 `this.local_screen`。
- 创建 `localVideo` 并绑定摄像头流用于预览。

> 🔐 权限提示：需要用户授权麦克风和摄像头权限。

---

#### `peer_close(peer)`
清理与指定对端的所有资源。

**释放内容：**
- 停止所有接收/发送的媒体 Track。
- 停止远端视频流。
- 关闭数据通道和 `RTCPeerConnection`。
- 删除 `peers` 中的记录。
- 若无剩余连接，停止本地流并从信令中注销会话处理器。

---

## 使用示例

```js
// 初始化信令
var signaling = new bricks.Signaling({
    signaling_url: 'wss://example.com/signaling',
    info: { id: 'user123', name: 'Alice' },
    heartbeat_period: 30,
    onlogin: function(peers) {
        console.log('Online users:', peers);
    }
});

// 注册 P2P 处理器
signaling.add_sessionhandler('p2p', bricks.RTCP2PConnect);

// 登录（触发 login）
signaling.login();

// 发起一个 P2P 会话
var p2p = signaling.new_session('p2p', { id: 'user456' });
```

---

## 注意事项与潜在问题

| 问题 | 描述 | 建议修复 |
|------|------|---------|
| `ondatachanel` 拼写错误 | 应为 `ondatachannel` | 更正拼写 |
| `auto_callaccept || true` | 条件恒真，失去意义 | 改为 `this.opts.auto_callaccept === true` |
| `newStream` 变量名错误 | `changeLocalVideoStream` 中误写为 `newStream` | 改为 `new_stream` |
| 缺少异常处理 | 多处 `await` 未包裹 `try/catch` | 增加错误捕获 |
| 心跳任务未清除 | `schedule_once` 可能导致内存泄漏 | 确保正确取消任务 |
| 未实现自动重连 | `reconnect()` 仅触发回调 | 应加入延迟重试机制 |

---

## 总结

`bricks` 提供了一套完整的 WebRTC 信令与连接管理方案，具有以下特点：

✅ **模块化设计**：分离信令、会话、连接逻辑  
✅ **扩展性强**：支持多种会话类型  
✅ **易于集成**：提供 VideoBox 等 UI 组件封装  
⚠️ **需优化点**：存在若干 bug 与安全限制需处理  

适用于开发音视频会议、直播互动、远程协作等实时通信应用。