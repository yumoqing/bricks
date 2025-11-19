# `bricks.DataGrid` 技术文档

> **基于 `bricks.js` 框架的可冻结列数据表格组件**

---

## 概述

`bricks.DataGrid` 是一个功能丰富的前端数据网格组件，支持：
- 冻结列（固定左侧列）
- 虚拟滚动与分页加载
- 动态字段渲染（通过 `uitype` 和 `uioptions`）
- 行选择、点击事件处理
- 工具栏、迷你表单集成
- 多语言支持（i18n）

该组件继承自 `bricks.VBox`，采用模块化设计，结合 `bricks.Row` 实现每行数据的封装和交互。

---

## 类结构

### 1. `bricks.Row`

表示数据网格中的一行记录。

#### 构造函数：`constructor(dg, rec)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `dg` | `bricks.DataGrid` | 所属的数据网格实例 |
| `rec` | `Object` | 当前行的数据对象 |

**初始化内容：**
- 复制数据：`this.data = objcopy(rec)`
- 初始化列容器：`freeze_cols`, `normal_cols`
- 创建列控件：调用 `create_col_widgets()` 分别生成冻结列和普通列
- 设置宽度样式
- 绑定点击处理器

#### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `dg` | `DataGrid` | 所属的数据网格对象 |
| `data` | `Object` | 当前行原始数据副本 |
| `freeze_cols` | `Array<bricks.Widget>` | 冻结列中的控件列表 |
| `normal_cols` | `Array<bricks.Widget>` | 非冻结列中的控件列表 |
| `name_widgets` | `Object` | 字段名 → 控件映射表 |
| `click_handler` | `Function` | 点击事件处理器（绑定到所属 DataGrid） |
| `freeze_row` | `bricks.HBox` 或 `null` | 包含所有冻结列控件的水平布局容器 |
| `normal_row` | `bricks.HBox` 或 `null` | 包含所有非冻结列控件的水平布局容器 |

#### 方法

##### `create_col_widgets(fields, cols)` → `bricks.HBox|null`

根据字段定义创建对应的 UI 控件，并放入指定数组中。

**参数：**
- `fields`: 字段配置数组
- `cols`: 输出控件数组（引用传递）

**逻辑流程：**
1. 遍历每个字段 `f`
2. 合并默认选项：
   ```js
   {
     name: f.name,
     label: f.label,
     uiype: f.uitype,
     width: f.width,
     required: true,
     row_data: objcopy(this.data),
     readonly: true
   }
   ```
3. 根据 `uitype` 创建不同控件：
   - `'button'`: 使用 `bricks.Button`，绑定 `button_click`
   - 其他类型：使用 `bricks.viewFactory(opts, this.data)`
4. 为控件设置样式（flex 布局、最小宽度）
5. 将控件加入 `cols` 数组及 `name_widgets` 映射
6. 最终返回一个包含这些控件的 `HBox`

**返回值：**
- 成功时返回 `HBox` 容器
- 若无字段则返回 `null`

---

##### `button_click(event)`

按钮点击回调函数。

**行为：**
- 临时重写 `getValue()` 方法，使其返回整行数据
- 准备动作描述符 `desc`（含 action、params、datawidget 等）
- 触发全局处理器 `universal_handler`

> ⚠️ 注意：此方法在 `Button` 上下文中执行（通过 `.bind(w)` 绑定）

---

##### `selected()`

将当前行设为“已选”状态（视觉高亮）。

**操作：**
- 遍历所有列控件，移除 `'selected'` CSS 类

##### `unselected()`

取消当前行的选择状态。

**操作：**
- 添加 `'selected'` CSS 类至所有列控件

##### `toogle_select(e, f)`

手动切换 DOM 元素的选中类。

| 参数 | 类型 | 说明 |
|------|------|------|
| `e` | `HTMLElement` | 要操作的元素 |
| `f` | `Boolean` | 是否添加 `'selected'` 类 |

---

### 2. `bricks.DataGrid` （主类）

继承自 `bricks.VBox`，实现完整的数据表格功能。

#### 构造函数：`constructor(opts)`

