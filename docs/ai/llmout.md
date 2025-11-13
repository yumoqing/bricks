# LlmOut

LlmOut 是一个用于展示大模型输出内容的容器控件，能够根据返回的数据动态渲染文本、音频、视频、图片及错误信息。类型为**容器控件**，继承自 `bricks.VBox`。

---

## 主要方法

- **`update(data)`**  
  更新控件显示内容。接收一个包含大模型响应数据的对象，支持以下字段：
  - `content`: 主要应答文本（Markdown 格式）
  - `reasoning_content`: 推理过程文本
  - `error`: 错误信息
  - `audio`: 音频资源 URL 或 Base64 编码字符串
  - `video`: 视频资源 URL 或 Base64 编码字符串
  - `image`: 单个图像 URL 或图像 URL 数组

  控件会自动创建对应的子控件（如 `AudioPlayer`、`VideoPlayer`、`Image`、`MdWidget` 等）并添加到内部布局中。

- **`clear_widgets()`**  
  清除当前所有子控件（来自父类 `VBox`），在每次更新前调用以确保界面刷新。

---

## 主要事件

无自定义事件。但可通过 Bricks 的事件系统监听其子控件触发的事件（例如音频播放完成、视频加载失败等）。

---

## 源码例子

```json
{
  "id": "llm_output_area",
  "widgettype": "LlmOut",
  "options": {
    "width": "100%",
    "css": "llm-response-container"
  },
  "subwidgets": [],
  "binds": [
    {
      "actiontype": "event",
      "wid": "submit_btn",
      "event": "click",
      "target": "llm_output_area",
      "dispatch_event": "loading:start",
      "params": {
        "message": "正在请求大模型响应..."
      }
    },
    {
      "actiontype": "urlwidget",
      "wid": "submit_btn",
      "event": "click",
      "target": "llm_output_area",
      "mode": "replace",
      "options": {
        "url": "/api/llm/response",
        "method": "POST",
        "params": {
          "prompt": "data:text_input.getValue()"
        }
      },
      "conform": {
        "title": "确认提交",
        "message": "您确定要发送此请求吗？",
        "confirmText": "确定",
        "cancelText": "取消"
      }
    }
  ]
}
```

> **注释说明：**
> - `widgettype: "LlmOut"` 表示使用已注册的 LlmOut 控件。
> - `options.width`: 设置控件宽度占满父容器。
> - `binds` 中定义了两个行为：
>   1. 当按钮 `submit_btn` 被点击时，向 `llm_output_area` 派发 `loading:start` 自定义事件，可用于显示加载状态。
>   2. 同时发起一个远程请求获取新的 LLM 响应，并将结果替换当前 `LlmOutputArea` 的内容。
> - `data:text_input.getValue()` 是运行时数据绑定语法，表示从 ID 为 `text_input` 的控件中获取用户输入作为请求参数。
> - 使用 `conform` 提供用户确认弹窗，防止误操作。

--- 

该控件适用于 AI 对话系统、智能助手界面等需要动态展示多模态输出的场景。