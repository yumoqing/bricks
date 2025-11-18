# Popup

弹窗控件，用于在页面上显示浮动的对话框或内容窗口。属于**容器控件**，继承自 `bricks.VBox`。

## 主要方法

- `open()`：打开弹窗，设置位置、显示样式，并触发 `opened` 事件。
- `dismiss()`：关闭弹窗，隐藏其 DOM 元素，并可选择自动销毁。
- `destroy()`：彻底销毁该弹窗实例，从父容器中移除并清理资源。
- `add_widget(w, i)`：向弹窗内容区域添加子控件。
- `remove_widget(w)`：从内容区域移除指定子控件。
- `clear_widgets()`：清空内容区域的所有子控件。
- `bring_to_top()`：将当前弹窗置于所有其他弹窗之上（通过提升 z-index）。
- `positify_tl()`：根据锚点（archor）和屏幕尺寸计算并设置弹窗初始位置。
- `popup_from_widget(from_w)`：相对于某个源控件定位弹窗（常用于下拉菜单等场景）。
- `load_content()`：异步加载 `content` 配置中的组件并渲染到内容区。

## 主要事件

- `opened`：弹窗打开后触发。
- `dismissed`：弹窗关闭时触发。
- `destroy`：弹窗被销毁时触发（仅当 `auto_destroy` 为 true 时）。

## 源码例子

```json
{
  "id": "my_popup",
  "widgettype": "Popup",
  "options": {
    "width": "400px",           // 弹窗宽度
    "height": "300px",          // 弹窗高度
    "archor": "cc",             // 居中显示：'cc' 表示 center-center
    "modal": true,              // 是否模态，模态时背景不可点击
    "movable": true,            // 是否允许拖动
    "resizable": true,          // 是否允许调整大小
    "auto_open": false,         // 是否创建后自动打开
    "auto_dismiss": true,       // 点击外部是否自动关闭
    "auto_destroy": true,       // 关闭后是否自动销毁
    "timeout": 5000,            // 自动关闭延时（毫秒），0 表示不启用
    "content": {                // 要加载的内容（支持嵌套控件）
      "widgettype": "VBox",
      "options": {
        "padding": "20px",
        "css": "popup-content"
      },
      "subwidgets": [
        {
          "widgettype": "Text",
          "options": {
            "text": "这是一个弹窗示例！",
            "i18n": true
          }
        },
        {
          "widgettype": "Button",
          "options": {
            "text": "关闭",
            "css": "primary"
          },
          "binds": [
            {
              "actiontype": "event",
              "wid": "close_btn",
              "event": "click",
              "target": "my_popup",
              "dispatch_event": "dismissed"
            }
          ]
        }
      ]
    }
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "trigger_button",     // 触发控件 ID
      "event": "click",            // 监听点击事件
      "target": "my_popup",        // 目标是此弹窗
      "method": "open",            // 执行 open 方法
      "params": {}
    },
    {
      "actiontype": "event",
      "wid": "my_popup",
      "event": "dismissed",
      "target": "status_text",
      "dispatch_event": "setValue",
      "params": {
        "value": "弹窗已关闭"
      }
    }
  ]
}
```

> ✅ **注释说明**：
> - 此弹窗不会自动打开（`auto_open: false`），需由按钮触发。
> - 点击“关闭”按钮会派发 `dismissed` 事件，进而触发状态更新。
> - 使用 `content` 字段定义内部结构，支持动态构建复杂界面。
> - 支持国际化文本（`i18n: true`）、拖拽、缩放、模态遮罩等功能。

---

# PopupWindow

带标题栏的可操作窗口型弹窗控件，适用于桌面风格的应用程序窗口管理。属于**容器控件**，继承自 `bricks.Popup`。

## 主要方法

- `open()`：打开窗口，若设置了自动打开则延迟执行。
- `build_title_bar()`：构建顶部标题栏（含图标、工具按钮等）。
- `win_minimize()`：最小化窗口（实际是关闭但保留引用供恢复）。
- `set_title(txt)`：动态设置窗口标题。
- `destroy()`：销毁窗口，同时从全局管理列表中移除。

## 主要事件

- `opened`：窗口打开时触发。
- `dismissed`：窗口关闭（最小化）时触发。
- `destroy`：窗口被彻底销毁时触发。

## 源码例子

```json
{
  "id": "app_window",
  "widgettype": "PopupWindow",
  "options": {
    "title": "我的应用",                    // 窗口标题
    "icon": "/resources/icons/app.png",   // 标题栏左侧图标路径
    "width": "60%",                       // 宽度百分比
    "height": "70%",                      // 高度百分比
    "movable": true,                      // 可拖动标题栏移动
    "resizable": true,                    // 可调整大小
    "modal": false,                       // 非模态，允许后台交互
    "auto_open": true                     // 创建即打开
  },
  "subwidgets": [
    {
      "widgettype": "HtmlView",
      "options": {
        "html": "<div style='padding:20px;'>欢迎使用我的应用程序！</div>"
      }
    }
  ],
  "binds": [
    {
      "actiontype": "urlwidget",
      "wid": "refresh_btn",
      "event": "click",
      "target": "app_window",
      "mode": "replace",
      "options": {
        "url": "/ui/myapp.content.ui",   // 动态加载新内容
        "method": "GET",
        "params": {}
      }
    },
    {
      "actiontype": "script",
      "wid": "log_btn",
      "event": "click",
      "target": "app_window",
      "script": "console.log('用户在窗口中点击了日志按钮');",
      "params": {}
    }
  ]
}
```

> ✅ **注释说明**：
> - `PopupWindow` 提供标准窗口行为：最小化、关闭、全屏。
> - 工具栏按钮由 `IconBar` 实现，内置 delete/minimize/fullscreen 功能。
> - 最小化后可通过全局 `bricks.app.mwins` 列表恢复。
> - 支持通过 `urlwidget` 动态刷新内容，实现模块化加载。
> - 适合构建多窗口 Web 应用，如 IDE、管理系统等。

---

# WindowsPanel

任务栏式窗口管理面板，列出所有最小化的 `PopupWindow` 并提供恢复功能。属于**容器控件**，继承自 `bricks.Popup`。

## 主要方法

- `del_window(event)`：处理点击某个窗口项时将其恢复并从列表中移除。
- （构造函数中自动初始化数据源与事件绑定）

## 主要事件

- `record_click`：当用户点击某个窗口记录项时触发（来自 `Cols` 控件）。

## 源码例子

```json
{
  "id": "windows_panel",
  "widgettype": "WindowsPanel",
  "options": {
    "archor": "br",               // 锚定在右下角
    "width": "200px",
    "height": "300px",
    "movable": true,
    "resizable": false,
    "modal": false,
    "auto_open": false            // 不自动打开，由快捷键或按钮触发
  },
  "binds": [
    {
      "actiontype": "method",
      "wid": "taskbar_btn",
      "event": "click",
      "target": "windows_panel",
      "method": "open",
      "params": {}
    }
  ]
}
```

> ✅ **注释说明**：
> - 此控件用于展示当前已最小化的所有 `PopupWindow` 实例。
> - 数据来源于 `bricks.app.mwins` 数组，在构造时自动映射为可视列表。
> - 每一项是一个图标 + 标题，点击即可还原对应窗口。
> - 常用于模拟操作系统任务栏功能。
> - 本身也是弹窗类型，点击外部可自动关闭（`auto_dismiss: true`）。