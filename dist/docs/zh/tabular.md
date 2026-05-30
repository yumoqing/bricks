# Tabular

控件功能：用于以表格形式展示数据，支持行选择、复选框状态变化事件、动态内容展开等功能，适用于数据列表展示与交互。  
类型：普通控件（容器型数据展示控件）  
父类控件：`bricks.DataViewer`

## 初始化参数

- `opts` {Object}：初始化选项对象，继承自 `DataViewer` 的参数，并扩展以下特有属性：
  - `row_options` {Object}：定义每行数据渲染的配置，包括字段（`fields`）、高度（`cheight`）等。
  - `content_view` {Object|undefined}：可选，指定点击行时展开的详细内容视图描述（JSON 结构），若存在则启用折叠面板功能。
  - `editexclouded` {Array}：可选，包含不应在编辑模式中显示的字段名数组。
  - `data_params` {Object}：用于生成隐藏字段的数据参数，在表单提交等场景下使用。

## 主要事件

- `row_selected`  
  触发时机：当某一行被点击选中时触发。  
  携带参数：当前选中行对应的数据记录（`record` 对象）。  
  示例：可用于更新详情面板或外部控件的状态。

- `row_check_changed`  
  触发时机：当某行的复选框状态发生变化时触发。  
  携带参数：该行对应的用户数据（`user_data`）。  
  注意：通过绑定 `DataRow` 的 `check_changed` 事件派发而来，常用于多选操作处理。

- 自定义事件转发（通过 `record_event_handle`）  
  支持将子组件（如工具栏按钮）的事件冒泡到父级，例如：
  - `click`, `dblclick` 等 DOM 事件封装后的自定义事件。
  - 携带原始记录数据，便于业务逻辑响应。
