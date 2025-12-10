# `bricks.js` 技术文档：LlmDialog 模块

> **版本**：1.0  
> **模块名称**：`LlmDialog`, `LlmMsgBox`, `UserMsgBox`, 工具函数 `escapeSpecialChars`  
> **依赖框架**：`bricks.js` 前端组件库（基于类的 UI 架构）

---

## 📚 概述

该模块提供了一套用于构建与 LLM（大语言模型）交互对话界面的组件系统，支持多模型并行响应、流式/同步响应模式、Markdown 渲染以及消息内容转义。主要包含以下核心类：

- `bricks.escapeSpecialChars`：字符串特殊字符转义工具。
- `bricks.UserMsgBox`：用户消息展示组件。
- `bricks.LlmMsgBox`：LLM 回应消息展示及请求处理组件。
- `bricks.LlmDialog`：主对话容器，管理整个对话流程。

此外，通过 `bricks.Factory.register` 注册了 `LlmDialog` 以便动态创建。

---

## 🔧 工具函数

### `bricks.escapeSpecialChars(s)`

对输入字符串中的特殊字符进行反斜杠转义，常用于防止 JSON 注入或确保文本安全输出。

#### 参数
| 参数 | 类型   | 描述         |
|------|--------|--------------|
| `s`  | string | 待转义字符串 |

#### 返回值
- **类型**：`string`
- 转义后的字符串，适用于嵌入 JSON 或 HTML 环境。

#### 支持转义的字符
| 字符 | 原始表示 | 转义后表示     | 说明               |
|------|----------|----------------|--------------------|
| `\`  | `\`      | `\\`           | 反斜杠             |
| `"`  | `"`      | `\"`           | 双引号             |
| `\n` | 换行     | `\n`           | 换行符             |
| `\r` | 回车     | `\r`           | 回车符             |
| `\t` | 制表符   | `\t`           | Tab                |
| `\f` | 换页     | `\f`           | Form feed          |
| `\v` | 垂直制表 | `\v`           | Vertical tab       |
| `\0` | 空字符   | `\0`           | Null byte          |

> ⚠️ 注意：单引号 `'` 的转义代码被注释，当前未启用。

#### 示例
```js
bricks.escapeSpecialChars('Hello "world"\n'); 
// 输出: 'Hello \\"world\\"\\n'
```

---

## 💬 用户消息组件：`UserMsgBox`

继承自 `bricks.HBox`，用于显示用户发送的消息。

### 继承关系
```js
class UserMsgBox extends bricks.HBox
```

### 构造函数：`constructor(opts)`

#### 参数 `opts`
| 属性       | 类型   | 必需 | 默认值                     | 描述                         |
|------------|--------|------|----------------------------|------------------------------|
| `icon`     | string | 否   | `imgs/chat-user.svg`       | 用户头像 SVG 图标 URL        |
| `prompt`   | string | 是   | -                          | 用户输入的消息内容           |
| `msg_css`  | string | 否   | `'user_msg'`               | 应用到消息体的 CSS 类名      |

#### 内部结构
1. 创建一个 SVG 头像图标（使用 `bricks.Svg`）。
2. 使用 `MdWidget` 显示 Markdown 格式消息。
3. 添加左侧空白图标占位符（`BlankIcon`），保持布局对齐。
4. 消息排列顺序：`[BlankIcon] ← [消息内容] ← [用户头像]`

#### 示例实例化
```js
new bricks.UserMsgBox({
  prompt: "你好，请介绍一下你自己。",
  icon: "/icons/user.svg",
  msg_css: "custom-user-style"
});
```

---

## 🤖 LLM 消息组件：`LlmMsgBox`

继承自 `bricks.HBox`，用于展示 LLM 的回复，并支持流式和同步两种响应方式。

### 继承关系
```js
class LlmMsgBox extends bricks.HBox
```

### 构造函数：`constructor(opts)`

