# `bricks.QAFrame` 技术文档

> 一个基于 WebSocket 的问答交互框架组件，支持多媒体课件展示、题目呈现与用户答案提交。

---

## 概述

`bricks.QAFrame` 是 `bricks` UI 框架中的一个复合组件类，继承自 `bricks.VBox`。它用于构建一个完整的**问答互动界面**，通过 WebSocket 与后端服务通信，支持以下功能：

- 展示多媒体课件（视频、音频、图片、Markdown）
- 显示问题并接收用户输入（文本或语音）
- 控制答题流程（开始确认、题目切换、结果反馈等）

该组件广泛适用于在线教育、智能测评和互动学习场景。

---

## 继承关系

```
bricks.QAFrame → bricks.VBox → bricks.Widget
```

---

## 构造函数

```js
new bricks.QAFrame(options)
```

### 参数：`options` (Object)

| 属性名         | 类型     | 必填 | 描述 |
|----------------|----------|------|------|
| `ws_url`       | String   | 是   | WebSocket 连接地址 |
| `ws_params`    | Object   | 否   | WebSocket 查询参数对象，将被序列化为 URL 查询字符串 |
| `title`        | String   | 否   | 页面标题（未在代码中使用，保留字段） |
| `description`  | String   | 否   | 描述信息（未在代码中使用，保留字段） |
| `courseware`   | Object   | 否   | 初始课件配置，结构见下文 |

#### `courseware` 子属性

| 属性名    | 类型     | 可选值                     | 描述 |
|-----------|----------|----------------------------|------|
| `type`    | String   | `"audio"`, `"video"`, `"image"`, `"markdown"` | 媒体类型 |
| `url`     | String   | -                          | 资源 URL |
| `timeout` | Number   | 秒数，0 表示无超时         | 自动跳转时间 |

> 示例：
> ```js
> courseware: {
>   type: 'video',
>   url: '/media/intro.mp4',
>   timeout: 30
> }
> ```

---

## 内部结构布局

`QAFrame` 使用垂直布局容器（VBox），包含三个主要区域：

| 区域      | 组件          | 功能说明 |
|-----------|---------------|----------|
| `top_w`   | `HBox`        | 顶部工具栏区域（可显示题号） |
| `main_w`  | `Filler`      | 主内容区，动态加载课件或问题 |
| `bottom_w`| `HBox`        | 底部操作区，放置按钮或输入控件 |

---

## WebSocket 通信协议

`QAFrame` 通过内置的 `bricks.WebSocket` 实例与服务器进行双向通信。

### WebSocket 初始化

自动拼接 `ws_params` 成查询字符串：

```js
const url = this.ws_url + '?' + new URLSearchParams(this.ws_params).toString();
this.ws = new bricks.WebSocket({ ws_url: url });
```

### 监听事件绑定

| 事件名           | 回调方法             | 触发时机 |
|------------------|----------------------|---------|
| `onopen`         | `start_question_answer()` | WebSocket 连接建立时 |
| `onquestion`     | `show_question(d)`   | 收到新问题数据 |
| `oncourseware`   | `show_courseware(d)` | 收到课件数据 |
| `onaskstart`     | `show_conform(d)`    | 请求用户确认开始 |

> ⚠️ 注意：`oncourseware` 被重复绑定三次 —— 此为冗余代码，建议优化。

---

## 接收消息格式（Server → Client）

由 WebSocket 推送的消息通过 `data` 字段传递，`type` 标识消息类型。

| 编号 | 类型            | `data` 结构 | 说明 |
|------|------------------|-------------|------|
| 1    | `courseware`     | `{ type, url }` | 播放指定类型的媒体资源 |
| 2    | `askready`       | `{ total_q, cur_q }` | 提示准备开始第几题 |
| 3    | `question`       | `{ q_desc, total_q, cur_q }` | 显示具体问题 |
| 4    | `result`         | `{ total_q, correct_cnt, error_cnt }` | 显示答题结果统计 |
| 5    | `error_list`     | `{ error_cnt, rows: [...] }` | 错误详情列表 |

### `error_list.rows[]` 元素结构

| 字段        | 类型   | 说明 |
|-------------|--------|------|
| `pos`       | Number | 题目位置索引 |
| `q_desc`    | String | 题干描述 |
| `your_a`    | String | 用户答案 |
| `corrent_a` | String | 正确答案 |
| `error_desc`| String | 错误原因说明 |

---

## 发送消息格式（Client → Server）

| 编号 | 类型             | `data` 值 | 触发方式 |
|------|-------------------|-----------|----------|
| 1    | `qa_start`        | `null` 或 `{ d: "test data", v: 100 }` | 点击“开始”或连接打开时自动发送 |
| 2    | `conform_start`   | `null` | 用户点击“Start?”按钮触发 |
| 3    | `text_answer`     | `{ texta: "用户输入内容" }` | 文本输入框失去焦点时 |
| 4    | `audio_answer`    | Base64 编码的音频 Blob | 录音结束时自动发送 |

> 示例：
> ```js
> { type: 'text_answer', data: 'Hello world' }
> { type: 'audio_answer', data: 'base64:...' }
> ```

