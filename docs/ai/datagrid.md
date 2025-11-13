# DataGrid

DataGrid 是一个用于展示结构化数据的容器控件，支持分页加载、冻结列、行选择、工具栏集成等功能。它是 `bricks` 框架中用于替代传统表格（table）的高级布局控件，继承自 `VBox`，属于**容器控件**。

---

## 主要方法

| 方法名 | 描述 |
|--------|------|
| `add_row(data, index)` | 向表格中添加一行数据，可指定插入位置（index）。 |
| `add_rows(records, direction)` | 批量添加多行记录，支持从顶部或底部添加（direction: 'up'/'down'）。 |
| `clear_data()` | 清空所有数据行，包括冻结区和正常区的内容。 |
| `loadData(params)` | 重新加载数据，传入参数给后端请求。 |
| `create_header()` | 根据字段定义创建表头。 |
| `create_parts()` | 创建整体布局结构：冻结列区域、主内容区域、滚动同步等。 |
| `coscroll(event)` | 实现两个垂直滚动面板之间的同步滚动（用于冻结列与主体列对齐）。 |
| `miniform_input(event)` | 响应搜索表单输入事件，触发数据重载。 |
| `command_handle(event)` | 处理来自工具栏的命令事件（如“新增”、“删除”等），需开发者扩展实现。 |
| `del_old_rows(cnt, direction)` | 删除旧的行（从开头或结尾），用于缓冲加载策略。 |

---

## 主要事件

| 事件名 | 触发时机 | 参数说明 |
|-------|---------|----------|
| `row_click` | 用户点击某一行时触发 | 回调参数为被点击的 `Row` 实例对象，可通过其 `.data` 获取原始数据 |
| `min_threshold` | 滚动接近顶部边界时触发 | 通常用于加载上一页数据 |
| `max_threshold` | 滚动接近底部边界时触发 | 通常用于加载下一页数据 |
| `scroll` | 滚动发生时触发 | 用于实现双列滚动同步 |

> 注：这些事件通过 `bind()` 进行监听，例如绑定到 `normal_body` 或 `freeze_body` 的滚动行为。

---

## 源码例子

```json
{
  "id": "my_datagrid",
  "widgettype": "DataGrid",
  "options": {
    // 数据源配置
    "dataurl": "/api/users",         // 从该 URL 异步获取数据
    "method": "GET",                 // 请求方式，默认为 GET
    "params": { "page_size": 80 },   // 请求参数

    // 显示配置
    "title": "用户列表",              // 表格标题（支持 i18n）
    "description": "所有注册用户的详细信息", // 描述文本
    "show_info": true,               // 是否显示信息栏
    "row_height": "40px",            // 每行高度
    "header_css": "grid_header",     // 表头样式类名
    "body_css": "grid_body",         // 表体样式类名

    // 功能开关
    "check": false,                  // 是否显示复选框列
    "lineno": true,                  // 是否显示行号列

    // 工具栏与搜索
    "miniform": {
      "fields": [
        {
          "name": "keyword",
          "uitype": "text",
          "label": "搜索关键词",
          "i18n": true,
          "uioptions": {
            "placeholder": "请输入用户名..."
          }
        },
        {
          "name": "status",
          "uitype": "select",
          "label": "状态",
          "i18n": true,
          "uioptions": {
            "options": [
              { "label": "全部", "value": "" },
              { "label": "启用", "value": "active" },
              { "label": "禁用", "value": "inactive" }
            ]
          }
        }
      ]
    },
    "toolbar": {
      "buttons": [
        {
          "name": "add_user",
          "label": "新增用户",
          "icon": "add",
          "action": {
            "actiontype": "newwindow",
            "target": "/user/add",
            "mode": "popup",
            "width": 800,
            "height": 600
          }
        },
        {
          "name": "refresh",
          "label": "刷新",
          "icon": "refresh",
          "action": {
            "actiontype": "method",
            "wid": "my_datagrid",
            "method": "loadData",
            "params": {}
          }
        }
      ]
    },

    // 字段定义
    "fields": [
      {
        "name": "username",
        "label": "用户名",
        "uitype": "text",
        "width": 120,
        "freeze": true,              // 冻结此列（固定左侧）
        "i18n": true
      },
      {
        "name": "email",
        "label": "邮箱",
        "uitype": "text",
        "width": 180,
        "i18n": true
      },
      {
        "name": "status",
        "label": "状态",
        "uitype": "label",
        "width": 100,
        "uioptions": {
          "css_map": {
            "active": "success",
            "inactive": "danger"
          }
        }
      },
      {
        "name": "last_login",
        "label": "最后登录时间",
        "uitype": "datetime",
        "width": 160
      },
      {
        "name": "action",
        "label": "操作",
        "uitype": "button",
        "width": 100,
        "icon": "edit",
        "action": {
          "actiontype": "newwindow",
          "target": "/user/edit?id={id}",
          "mode": "popup",
          "width": 900,
          "height": 700
        }
      }
    ]
  },
  "binds": [
    {
      "actiontype": "event",
      "wid": "my_datagrid",
      "event": "row_click",
      "target": "detail_panel",
      "dispatch_event": "update_detail",
      "params": {
        "source": "my_datagrid"
      },
      "datawidget": "my_datagrid",
      "datamethod": "getValue",
      "dataparams": {},
      "rtdata": {
        "section": "user_profile"
      }
    },
    {
      "actiontype": "script",
      "wid": "my_datagrid",
      "event": "row_click",
      "script": "console.log('用户点击了行:', params.row_data);",
      "params": {
        "row_data": "{source.getValue()}"
      }
    }
  ]
}
```

### 注释说明：

- **`dataurl`**: 设置远程数据接口地址，框架会自动发起请求并渲染数据。
- **`miniform`**: 内置迷你搜索表单，用户输入后自动调用 `loadData()` 刷新数据。
- **`toolbar`**: 工具栏按钮支持弹窗、刷新等操作。
- **`fields[].freeze`**: 设为 `true` 可将列固定在左侧（常用于关键字段如 ID、姓名）。
- **`uitype: button`**: 在表格内嵌按钮，支持动态绑定动作（如编辑、删除）。
- **`binds`**:
  - 第一条：当某行被点击时，向 `detail_panel` 控件派发 `update_detail` 自定义事件，传递当前行数据。
  - 第二条：执行脚本输出调试日志，演示如何获取运行时数据。

> 💡 提示：结合 `BufferedDataLoader`，DataGrid 支持大数据量下的虚拟滚动与分页预加载，适用于成千上万条记录的场景。