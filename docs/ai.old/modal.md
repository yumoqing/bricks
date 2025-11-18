# Modal

Modal 是一个模态窗口控件，用于在当前页面上层显示一个浮动的对话框。它继承自 `BaseModal`，属于**容器控件**，可以包含其他子控件（如表单、文本、按钮等），常用于提示信息、确认操作或展示临时内容。

类型：容器控件，继承自 `bricks.BaseModal`

---

## 主要方法

- **open()**  
  显示模态框，设置其 `display` 样式为可见，并触发 `opened` 事件。如果设置了超时时间（`timeout`），会启动定时关闭任务。

- **dismiss()**  
  隐藏并移除模态框，取消可能存在的超时任务，并派发 `dismissed` 事件。

- **add_widget(w, index)**  
  向模态框的内容区域添加子控件。若配置了 `auto_open: true`，则自动调用 `open()` 方法打开模态框。

- **get_zindex()**  
  获取当前模态框应使用的 `z-index` 值，确保新弹出的模态框始终位于最上层。

- **create_title()**  
  创建标题栏，包括标题文字和右上角关闭图标（SVG 图标），支持国际化（i18n）。

---

## 主要事件

- **opened**  
  当模态框被成功打开时触发。

- **dismissed**  
  当模态框被关闭并从 DOM 中移除后触发。

- **click (内部处理)**  
  点击遮罩背景区域可关闭模态框（仅当 `auto_close` 为 `true` 时启用）。

---

## 源码例子

```json
{
  "id": "example_modal",
  "widgettype": "Modal",
  "options": {
    "title": "操作确认",           // 模态框标题，支持 i18n 自动翻译
    "width": "400px",             // 宽度
    "height": "200px",            // 高度
    "bgcolor": "#ffffff",         // 内容面板背景色
    "archor": "cc",               // 居中对齐（center-center）
    "auto_open": false,           // 不自动打开，需手动触发
    "timeout": 0                  // 无自动关闭时间
  },
  "subwidgets": [
    {
      "id": "confirm_text",
      "widgettype": "Text",
      "options": {
        "otext": "您确定要执行此操作吗？",
        "i18n": true,
        "style": { "padding": "20px", "textAlign": "center" }
      }
    },
    {
      "id": "button_row",
      "widgettype": "HBox",
      "options": { "justify": "end", "padding": "10px" },
      "subwidgets": [
        {
          "id": "cancel_btn",
          "widgettype": "Button",
          "options": { "text": "取消", "i18n": true }
        },
        {
          "id": "confirm_btn",
          "widgettype": "Button",
          "options": { "text": "确定", "i18n": true, "variant": "primary" }
        }
      ]
    }
  ],
  "binds": [
    {
      "actiontype": "method",
      "wid": "cancel_btn",
      "event": "click",
      "target": "example_modal",
      "method": "dismiss"
    },
    {
      "actiontype": "event",
      "wid": "confirm_btn",
      "event": "click",
      "target": "example_modal",
      "dispatch_event": "submit",
      "params": { "action": "delete_item" }
    },
    {
      "actiontype": "event",
      "wid": "example_modal",
      "event": "dismissed",
      "target": "logger",
      "dispatch_event": "log",
      "params": { "msg": "Modal closed by user." }
    }
  ]
}
```

> ✅ **注释说明：**
>
> - 使用 `Modal` 控件创建一个居中的对话框。
> - 包含一段提示文本和两个按钮（取消/确定）。
> - 点击“取消”调用 `dismiss()` 关闭模态框。
> - 点击“确定”派发一个名为 `submit` 的自定义事件，携带操作参数。
> - 模态框关闭后，向日志组件发送一条日志消息。
> - 所有文本均支持国际化（`i18n: true`），可通过语言包动态切换语言。

--- 

💡 提示：可通过 JavaScript 动态创建或通过 `.ui` 文件以 JSON 形式声明使用。结合 `urlwidget` 可实现远程加载模态内容，提升模块化能力。