---

## 核心方法说明

### `show_question(d)`

显示一道新问题。

#### 参数
- `d`: `{ q_desc, total_q, cur_q }`

#### 行为
- 更新顶部题号显示（需确保已创建 `qtotal_w` 和 `qcur_w`，当前代码缺失定义）
- 使用 `widgetBuild` 解析 `q_desc` 内容生成子组件
- 添加至主区域

> ✅ 支持富内容渲染（如 HTML、自定义组件）

---

### `show_courseware(d)`

播放指定课件资源。

#### 参数
- `d`: `{ type, url }`

#### 支持类型
| 类型       | 组件               | 特性 |
|------------|--------------------|------|
| `video`    | `bricks.Video`     | 全屏自动播放 |
| `audio`    | `bricks.AudioPlayer` | 自动播放 |
| `image`    | `bricks.Image`     | 全屏展示 |
| `markdown` | `bricks.MdWidget`  | 加载远程 `.md` 文件 |

> 所有组件均设置宽高为 `100%`，适应容器。

---

### `show_conform(d)`

显示“是否开始”确认按钮。

#### 行为
- 清空主区域
- 添加一个标签为 `"Start ?"` 的按钮
- 绑定点击事件调用 `start_question_answer()`

---

### `start_question_answer()`

向服务端发送启动信号。

```js
this.ws.send({
  type: 'qa_start',
  data: { d: 'test data', v: 100 }
});
```

通常由 `WebSocket.onopen` 或用户点击触发。

---

### `conform_start()`

发送用户确认开始指令。

```js
this.ws.send({
  type: 'conform_start',
  data: null
});
```

---

### `send_text_answer(e)`

处理文本答案提交。

#### 参数
- `e.data.texta`: 用户输入文本

#### 流程
- 获取输入值
- 发送 `text_answer` 消息

> 绑定于 `StrInput` 的 `blur` 事件（失焦即提交）

---

### `send_audio_answer(e)`

异步处理录音答案提交。

#### 参数
- `e.data.audio`: Blob 音频数据

#### 流程
1. 将 Blob 转为 Base64 字符串（依赖 `blobToBase64` 函数）
2. 发送 `audio_answer` 消息

> ⚠️ 注意：`send_audio_data` 方法未定义，应为笔误，实际应为 `send_audio_answer`

---

### `build_input_widgets()`

构建底部输入控件区。

#### 创建组件
- `StrInput`: 文本输入框（name=`texta`，样式填充）
- `AudioRecorder`: 语音录制按钮（带图标动画）

#### 事件绑定
- 文本框失焦 → `send_text_answer`
- 录音结束 → `send_audio_answer`（原写错为 `send_audio_data`）

> ❗ 注释部分包含图像/视频采集功能预留接口（SVG 图标），目前未启用。

---

### `play_course()`

【未使用】根据 `this.courseware` 播放初始课程内容。

> 当前逻辑中未调用此方法。若需启用，应在构造函数中补充调用。

---

### `build_startbtn()`

构建底部“press to start”按钮。

> 当前未在构造函数中调用，可能用于手动控制启动流程。

---

## 工厂注册

```js
bricks.Factory.register('QAFrame', bricks.QAFrame);
```

允许通过工厂模式按名称创建实例：

```js
bricks.create({ type: 'QAFrame', ws_url: 'ws://localhost:8080' });
```

---

## 使用示例

```html
<div id="qa-container"></div>
<script>
  const qa = new bricks.QAFrame({
    ws_url: 'ws://example.com/ws/qa',
    ws_params: {
      session_id: 'abc123',
      user_id: 'u456'
    },
    courseware: {
      type: 'video',
      url: '/intro.mp4',
      timeout: 15
    }
  });

  document.getElementById('qa-container').appendChild(qa.root());
</script>
```

---

## 已知问题与改进建议

| 问题 | 描述 | 建议 |
|------|------|------|
| `qtotal_w` / `qcur_w` 未定义 | `show_question` 中尝试调用 `.set_text()`，但未初始化这些 widget | 应在构造函数中创建并加入 `top_w` |
| `oncourseware` 多次绑定 | 同一事件监听器重复注册三次 | 保留一次即可 |
| `send_audio_data` 调用错误 | `bind('record_ended')` 指向不存在的方法 | 改为 `this.send_audio_answer.bind(this)` |
| `play_course()` 未调用 | 初始化课件无法自动播放 | 在合适时机调用（如构造末尾判断是否存在 `courseware`） |
| `StrInput` 工厂调用不明确 | `StrInput({...})` 不符合常规语法 | 应为 `new bricks.StrInput(...)` 或使用 `widgetBuild` |

---

## 总结

`bricks.QAFrame` 是一个功能完整、结构清晰的互动问答组件，具备以下优势：

✅ 支持多种媒体格式  
✅ 实时双向通信  
✅ 模块化设计便于扩展  
✅ 适合嵌入式教学系统

建议修复上述问题以提升稳定性和可维护性。

--- 

*文档版本：v1.0*  
*最后更新：2025年4月*