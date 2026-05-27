# IconBar

控件功能：创建一个图标工具栏，包含多个可点击的SVG图标按钮，支持选中状态和事件分发。  
类型：容器控件  
父类控件：`bricks.HBox`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `opts.cheight` | Number | 子控件高度（字符单位），默认值为 `2` |
| `opts.rate` | Number | 缩放比例，影响图标大小，默认值为 `1` |
| `opts.margin` | String | 图标之间的左右边距，CSS格式（如 `'10px'`） |
| `opts.tools` | Array | 工具项数组，每个工具项是一个对象，包含以下字段：<br>- `name`: 工具名称（用于标识和事件）<br>- `icon`: SVG图标的URL<br>- `rate`: 当前图标的缩放比例（可选）<br>- `dynsize`: 是否动态调整尺寸（布尔值）<br>- `tip`: 提示文本（可选） |

> 如果未提供 `cheight` 或 `rate`，会自动设置默认值。

## 主要事件

| 事件名 | 触发条件 | 携带数据 |
|--------|---------|--------|
| `desc.name`（即 `tools[i].name`） | 点击某个图标时触发，事件名为该图标的 `name` 字段 | 传递对应图标的 `desc` 对象 |
| `command` | 所有图标点击都会触发此统一事件 | 传递当前图标的 `desc` 对象 |

> 事件通过 `dispatch` 分发，可用于外部监听具体命令或通用操作。

---

# IconTextBar

控件功能：扩展自 `IconBar`，每个工具项显示为“图标 + 文本”组合形式，适用于需要标签说明的工具栏。  
类型：容器控件  
父类控件：`bricks.IconBar`

## 初始化参数

继承 `IconBar` 的所有参数，并增强 `tools` 数组中每一项的支持：

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `opts.tools[i].label` | String | 显示在图标旁边的文本标签 |
| `opts.tools[i].tip` | String | 鼠标悬停提示文本，会应用到整个图标+文本容器上 |
| 其他参数同 `IconBar` | —— | 支持 `name`, `icon`, `rate`, `dynsize` 等 |

> 每个工具项会被构造成一个水平布局（`HBox`），内部依次添加 `Svg` 和 `Text` 控件。

## 主要事件

与 `IconBar` 完全一致：

| 事件名 | 触发条件 | 携带数据 |
|--------|---------|--------|
| `desc.name` | 点击某一项时触发，事件名为其 `name` | 对应的 `desc` 对象 |
| `command` | 所有点击均触发此事件 | 当前项的 `desc` 对象 |

> 事件绑定在整体 `HBox` 上，点击任意部分（图标或文字）都会触发。

---

# FloatIconBar

控件功能：浮动式图标工具栏，初始只显示一个“外挂图标”，鼠标移入时展开完整的 `IconBar`。常用于侧边悬浮工具栏。  
类型：容器控件  
父类控件：`bricks.HBox`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `opts` | Object | 传递给内部 `IconBar` 的配置对象，结构同 `IconBar` 的 `opts.tools` 等 |
| 内部使用 `bricks_resource('imgs/float-out.png')` | —— | 固定的浮出按钮图标 |

> 实际工具项由传入的 `opts` 构建内部 `IconBar` 使用。

## 主要事件

与内部 `IconBar` 保持一致：

| 事件名 | 触发条件 | 携带数据 |
|--------|---------|--------|
| `desc.name` | 用户点击展开后的某个图标时触发 | 对应图标的 `desc` 对象 |
| `command` | 所有图标点击都会触发 | 当前图标的 `desc` 对象 |

> 事件来自内嵌的 `IconBar` 实例，自动透传。

此外还具备行为事件：
- `mousemove` 在浮出图标上触发展开菜单
- 页面任意位置 `click` 触发收起菜单（通过监听 `bricks.Body`）

---

# FloatIconTextBar

控件功能：浮动式“图标+文本”工具栏，是 `FloatIconBar` 的扩展版本，展开后显示带文字标签的工具项。  
类型：容器控件  
父类控件：`bricks.FloatIconBar`

## 初始化参数

与 `FloatIconBar` 相同：

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `opts` | Object | 包含 `tools` 数组及其他配置，在内部构建 `IconTextBar` 时使用 |

> 内部调用 `build_bar(opts)` 创建的是 `IconTextBar` 实例，因此支持 `label`、`tip` 等文本相关属性。

## 主要事件

与 `IconTextBar` 一致：

| 事件名 | 触发条件 | 携带数据 |
|--------|---------|--------|
| `desc.name` | 点击展开后的某一项时触发 | 该项的 `desc` 对象 |
| `command` | 所有点击都触发 | 当前项的 `desc` 对象 |

> 所有事件均由内部 `IconTextBar` 实例发出，自动向上冒泡。