# DynamicAccordion

**控件功能**: 动态可折叠列表控件，支持分页加载、远程数据获取、内容懒加载、增删改查操作及工具栏自定义。适用于展示大量可折叠结构化数据。  
**类型**: 容器控件  
**父类控件**: bricks.VScrollPanel

## 初始化参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `data_url` | String | 数据请求地址，用于加载列表数据 |
| `data_method` | String | 请求方法（GET/POST等），默认为 GET |
| `cache_limit` | Number | 缓存页数限制，控制内存中保留的数据页数量 |
| `page_rows` | Number | 每页请求的数据行数 |
| `row_cheight` | Number | 每行高度系数，默认为 `1.5` |
| `record_view` | Object/String | 每条记录在标题区的渲染模板（widget 描述或名称） |
| `content_rely_on` | String | 内容是否展开依赖的字段名 |
| `content_rely_value` | Any | 当 `content_rely_on` 字段等于该值时才加载内容 |
| `editable` | Object | 编辑配置对象，包含新增、修改、删除相关设置 |
| &nbsp;&nbsp;`.add_icon` | String | 新增按钮图标路径 |
| &nbsp;&nbsp;`.update_icon` | String | 更新按钮图标路径 |
| &nbsp;&nbsp;`.delete_icon` | String | 删除按钮图标路径 |
| &nbsp;&nbsp;`.form_cheight` | Number | 表单高度系数 |
| &nbsp;&nbsp;`.new_data_url` | String | 添加新记录提交地址 |
| &nbsp;&nbsp;`.update_data_url` | String | 更新记录提交地址 |
| &nbsp;&nbsp;`.delete_data_url` | String | 删除记录提交地址 |
| `fields` | Array | 字段定义数组，用于表单和数据显示 |
| `record_toolbar` | Object | 每行右侧工具栏配置（图标按钮组） |
| `record_toolbar_collapsable` | Boolean | 工具栏是否可折叠（暂未实现细节） |
| `header` | Object | 表头配置（预留） |
| `content_view` | Object/String | 展开后内容区域的渲染模板 |
| `title` | String | 控件顶部标题文本（可选） |
| `description` | String | 控件描述文本（可选） |
| `toolbar` | Object | 顶部工具栏配置（传给 `IconTextBar`） |

## 主要事件

| 事件名 | 触发条件 | 参数 |
|--------|----------|------|
| `row_selected` | 用户点击某一行时触发 | `info`: 被点击的 `AccordionInfo` 实例 |
| 自定义事件（通过 `record_toolbar.tools[i].name` 定义） | 点击行内自定义工具按钮时触发 | `record`: 当前行数据对象 |
| `conformed`（内部使用） | 删除确认弹窗用户确认后触发 | 传递至 `delete_record_act` 方法处理 |
| `submited`（嵌套表单） | 新增/编辑表单提交成功后触发 | 响应数据 `event.params` |
| `cancel`（嵌套表单） | 表单取消操作时触发 | 关闭当前编辑区域 |

> 注：部分事件为子组件触发并由 `DynamicAccordion` 监听处理，例如 `submited`, `cancel`, `click` 等。
