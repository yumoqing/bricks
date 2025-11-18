以下是根据你提供的源码中定义的两个控件（`TreeNode` 和 `Tree`）编写的 **Markdown 格式控件文档**，每个控件均按照要求包含一级标题、功能描述、类型与父类，以及“初始化参数”和“主要事件”两个二级标题。

---

# TreeNode

**控件功能**：表示树结构中的一个节点，用于展示树形数据中的单个条目，支持展开/折叠子节点、图标显示、复选框等功能。它是构成树形结构的基本单元。

**类型**：普通控件  
**父类控件**：`bricks.VBox`

## 初始化参数

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `tree` | `bricks.Tree` 实例 | 所属的树控件实例，用于回调和共享配置 |
| `pnode` | `bricks.TreeNode` 实例或 `null` | 父节点实例，根节点为 `null` |
| `data` | `Object` | 节点绑定的数据对象，包含文本、ID、是否为叶子等字段 |

在构造函数中通过 `opts` 设置默认布局属性：
- `width: '100%'`
- `height: 'auto'`

内部自动设置以下状态和属性：
- `this.is_leaf`：根据 `data[tree.is_leafField]` 判断是否为叶子节点
- `this.params`：传递给后端请求的参数，包含节点 ID 和类型信息
- `this.container`：仅非叶子节点创建，用于容纳子节点的 `VBox` 容器（初始隐藏）

## 主要事件

| 事件名 | 触发条件 | 回调参数说明 |
|--------|--------|-------------|
| `click`（注册于 `node_widget`） | 用户点击节点行时触发 | 由 `tree.node_click_handle` 处理，传入当前节点实例 |
| `state_changed`（注册于 `triple` 控件） | 节点前导图标状态切换时（点击展开/折叠图标） | 触发 `toggleExpandCollapse` 方法，控制子节点容器的显隐 |
| （间接）`changed`（注册于 `check_w`） | 若启用复选框，用户勾选/取消勾选时触发 | 交由 `tree.node_checked` 处理，更新 `checked_data` 并派发事件 |

> 注意：`TreeNode` 自身不直接 dispatch 公共事件，而是通过所属 `Tree` 实例进行事件分发。

---

# Tree

**控件功能**：树形结构控件，用于展示层级化的数据（如目录、组织架构等），支持异步加载、节点增删改、复选、工具栏操作等功能。可作为静态树或可编辑树使用。

**类型**：容器控件  
**父类控件**：`bricks.VScrollPanel`

## 初始化参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| `row_height` | `String` | 否 | 每个节点行的高度，默认 `'35px'` |
| `idField` | `String` | 是 | 数据中表示节点唯一标识的字段名 |
| `textField` | `String` | 是 | 数据中表示节点显示文本的字段名 |
| `is_leafField` | `String` | 否 | 标识节点是否为叶子节点的字段名，默认 `'is_leaf'` |
| `typeField` | `String` | 否 | 区分节点类型的字段名，用于定制图标 |
| `data` | `Array` | 否 | 静态树数据数组，直接初始化节点 |
| `dataurl` | `String` | 否 | 异步加载子节点数据的 URL 地址 |
| `method` | `String` | 否 | 请求数据的方法，默认 `'GET'` |
| `params` | `Object` | 否 | 请求时附加的全局参数 |
| `node_view` | `Widget Description` | 否 | 自定义节点渲染模板（描述对象） |
| `checkField` | `String` | 否 | 支持复选功能时，数据中保存勾选状态的字段名 |
| `node_typeicons` | `Object` | 否 | 按节点类型定义图标的映射表，格式 `{ nodetype: { open, close, leaf }, default_type: "type" }` |
| `editable` | `Object` | 否 | 编辑配置，含 `fields`, `add_url`, `delete_url`, `update_url` 等 |
| `newdata_params` | `Object` | 否 | 添加新节点时额外注入的固定参数 |

## 主要事件

| 事件名 | 触发条件 | 回调参数说明 |
|--------|--------|-------------|
| `node_selected` | 节点被点击选中或取消选中时派发 | 参数为 `node.user_data` 扩展了 `{ selected: true/false }` |
| `check_changed` | 节点复选框状态改变时派发 | 参数为该节点的 `user_data`，反映最新勾选状态 |
| `command`（来自 `toolbar_w`） | 工具栏按钮被点击时触发 | 由 `toolbar_command` 处理，根据 `event.params.name` 执行添加、删除、更新或其他自定义命令 |
| （自定义命令）如 `add`, `delete`, `update` 等 | 用户执行相应操作并成功提交后，通过 `dispatch(name, data)` 派发 | `data` 包含节点数据及元信息 `meta_data`（来源、标题、图标等），可用于打开表单或通知其他模块 |

此外，`Tree` 还会响应以下用户交互行为并执行逻辑：
- 展开/折叠节点（通过 `expand()` / `collapse()`）
- 动态加载子节点数据（`get_children_data`）
- 增删改节点（通过 HTTP 请求或本地操作）

---

> ✅ 文档说明：以上内容基于源码分析生成，适用于开发人员查阅组件接口与行为。实际使用时需确保依赖 `bricks` 框架核心模块（如 `HttpJson`, `ModalForm`, `IconTextBar` 等）已正确加载。