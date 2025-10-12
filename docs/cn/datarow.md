# `bricks.DataRow` 技术文档

> **模块**: `bricks.js`  
> **类名**: `bricks.DataRow`  
> **继承自**: `bricks.HBox`

---

## 概述

`bricks.DataRow` 是一个用于渲染表格行的 UI 组件，通常用于数据浏览器（Data Browser）或列表视图中。它支持表头行和数据行两种渲染模式，能够根据配置自动构建字段、工具栏，并处理用户交互。

该组件继承自 `bricks.HBox`，因此具备水平布局能力，适用于构建可扩展的数据展示界面。

---

## 配置选项 (Options)

| 属性 | 类型 | 说明 |
|------|------|------|
| `toolbar` | Object / null | 工具栏配置对象，包含 `tools` 数组，定义操作图标按钮。在表头中将被替换为空白图标。 |
| `fields` | Array | 字段定义数组，每个字段描述一个列的显示方式（如名称、类型等）。 |
| `css` | String / Object | 自定义 CSS 样式，应用于整个 DataRow 容器。 |
| `browserfields` | Object | 浏览器专用配置：<br>- `exclouded`: 排除显示的字段名数组<br>- `cwidth`: 各字段的列宽映射（单位：字符宽度） |
| `editexclouded` | Array | （未使用）预留字段排除列表（当前未实现逻辑）。 |
| `header_css` | String / Object | 表头行的额外 CSS 样式。 |
| `checkField` | String | 可选字段名，用于启用复选框列（例如选择记录）。值会绑定到 `user_data[checkField]`。 |

### 字段定义 (`fields` 中的对象)

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | String | 字段名，对应数据中的键。 |
| `label` | String | 列标题；若未提供，则使用 `name` 作为标签。 |
| `uitype` | String | 控件类型（如 `'str'`, `'int'`, `'date'` 等），决定如何渲染该字段。 |
| `cwidth` | Number | 列宽（以字符为单位，默认为 10）。优先级低于 `browserfields.cwidth`。 |
| `value` | Any | （仅用于表头）默认值或标签文本。 |
| 其他属性 | - | 支持传递给具体 ViewBuilder 的其他参数。 |

---

## 方法

### 构造函数 `constructor(opts)`

初始化 `DataRow` 实例并设置初始状态。

```js
new bricks.DataRow(options);
```

#### 参数：
- `opts` (Object): 配置选项对象，参见上文。

#### 内部初始化：
- 调用父类构造函数。
- 初始化 `this.record_w = null` —— 用于存放字段控件的容器。

---

### `render_header()`

渲染表头行（即列标题）。

```js
row.render_header();
```

内部调用 `this.render(true)`，指示进入“表头”模式。

---

### `render_data()`

渲染数据行（即实际记录内容）。

```js
row.render_data();
```

内部调用 `this.render(false)`，表示渲染真实数据。

---

### `render(header)`

主渲染方法，区分表头与数据行逻辑。

#### 参数：
- `header` (Boolean)：是否渲染为表头。

#### 行为：
1. 若存在 `checkField`：
   - 表头：添加一个空图标（`bricks.BlankIcon`）
   - 数据行：添加一个可交互的复选框（`bricks.UiCheck`），绑定 `changed` 事件到 `get_check_state`
2. 调用 `build_fields(header)` 渲染所有字段。

---

### `renew(record)`

更新当前行的数据源并重新渲染字段内容。

#### 参数：
- `record` (Object): 新的数据记录对象。

#### 行为：
- 更新 `this.user_data = record`
- 清空原有字段容器 `record_w`
- 重建字段控件

> ⚠️ 注意：不会重建整个 DOM 结构，仅刷新字段内容，性能更优。

---

### `get_check_state(e)`

处理复选框状态变化事件。

#### 参数：
- `e` (Event): 来自 `UiCheck` 的 `changed` 事件。

#### 行为：
- 获取新值并同步回 `this.user_data[this.checkField]`
- 触发 `check_changed` 事件，携带自身实例作为参数

```js
this.dispatch('check_changed', this);
```

可用于外部监听选中状态变更。

---

### `build_toolbar(header)`

构建工具栏区域（如操作按钮：编辑、删除等）。

#### 参数：
- `header` (Boolean): 是否为表头模式。

#### 行为：
- 表头模式下，所有工具替换为占位图标（`blankicon`），保持对齐
- 数据行模式下，正常加载工具项
- 创建 `bricks.IconBar` 实例并添加至组件
- 为每个非空白工具绑定事件监听器，通过 `my_dispatch` 转发事件名

