# Toolbar

**用处**：`Toolbar` 是一个用于创建工具栏的容器控件，常用于放置一系列功能按钮（如编辑、保存、删除等），支持横向或纵向布局，并可为每个工具项配置图标、标签、名称和样式。用户点击某个工具按钮时，会触发相应的命令事件。

**类型**：容器控件，继承自 `bricks.Layout`

---

## 主要方法

| 方法名 | 说明 |
|--------|------|
| `createTool(desc)` | 异步创建一个工具按钮，根据传入的描述对象生成 Button 控件并绑定点击事件 |
| `createTools()` | 遍历 `opts.tools` 数组，依次创建所有工具项，并在中间插入间隔元素 |
| `add_interval_box()` | 在两个工具项之间添加一个空白间隔（JsWidget），实现视觉分隔 |
| `do_handle(tool, event)` | 工具按钮点击后的处理逻辑：高亮当前按钮、派发命令事件和自定义命名事件 |
| `remove_item(w, event)` | 移除指定的可移除工具项，触发 `remove` 事件并清理事件监听 |
| `add_removable(item)` | 为支持移除的工具项添加一个小的“删除”SVG图标，点击可移除该工具 |
| `click(name)` | 模拟点击指定名称的工具按钮，通过名字触发其行为 |

---

## 主要事件

| 事件名 | 触发条件 | 参数说明 |
|--------|---------|----------|
| `command` | 任意工具按钮被点击时触发 | 传递包含工具配置信息的对象，可能包括 `target` 字段 |
| `[tool.name]` | 点击具体某个工具按钮时，以该工具的 `name` 值命名的事件被触发 | 数据结构同 `command` 事件 |
| `remove` | 当用户点击工具上的删除图标将其移除时触发 | 返回被移除工具的原始配置对象 `tool_opts` |

---

## 源码例子

```json
{
  "id": "my_toolbar",
  "widgettype": "Toolbar",
  "options": {
    "orientation": "horizontal",     // 可选 'horizontal' 或 'vertical'
    "interval": "8px",               // 工具项之间的间距，默认10px
    "target": "main_content",        // 可选，附加到事件数据中的目标区域标识
    "css": "custom-toolbar",         // 自定义CSS类前缀
    "tools": [
      {
        "name": "new_file",
        "label": "新建文件",
        "icon": "imgs/new.svg",
        "css": "btn-new"
      },
      {
        "name": "save",
        "label": "保存",
        "icon": "imgs/save.svg",
        "css": "btn-save",
        "removable": true                            // 表示这个工具可以被用户手动删除
      },
      {
        "name": "delete",
        "label": "删除",
        "icon": "imgs/delete.svg",
        "css": "btn-delete"
      }
    ]
  },
  "subwidgets": [],  // Toolbar 是容器控件，但通常不直接使用 subwidgets，而是通过 tools 自动生成子控件
  "binds": [
    {
      "actiontype": "event",
      "wid": "my_toolbar",
      "event": "command",
      "target": "app_handler",
      "rtdata": {
        "action": "execute_tool"
      },
      "params": {
        "source": "toolbar"
      }
    },
    {
      "actiontype": "method",
      "wid": "my_toolbar",
      "event": "remove",
      "target": "log_panel",
      "method": "appendMessage",
      "params": {
        "message": "用户移除了一个工具按钮"
      }
    },
    {
      "actiontype": "script",
      "wid": "my_toolbar",
      "event": "save",
      "target": "none",
      "script": "async function({ data }) { await fetch('/api/save', { method: 'POST', body: JSON.stringify(data) }); }",
      "dataparams": {
        "content": "editor.getValue()"
      }
    }
  ]
}
```

> **注释说明**：
> - `orientation`: 设置工具栏方向，影响内部使用 `HScrollPanel` 还是 `VScrollPanel`
> - `tools`: 定义工具列表，每一项将转换为一个带图标的按钮
> - `removable`: 若设为 `true`，则会在该工具上显示一个小的删除图标（SVG），允许用户动态移除
> - `binds` 示例展示了三种典型用途：
>   1. 监听 `command` 事件统一处理所有工具操作；
>   2. 对 `remove` 事件做日志记录；
>   3. 对特定工具（如 `save`）执行自定义脚本进行数据提交。