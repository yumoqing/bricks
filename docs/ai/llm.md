# LlmMsgAudio

**控件功能**：用于处理语音消息流，支持中文与非中文标点分段，并通过音频播放器播放模型返回的语音响应。  
**类型**：普通控件  
**父类控件**：`bricks.UpStreaming`

## 初始化参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| opts | Object | 传递给父类的配置选项，由 `UpStreaming` 处理 |

> 注意：该控件内部初始化了以下属性：
> - `olddata` / `data`：用于累积文本数据
> - `cn_p` / `other_p`：中英文常见标点符号数组
> - `audio`：使用 `AudioPlayer({})` 创建的音频播放实例

## 主要事件

无显式绑定事件，但重写了以下方法参与数据流处理：
- `send(data)`：接收增量文本，按语言标点切分并发送可播放片段
- `go()`：发起请求并设置音频源，基于响应内容播放语音

---

# ModelOutput

**控件功能**：展示大模型输出内容，支持动态更新、运行状态指示、用户反馈评分（点赞/点踩），并集成 TTS 语音播放能力。  
**类型**：容器控件  
**父类控件**：`bricks.VBox`

## 初始化参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| opts.modelname | String | 否 | 显示的模型名称 |
| opts.icon | String | 否 | 模型图标 URL，缺省使用默认 LLM 图标 |
| opts.response_mode | String | 否 | 响应模式：`stream`, `sync`, `async` |
| opts.estimate_url | String | 否 | 提交用户评价的接口地址（用于点赞/点踩） |
| opts.textvoice | Boolean | 否 | 是否启用语音朗读功能 |
| opts.tts_url | String | 否 | TTS 服务接口地址，用于生成语音 |

## 主要事件

| 事件名 | 触发条件 | 回调函数 |
|--------|---------|--------|
| click (on like icon) | 用户点击“点赞”图标 | `estimate_llm(icon, 1)` |
| click (on unlike icon) | 用户点击“点踩”图标 | `estimate_llm(icon, -1)` |

> 其他行为：
> - `update_data(data)`：接收模型输出数据并更新显示内容
> - `finish()`：流结束时调用，目前仅打印日志

---

# LlmModel

**控件功能**：封装单个大模型的调用逻辑，包括输入预处理、请求发送、响应流处理及结果渲染。支持多种交互模式（同步/流式/异步）。  
**类型**：普通控件  
**父类控件**：`bricks.JsWidget`

## 初始化参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| llmio | Object | 是 | 所属的 `LlmIO` 实例，用于共享配置 |
| opts.model | String | 是 | 模型标识符 |
| opts.modelname | String | 是 | 显示名称 |
| opts.url | String | 是 | 模型 API 地址 |
| opts.icon | String | 否 | 自定义图标路径 |
| opts.params | Object | 否 | 额外请求参数 |
| opts.user_message_format | String | 否 | 用户消息模板格式 |
| opts.system_message_format | String | 否 | 系统消息模板格式 |
| opts.llm_message_format | Object | 否 | 助手消息结构定义 |
| opts.use_session | Boolean | 否 | 是否保持会话上下文 |
| opts.input_from | String | 否 | 输入来源标识 |
| opts.textvoice | Boolean | 否 | 是否启用语音输出 |
| opts.tts_url | String | 否 | TTS 接口地址 |
| opts.response_mode | String | 是 | 请求模式：`stream`, `sync`, `async` |

## 主要事件

| 事件名 | 触发条件 | 回调函数 |
|--------|----------|--------|
| click (on title) | 点击模型标题区域 | `show_setup_panel(event)` —— 子类可扩展 |

> 内部关键方法：
> - `model_inputed(data)`：接收到输入数据后触发模型请求
> - `chunk_response(mout, line)`：处理流式响应中的每一个数据块
> - `is_accept_source(source)`：判断是否接受某来源的数据

---

# LlmIO

**控件功能**：作为整体 LLM 交互界面的核心容器，管理多个模型实例、输入弹窗、知识库配置、用户输入和输出展示。提供统一入口控制多模型协同工作。  
**类型**：容器控件  
**父类控件**：`bricks.VBox`

## 初始化参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| opts.user_icon | String | 否 | 用户头像图标 URL |
| opts.list_models_url | String | 否 | 获取可用模型列表的接口地址 |
| opts.input_fields | Array | 是 | 表单字段定义（如 prompt、temperature 等） |
| opts.models | Array | 是 | 初始加载的模型配置数组 |
| opts.tts_url | String | 否 | 全局 TTS 服务地址 |
| opts.get_kdb_url | String | 否 | 获取知识库列表的接口地址 |
| opts.estimate_url | String | 否 | 用户反馈提交地址 |
| opts.enabled_kdb | Boolean | 否 | 是否启用知识库增强功能 |

> 示例 `models` 结构：
> ```js
> {
>   model: "qwen",
>   modelname: "通义千问",
>   url: "/api/llm/qwen",
>   response_mode: "stream"
> }
> ```

## 主要事件

| 事件名 | 触发条件 | 回调函数 |
|--------|----------|--------|
| click (i_w) | 点击输入按钮 | `open_input_widget(event)` —— 弹出输入表单 |
| click (nm_w) | 点击添加模型按钮 | `open_search_models(event)` —— 弹出模型选择面板 |
| click (kdb_w) | 点击知识库设置按钮 | `setup_kdb(event)` —— 打开 KDB 配置表单 |
| submit (in form) | 用户提交输入表单 | `handle_input(event)` —— 分发输入至各模型 |
| record_click (in Cols) | 选择一个模型记录 | `add_new_model(event)` —— 添加新模型实例 |
| submit (in kdb form) | 提交知识库配置 | `handle_kdb_setup(event)` —— 保存配置并应用 |

> 其他核心行为：
> - `show_input(params)`：在聊天区显示用户输入
> - `show_added_model(m)`：注册并展示一个新的模型实例