#### 参数 `opts`
| 属性            | 类型     | 必需 | 默认值                  | 描述                                                                 |
|------------------|----------|------|-------------------------|----------------------------------------------------------------------|
| `model`          | string   | 是   | -                       | 使用的模型名称（如 `gpt-3.5-turbo`）                                 |
| `mapi`           | string   | 是   | -                       | API 类型标识（可用于后端路由判断）                                   |
| `url`            | string   | 是   | -                       | 请求后端接口地址                                                     |
| `icon`           | string   | 否   | `imgs/user.png`         | LLM 头像图标 URL                                                    |
| `msg_css`        | string   | 否   | `'llm_msg'`             | 消息区域应用的 CSS 类                                                |
| `response_mode`  | string   | 否   | `'stream'`              | 响应模式：`'stream'`, `'sync'`, `'async'`                            |
| `user_msg`       | object   | 否   | `{role:'user', content:"${prompt}"}` | 用户消息模板，支持 `${prompt}` 插值                                |
| `llm_msg`        | object   | 否   | `{role:'assistant', content:"${content}"}` | LLM 消息模板，支持 `${content}` 插值                             |

#### 内部初始化逻辑
- 创建头像图标（SVG）
- 初始化 `MdWidget` 显示消息内容
- 加载 `BaseRunning` 动画组件（在响应中显示加载状态）
- 初始化消息历史数组 `this.messages = []`

#### 消息排列顺序
`[LLM头像] → [运行动画] → [消息内容] → [空白占位符]`

---

### 方法列表

#### `responsed()`
标记响应已开始，停止加载动画，移除运行指示器。

```js
this.run.stop_timepass();
this.remove_widget(this.run);
```

#### `user_msg_format()`
生成用户消息对象格式。

- 若设置了 `this.user_msg`，则返回其值；
- 否则返回默认模板：`{role: 'user', content: "${prompt}"}`

> 实际内容将在调用时通过 `bricks.apply_data()` 替换 `${prompt}`。

#### `llm_msg_format()`
生成 LLM 消息对象格式。

- 若设置了 `this.llm_msg`，返回其值；
- 否则返回：`{role: 'assistant', content: "${content}"}`

#### `chunk_response(l)`
处理流式响应中的每一个数据块（chunk）。

##### 参数
- `l`: JSON 字符串片段（通常来自 ReadableStream）

##### 行为
1. 解析 JSON 数据。
2. 若无 `content` 字段或为空，忽略。
3. 累加内容至当前消息。
4. 更新 `MdWidget` 内容。
5. 触发 `updated` 事件。

#### `chunk_ended()`
流式响应结束后，将最终内容保存为结构化消息并推入 `messages` 数组。

- 调用 `escapeSpecialChars` 对内容转义
- 使用 `apply_data` 填充模板
- 推入 `this.messages`

#### `async set_prompt(prompt)`
发起对 LLM 的请求。

##### 参数
- `prompt`: 用户输入文本（自动转义）

##### 流程
1. 将用户消息按模板格式化并加入 `messages`。
2. 准备请求参数：
   ```js
   {
     messages: this.messages,
     mapi: this.mapi,
     model: this.model
   }
   ```
3. 根据 `response_mode` 执行不同请求策略：

| 模式      | 行为说明 |
|-----------|---------|
| `stream`  | 使用 `HttpResponseStream` 发起 POST 请求，逐块接收并渲染 |
| `sync`    | 使用 `HttpJson` 同步获取完整响应，一次性渲染结果 |
| 其他      | 不做任何操作（预留扩展） |

##### 示例调用
```js
await llmMsgBox.set_prompt("请写一首关于春天的诗");
```

---

## 🧩 主对话框组件：`LlmDialog`

继承自 `bricks.VBox`，是完整的聊天对话界面容器，支持多模型同时响应。

### 继承关系
```js
class LlmDialog extends bricks.VBox
```

### 构造函数：`constructor(opts)`

#### 参数 `opts`
| 属性             | 类型     | 必需 | 默认值         | 描述                                                                 |
|------------------|----------|------|----------------|----------------------------------------------------------------------|
| `models`         | array    | 是   | -              | 模型配置数组，每个元素定义一个 LLM 模型                              |
| `response_mode`  | string   | 否   | `'stream'`     | 全局响应模式：`'stream'`, `'sync'`, `'async'`                        |
| `user_msg_css`   | string   | 否   | `'user_msg'`   | 用户消息使用的 CSS 类                                               |
| `user_icon`      | string   | 否   | -              | 用户头像图标路径                                                    |
| `title_ccs`      | string   | 否   | `'llm_title'`  | 标题栏 CSS 类（拼写疑似错误，应为 `title_css`）                     |
| `height`         | string   | 否   | `'100%'`       | 容器高度                                                            |

