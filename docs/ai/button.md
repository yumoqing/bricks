# Button

按钮控件（Button）是 Bricks.js 框架中用于触发用户交互行为的**普通控件**，继承自 `bricks.Layout`。它通常用于提交表单、打开弹窗、执行脚本或导航等操作。Button 支持图标、文本标签、自定义样式以及事件绑定，适用于各种 UI 场景。

## 主要方法

- **`target_clicked(event)`**  
  内部方法，当按钮被点击时触发，阻止事件冒泡并派发 `click` 事件，同时处理配置的 `action` 行为。

- **`create()`**  
  创建底层 DOM 元素（`<button>` 标签），由框架自动调用。

- **`opts_setup()`**  
  初始化按钮内容：根据 `opts.icon` 和 `opts.label` 创建图标和文本子控件，并添加到布局中。

- **`add_widget(widget)`**  
  继承自父类，用于向按钮内部添加子控件（如 Icon 或 Text）。

- **`bind(event, handler)`**  
  绑定自定义事件处理器（例如 `'click'` 事件）。

## 主要事件

- **`click`**  
  当按钮被用户点击时触发。可通过 `binds` 配置监听此事件，并执行相应动作（如调用方法、跳转页面、发送请求等）。

## 源码例子

```json
{
  "id": "btn_submit",                    // 控件唯一标识
  "widgettype": "Button",                // 控件类型：Button
  "options": {
    "name": "btn_submit",               // 按钮名称（用于 DOM ID 设置）
    "label": "Submit",                  // 显示的文字标签（支持 i18n 国际化）
    "icon": "icons/submit.png",         // 图标路径（可选）
    "color": "#ffffff",                 // 文字颜色
    "bgcolor": "#007BFF",               // 背景色
    "item_rate": 1.2,                   // 图标与文字的比例系数
    "orientation": "horizontal",        // 布局方向：horizontal(图标在左) / vertical
    "css": "custom-btn",                // 自定义 CSS 类名
    "nonepack": false,                  // 是否去除默认 padding 和边框
    "action": {
      "actiontype": "method",           // 点击后执行的动作类型
      "wid": "form_main",               // 目标组件 ID
      "method": "submit",               // 调用的方法名
      "params": {}                      // 方法参数
    }
  },
  "binds": [
    {
      "actiontype": "method",           // 动作类型：调用方法
      "wid": "btn_submit",              // 触发组件 ID
      "event": "click",                 // 监听事件：点击
      "target": "form_main",            // 目标组件 ID
      "method": "validateAndSubmit",    // 执行方法
      "params": {
        "showLoading": true
      }
    },
    {
      "actiontype": "script",           // 执行脚本
      "wid": "btn_submit",
      "event": "click",
      "target": "",                     // script 类型无需 target
      "script": "console.log('Button clicked:', params);",
      "params": {
        "message": "Hello from Button!"
      }
    },
    {
      "actiontype": "event",            // 派发自定义事件
      "wid": "btn_submit",
      "event": "click",
      "target": "Popup",                // 向弹窗系统派发事件
      "dispatch_event": "open_dialog",
      "params": {
        "dialogId": "confirm_save"
      }
    }
  ]
}
```

> ✅ **注释说明：**
>
> - `widgettype: "Button"` 表示使用已注册的 Button 控件。
> - `options` 中的 `action` 是按钮内置的行为配置，也可通过 `binds` 实现更复杂的逻辑。
> - `binds` 数组允许一个按钮绑定多个不同类型的响应动作（方法调用、脚本执行、事件派发等）。
> - 图标和文本会自动按 `orientation` 排列，`item_rate` 控制大小比例。
> - 使用 `i18n: true`（隐式支持）时，`label` 可以从语言包中读取多语言值。
> - `nonepack: true` 可用于创建无边距/无背景的纯净按钮，适合嵌入工具栏等场景。