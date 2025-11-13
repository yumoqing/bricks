# DynamicAccordion

动态手风琴控件（DynamicAccordion）是一个容器控件，用于以分页、可折叠的方式展示大量数据记录。它继承自 `bricks.VScrollPanel`，支持懒加载、无限滚动、编辑操作和内容动态渲染，适用于需要高效展示结构化数据的场景（如后台管理列表、日志查看器等）。该控件结合了数据加载、视图模板、工具栏配置与交互逻辑，是 bricks 框架中功能较完整的复合型容器控件。

类型：容器控件，继承自 `VScrollPanel`

---

## 主要方法

- **`render(params)`**  
  根据参数重新加载并渲染数据。若传入 `params`，会作为请求参数发送至后端接口。此方法触发数据加载与界面更新。

- **`build_item(record)`**  
  构建单个手风琴项（AccordionItem），包含标题信息区域和隐藏的内容区域。如果 record 存在，则绑定点击事件以展开内容。

- **`toggle_content(info, content, record, event)`**  
  切换指定项的内容区域显示/隐藏状态。首次展开时按需加载并渲染 `content_view` 定义的子控件。

- **`line_clicked(info, content, record, event)`**  
  行点击回调函数，处理选中高亮及内容切换逻辑。

- **`load_previous_page()` / `load_next_page()`**  
  分别加载前一页或下一页数据，实现“无限滚动”效果，基于 `min_threshold` 和 `max_threshold` 事件触发。

- **`add_record(info)`**  
  添加新记录，通常通过表单输入完成，并提交到服务器。

- **`update_record(info, record)`**  
  更新当前记录，弹出可编辑表单。

- **`delete_record(info, record)`**  
  删除指定记录，弹出确认对话框防止误操作。

- **`build_record_toolbar(info, record)`**  
  构建每行右侧的操作工具栏（如增删改图标按钮），支持自定义扩展事件。

- **`fire_event(event_name, data)`**  
  向外派发自定义事件，供外部监听使用（例如用于联动其他组件）。

- **`select_line(info)`**  
  设置某行为选中状态，并取消之前选中的行样式。

---

## 主要事件

| 事件名             | 触发时机 |
|--------------------|--------|
| `row_selected`     | 当用户点击某一行时触发，携带被点击行的信息组件 `info` 作为参数。可用于与其他控件联动。 |
| `conformed`        | 在删除确认弹窗中点击“确定”后触发，执行实际删除动作。 |
| `submited`         | 表单提交成功后触发，常用于刷新视图或关闭弹窗。 |
| `cancel`           | 编辑/新增表单取消时触发，关闭表单区域。 |
| `min_threshold`    | 垂直滚动条接近顶部时触发，由 `container` 内部发出，用于加载上一页数据。 |
| `max_threshold`    | 垂直滚动条接近底部时触发，用于加载下一页数据。 |

---

## 源码例子