**参数 `opts` 支持以下属性：**

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `dataurl` | `String` | 否 | - | 数据接口 URL（用于异步加载） |
| `method` | `String` | 否 | `'GET'` | 请求方式 |
| `params` | `Object` | 否 | `{}` | 请求参数 |
| `title` | `String` | 否 | - | 表格标题（显示为 `Title1`） |
| `description` | `String` | 否 | - | 表格描述文本 |
| `show_info` | `Boolean` | 否 | `false` | 是否显示信息栏 |
| `miniform` | `Object` | 否 | - | 查询条件迷你表单配置 |
| `toolbar` | `Object` | 否 | - | 工具栏按钮配置 |
| `row_height` | `Number/String` | 否 | `'auto'` | 表头行高度 |
| `header_css` | `String` | 否 | `'grid_header'` | 表头 CSS 类名 |
| `body_css` | `String` | 否 | `'grid_body'` | 表体 CSS 类名 |
| `fields` | `Array<Object>` | 是 | - | 字段定义数组（见下文） |
| `check` | `Boolean` | 否 | `false` | 是否显示复选框列 |
| `lineno` | `Boolean` | 否 | `false` | 是否显示序号列 |
| `admin` | `Any` | 否 | - | 管理员权限标志（预留扩展） |

#### 字段定义 (`fields`) 结构

每个字段对象包含：

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `String` | 字段名（对应数据键） |
| `label` | `String` | 显示标签（支持 i18n） |
| `datatype` | `String` | 数据类型（如 string, int, date） |
| `uitype` | `String` | 控件类型（text, number, button, checkbox 等） |
| `uioptions` | `Object` | 控件额外配置项 |
| `freeze` | `Boolean` | 是否冻结（固定在左侧） |
| `width` | `Number/String` | 列宽（单位 px） |

> 特殊字段自动插入：
> - `_check`: 复选框列（当 `check=true`）
> - `_lineno`: 序号列（当 `lineno=true`）

---

#### 主要属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `loading` | `Boolean` | 是否正在加载数据 |
| `select_row` | `bricks.Row` | 当前选中行对象 |
| `dataurl`, `method`, `params` | `String/Object` | 数据请求配置 |
| `fields` | `Array` | 所有字段定义 |
| `freeze_fields` / `normal_fields` | `Array` | 分离后的冻结/非冻结字段列表 |
| `freeze_width` / `normal_width` | `Number` | 冻结区与主体区域总宽度（px） |
| `freeze_part`, `normal_part` | `VBox` | 左右两部分容器 |
| `freeze_header`, `normal_header` | `HBox` | 表头容器 |
| `freeze_body`, `normal_body` | `VScrollPanel` | 表体滚动容器 |
| `loader` | `BufferedDataLoader` | 缓冲式数据加载器 |
| `miniform` | `MiniForm` | 查询表单 |
| `toolbar` | `Toolbar` | 工具栏 |

---

#### 核心方法

##### `create_parts()`

初始化整个表格结构，包括：
1. 分离字段为 `freeze_fields` 和 `normal_fields`
2. 计算各区域宽度
3. 创建左右两个垂直容器（带滚动）
4. 构建表头（调用 `create_header()`）
5. 设置同步滚动机制（`coscroll`）

> ✅ 如果启用了 `check` 或 `lineno`，会自动插入特殊字段。

---

##### `create_header()`

创建表头单元格，使用 `bricks.Text` 显示字段 `label` 或 `name`。

- 每个文本控件设置 `flex` 样式以匹配列宽
- 添加 `column_no` 属性到 DOM 元素（格式：`f0`, `n1`...），便于后续定位

---

##### `add_rows(records, direction)` 

批量添加多行数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `records` | `Array<Object>` | 数据记录数组 |
| `direction` | `'up' \| 'down'` | 添加方向（默认 `'down'`） |

内部循环调用 `add_row()`。

---

##### `add_row(data, index)` 

添加单行数据。

**步骤：**
1. 实例化 `new bricks.Row(this, data)`
2. 将其 `freeze_row` 和 `normal_row` 分别加入左右容器
3. 可指定插入位置（`index`）

---

##### `clear_data()` 

清空所有行数据并重置选中行。

- 清除 `freeze_body` 和 `normal_body` 中的控件
- 设置 `selected_row = null`

---

##### `del_old_rows(cnt, direction)` 

删除旧的若干行（用于虚拟滚动优化）。

| 参数 | 说明 |
|------|------|
| `cnt` | 删除数量 |
| `direction` | `'up'`（顶部删除）或 `'down'`（底部删除） |

---

##### `loadData(params)` 

重新加载数据（通常由外部触发）。

委托给 `this.loader.loadData(params)`

---

##### `miniform_input(event)` 

监听迷你表单输入事件，自动调用 `loadData()`。

---

##### `command_handle(event)` 

工具栏命令处理钩子（需用户自行覆盖实现）。

---

##### `coscroll(event)` 

