# Cols

**用途**：`Cols` 是一个用于展示分页滚动数据列表的容器控件，适用于移动端或响应式布局中以卡片形式展示多条记录（如新闻、商品、消息等）。它支持无限滚动加载前一页和后一页数据，具备自动触发加载机制，并可通过点击选中某一条记录。

**类型**：容器控件，继承自 `bricks.VBox`

---

## 主要方法

| 方法名 | 说明 |
|--------|------|
| `load_first_page(params)` | 首次加载数据，可传入额外参数 `params` 合并到请求中。若配置了 `data_url`，则从服务器拉取数据；否则使用本地数据 `this.data`。 |
| `load_previous_page()` | 加载上一页数据，当用户滚动到顶部时自动触发（绑定在 `min_threshold` 事件上）。 |
| `load_next_page()` | 加载下一页数据，当用户滚动到底部时自动触发（绑定在 `max_threshold` 事件上）。 |
| `dataHandle(d)` | 处理返回的数据 `d`，将每条记录渲染为一个子控件并插入主容器 `main` 中，支持逆序插入（用于上翻页）。 |
| `delete_page(page)` | 删除指定页码的所有 DOM 元素及其对应的控件实例，用于清理不再需要的页面内容。 |
| `create_main_widget()` | 创建内部显示区域的主控件 `DynamicColumn`，用于管理列数和响应式布局。 |
| `show_with_data(data)` | 直接传入静态数据进行展示，不依赖远程 URL，适合临时数据显示。 |
| `command_handle(event)` | 工具栏命令处理函数，派发工具栏按钮对应的事件名称。 |

---

## 主要事件

| 事件名 | 触发条件 | 携带数据 |
|--------|----------|---------|
| `record_click` | 用户点击某一条记录项时触发 | 当前记录的数据对象（`rw.user_data`） |
| `command` | 工具栏按钮被点击时（由 `Toolbar` 控件发出），通过 `command_handle` 转发为同名事件 | 按钮定义中的 `name` 参数 |

> 注：`min_threshold` 和 `max_threshold` 是 `VScrollPanel` 提供的滚动边界事件，分别表示滚动到顶部和底部，用于驱动分页加载。

---

## 源码例子

```json
{
  "id": "cols_example",
  "widgettype": "Cols",
  "options": {
    // 数据源地址，返回符合 PageDataLoader 格式的 JSON
    "data_url": "/api/news/list",
    
    // 请求参数
    "data_params": {
      "category": "tech",
      "page_size": 10
    },
    
    // HTTP 方法，默认 GET
    "data_method": "GET",
    
    // 每页显示行数
    "page_rows": 10,
    
    // 缓存页数限制
    "cache_limit": 5,
    
    // 列宽设置（百分比）
    "col_cwidth": "48%",
    
    // 移动端列数
    "mobile_cols": 1,
    
    // 标题文本（支持国际化）
    "title": "最新资讯",
    "i18n": true,
    
    // 描述信息（Markdown 支持）
    "description": "这里是科技类新闻列表",
    
    // 工具栏定义
    "toolbar": {
      "items": [
        {
          "type": "button",
          "text": "刷新",
          "name": "refresh"
        },
        {
          "type": "button",
          "text": "新增",
          "name": "add_new"
        }
      ]
    },
    
    // 每条记录的视图模板
    "record_view": {
      "widgettype": "CardWidget",
      "options": {
        "title": "{title}",           // 动态字段替换
        "subtitle": "发布时间: {ctime}",
        "content": "{summary}",
        "thumbnail": "{image_url}"
      }
    }
  },
  
  // 绑定事件
  "binds": [
    {
      "actiontype": "event",
      "wid": "cols_example",
      "event": "record_click",
      "target": "detail_panel",
      "rtdata": {
        "action": "show_detail"
      },
      "dataparams": {
        "source_event": "record_click"
      }
    },
    {
      "actiontype": "method",
      "wid": "cols_example",
      "event": "refresh",
      "target": "cols_example",
      "method": "load_first_page",
      "params": {}
    },
    {
      "actiontype": "urlwidget",
      "wid": "cols_example",
      "event": "add_new",
      "target": "Popup",
      "mode": "replace",
      "options": {
        "url": "/forms/news_edit.ui",
        "method": "GET",
        "params": {}
      }
    }
  ]
}
```

### ✅ 注释说明：

- `"data_url"`：服务端接口路径，返回格式需包含 `rows`, `page`, `pos_rate` 等字段。
- `"record_view"`：定义每个数据项如何渲染成 UI 控件，支持字段插值 `{field}`。
- `"binds"`：
  - 当用户点击某条记录时，派发 `record_click` 事件，通知 `detail_panel` 显示详情。
  - 工具栏“刷新”按钮重新加载第一页数据。
  - “新增”按钮打开弹窗（Popup），加载 `/forms/news_edit.ui` 表单界面。
- `VScrollPanel` 自动监听滚动位置，在接近边界时调用 `load_previous_page` / `load_next_page` 实现懒加载。

--- 

> 💡 **提示**：`Cols` 特别适合构建类似微博、朋友圈、电商商品列表等需要长列表无限滚动的场景，结合 `PageDataLoader` 实现高效内存管理和数据缓存。