# DataViewer

DataViewer 是一个用于展示分页数据的容器控件，支持动态加载远程数据、滚动加载前后页、内置增删改查操作工具栏，并可通过子类扩展自定义记录视图。它继承自 `bricks.VBox`，属于**容器控件**。

---

## 主要方法

| 方法名 | 说明 |
|--------|------|
| `render(params)` | 根据参数从服务器加载数据并渲染列表，默认会缓存请求参数避免重复加载 |
| `build_row(record, page, pos)` | 构建单条记录对应的控件，并插入到滚动面板中（可被重写） |
| `build_record_view(record)` | 创建每条数据的显示控件，子类需重写此方法以实现自定义 UI |
| `add_record()` | 打开新增记录弹窗 |
| `update_record(row)` | 打开编辑当前选中行记录的弹窗 |
| `clone_record(row)` | 克隆当前选中记录并打开新增表单 |
| `delete_record(row)` | 删除指定行记录，触发确认对话框 |
| `load_previous_page()` | 向上滚动时加载前一页数据（支持无限滚动） |
| `load_next_page()` | 向下滚动时加载后一页数据 |
| `command_event_handle(event)` | 处理工具栏按钮点击事件（如 add/update/delete 等） |
| `get_edit_fields()` | 获取可编辑字段列表，排除配置中设置的字段 |
| `get_hidefields()` | 获取隐藏字段（通常为过滤条件或上下文参数） |
| `build_add_form()` / `build_update_form(data)` / `build_clone_form(data)` | 分别构建新增、更新、克隆用的表单控件 |
| `build_window(icon, title, form)` | 创建弹出窗口包裹表单 |

---

## 主要事件

| 事件名 | 触发时机 | 携带数据 |
|--------|--------|---------|
| `row_check_changed` | 当某一行的选择状态发生变化时 | 被选中行的数据对象（`user_data`） |
| 自定义命令事件（如 `'add'`, `'update'` 等） | 用户点击工具栏按钮时 | 当前行数据（如有） |

> 注：这些事件可通过 `binds` 进行监听和处理。

---

## 源码例子

```json
{
  "id": "dataviewer_main",
  "widgettype": "DataViewer",
  "options": {
    // 数据源配置
    "data_url": "/api/list_records",         // 获取数据的接口地址
    "data_method": "GET",                    // 请求方式
    "data_params": {                         // 静态请求参数
      "category": "news"
    },
    "page_rows": 20,                         // 每页加载多少条数据
    "cache_limit": 5,                        // 最多缓存几个页面的数据

    // 编辑功能配置（启用工具栏）
    "editable": {
      "add_icon": "imgs/add.svg",
      "update_icon": "imgs/edit.svg",
      "clone_icon": "imgs/clone.svg",
      "delete_icon": "imgs/delete.svg",
      "new_data_url": "/api/create_record",   // 新增提交地址
      "update_data_url": "/api/update_record", // 更新提交地址
      "delete_data_url": "/api/delete_record"  // 删除提交地址
    },

    // 行记录选项（传递给 build_record_view）
    "row_options": {
      "fields": [
        { "name": "title", "label": "标题", "uitype": "text" },
        { "name": "author", "label": "作者", "uitype": "text" },
        { "name": "pub_date", "label": "发布时间", "uitype": "date" }
      ],
      "editexclouded": ["pub_date"]          // 编辑时不显示的字段
    }
  },
  "subwidgets": [],  // DataViewer 自动管理子控件（通过 dataHandle 渲染），一般不手动添加
  "binds": [
    {
      "actiontype": "method",
      "wid": "dataviewer_main",
      "event": "row_check_changed",
      "target": "logger_panel",
      "method": "setValue",
      "dataparams": {
        "message": "Selected row changed: {{value}}"
      },
      "datamethod": "getValue",              // 从事件中获取数据
      "datawidget": "dataviewer_main"
    },
    {
      "actiontype": "event",
      "wid": "dataviewer_main",
      "event": "add",
      "target": "global_event_bus",
      "dispatch_event": "open_statistics_panel",
      "params": {
        "action": "add",
        "from": "DataViewer"
      }
    },
    {
      "actiontype": "bricks",
      "wid": "dataviewer_main",
      "event": "update",
      "target": "Popup",
      "mode": "replace",
      "options": {
        "widgettype": "Message",
        "options": {
          "title": "Success",
          "message": "Record updated successfully!",
          "level": "info"
        }
      }
    }
  ]
}
```

### ✅ 注释说明：

- `"data_url"` 和 `"data_params"` 配合使用，由 `PageDataLoader` 自动发起请求。
- `"editable"` 开启后会在顶部生成包含增删改克隆图标的工具栏。
- `build_record_view()` 必须在子类中重写才能正确显示内容；否则默认显示一个空白方块。
- 工具栏按钮点击后会派发对应名称的事件（如 `add`, `update`），可用于联动其他模块。
- 使用 `binds` 可将用户操作与日志、提示、跳转等行为连接起来。
- 支持垂直滚动加载更多数据（上拉刷新 / 下拉加载）。

> 💡 提示：若要完全自定义界面，请继承 `DataViewer` 并重写 `build_record_view(record)` 方法返回你想要的控件结构。