# `bricks.Tree` 与 `bricks.TreeNode` 技术文档

> **版本：1.0**  
> **模块：Tree 组件（树形结构 UI 控件）**

---

## 概述

`bricks.Tree` 是一个基于 `bricks.js` 框架的可交互树形组件，支持异步数据加载、节点展开/折叠、选中/勾选操作、动态增删改节点等功能。它适用于展示层级数据结构（如文件系统、组织架构等），并提供完整的前端交互逻辑和后端通信能力。

该组件由两个核心类构成：

- `bricks.Tree`: 树的容器类，继承自 `bricks.VScrollPanel`，负责管理整体布局、数据获取、工具栏及事件分发。
- `bricks.TreeNode`: 单个树节点类，继承自 `bricks.VBox`，表示树中的一个节点，包含图标、文本、子节点区域等元素。

---

## 类定义

### `bricks.TreeNode`

#### 继承关系
```js
class TreeNode extends bricks.VBox
```

#### 构造函数
```js
constructor(tree, parent_node, data)
```

##### 参数说明：
| 参数         | 类型     | 描述 |
|--------------|----------|------|
| `tree`       | `bricks.Tree` | 当前节点所属的树实例 |
| `parent_node`| `bricks.TreeNode` 或 `null` | 父节点引用；根节点为 `null` |
| `data`       | `Object` | 节点绑定的数据对象 |

##### 初始化行为：
- 设置默认选项（宽度 100%，高度自适应）
- 初始化节点状态字段（是否为叶子节点、是否已加载子节点等）
- 设置图标 URL（根据类型或默认配置）
- 创建主内容行（`HBox`），绑定点击事件
- 异步创建节点内容（图标、复选框、文本或自定义视图）
- 若非叶子节点，则创建子节点容器（`VBox`），初始隐藏

---

### `bricks.Tree`

#### 继承关系
```js
class Tree extends bricks.VScrollPanel
```

#### 构造函数
```js
constructor(options)
```

##### 参数说明（`options` 对象）：
| 属性名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `row_height` | String | 否 | `'35px'` | 每行节点的高度 |
| `idField` | String | 是 | - | 数据中标识唯一 ID 的字段名 |
| `textField` | String | 是 | - | 显示节点文本的字段名 |
| `is_leafField` | String | 否 | `'is_leaf'` | 判断是否为叶子节点的字段名 |
| `typeField` | String | 否 | - | 区分节点类型的字段名（用于图标定制） |
| `data` | Array | 否 | - | 静态数据源（本地 JSON 数组） |
| `dataurl` | String | 否 | - | 动态获取子节点数据的 API 地址 |
| `method` | String | 否 | `'GET'` | 请求数据时使用的 HTTP 方法 |
| `params` | Object | 否 | `{}` | 发送请求时携带的额外参数 |
| `node_view` | WidgetDesc \| Function | 否 | - | 自定义节点渲染模板（可通过 `widgetBuild` 解析） |
| `checkField` | String | 否 | - | 控制节点勾选状态的字段名 |
| `editable` | Object | 否 | - | 编辑功能配置（增删改 URL 和字段） |
| `node_typeicons` | Object | 否 | 内置默认图标 | 不同类型节点的图标配置 |
| `multitype_tree` | Boolean | 否 | `false` | 是否启用多类型树显示 |

##### 初始化行为：
- 创建滚动面板
- 构建标题与描述（预留接口）
- 创建工具栏（如果启用了编辑模式或自定义工具）
- 初始化容器用于放置节点
- 如果有 `dataurl`，则异步加载根节点数据；否则使用本地 `data` 构建树

---

## 主要方法

### `bricks.TreeNode` 方法