实现左右两列区域的垂直滚动同步。

**原理：**
- 监听任一侧 `VScrollPanel` 的 `scroll` 事件
- 同步另一侧的 `scrollTop`

> 保证冻结列与主表体垂直对齐

---

##### `load_previous_data()` / `load_next_data()`

响应滚动到底部/顶部阈值时，加载前一页/后一页数据。

内部调用 `this.loader.previousPage()` 或 `nextPage()`

> 通过 `min_threshold` / `max_threshold` 事件绑定触发

---

##### `click_handler(row, event)` 

行内控件点击统一处理器。

**行为：**
1. 取消之前选中行的高亮
2. 高亮当前行（调用 `row.selected()`）
3. 触发 `row_click` 自定义事件
4. 输出调试日志

> 此函数作为 `bind` 上下文传入每一行控件

---

## 事件系统

| 事件名 | 触发时机 | 传递参数 |
|-------|---------|--------|
| `row_click` | 用户点击某一行 | `bricks.Row` 实例 |
| `input` (from miniform) | 迷你表单值变化 | event 对象 |
| `command` (from toolbar) | 工具栏按钮被点击 | command 名称等 |

---

## 样式类说明（CSS Classes）

| 类名 | 应用元素 | 用途 |
|------|----------|------|
| `datagrid` | 外层容器 | 主体样式 |
| `datagrid-grid` | 主 `HBox` | 网格布局容器 |
| `datagrid-left` | 冻结区 `VBox` | 左侧固定列容器 |
| `datagrid-right` | 主体区 `VBox` | 右侧可滚动列容器 |
| `grid_header` | 表头 `HBox` | 表头样式 |
| `datagrid-body` | `VScrollPanel` | 表体滚动区域样式 |
| `selected` | 单元格/行 | 高亮选中状态 |

---

## 注册与使用

```js
// 注册组件工厂
bricks.Factory.register('DataGrid', bricks.DataGrid);
```

### 示例用法

```js
var grid = new bricks.DataGrid({
  title: "用户列表",
  dataurl: "/api/users",
  method: "POST",
  params: { dept: "sales" },
  check: true,
  lineno: true,
  row_height: 40,
  fields: [
    { name: "name", label: "姓名", uitype: "text", freeze: true, width: 120 },
    { name: "age", label: "年龄", uitype: "int", width: 80 },
    { name: "edit", label: "编辑", uitype: "button", icon: "edit", action: { cmd: "edit_user" }, width: 60 }
  ],
  miniform: { /* mini form config */ },
  toolbar: { items: [ /* toolbar buttons */ ] }
});

container.add_widget(grid);
```

---

## 调试与日志

使用 `bricks.debug(...)` 输出关键流程日志，例如：
- 列宽计算结果
- 滚动事件触发
- 数据加载过程

可通过浏览器控制台查看。

---

## 依赖说明

本组件依赖以下 `bricks.js` 模块：
- `bricks.VBox`, `bricks.HBox`：布局容器
- `bricks.Text`, `bricks.Button`, `bricks.Title1`：基础控件
- `bricks.MiniForm`, `bricks.Toolbar`：功能控件
- `bricks.VScrollPanel`：滚动面板
- `bricks.BufferedDataLoader`：分页数据加载器
- `bricks.viewFactory`：动态视图工厂
- `objcopy()`：对象深拷贝工具
- `convert2int()`：安全转整数
- `schedule_once()`：延迟执行函数

---

## 设计亮点

✅ **高性能虚拟滚动**  
通过 `BufferedDataLoader` + `min_threshold/max_threshold` 实现大数据量流畅浏览。

✅ **灵活 UI 扩展性**  
支持任意 `uitype` 字段类型，可通过 `viewFactory` 扩展。

✅ **双列同步滚动**  
完美实现冻结列与主体列的垂直同步滚动。

✅ **模块化架构**  
`Row` 类独立封装行逻辑，易于维护和定制。

---

## 待改进点（建议）

- ❌ 错误：`self.toolbar` 应为 `this.toolbar`
- 🔧 增加 `destroy()` 方法清理事件监听
- 📈 支持横向滚动同步（如有必要）
- 💡 提供 `getValue()` 获取所有选中行数据的方法
- 🔄 支持列排序、过滤等高级功能扩展

---

## 版本信息

- 编写时间：2025年4月
- 作者：Bricks Framework 团队
- 文档版本：v1.0

--- 

> 📘 提示：请确保引入完整 `bricks.js` 框架及其依赖资源（CSS、图标等）以正确渲染组件。