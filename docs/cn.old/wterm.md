# `bricks.Wterm` 技术文档

> 基于 xterm.js 的终端组件，通过 WebSocket 与后端交互，支持自动连接、心跳保活、终端尺寸自适应等功能。

---

## 概述

`bricks.Wterm` 是一个基于 [xterm.js](https://xtermjs.org/) 的前端终端控件类，继承自 `bricks.JsWidget`。它用于在网页中嵌入一个可交互的终端界面，并通过 WebSocket 连接到后端服务进行数据通信。

该组件主要功能包括：

- 终端渲染（使用 xterm.js）
- WebSocket 通信管理
- 自动发送终端尺寸
- 心跳机制保活连接
- 键盘输入转发
- DOM 生命周期绑定（如页面显示/隐藏时自动处理连接）

---

## 依赖

- **xterm.js**：核心终端库
- **FitAddon for xterm.js**：用于自适应容器大小
- `bricks.js` 框架运行环境
- 全局函数 `schedule_once(fn, delay)`：用于延迟执行任务（类似 `setTimeout` 封装）

---

## 类定义

```js
class bricks.Wterm extends bricks.JsWidget
```

---

## 构造函数

### `constructor(opts)`

初始化终端组件。

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `opts.ws_url` | `String` | WebSocket 服务器地址（必需） |
| `opts.ping_timeout` | `Number` | 心跳间隔时间（秒），默认为 `19` 秒 |

#### 示例

```js
const term = new bricks.Wterm({
  ws_url: 'ws://localhost:8080/ws',
  ping_timeout: 20
});
```

#### 内部逻辑

1. 调用父类构造函数。
2. 初始化 `socket` 为 `null`。
3. 设置心跳超时时间。
4. 使用 `schedule_once` 延迟调用 `open()` 方法（避免同步阻塞）。
5. 绑定事件：
   - `'domon'` → 当元素可见时触发 `send_term_size`
   - `'domoff'` → 当元素不可见时触发 `destroy`

---

## 核心方法

### `async open()`

建立终端和 WebSocket 连接。

#### 流程说明

1. 创建 `Terminal` 实例并应用配置（包括宽高百分比等）。
2. 将终端挂载到 `this.dom_element`（由父类提供）。
3. 创建 WebSocket 连接至 `opts.ws_url`。
4. 加载 `FitAddon` 插件以实现自适应布局。
5. 调整字体大小（依赖全局 `bricks.app.charsize`）。
6. 设置 WebSocket 回调：
   - `onmessage`：接收服务器数据并写入终端
   - `onclose`：清理心跳任务
   - `onopen`：连接成功后发送初始尺寸并启动心跳
7. 监听键盘输入，转发至服务端。
8. 监听终端尺寸变化，自动同步。
9. 主动发送一次终端尺寸并聚焦。

#### 接收消息类型（来自服务端）

| 类型 | 数据结构 | 动作 |
|------|----------|------|
| `"heartbeat"` | `{ data: { type: "heartbeat" } }` | 打印日志：“connection alive” |
| `"data"` | `{ data: { type: "data", data: "..." } }` | 调用 `term.write(...)` 显示内容 |
| 其他 | 任意 | 打印原始消息内容 |

#### 发送消息类型（至服务端）

| 类型 | 数据格式 | 触发条件 |
|------|---------|----------|
| `"input"` | `{ type: "input", data: key }` | 用户按键输入 |
| `"resize"` | `{ type: "resize", width, height, rows, cols }` | 终端或窗口尺寸改变 |
| `"heartbeat"` | `{ type: "heartbeat" }` | 定期发送心跳 |

---

### `send_data(d)`

向服务器发送用户输入的数据。

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `d` | `String` | 键盘输入字符 |

#### 示例

```js
this.send_data('hello');
```

#### 实现

```js
this.socket.send(JSON.stringify({ type: "input", data: d }));
```

---

### `send_term_size()`

向服务器发送当前终端的尺寸信息。

#### 发送内容

```json
{
  "type": "resize",
  "width": <容器宽度>,
  "height": <容器高度>,
  "rows": <行数>,
  "cols": <列数>
}
```

#### 注意事项

- 若 WebSocket 尚未就绪（`readyState !== 1`），会捕获异常并打印 `'ws not ready'`。
- 在 `open()` 中被调用两次：首次连接 + 终端初始化后。

---

### `send_heartbeat()`

发送心跳包以维持连接活跃。

#### 发送内容

```json
{ "type": "heartbeat" }
```

---

### `heartbeat()`

周期性执行的心跳函数。

#### 行为逻辑

1. 检查 WebSocket 是否处于打开状态（`readyState === 1`）。
2. 如果是，则调用 `send_heartbeat()`。
3. 使用 `schedule_once` 调度下一次心跳（间隔为 `this.ping_timeout` 秒）。

> ⚠️ 此方法采用递归调度方式实现定时循环。

---

### `charsize_sizing()`

根据全局字体设置调整终端字号。

#### 依赖

```js
var cs = bricks.app.charsize; // 假设为数字（例如 14）
```

#### 实现

```js
this.term.setOption('fontSize', cs);
```

---

### `term_resize()`

响应外部容器尺寸变化的回调函数。

#### 功能

调用 `fitAddon.fit()` 让终端自适应新尺寸。

> 注释掉 `this.send_term_size()` 可能是为了防止重复发送（已在 xterm 的 `onResize` 中处理）。

---

## 资源释放与销毁

### `close_websocket()`

关闭并清理 WebSocket 连接。

#### 清理项

- 调用 `close(1000, 'close now')`
- 解除所有事件监听器
- 将 `this.socket` 设为 `null`

#### 异常处理

捕获任何错误并重置 `socket` 引用，确保不会残留无效引用。

---

### `close_terminal()`

关闭并销毁 xterm 终端实例。

#### 清理项

- 调用 `fitAddon.dispose()`
- 调用 `term.dispose()`
- 将 `this.term` 设为 `null`

---

### `destroy()`

完整销毁组件资源（响应 `'domoff'` 事件）。

#### 执行步骤

1. 打印调试日志
2. 取消心跳任务（如果存在）
3. 解绑 `element_resize` 事件
4. 关闭 WebSocket（如有）
5. 销毁终端实例（如有）

#### 日志输出示例

```text
------domoff event, destory this widget
---1--domoff event, destory this widget
---2--domoff event, destory this widget
---3--domoff event, destory this widget
```

---

## 事件绑定

| 事件名 | 触发时机 | 处理函数 |
|--------|---------|---------|
| `'domon'` | DOM 元素变为可见 | `send_term_size()` |
| `'domoff'` | DOM 元素隐藏或移除 | `destroy()` |
| `'element_resize'` | 容器尺寸变化 | `term_resize()` |

> 使用 `this.bind(event, handler)` 和 `this.unbind(...)` 管理事件。

---

## 静态注册

```js
bricks.Factory.register('Wterm', bricks.Wterm);
```

允许通过工厂模式创建实例：

```js
bricks.Factory.create('Wterm', options);
```

---

## 使用示例

```html
<div id="terminal-container" style="width:100%; height:500px;"></div>

<script>
// 假设已加载 xterm.js 和 FitAddon
const terminalWidget = new bricks.Wterm({
  ws_url: 'ws://your-terminal-server/ws/session-id',
  ping_timeout: 20
});

// 挂载到 DOM
terminalWidget.render('#terminal-container');
</script>
```

---

## 注意事项

1. **必须引入 xterm.js 和 FitAddon**
   ```html
   <script src="https://unpkg.com/xterm@5.x.x/lib/xterm.js"></script>
   <script src="https://unpkg.com/xterm-addon-fit@0.x.x/lib/FitAddon.js"></script>
   ```
2. `schedule_once(fn, delay)` 需要全局可用（通常由框架提供）。
3. 字体大小依赖 `bricks.app.charsize`，请确保其存在。
4. WebSocket 服务需支持以下协议字段：
   - `type: "input"` / `"resize"` / `"heartbeat"`
   - 并能返回 `type: "data"` 或 `"heartbeat"` 消息。

---

## 版本兼容性

| 库名 | 推荐版本 |
|------|----------|
| xterm.js | `>= 4.0.0 < 6.0.0` |
| xterm-addon-fit | 对应版本 |

---

## 总结

`bricks.Wterm` 是一个功能完整的 Web 终端组件，适用于远程 shell、在线 IDE、调试工具等场景。其设计模块化、生命周期清晰，结合 bricks 框架可轻松集成进复杂前端系统。

--- 

✅ **建议扩展方向**：
- 支持主题切换
- 添加复制粘贴快捷键拦截
- 增加连接失败重试机制
- 支持二进制数据传输（如图像）