```json
{
  "id": "dynamic_accordion_example",
  "widgettype": "DynamicAccordion",
  "options": {
    // 数据源 URL，返回符合 PageDataLoader 格式的 JSON
    "data_url": "/api/records/list",
    "data_params": {
      "category": "news"
    },
    "data_method": "GET",
    
    // 分页设置
    "page_rows": 10,
    "cache_limit": 5,

    // 每行高度倍数（相对于标准行高）
    "row_cheight": 1.5,

    // 是否启用编辑功能
    "editable": {
      "form_cheight": 8,
      "add_icon": "/static/icons/add.svg",
      "update_icon": "/static/icons/edit.svg",
      "delete_icon": "/static/icons/trash.svg",
      "new_data_url": "/api/records/create",
      "update_data_url": "/api/records/update",
      "delete_data_url": "/api/records/delete"
    },

    // 头部标题与描述（可选）
    "title": "新闻列表",
    "description": "点击查看详细内容",

    // 工具栏定义（可选）
    "toolbar": {
      "tools": [
        { "name": "refresh", "icon": "/static/icons/refresh.svg", "tip": "刷新列表" }
      ]
    },

    // 字段定义，用于构建表单或标题展示
    "fields": [
      { "name": "title", "label": "标题", "uitype": "text" },
      { "name": "author", "label": "作者", "uitype": "text" },
      { "name": "pub_date", "label": "发布时间", "uitype": "date" }
    ],

    // 每行记录的视图模板（用于 header 显示）
    "record_view": {
      "widgettype": "HBox",
      "options": { "padding": 10 },
      "subwidgets": [
        {
          "widgettype": "Text",
          "options": {
            "otext": "{title}",
            "i18n": false,
            "halign": "left",
            "style": { "font-weight": "bold", "margin-right": "10px" }
          }
        },
        {
          "widgettype": "Text",
          "options": {
            "otext": "by {author}",
            "i18n": false,
            "halign": "left",
            "style": { "color": "#666", "font-size": "0.9em" }
          }
        }
      ]
    },

    // 展开后显示的详细内容视图
    "content_view": {
      "widgettype": "Form",
      "options": {
        "submit_url": "/api/records/update",
        "fields": [
          { "name": "title", "label": "标题", "uitype": "text" },
          { "name": "content", "label": "正文", "uitype": "textarea", "cheight": 5 },
          { "name": "status", "label": "状态", "uitype": "select", "options": ["草稿", "已发布"] }
        ]
      }
    },

    // 自定义每行的操作按钮（除编辑外）
    "record_toolbar": {
      "cwidth": 2.5,
      "tools": [
        { "name": "share", "icon": "/static/icons/share.svg", "tip": "分享此条目" },
        { "name": "export", "icon": "/static/icons/export.svg", "tip": "导出为 PDF" }
      ]
    },

    // 控制何时才渲染 content_view（条件依赖字段）
    "content_rely_on": "has_detail",
    "content_rely_value": true
  },

  // 绑定事件
  "binds": [
    {
      "actiontype": "bricks",
      "wid": "dynamic_accordion_example",
      "event": "row_selected",
      "target": "another_panel",
      "options": {
        "widgettype": "Text",
        "options": {
          "otext": "Selected: {user_data.title}",
          "i18n": false
        }
      },
      "mode": "replace"
    },
    {
      "actiontype": "urlwidget",
      "wid": "dynamic_accordion_example",
      "event": "refresh",
      "target": "dynamic_accordion_example",
      "options": {
        "url": "/api/records/list",
        "method": "GET",
        "params": { "force_refresh": true }
      },
      "mode": "replace"
    },
    {
      "actiontype": "event",
      "wid": "dynamic_accordion_example",
      "event": "share",
      "target": "Popup",
      "dispatch_event": "show_share_dialog",
      "params": { "record": "{user_data}" }
    }
  ]
}
```

> ✅ **注释说明：**
>
> - `data_url` 提供分页数据接口，返回格式应为 `{ rows: [...], page: 1, total: 100 }`
> - `record_view` 定义每一行如何显示简略信息。
> - `content_view` 定义展开后的详细内容，仅在点击时动态加载。
> - `editable` 开启内置增删改功能，自动添加操作图标。
> - `binds` 中监听 `row_selected` 实现跨组件通信；`refresh` 按钮重新加载数据。
> - 使用 `{field_name}` 占位符可在文本或参数中引用运行时数据（来自 record）。
> - `content_rely_on` 可控制是否显示展开内容，提高性能。

--- 

📌 **总结：**  
`DynamicAccordion` 是一个高度集成的数据展示控件，适合构建复杂的数据浏览界面。其核心优势在于：
- 支持大数据量下的分页懒加载；
- 提供灵活的视图定制能力；
- 内建 CRUD 支持与事件系统；
- 易于通过 JSON 配置实现复杂交互逻辑。