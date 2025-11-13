以下是根据你提供的源码和文档规范，为 `bricks.LlmIO` 控件编写的 **Markdown 格式控件文档示例**。由于源码中注册了多个控件（如 `LlmMsgAudio`, `ModelOutput`, `LlmModel`, `LlmIO`），我们以 **`LlmIO` 为主控件进行完整示例编写**，其他控件可依此模板类推。

---

# LlmIO

用于构建多模型语言模型输入输出交互界面的容器控件，支持动态添加语言模型、配置知识库（KDB）、输入数据并分发给各模型处理，适用于聊天机器人、AI助手等场景。  
类型：**容器控件**，继承自 `bricks.VBox`

## 主要方法

| 方法名 | 说明 |
|-------|------|
| `show_added_model(m)` | 将指定模型配置对象渲染为 `LlmModel` 实例并显示在顶部标题栏 |
| `open_search_models(event)` | 打开弹窗，通过 `Cols` 组件加载可用模型列表供用户选择 |
| `add_new_model(event)` | 处理模型选择事件，将新模型加入 `this.models` 并调用 `show_added_model` 显示 |
| `setup_kdb(event)` | 打开知识库配置弹窗，允许用户设置 KDB 参数及提示词模板 |
| `handle_kdb_setup(event)` | 接收表单提交的 KDB 配置并保存到 `this.kdb_setting` |
| `open_input_widget(event)` | 打开输入表单弹窗，供用户填写输入内容 |
| `handle_input(event)` | 处理输入提交，广播输入数据到所有已加载的 `LlmModel` 实例 |
| `show_input(params)` | 在输出区域显示用户的输入内容卡片 |

## 主要事件

| 事件名 | 触发时机 | 携带参数 |
|--------|---------|----------|
| `record_click` (来自 `Cols`) | 用户点击模型记录行时触发 | 包含所选模型信息的 `event.params` |
| `submit` (来自 `Form`) | 输入或 KDB 表单提交时触发 | `event.params` 为表单数据对象 |

## 源码例子

```json
{
  "widgettype": "LlmIO",
  "id": "llm_container",
  "options": {
    "user_icon": "/static/imgs/user-avatar.svg",
    "tts_url": "/api/tts/stream",
    "estimate_url": "/api/feedback/submit",
    "get_kdb_url": "/api/kdb/list",
    "list_models_url": "/api/models/search",
    "enabled_kdb": true,
    "input_fields": [
      {
        "name": "prompt",
        "label": "请输入问题",
        "uitype": "textarea",
        "required": true
      },
      {
        "name": "session_id",
        "label": "会话ID",
        "uitype": "text",
        "value": ""
      }
    ],
    "models": [
      {
        "llmid": "gpt-4o-mini",
        "modelname": "GPT-4o Mini",
        "model": "gpt-4o-mini",
        "icon": "/static/imgs/gpt.svg",
        "url": "/api/llm/chat/stream",
        "response_mode": "stream",
        "input_from": "prompt"
      }
    ]
  },
  "subwidgets": [],
  "binds": []
}
```

> 💡 **注释说明：**
>
> - `widgettype`: 必须是已注册的控件名，此处为 `LlmIO`
> - `id`: 唯一标识该组件实例，便于事件绑定与查找
> - `options`:
>   - `user_icon`: 用户头像图标路径
>   - `tts_url`: 文转语音服务接口地址（启用语音功能）
>   - `estimate_url`: 用户反馈评分提交地址（点赞/点踩）
>   - `get_kdb_url`: 获取知识库列表的 API 地址
>   - `list_models_url`: 模型搜索接口，返回可添加的模型列表
>   - `enabled_kdb`: 是否启用知识库增强功能
>   - `input_fields`: 定义输入表单字段结构，使用 `Form` 控件渲染
>   - `models`: 初始加载的语言模型数组，每个对象对应一个 `LlmModel`
> - `subwidgets`: 虽然是容器控件，但内部布局由 JS 构建，通常留空
> - `binds`: 此控件自身不直接绑定外部事件，事件由子控件（如按钮）触发

---

### ✅ 使用场景说明

该控件适合构建如下界面：
- 支持多模型对比回答的 AI 助手前端
- 可扩展模型的知识问答系统
- 集成 TTS 语音播报和用户反馈机制
- 支持外接知识库检索与提示工程优化

通过远程 `urlwidget` 加载此 JSON 即可动态嵌入页面：

```json
{
  "widgettype": "urlwidget",
  "options": {
    "url": "/ui/components/llmio.ui"
  },
  "target": "main_content"
}
```

--- 

> ⚙️ 提示：若需启用语音朗读，确保服务器提供 `/api/tts/stream` 流式音频接口；若使用反馈功能，请实现 `estimate_url` 接口接收 `logid` 和 `value`（1=满意，-1=不满意）

---

如需继续编写其他控件（如 `ModelOutput`, `LlmModel`, `LlmMsgAudio`）的文档，请告知，我可以按相同格式逐个生成。