> ✅ 支持事件冒泡机制，便于外部监听工具点击事件。

---

### `my_dispatch(e)`

事件转发函数工厂，生成能正确派发事件的方法。

#### 参数：
- `e` (String): 事件名称（如 `'edit'`, `'delete'`）

#### 返回：
- Function: 闭包函数，调用 `this.dispatch(e)`，确保上下文正确。

常用于绑定：

```js
w.bind(tools[i].name, this.my_dispatch(tools[i].name));
```

---

### `build_fields(header, cw?)`

创建字段容器并启动字段构建流程。

#### 参数：
- `header` (Boolean): 是否为表头
- `cw` (Widget, 可选): 外部传入的容器，默认新建 `HBox`

#### 行为：
- 创建新的 `HBox` 容器 `record_w`
- 设置样式类 `childrensize`
- 添加进主组件
- 调用 `_build_fields` 执行具体构建

---

### `_build_fields(header, cw)`

私有方法：逐个构建字段控件。

#### 参数：
- `header` (Boolean): 是否为表头
- `cw` (Container Widget): 目标容器

#### 流程：
1. 解析 `browserfields.exclouded` 和 `cwidths` 配置
2. 将 `checkField` 加入排除列表（避免重复显示）
3. 遍历 `this.fields`：
   - 跳过被排除的字段
   - 构造字段控件参数 `opts`
     - 表头：显示 `label` 或 `name`
     - 数据行：从 `user_data` 提取值
   - 使用 `bricks.get_ViewBuilder(uitype)` 获取对应的视图生成器
   - 回退到 `'str'` 类型生成器以防不支持的类型
   - 实例化控件并添加到容器
   - 添加 CSS 类 `tabular-cell` 保证表格样式一致

---

## 事件系统

`DataRow` 支持以下事件分发：

| 事件名 | 触发时机 | 携带参数 |
|--------|----------|---------|
| `check_changed` | 复选框状态改变时 | 当前行实例 (`this`) |
| `[tool.name]` | 工具栏按钮被点击时（如 `'edit'`, `'delete'`） | 由 `IconBar` 触发，可通过 `bind()` 监听 |

示例监听：

```js
row.bind('check_changed', function(sender){
    console.log("选中状态变化:", sender.user_data);
});
```

---

## 注册信息

```js
bricks.Factory.register('DataRow', bricks.DataRow);
```

允许通过工厂方式创建实例：

```js
var row = bricks.Factory.create('DataRow', options);
```

---

## 使用示例

### 创建表头行

```js
var headerRow = new bricks.DataRow({
    fields: [
        { name: 'id', label: 'ID', uitype: 'int', cwidth: 5 },
        { name: 'name', label: '姓名', uitype: 'str', cwidth: 15 },
        { name: 'age', label: '年龄', uitype: 'int' }
    ],
    checkField: 'selected'
});

headerRow.render_header(); // 渲染列标题 + 复选框占位
container.add_widget(headerRow);
```

### 创建数据行

```js
var dataRow = new bricks.DataRow({
    fields: [...],
    checkField: 'selected',
    browserfields: {
        exclouded: ['internal_id'],
        cwidths: { name: 20 }
    },
    toolbar: {
        tools: [
            { name: 'edit', icon: 'pencil' },
            { name: 'delete', icon: 'trash' }
        ]
    }
});

dataRow.renew({ id: 1, name: '张三', age: 25, selected: 1 });
container.add_widget(dataRow);
```

---

## 设计特点

- **双模式渲染**：同一组件支持表头与数据行，减少冗余代码。
- **灵活字段控制**：通过 `browserfields.exclouded` 动态隐藏字段。
- **列宽管理**：支持全局与字段级 `cwidth` 控制布局。
- **事件解耦**：通过 `dispatch` 实现松耦合通信。
- **可扩展性**：基于 `ViewBuilder` 插件机制支持多种字段类型。

---

## 注意事项

1. `editexclouded` 字段目前未在代码中使用，可能是遗留字段。
2. `toolbar.tools.forEach(...)` 应注意空指针风险，建议增加判空保护。
3. `_build_fields` 中 `cwidths` 键名为 `cwidths`，但配置写的是 `cwidth`，可能存在拼写错误（应统一为 `cwidth`）。
4. 建议在 `renew()` 中判断 `record_w` 是否已存在，避免重复创建。

---

## 版本信息

- **Author**: Bricks Framework Team
- **Version**: 1.0
- **Last Modified**: 2025-04-05

--- 

✅ 文档完