| 方法名 | 说明 |
|-------|------|
| `getValue()` | 返回当前节点及其所有子节点的完整数据结构（递归） |
| `get_id()` | 获取节点 ID（通过 `idField` 字段） |
| `selected(flg)` | 设置节点选中状态样式 |
| `toggleExpandCollapse(event)` | 切换展开/收起状态（异步） |
| `expand()` | 展开节点（若未加载过子节点且存在 `dataurl`，会先请求数据） |
| `collapse()` | 收起节点 |
| `create_triple()` | 创建带状态切换功能的 SVG 图标（展开/收起） |
| `change_node_type()` | 根据是否为叶子节点设置图标行为 |
| `create_node_content(widget)` | 渲染节点内部内容（图标、复选框、文本或自定义组件） |
| `update_content()` | 更新节点显示内容（主要用于刷新文本或视图） |
| `setup_icon_urls()` | 根据节点类型配置图标路径（支持按 type 定制） |

---

### `bricks.Tree` 方法

| 方法名 | 说明 |
|-------|------|
| `getValue()` | 获取整棵树的数据结构（含所有子节点） |
| `get_id()` | 获取树根节点 ID |
| `create_toolbar()` | 创建顶部工具栏（添加、编辑、删除按钮及其他命令） |
| `toolbar_command(event)` | 工具栏命令处理器（响应用户操作） |
| `add_new_node()` | 打开模态窗添加新节点 |
| `new_node_inputed(event)` | 处理新增节点表单提交 |
| `append_new_subnode(node, data)` | 在指定节点下追加子节点 |
| `build_subnode(node, data)` | 构建并插入一个 `TreeNode` 实例 |
| `delete_node()` | 删除当前选中节点（弹出确认框） |
| `delete_node_conformed(event)` | 确认删除后的处理逻辑 |
| `delete_subnode(node, subnode)` | 从父节点中移除子节点（更新数据与 DOM） |
| `update_node()` | 编辑当前选中节点（打开表单） |
| `update_node_inputed(event)` | 处理编辑表单提交 |
| `update_node_data(node, data)` | 应用新数据到节点，并刷新 UI |
| `get_children_data(node)` | 通过 AJAX 获取某节点的子节点数据 |
| `create_node_children(node, data)` | 使用给定数据批量创建子节点 |
| `node_click_handle(node, event)` | 节点点击处理（控制选中状态切换） |
| `node_selected(node, flag)` | 分发节点选中事件 |
| `node_checked(node, event)` | 处理节点勾选状态变化，维护 `checked_data` 列表 |

---

## 事件机制

### 内部触发事件（通过 `dispatch` 分发）

| 事件名 | 触发时机 | 参数说明 |
|--------|---------|----------|
| `node_selected` | 节点被选中或取消选中 | 包含节点原始数据 + `selected: true/false` |
| `check_changed` | 节点勾选状态改变 | 节点数据对象 |
| `[command]` | 工具栏执行命令（如 `add`, `delete`） | 命令参数 + 元数据（referer、title 等） |

> 示例监听方式：
```js
tree.bind('node_selected', function(e){
    console.log('Selected node:', e.params);
});
```

---

## 图标与资源管理

### 图标策略

- 支持三种状态图标：
  - `open`: 展开状态图标
  - `close`: 收起状态图标
  - `leaf`: 叶子节点图标

- 图标来源优先级：
  1. `node_typeicons[type]` —— 按节点类型指定
  2. 回退到 `default_type`
  3. 使用内置默认图标集

```js
this.node_typeicons = {
    folder: {
        open: '/static/imgs/open-folder.svg',
        close: '/static/imgs/close-folder.svg',
        leaf: '/static/imgs/file.svg'
    },
    default_type: 'folder'
}
```

- 使用 `bricks_resource(path)` 解析静态资源路径。

---

## 编辑功能（EditableTree）

当配置 `editable` 选项时，启用增删改功能：

```js
editable: {
    fields: [ /* 表单字段定义 */ ],
    add_url: '/api/node/add',
    delete_url: '/api/node/delete',
    update_url: '/api/node/update'
}
```

### 功能流程

| 操作 | 流程 |
|------|------|
| 添加节点 | 弹出 `ModalForm` → 提交 → 调用 `add_url` → 成功后插入新节点 |
| 删除节点 | 确认对话框 → 调用 `delete_url` → 移除 DOM 与数据 |
| 修改节点 | 加载当前数据至表单 → 提交 → 调用 `update_url` → 局部刷新 UI |

