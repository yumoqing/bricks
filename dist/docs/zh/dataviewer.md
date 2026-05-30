# DataViewer

**控件功能**：用于展示分页数据的容器控件，支持滚动加载前后页、行记录操作（增删改查）、工具栏命令响应，并可动态渲染数据行。常用于数据列表或表格类场景。

**类型**：容器控件  
**父类控件**：`bricks.VBox`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `data_url` | String | 数据加载的接口 URL，供 `PageDataLoader` 使用 |
| `data_params` | Object | 请求数据时附加的参数，在每次请求中发送 |
| `page_rows` | Number | 每页请求的数据条数 |
| `data_method` | String | 请求方法（如 'GET' 或 'POST'），默认为 'GET' |
| `cache_limit` | Number | 缓存页数限制，控制内存中保留的历史页面数量 |
| `editable` | Object | 可选配置，定义新增、更新、克隆、删除等操作的图标和 URL |
| &nbsp;&nbsp;`.add_icon` | String | 新增按钮图标路径 |
| &nbsp;&nbsp;`.update_icon` | String | 更新按钮图标路径 |
| &nbsp;&nbsp;`.clone_icon` | String | 克隆按钮图标路径 |
| &nbsp;&nbsp;`.delete_icon` | String | 删除按钮图标路径 |
| &nbsp;&nbsp;`.new_data_url` | String | 新增记录提交的目标 URL |
| &nbsp;&nbsp;`.update_data_url` | String | 更新记录提交的目标 URL |
| &nbsp;&nbsp;`.delete_data_url` | String | 删除记录提交的目标 URL |
| `toolbar` | Object | 自定义工具栏描述对象，包含额外命令按钮 |
| `row_options` | Object | 行渲染相关选项 |
| &nbsp;&nbsp;`.fields` | Array | 字段定义数组，每个字段包含 name, uitype 等信息 |
| &nbsp;&nbsp;`.editexclouded` | Array | 在编辑/克隆时不显示的字段名列表 |

> ⚠️ 所有初始化参数通过 `opts` 传入，构造函数会自动设置宽度为 `'100%'`、高度为 `'100%'`、溢出隐藏。

## 主要事件

| 事件名称 | 触发条件 | 传递数据（event.params）说明 |
|--------|--------|-----------------------------|
| `row_check_changed` | 当某一行的选择状态发生变化时触发（由子类或内部机制调用） | 包含该行用户数据的对象（`user_data`） |
| `<command>` | 工具栏中非内置按钮被点击时，以按钮 `name` 分发自定义事件 | 若当前有选中行，则携带该行的 `user_data`；否则为 null |
| `command` | 内部使用，来自 `IconTextBar` 的原始命令事件 | 原始工具项描述 `{ name, selected_row }` |

> 💡 特殊命令处理：
> - `add`: 弹出新增表单窗口
> - `update`: 弹出修改当前选中行的表单
> - `clone`: 弹出基于当前行复制的新建表单
> - `delete`: 弹出确认框并执行删除动作

---