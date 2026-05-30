# `bricks.LlmIO` 技术文档

> 本模块实现了一个基于 Web 的多模型 LLM（大语言模型）交互界面组件，支持流式/同步响应、用户输入、语音输出、反馈评分等功能。适用于构建类 ChatGPT 的对话系统。

---

## 目录

- [概述](#概述)
- [核心类结构](#核心类结构)
- [类详解](#类详解)
  - [`bricks.LlmIO`](#bricksllmio)
  - [`bricks.LlmModel`](#bricksllmmodel)
  - [`bricks.ModelOutput`](#bricksmodeloutput)
  - [`bricks.RoleOutput`](#bricksroleoutput)
- [数据格式说明](#数据格式说明)
- [事件与回调机制](#事件与回调机制)
- [扩展功能](#扩展功能)
- [使用示例](#使用示例)
- [依赖与注册](#依赖与注册)

---

## 概述

`bricks.LlmIO` 是一个复合型 UI 控件，用于集成多个 LLM 模型并统一管理用户输入和模型输出。它提供了以下能力：

- 支持添加多个 LLM 模型；
- 用户通过表单提交输入；
- 支持 **流式 (stream)**、**同步 (sync)** 和 **异步 (async)** 响应模式；
- 输出内容可动态渲染（支持模板化视图）；
- 支持 TTS（文本转语音）流式播放；
- 可对模型输出进行满意度评分（点赞/踩）；
- 自动维护会话历史（可选）；

该组件基于 `bricks.js` 框架构建，采用面向对象设计，高度可配置和可扩展。

---

## 核心类结构

| 类名 | 功能 |
|------|------|
| `bricks.LlmIO` | 主容器，管理所有模型实例和输入/输出区域 |
| `bricks.LlmModel` | 单个 LLM 模型的封装，处理请求发送与消息管理 |
| `bricks.ModelOutput` | 显示单条模型输出结果，支持富内容渲染与反馈控件 |
| `bricks.RoleOutput` *(内部基类)* | 统一用户与模型输出样式布局的基础类 |

---

## 类详解

### `bricks.LlmIO`

主控件，继承自 `bricks.VBox`，作为整个对话系统的容器。

#### 构造参数 (`opts`)

```js
{
  ws_url: String,               // WebSocket 地址（预留未使用）
  user_icon: String,            // 用户头像图标 URL
  list_models_url: String,      // 获取可用模型列表的 API 接口
  input_fields: Array,          // 输入表单字段定义（用于 bricks.Form）
  input_view: Object,           // 定义如何展示用户输入的内容（widget 描述）
  output_view: Object,          // 默认全局输出视图模板（可被模型覆盖）
  models: Array<LlmModelOpts>,  // 初始加载的模型配置数组
  tts_url: String,              // TTS 接口地址（启用语音时使用）
  estimate_url: String,         // 提交反馈评分的接口地址
  msg_css: String               // 用户消息的 CSS 类名（默认 'user_msg'）
}
```

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `ws` | `bricks.WebSocket` | 预留 WebSocket 实例（当前未实际使用） |
| `llmmodels` | `Array<bricks.LlmModel>` | 已添加的模型实例列表 |
| `title_w` | `bricks.HBox` | 顶部显示模型标签的容器 |
| `o_w` | `bricks.Filler` | 输出内容滚动区域 |
| `i_w`, `nm_w` | `bricks.Svg` | “输入” 和 “新增模型” 图标按钮 |
| `textvoice` | Boolean | 是否启用文本语音合成功能 |

#### 方法

##### `constructor(opts)`
初始化主界面，创建标题栏、输出区、底部操作按钮，并加载初始模型。

##### `show_added_model(m)`
将给定模型配置 `m` 实例化为 `LlmModel` 并加入界面。

- 若启用了 `textvoice`，自动注入 TTS 配置。
- 调用 `render_title()` 创建模型标签并插入标题栏。

##### `open_search_models(event)`
弹出模型选择弹窗（`PopupWindow`），从服务器拉取可选模型列表。

- 使用 `bricks.Cols` 展示模型卡片列表；
- 点击任一模型触发 `add_new_model()`；
- 弹窗点击后自动关闭。

##### `add_new_model(event)`
接收来自 `Cols` 的选中模型数据，将其加入 `this.models` 数组，并调用 `show_added_model()` 渲染到界面上。

##### `open_input_widget(event)`
打开输入表单弹窗，允许用户输入内容。

- 使用 `bricks.Form` 构建表单；
- 表单字段由 `input_fields` 配置；
- 提交后触发 `handle_input()`。

##### `handle_input(event)`
处理用户输入数据：

1. 调用 `show_input(params)` 显示用户输入；
2. 遍历所有 `LlmModel` 实例，若其接受 `'userinput'` 来源，则调用 `model_inputed(params)` 发起请求。

> 使用 `schedule_once` 延迟执行以避免阻塞 UI。

##### `show_input(params)`
将用户输入数据根据 `input_view` 模板渲染成可视化组件，并显示在输出区域左侧（带用户图标）。

- 支持富文本或结构化数据显示；
- 添加 CSS 类 `user_msg` 或自定义类名。

---

### `bricks.LlmModel`

表示一个具体的 LLM 模型实例，负责请求发送、消息管理和响应解析。

#### 构造参数 (`opts`)

```js
{
  icon: String,
  model: String,                  // 模型名称
  url: String,                    // 请求后端 API 地址
  output_view: Object|String,     // 输出渲染模板（widget 描述）
  params: Object,                 // 固定请求参数
  user_message_format: Object,    // 用户消息格式模板
  system_message_format: Object,  // 系统消息格式模板
  llm_message_format: Object,     // 模型回复消息格式模板
  use_session: Boolean,           // 是否保持会话上下文
  input_from: String,             // 接收输入来源标识（如 'userinput'）
  textvoice: Boolean,             // 是否启用 TTS
  tts_url: String,                // TTS 流地址
  response_mode: 'stream'|'sync'|'async'  // 响应模式
}
```

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `llmio` | `bricks.LlmIO` | 所属父容器 |
| `messages` | Array | 当前会话的历史消息（遵循 OpenAI 类似格式） |
| `resp_data` | Object | 最终完整响应数据（用于 sync 模式拼接） |

#### 方法

##### `constructor(llmio, opts)`
初始化模型实例，设置默认消息格式。

##### `render_title()`
生成模型标题栏组件（HBox），包含图标和点击事件绑定（未来可用于配置面板）。

##### `inputdata2uploaddata(data)`
将原始输入数据转换为适合发送给后端的格式：

- 支持 `FormData` 或普通对象；
- 自动追加 `model`, `modelinstanceid`, `modeltypeid`, `messages` 等字段；
- 若定义了 `user_message_format`，则按模板格式化用户消息并推入 `messages`。

##### `model_inputed(data)`
主入口方法：当收到用户输入时触发。

根据 `response_mode` 分支处理：

| 模式 | 处理方式 |
|------|---------|
| `stream` / `async` | 使用 `HttpResponseStream` 分块接收流式响应，逐段更新输出 |
| `sync` | 使用 `HttpJson` 一次性获取完整响应，并整体更新 |

> 在流式模式下，每收到一段数据都会调用 `chunk_response()` 更新 UI。

##### `is_accept_source(source)`
判断是否接受指定来源的输入（目前仅支持 `'userinput'`）。

##### `llm_msg_format()`
返回模型回复消息的标准格式，默认为：
```json
{ "role": "assistant", "content": "${content}" }
```

##### `chunk_response(mout, line)`
处理流式响应中的每一个数据块：

- 解析 JSON；
- 过滤空内容；
- 转义特殊字符；
- 调用 `mout.update_data(d)` 实时更新输出；
- 累积内容至 `this.resp_data`。

##### `chunk_ended()`
流式响应结束后，将最终累积的内容按 `llm_msg_format` 格式化并压入 `messages` 数组，完成上下文保存。

---

### `bricks.ModelOutput`

继承自 `RoleOutput`，专门用于显示 **LLM 模型的输出内容**。

#### 构造参数 (`opts`)

```js
{
  icon: String,
  model: String,
  estimate_url: String,       // 提交评分的接口地址
  output_view: Object|String, // 输出内容渲染模板
  textvoice: Boolean,
  tts_url: String
}
```

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `img` | `bricks.Svg` | 模型图标 |
| `filler` | `bricks.VBox` | 内容填充区域 |
| `run` | `bricks.BaseRunning` | 加载动画（请求中状态） |
| `estimate_w` | `bricks.HBox` | 满意度评价组件（点赞/踩） |
| `upstreaming` | `bricks.UpStreaming` | TTS 流上传器（语音播报） |
| `logid` | String | 日志 ID（用于反馈关联） |

#### 方法

##### `constructor(opts)`
初始化输出框：

- 创建头部模型信息行（图标 + 名称）；
- 创建内容区域（含加载动画）；
- 若是 LLM 角色，创建左右留白；
- 调用 `build_estimate_widgets()` 创建评价控件（如果配置了 `estimate_url`）。

##### `build_estimate_widgets()`
构建“结果满意吗？”评价组件：

- 包含文字提示、“赞”和“踩”SVG图标；
- 绑定点击事件到 `estimate_llm(val)`；
- 初始隐藏，待有 `logid` 时再显示。

##### `estimate_llm(val, event)`
提交用户评分：

- 构造 `urlwidget` 请求描述；
- 参数包括 `logid` 和评分值（1=满意，-1=不满意）；
- 动态创建 widget 发起请求；
- 提交后禁用按钮防止重复提交。

##### `update_data(data)`
更新输出内容：

- 移除加载动画；
- 启动 TTS 流（如有配置）；
- 使用 `output_view` 模板结合 `data` 数据构建 UI 组件；
- 将组件添加到 `filler` 中；
- 若存在 `logid`，显示评价组件。

> 支持 `output_view` 为字符串（JSON 字符串）或对象。

##### `finish()`
结束 TTS 流传输。

---

### `bricks.RoleOutput`

> ⚠️ 注意：代码中存在语法错误 —— `defautl_icon` 应为 `default_icon`

`ModelOutput` 的基类，也用于用户输出（但未导出独立类）。统一管理角色输出的布局结构。

#### 共享特性

- 左侧图标（用户 or LLM）；
- 内容区域居中对齐；
- 左右两侧空白图标占位（实现对话气泡错位效果）；
- 支持动态内容更新。

---

## 数据格式说明

### `output_view` 结构

用于定义模型输出的 UI 渲染模板，是一个标准的 `bricks.widget` 描述对象：

```js
{
  widgettype: "Text",
  options: {
    text: "${content}",
    wrap: true
  }
}
```

支持变量插值（`${xxx}`），由 `bricks.apply_data(template, data)` 替换。

### `input_view` 结构

同上，用于渲染用户输入内容。

### 消息格式（`messages` 数组项）

```js
{
  role: 'user' | 'system' | 'assistant',
  content: String
}
```

可通过 `user_message_format`、`llm_message_format` 自定义格式。

---

## 事件与回调机制

| 事件名 | 触发条件 | 示例 |
|--------|----------|------|
| `record_click` | Cols 中某条记录被点击 | 添加新模型 |
| `submit` | Form 提交 | 处理用户输入 |
| `click` | SVG 按钮点击 | 打开输入窗、添加模型 |
| 自定义绑定 | 如 `likew.bind('click', ...)` | 提交评分 |

---

## 扩展功能

### ✅ 流式响应支持
通过 `HttpResponseStream` 实现 SSE 或分块传输解码，实时更新输出。

### ✅ 文本转语音（TTS）
利用 `UpStreaming` 组件边生成边播放音频流，提升交互体验。

### ✅ 用户反馈评分
提供“点赞/踩”按钮，收集用户对模型输出质量的反馈。

### ✅ 多模型共存
支持同时运行多个模型，各自独立维护上下文。

### ✅ 模板化渲染
使用 `apply_data()` 实现数据驱动的 UI 渲染，灵活支持 Markdown、代码块等复杂内容。

---

## 使用示例

```js
var llmio = new bricks.LlmIO({
  user_icon: '/icons/user.png',
  list_models_url: '/api/models/list',
  input_fields: [
    { name: 'prompt', type: 'textarea', label: '请输入问题' }
  ],
  input_view: {
    widgettype: 'Text',
    options: { text: '${prompt}', css: 'user-input' }
  },
  estimate_url: '/api/feedback/rate',
  tts_url: '/api/tts/stream',
  models: [{
    model: 'gpt-3.5-turbo',
    icon: '/icons/gpt.svg',
    url: '/api/llm/chat',
    output_view: {
      widgettype: 'Markdown',
      options: { source: '${content}' }
    },
    response_mode: 'stream',
    input_from: 'userinput',
    use_session: true
  }]
});

document.body.appendChild(llmio.dom);
```

---

## 依赖与注册

```js
bricks.Factory.register('LlmIO', bricks.LlmIO);
```

确保该组件可通过工厂方式动态创建：

```js
bricks.widgetBuild({ widgettype: 'LlmIO', options: {...} });
```

---

## 已知问题与改进建议

| 问题 | 建议修复 |
|------|---------|
| `defautl_icon` 拼写错误 → 应为 `default_icon` | 修正拼写 |
| `opts` 在 `model_inputed` 中引用错误（应为 `this.opts`） | 修改为 `this.opts.use_session` |
| `ws` 成员未实际使用 | 删除或补充 WebSocket 支持逻辑 |
| `handle_input` 中注释掉 `await` 可能导致并发问题 | 建议保留 `await` 或明确使用异步调度 |

---

## 版本信息

- 编写日期：2025年4月
- 框架版本：`bricks.js` （假设）
- 作者：Auto-generated from source code

--- 

✅ **文档完**