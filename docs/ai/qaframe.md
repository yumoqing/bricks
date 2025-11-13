# QAFrame

QAFrame 是一个用于实现问答交互流程的容器控件，通常用于在线教育、测试或互动课程场景。它通过 WebSocket 与后端通信，接收题目、课件内容、答题结果等数据，并动态渲染对应的界面。该控件继承自 `bricks.VBox`，属于**容器控件**。

---

## 主要方法

| 方法名 | 描述 |
|-------|------|
| `start_question_answer()` | 向服务器发送 `'qa_start'` 消息，启动问答流程。绑定在开始按钮点击事件上。 |
| `show_question(d)` | 接收题目数据并显示，更新当前题号和总题数，将题目描述（HTML/文本）渲染到主区域。 |
| `show_courseware(d)` | 根据传入的数据类型（video/audio/image/markdown），创建对应媒体控件并展示在主区域。 |
| `show_conform(d)` | 显示确认开始的提示按钮，供用户点击确认后进入下一阶段。 |
| `conform_start()` | 发送 `'conform_start'` 消息至 WebSocket，表示用户已确认准备就绪。 |
| `send_text_answer(e)` | 处理文本答案提交，从事件中提取文本内容并通过 WebSocket 发送给服务端。 |
| `send_audio_answer(e)` | 将录音 Blob 转为 Base64 编码，并以 `'audio_answer'` 类型发送给服务端。 |
| `build_input_widgets()` | 构建输入控件：文本输入框和语音录制按钮，添加到底部工具栏。 |
| `play_course()` | 根据配置的 courseware 类型播放课件内容（视频、音频、图片或 Markdown）。 |

---

## 主要事件

| 事件名 | 触发时机 | 数据格式示例 |
|--------|---------|-------------|
| `onopen` (WebSocket) | WebSocket 连接建立时 | 自动触发 `start_question_answer()` |
| `onquestion` | 收到新题目消息时 | `{ type: "question", data: { q_desc: "...", total_q: 5, cur_q: 1 } }` |
| `oncourseware` | 收到课件推送时 | `{ type: "video", url: "/video/1.mp4" }` |
| `onaskstart` | 服务端要求用户确认是否准备好时 | 显示“Start?”按钮等待点击 |
| `record_ended` (AudioRecorder) | 用户完成录音时 | 触发 `send_audio_answer()` 发送音频数据 |
| `blur` (文本输入框) | 文本输入失去焦点时 | 触发 `send_text_answer()` 发送答案 |

---

## 源码例子

```json
{
  "id": "qa_frame_main",
  "widgettype": "QAFrame",
  "options": {
    // WebSocket 地址，用于实时通信
    "ws_url": "wss://example.com/ws/qa-session",
    
    // 可选参数，附加到 ws_url 后作为查询字符串
    "ws_params": {
      "session_id": "12345",
      "user_id": "U001"
    },
    
    // 页面标题（可选）
    "title": "智能问答练习",
    
    // 描述信息（可选）
    "description": "请认真作答每一道问题。",
    
    // 初始课件配置（可选），支持多种类型
    "courseware": {
      "type": "markdown",           // 支持 "audio", "video", "image", "markdown"
      "url": "/static/intro.md",   // 内容资源地址
      "timeout": 10                // 展示超时时间（秒），0 表示无超时
    },
    
    // 其他 UI 配置项（如有）
    "cheight": 6                   // 占据高度（基于网格布局）
  },
  
  // 子控件（此控件自身是容器，但一般不手动添加 subwidgets）
  // 实际子组件由内部逻辑动态生成（如 main_w、top_w 等）
  "subwidgets": [],
  
  // 绑定事件：例如外部触发重新开始
  "binds": [
    {
      "actiontype": "method",
      "wid": "btn_restart",
      "event": "click",
      "target": "qa_frame_main",
      "method": "start_question_answer",
      "conform": {
        "title": "确认重启？",
        "message": "你确定要重新开始本次问答吗？",
        "confirm_label": "确定",
        "cancel_label": "取消"
      }
    },
    {
      "actiontype": "script",
      "wid": "qa_frame_main",
      "event": "onquestion",
      "target": "console_logger",
      "script": "console.log('New question received:', params.q_desc);",
      "params": {
        "q_desc": "{data.q_desc}"
      }
    }
  ]
}
```

> ✅ **注释说明：**
> - `ws_url` 必须为有效的 WebSocket 地址（`ws://` 或 `wss://`）。
> - `ws_params` 中的参数会自动拼接到连接 URL 上，便于身份验证或会话追踪。
> - `courseware` 字段定义初始加载的内容，可在连接后由服务端消息覆盖。
> - 所有 UI 更新均由 WebSocket 推送驱动，无需手动操作 DOM。
> - 使用 `binds` 可扩展与其他控件的交互行为，如日志记录、弹窗提醒等。

--- 

💡 **使用建议：**

- 配合后台使用 Node.js / Python WebSocket 服务实现题库推送与评分逻辑。
- 在移动端注意音频录制权限处理。
- 可结合 `Popup` 控件实现更复杂的交互确认流程。