> 注意：表单数据自动附加 `idField` 和 `parentField`（如有父节点）

---

## 数据结构要求

### 节点数据格式示例

```json
{
    "id": "n1",
    "name": "项目A",
    "type": "project",
    "is_leaf": false,
    "children": [
        {
            "id": "n11",
            "name": "子任务1",
            "is_leaf": true
        }
    ]
}
```

### 关键字段映射（可配置）

| 配置项 | 默认字段 |
|--------|----------|
| `idField` | `id` |
| `textField` | `name`（需在 `opts.textField` 中指定） |
| `is_leafField` | `is_leaf` |
| `typeField` | （可选）`type` |

---

## 使用示例

### 静态树（本地数据）

```js
var tree = new bricks.Tree({
    idField: 'id',
    textField: 'name',
    is_leafField: 'is_leaf',
    data: [
        { id: '1', name: '父节点', is_leaf: false, children: [
            { id: '2', name: '子节点', is_leaf: true }
        ]}
    ]
});
tree.open();
```

### 动态树（远程加载）

```js
var tree = new bricks.Tree({
    idField: 'id',
    textField: 'label',
    dataurl: '/api/tree/nodes',
    params: { app: 'doc' },
    row_height: '40px'
});
document.body.appendChild(tree.dom_element);
```

### 可编辑树

```js
var editableTree = new bricks.Tree({
    idField: 'id',
    textField: 'title',
    dataurl: '/api/tree',
    editable: {
        fields: [
            { name: 'title', label: '标题', type: 'text' },
            { name: 'type', label: '类型', type: 'select', options: [...] }
        ],
        add_url: '/api/node/add',
        delete_url: '/api/node/delete',
        update_url: '/api/node/update'
    }
});
```

---

## 异步加载机制

- 使用 `schedule_once(fn, delay)` 延迟执行以避免阻塞主线程
- 子节点数据仅在首次展开时请求一次（`children_loaded` 标志位控制）
- 支持无限层级嵌套

---

## 工具栏（Toolbar）

自动构建于树上方（如果启用了编辑或自定义工具）：

- 支持图标+文字按钮
- 可扩展自定义命令
- 命令可通过以下方式注入数据：
  - `selected_data: true` → 传入选中节点数据
  - `checked_data: true` → 传入所有勾选节点
  - 否则传入上下文数据（选中 > 勾选 > params）

---

## 注册组件

```js
bricks.Factory.register('Tree', bricks.Tree);
bricks.Factory.register('EditableTree', bricks.EditableTree); // 假设存在别名
```

允许通过描述符动态创建：
```js
bricks.widgetBuild({ widgettype: 'Tree', ...options }, parent);
```

---

## 已知限制与注意事项

1. **性能优化建议**：对于超大数据集（>1000 节点），建议启用虚拟滚动或懒加载优化。
2. **复选框过滤问题**：`checked_data` 过滤逻辑目前仅比较 `id`，应确保唯一性。
3. **FormData 处理**：对 `FormData` 类型做了特殊处理（`.append()`），兼容性强。
4. **图标路径错误排查**：注意 `bricks_resource()` 是否正确解析路径。
5. **循环引用风险**：`TreeNode` 持有 `tree` 和 `parent_node` 引用，注意内存释放。

---

## 附录：依赖函数说明

| 函数 | 来源 | 用途 |
|------|------|------|
| `bricks.extend(a, b)` | utils | 对象浅合并 |
| `bricks.uuid()` | utils | 生成唯一 ID |
| `bricks_resource(path)` | global | 解析资源路径 |
| `schedule_once(fn, delay)` | scheduler | 延迟执行函数 |
| `formdata2object(fd)` | utils | 将 FormData 转为普通对象 |
| `new bricks.HttpJson()` | net | 封装 JSON 请求 |

---

## 版本历史

- v1.0：初版发布，支持基本树形结构、异步加载、编辑操作、事件系统

---

> 文档维护者：Bricks Framework Team  
> 最后更新：2025年4月5日