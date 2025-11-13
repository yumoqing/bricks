# Tabular

**控件用途**：`Tabular` 是一个用于展示结构化数据的表格型控件，支持行选择、复选框切换、内容展开/折叠等交互功能。适用于列表展示、数据浏览、可编辑表格等场景。

**类型**：普通控件（继承自 `bricks.DataViewer`）

---

## 主要方法

| 方法名 | 参数 | 说明 |
|--------|------|------|
| `build_other()` | 无 | 异步构建其他组件内容，如获取可编辑字段信息 |
| `before_data_handle()` | 无 | 在数据处理前调用，用于初始化表头行 |
| `build_header_row()` | 无 | 构建并渲染表头行，添加到 `scrollpanel` 中 |
| `build_record_view(record)` | `record`: 数据记录对象 | 根据数据记录创建对应的视图行（支持带详情展开的内容） |
| `record_clicked(row, record, event)` | `row`: 行控件, `record`: 数据, `event`: 事件对象 | 处理行点击事件，实现选中状态切换与内容展开 |
| `toggle_content(row, flag)` | `row`: 行控件, `flag`: 布尔值 | 控制某一行的详细内容区域显示或隐藏 |
| `get_edit_fields()` | 无 | 获取允许编辑的字段列表（排除配置中指定的字段） |
| `build_info(record)` | `record`: 数据记录 | 创建单行 `DataRow` 控件，并绑定复选框变化事件 |
| `record_check_changed(event)` | `event`: 事件对象 | 当行的复选框状态改变时触发，派发 `row_check_changed` 事件 |
| `renew_record_view(form, row)` | `form`: 表单控件, `row`: 被更新的行 | 使用表单数据更新指定行的数据展示 |
| `record_event_handle(event_name, record, row, item)` | 各类事件参数 | 捕获并转发行内控件的事件 |
| `get_hidefields()` | 无 | 获取当前数据参数中需要作为隐藏字段输出的部分 |

---

## 主要事件

| 事件名 | 携带数据 | 触发时机 |
|-------|----------|---------|
| `row_selected` | 当前行对应的 `user_data` 对象 | 用户点击某一行且该行被选中时触发 |
| `row_check_changed` | 包含用户数据和复选状态的 `params` 对象 | 行的复选框状态发生变化时触发 |
| （转发事件） | 取决于 `event_names` 配置 | 如按钮点击等行内事件通过 `record_event_handle` 转发 |

---

## 源码例子

```json
{
  "id": "tabular_user_list",
  "widgettype": "Tabular",
  "options": {
    // 继承自 DataViewer 的基础选项
    "url": "/api/users",               // 数据源接口地址
    "method": "GET",                   // 请求方式
    "params": {},                      // 请求参数
    "cheight": 40,                     // 每行高度
    "content_view": {                  // 定义点击后展开的详情内容（可选）
      "widgettype": "VBox",
      "subwidgets": [
        {
          "widgettype": "Label",
          "options": {
            "text": "姓名: {{name}}"
          }
        },
        {
          "widgettype": "Label",
          "options": {
            "text": "邮箱: {{email}}"
          }
        }
      ]
    },
    "row_options": {                   // 行渲染配置
      "fields": [                      // 字段定义
        {
          "name": "name",
          "label": "姓名",
          "uitype": "text"
        },
        {
          "name": "age",
          "label": "年龄",
          "uitype": "number"
        },
        {
          "name": "active",
          "label": "状态",
          "uitype": "checkbox"
        }
      ],
      "editexclouded": ["active"]      // 不参与编辑的字段（用于编辑模式）
    }
  },
  "binds": [
    {
      "actiontype": "row_selected",
      "wid": "tabular_user_list",
      "event": "row_selected",
      "target": "detail_panel",
      "mode": "replace",
      "options": {
        "widgettype": "FormView",
        "options": {
          "data": "{{event.params}}",
          "schema": {
            "name": { "label": "姓名", "type": "string" },
            "email": { "label": "邮箱", "type": "string" }
          }
        }
      }
    },
    {
      "actiontype": "event",
      "wid": "tabular_user_list",
      "event": "row_check_changed",
      "target": "app_state_manager",
      "dispatch_event": "user_selection_updated",
      "params": {
        "selected_user": "{{event.params.user_data}}"
      }
    },
    {
      "actiontype": "method",
      "wid": "tabular_user_list",
      "event": "click",
      "target": "logger_service",
      "method": "logAction",
      "params": {
        "action": "view_user",
        "target_id": "{{event.target.bricks_widget.id}}"
      }
    }
  ],
  "subwidgets": []  // Tabular 是普通控件，不包含子控件
}
```

### 注释说明：

- `"content_view"`：定义了每行点击后展开的详细信息面板，使用模板语法 `{{}}` 动态填充数据。
- `"editexclouded"`：在编辑场景下排除某些字段（例如只读字段），由 `get_edit_fields()` 方法处理。
- `"binds"`：
  - 第一条绑定监听 `row_selected` 事件，将选中数据传递给另一个容器 `detail_panel` 并渲染为表单；
  - 第二条绑定将复选变更事件转发为全局事件 `user_selection_updated`；
  - 第三条调用日志服务的方法记录用户行为。
- 所有动态数据均通过 `{{}}` 表达式从运行时上下文中提取，符合 bricks 的数据绑定规范。

--- 

> ✅ **提示**：`Tabular` 控件适合与 `DataRow`、`DataViewer` 配合使用，是 Bricks 中实现复杂数据展示的核心控件之一。结合远程加载 (`urlwidget`) 可实现分页、搜索、动态刷新等功能。