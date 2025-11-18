# DataRow

**用处**：`DataRow` 是一个用于展示数据行的容器控件，常用于表格或列表中的一行数据展示。支持表头与数据行的分别渲染，可配置字段显示、列宽、隐藏字段等，适用于构建数据浏览界面（如数据表格）。

**类型**：容器控件，继承自 `bricks.HBox`

---

## 主要方法

- `render_header()`  
  渲染表头部分（通常包含字段名），调用 `render(true)` 实现。

- `render_data()`  
  渲染数据内容部分，调用 `render(false)` 实现。

- `render(header: Boolean)`  
  根据 `header` 参数决定是否渲染为表头。若为 `true`，则显示字段标签；否则显示实际数据值。

- `renew(record: Object)`  
  更新当前行绑定的数据记录，并重新渲染数据部分。`record` 为新的数据对象。

- `get_check_state(e: Event)`  
  处理复选框状态变化事件，更新内部数据并派发 `check_changed` 事件。

- `build_toolbar(header: Boolean)`  
  构建工具栏（如操作图标按钮），根据 `header` 判断是否在表头区域创建空白占位。

- `my_dispatch(event_name: String)`  
  返回一个闭包函数，用于在工具栏按钮点击时派发对应事件。

- `_build_fields(header: Boolean, containerWidget: Widget)`  
  内部方法，遍历 `fields` 配置并生成对应的视图控件（如文本、图标等），添加到指定容器中。

---

## 主要事件

- `check_changed`  
  当复选框状态改变时触发，携带当前组件实例作为参数。可用于监听选中状态变更。

- 自定义工具栏事件（由 `toolbar.tools.name` 定义）  
  如 `edit`, `delete` 等，通过 `IconBar` 绑定后会派发同名事件，可通过 `binds` 监听处理。

---

## 源码例子

```json
{
  "id": "data_row_001",
  "widgettype": "DataRow",
  "options": {
    // 表格字段定义
    "fields": [
      {
        "name": "id",
        "label": "编号",
        "uitype": "str",
        "cwidth": 5
      },
      {
        "name": "name",
        "label": "姓名",
        "uitype": "str",
        "cwidth": 10
      },
      {
        "name": "status",
        "label": "状态",
        "uitype": "label", // 使用标签控件显示
        "cwidth": 8
      }
    ],
    // 是否启用选择框
    "checkField": "selected",
    // 浏览器字段配置（控制列宽和隐藏）
    "browserfields": {
      "exclouded": ["internal_id"], // 不显示的字段
      "cwidths": {
        "status": 12
      }
    },
    // 工具栏配置
    "toolbar": {
      "tools": [
        {
          "name": "edit",
          "icon": "pencil",
          "tip": "编辑"
        },
        {
          "name": "delete",
          "icon": "trash",
          "tip": "删除"
        }
      ]
    },
    // 自定义样式
    "css": "data-row-item",
    "header_css": "header-row"
  },
  "subwidgets": [],
  "binds": [
    // 监听复选框变化
    {
      "actiontype": "event",
      "wid": "data_row_001",
      "event": "check_changed",
      "target": "data_grid_controller",
      "dispatch_event": "row_selected",
      "params": {
        "rowid": "{data_row_001.getValue().id}"
      }
    },
    // 编辑按钮点击
    {
      "actiontype": "method",
      "wid": "data_row_001",
      "event": "edit", // 来自 IconBar 的事件
      "target": "popup_manager",
      "method": "openEditPopup",
      "params": {
        "recordId": "{data_row_001.getValue().id}"
      }
    },
    // 删除按钮确认并执行
    {
      "actiontype": "event",
      "wid": "data_row_001",
      "event": "delete",
      "target": "data_row_001",
      "dispatch_event": "confirm_delete",
      "conform": {
        "title": "确认删除",
        "message": "确定要删除该条记录吗？",
        "confirmButtonText": "删除",
        "cancelButtonText": "取消"
      }
    }
  ]
}
```

> **注释说明**：
>
> - `fields` 定义了要展示的字段及其 UI 类型（`uitype`），框架会自动查找对应的 ViewBuilder 创建子控件。
> - `checkField` 启用行选择功能，会在最前插入一个复选框。
> - `toolbar.tools` 定义操作图标，每个 `name` 将作为事件名被 `DataRow` 派发。
> - `binds` 中通过 `event` 类型将内部事件转发给外部控制器处理。
> - `conform` 提供弹出确认对话框的能力，在危险操作前使用。
> - `{}` 中的表达式是 bricks 支持的运行时数据绑定语法，动态获取组件值。