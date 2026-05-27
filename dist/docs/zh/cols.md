# Cols

控件功能：用于展示分页的、可滚动的多列数据列表，支持动态加载前后页数据，常用于内容墙、卡片式布局等场景。  
类型：容器控件  
父类控件：`bricks.VBox`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `data_url` | String | 数据请求的 URL 地址，用于异步加载数据。 |
| `data_params` | Object | 请求数据时携带的初始参数对象。 |
| `data_method` | String | 请求方法（如 GET、POST），默认为 GET。 |
| `page_rows` | Number | 每页请求的数据行数。 |
| `cache_limit` | Number | 缓存的页数上限，用于控制内存中保留的历史数据页数量。 |
| `col_cwidth` | Number | 每一列的固定宽度（单位像素），用于动态列布局计算。 |
| `mobile_cols` | Number | 在移动端显示的列数，默认为 2。 |
| `title` | String | 可选标题文本，若存在则显示标题组件。 |
| `description` | String | 可选描述文本（支持 Markdown 格式），会渲染为说明内容。 |
| `toolbar` | Object | 工具栏配置对象，用于定义顶部操作按钮。 |
| `record_view` | Object | 单条记录的视图模板定义，描述如何渲染每一条数据项。 |

> 注：`record_view` 是一个控件配置对象，会被 `bricks.widgetBuild` 用来生成每个数据项的子控件。

## 主要事件

| 事件名 | 触发条件 | 携带数据 |
|--------|----------|---------|
| `record_click` | 用户点击某一条记录时触发 | 点击记录对应的数据对象（`user_data`） |
| `command` | 当工具栏按钮被点击时，通过 `toolbar_w` 传递上来的命令事件，由 `command_handle` 转发为 `dispatch(name)` | 命令名称（来自 toolbar 的 `params.name`） |

> 说明：`dispatch('record_click', data)` 会向外广播该事件，供外部监听处理。

## 例子
```
{
    "widgettype":"Cols",
    "options":{
        "data_url": "{{entire_url('accdetail.dspy')}}",
        "data_params":{
            "accountid":"{{params_kw.accountid}}"
        },
        "data_method": "GET"
        {% if params_kw._is_mobile %}
        "col_width": "{{params_kw.width / 2 - 5}}px",
        {% else %}
        "col_cwidth": 22,
        {% endif %}
        "record_view":{
            "widgettype":"VBox",
            "options":{
                "width":"100%"
            },
            "subwidgets":[
                {
                    "widgettype":"Text",
                    "options":{
                        "text":"${acc_date}"
                    }
                },
                {
                    "widgettype":"Text",
                    "options":{
                        "text":"${acc_dir}"
                    }
                },
                {
                    "widgettype":"Text",
                    "options":{
                        "text":"${summary}"
                    }
                },
                {
                    "widgettype":"Text",
                    "options":{
                        "text":"${amount}"
                    }
                },
                {
                    "widgettype":"Text",
                    "options":{
                        "text":"${balance}"
                    }
                }
            ]
        }
    }
}
```

