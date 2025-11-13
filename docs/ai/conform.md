# Conform

控件用于在用户执行关键操作前弹出确认对话框，提供“确认”和“取消”两个选项。属于**容器控件**，继承自 `bricks.PopupWindow`。

## 主要方法

- `constructor(opts)`  
  构造函数，接收配置参数 `opts`，自动设置超时为0、自动打开，并调用父类构造函数初始化弹窗。

- `create_conform()`  
  创建整体布局结构，包含消息区域和工具栏。

- `create_message(widget)`  
  在指定容器中创建消息显示区域，使用 `Text` 控件展示带换行的消息内容，支持国际化（i18n）。

- `create_toolbar(widget)`  
  创建底部按钮栏（`IconTextBar`），包含“确认”和“取消”按钮，可自定义图标与标签。

- `conform_hndl(event)`  
  点击“确认”按钮时触发，关闭弹窗并派发 `conformed` 事件。

- `discard_hndl(event)`  
  点击“取消”按钮时触发，关闭弹窗并派发 `cancelled` 事件。

## 主要事件

| 事件名       | 触发条件               | 携带数据 |
|--------------|------------------------|----------|
| `conformed`  | 用户点击“确认”按钮     | 无       |
| `cancelled`  | 用户点击“取消”按钮     | 无       |

## 源码例子

```json
{
  "id": "confirm_delete",
  "widgettype": "Conform",
  "options": {
    "message": "Are you sure you want to delete this item?",  // 要显示的提示信息
    "i18n": true,                                           // 支持国际化
    "conform": {                                            // 自定义“确认”按钮
      "label": "Delete",
      "icon": "imgs/delete.svg"
    },
    "discard": {                                            // 自定义“取消”按钮
      "label": "Keep",
      "icon": "imgs/keep.svg"
    }
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "confirm_delete",
      "event": "conformed",
      "target": "data_manager",
      "method": "deleteItem",
      "params": {
        "itemId": "{#input_form.getValue('id')}"            // 动态获取表单中的ID值
      },
      "description": "当用户确认删除时，调用数据管理器删除对应项目"
    },
    {
      "actiontype": "script",
      "wid": "confirm_delete",
      "event": "cancelled",
      "script": "console.log('Delete operation was cancelled by user.');",
      "description": "用户取消删除操作时输出日志"
    }
  ]
}
```

### 注释说明：

- `"widgettype": "Conform"`：必须确保该控件已在 bricks 框架中注册。
- `options.message`：支持静态文本或 i18n 键名，若启用 `i18n: true`，会自动翻译。
- `conform` 和 `discard` 字段是可选的，用于覆盖默认按钮样式与行为。
- `binds` 中通过监听 `conformed` 和 `cancelled` 事件实现后续逻辑处理。
- 使用 `{#...}` 表达式可在运行时动态求值，如从其他控件获取数据。

> 💡 提示：此控件常用于删除、退出、覆盖等需要二次确认的操作场景，提升用户体验与安全性。