#### `models` 数组项结构
```js
{
  model: "gpt-3.5-turbo",
  mapi: "openai",
  url: "/api/openai/chat",
  icon: "/icons/gpt.svg",
  css: "gpt-response",
  user_msg: { role: "user", content: "${prompt}" },
  llm_msg: { role: "assistant", content: "${content}" }
}
```

---

### 方法列表

#### `show_models_info()`
遍历所有模型，调用 `show_model_info(model)` 在标题栏显示模型信息。

#### `show_model_info(model)`
在顶部标题区添加一个 HBox，包含模型图标和名称。

- 使用 `Svg` 显示图标
- 使用 `Text` 显示模型名
- 存储引用到 `this.model_info_ws[model.model]`

#### `add_model(model)`
动态添加新模型配置，并立即显示在标题栏。

#### `delete_model(model)`
根据 `model.model` 名称删除模型及其视图。

#### `async set_prompt(prompt)`
主入口方法：发送用户消息并触发所有模型响应。

##### 步骤
1. 转义用户输入。
2. 创建并添加 `UserMsgBox` 到滚动面板。
3. 调用 `llm_request(prompt)` 并等待完成。
4. 自动滚动到底部。

#### `async llm_request(prompt)`
为每个注册的模型创建一个 `LlmMsgBox`，并异步启动请求。

- 使用 `schedule_once(fn, 0.1)` 延迟执行以避免阻塞 UI
- 所有模型并行响应

---

### 事件机制

#### `llm_answer` 事件
当某个模型完成响应后，可通过监听此事件获取回答内容。

> ❗ 当前代码中未显式触发 `llm_answer` 事件，需补充如下代码才能生效：
```js
// 在 chunk_ended 或 sync 响应结束处添加：
this.fire('llm_answer', { content: txt });
```

建议增强事件通知能力。

---

## 🏗️ 工厂注册

```js
bricks.Factory.register('LlmDialog', bricks.LlmDialog);
```

允许通过字符串标识动态创建组件：
```js
var dialog = bricks.Factory.create('LlmDialog', options);
```

---

## ✅ 使用示例

```js
var dialog = new bricks.LlmDialog({
  height: '600px',
  user_icon: '/icons/me.svg',
  title_ccs: 'chat-title',
  response_mode: 'stream',
  models: [
    {
      model: 'gpt-3.5-turbo',
      mapi: 'openai',
      url: '/api/chat',
      icon: '/icons/gpt.svg',
      css: 'gpt-msg',
      user_msg: { role: 'user', content: '${prompt}' },
      llm_msg: { role: 'assistant', content: '${content}' }
    },
    {
      model: 'claude-2',
      mapi: 'anthropic',
      url: '/api/anthropic',
      icon: '/icons/claude.svg',
      css: 'claude-msg'
    }
  ]
});

document.body.appendChild(dialog.dom_element);

// 发送消息
dialog.set_prompt("解释什么是机器学习");
```

---

## 📝 注意事项与改进建议

| 项目 | 说明 |
|------|------|
| 🔐 安全性 | `escapeSpecialChars` 有助于防止注入，但建议结合 DOMPurify 或其他 sanitizer 进一步防护 XSS |
| 🧩 单引号转义 | 被注释掉，若需兼容 SQL 或属性字符串场景，建议启用 |
| 🎯 事件缺失 | `llm_answer` 事件未实际触发，建议在 `chunk_ended()` 中补全 |
| 🖼️ 图标资源 | 依赖 `bricks_resource()` 函数解析静态资源路径，需确保其存在 |
| ⏳ 异步控制 | `schedule_once(..., 0.1)` 是一种 Hack，可考虑改为 `queueMicrotask` 或 `Promise.resolve().then()` |
| 📏 布局兼容 | 使用 Flexbox（HBox/VBox），确保父级容器设置正确尺寸 |

---

## 📚 总结

本模块提供了完整的前端 LLM 聊天对话解决方案，具备以下特性：

✅ 多模型支持  
✅ 流式 & 同步响应  
✅ Markdown 渲染  
✅ 自动滚动与加载动画  
✅ 可扩展模板机制  

适合集成进低代码平台、AI 助手界面、多模型对比测试工具等场景。

--- 

> 文档版本：1.0  
> 最后更新：2025年4月5日