# QAFrame

控件功能：实现一个问答交互框架，支持通过 WebSocket 接收课程内容（如音视频、图片、Markdown）、题目信息和结果反馈，并允许用户提交文本或音频答案。适用于在线教学、测验等场景。

类型：容器控件  
父类控件：`bricks.VBox`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `ws_url` | String | WebSocket 连接地址，用于与后端通信 |
| `ws_params` | Object (可选) | 要附加到 `ws_url` 上的查询参数对象，将被转换为 URL 查询字符串 |
| `title` | String (可选) | 页面标题（未在代码中直接使用，可能由外部传入） |
| `description` | String (可选) | 描述信息 |
| `courseware` | Object (可选) | 初始课程资源配置，包含：<br>- `type`: `"audio"`, `"video"`, `"image"`, `"markdown"`<br>- `url`: 资源地址<br>- `timeout`: 播放超时时间（秒），0 表示无超时 |
| `timeout` | Number | 整体超时控制（秒），0 表示不设超时 |

> 注：初始化时会创建内部子控件 `top_w`（HBox）、`main_w`（Filler）和 `bottom_w`（HBox），并建立 WebSocket 连接。

## 主要事件

| 事件名 | 触发条件 | 数据格式说明 |
|--------|---------|-------------|
| `onopen` | WebSocket 连接打开时 | 自动触发 `start_question_answer()` 方法，发送启动消息 `{ type: 'qa_start', data: { d: 'test data', v: 100 } }` |
| `onquestion` | 收到问题数据时 | 数据结构：<br>`{ q_desc: 题目描述, total_q: 总题数, cur_q: 当前题号 }`<br>调用 `show_question(d)` 显示题目 |
| `oncourseware` | 收到课程资源数据时 | 数据结构：<br>`{ type: "audio"/"video"/"image"/"markdown", url: 资源链接 }`<br>调用 `show_courseware(d)` 展示对应媒体内容 |
| `onaskstart` | 服务端请求确认开始时 | 触发显示“Start ?”按钮，点击后调用 `start_question_answer()` 发送启动信号 |
| `click`（自定义按钮） | 用户点击“press to start”或“Start ?”按钮时 | 调用 `conform_start()` 向服务器发送 `{ type: 'conform_start', data: null }` 消息 |

### 接收的数据类型（来自服务端）

1. **courseware**：播放指定类型的课程内容
   ```json
   {
     "type": "courseware",
     "data": {
       "type": "audio|video|image|markdown",
       "url": "资源URL"
     }
   }
   ```

2. **askready**：询问是否准备就绪
   ```json
   {
     "type": "askready",
     "data": {
       "total_q": 5,
       "cur_q": 1
     }
   }
   ```

3. **question**：下发题目
   ```json
   {
     "type": "question",
     "data": {
       "q_desc": "题目HTML或MD文本",
       "total_q": 5,
       "cur_q": 1
     }
   }
   ```

4. **result**：返回答题结果统计
   ```json
   {
     "type": "result",
     "data": {
       "total_q": 5,
       "correct_cnt": 3,
       "error_cnt": 2
     }
   }
   ```

5. **error_list**：错误详情列表
   ```json
   {
     "type": "error_list",
     "data": {
       "error_cnt": 2,
       "rows": [
         {
           "pos": 1,
           "q_desc": "第1题题干",
           "your_a": "你的答案",
           "corrent_a": "正确答案",
           "error_desc": "错误原因说明"
         }
       ]
     }
   }
   ```

### 发送的消息类型（客户端 → 服务端）

1. **qa_start**：连接成功后自动发送，表示可以开始流程
   ```json
   { "type": "qa_start", "data": { "d": "test data", "v": 100 } }
   ```

2. **conform_start**：用户点击开始按钮后发送
   ```json
   { "type": "conform_start", "data": null }
   ```

3. **text_answer**：提交文本答案
   ```json
   { "type": "text_answer", "data": "用户输入的内容" }
   ```

4. **audio_answer**：提交录音答案（Base64 编码）
   ```json
   { "type": "audio_answer", "data": "base64音频字符串" }
   ```

> 所有消息通过内置的 `WebSocket` 实例发送，使用 `this.ws.send(message)`。