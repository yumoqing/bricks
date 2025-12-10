# `bricks.Tabular` 技术文档

```markdown
# bricks.Tabular 类文档

`bricks.Tabular` 是一个基于 `bricks.DataViewer` 的表格数据展示组件，用于在 Web 界面中以表格形式渲染结构化数据。它支持行选择、复选框状态变更监听、动态内容展开（折叠面板）、字段过滤等功能，适用于需要交互式表格的前端应用场景。

---

## 继承关系

- **继承自**：`bricks.DataViewer`
- **注册名称**：`Tabular`（通过 `bricks.Factory.register` 注册）

---

## 构造函数

```js
constructor(opts)
```

### 参数
- `opts` (Object) - 配置选项，传递给父类 `DataViewer` 并用于初始化当前实例。

### 说明
调用父类构造函数后，绑定 `row_check_changed` 事件，触发时执行 `show_check_event_data` 方法（需确保该方法存在或已定义）。

> ⚠️ 注意：`this.show_check_event_data.bind(this)` 表明此方法应在外部实现或混入。

---

## 核心方法

### `async build_other()`
在数据构建阶段调用，用于初始化编辑字段。

#### 功能
调用 `get_edit_fields()` 方法，提取可编辑字段列表并存储到 `this.fields` 中。

---

### `async before_data_handle()`
在处理数据前异步执行的钩子函数。

#### 功能
1. 调用 `build_header_row()` 创建表头行；
2. 设置数据偏移量为 1（可能用于跳过表头占位）。

#### 属性设置
- `this.data_offset = 1`

---

### `async build_header_row()`
创建并渲染表格的表头行。

#### 实现逻辑
1. 合并配置项：将 `cheight` 和 `row_options` 扩展为新的 `options`；
2. 创建 `DataRow` 实例作为表头；
3. 渲染但不立即插入内容（`render(false)`）；
4. 添加 CSS 类名 `tabular-header-row`；
5. 将其添加至滚动容器 `scrollpanel`。

#### 示例代码
```js
var dr = new bricks.DataRow(options);
dr.set_css('tabular-header-row');
this.scrollpanel.add_widget(dr);
```

---

### `async build_record_view(record)`
根据记录数据构建单条记录的视图。

#### 参数
- `record` (Object) - 数据记录对象。

#### 返回值
- `Promise<Widget>` - 返回包装后的行控件（VBox 或 DataRow）。

#### 分支逻辑
| 条件 | 行为 |
|------|------|
| `!this.content_view` | 直接返回 `DataRow`，绑定点击事件 |
| `this.content_view` | 使用 `VBox` 包裹主行和隐藏的内容区，支持展开/折叠 |

##### 内部结构（含 content_view 时）
- 主显示区域：`row.rec_widget`
- 折叠内容区域：`row.content_widget`（初始隐藏）
- 存储原始数据：`row.user_data = record`

##### 事件绑定
- 点击主行触发 `record_clicked(row, record, event)`

---

### `async record_clicked(row, record, event)`
处理行点击事件，实现单选高亮与内容展开控制。

#### 参数
- `row` - 当前行控件（可能是 `DataRow` 或 `VBox`）
- `record` - 对应的数据记录
- `event` - 原生事件对象

#### 功能
1. 取消上一个选中行的高亮样式；
2. 若启用了 `content_view`，则关闭旧行的内容区；
3. 切换当前行为选中状态：
   - 更新 `this.select_row`
   - 显示高亮样式
   - 如启用 `content_view`，调用 `toggle_content(true)` 展开内容
4. 触发 `row_selected` 事件，携带当前记录数据。

---

### `async toggle_content(row, flag)`
控制某一行的折叠内容区域的显示或隐藏。

#### 参数
- `row` (VBox) - 包含 `.content_widget` 的行容器
- `flag` (Boolean) - `true` 展开，`false` 收起

#### 行为
- `flag === true`:
  - 显示内容区
  - 清空现有子控件
  - 复制 `this.content_view` 描述结构
  - 应用当前行数据进行模板填充
  - 异步构建新控件并插入
- `flag === false`:
  - 隐藏内容区
  - 清除所有子控件

> ✅ 支持动态内容渲染，常用于详情展示、表单嵌套等场景。

---

### `get_edit_fields()`
提取可用于编辑的字段列表，排除指定字段。

#### 参数来源
- `this.row_options.fields`: 字段定义数组
- `this.row_options.editexclouded`: 排除字段名数组（拼写疑似错误，应为 `excluded`）

#### 流程
遍历所有字段，若字段名不在 `editexclouded` 列表中，则加入 `this.fields` 数组。

> ❗ 注意：`editexclouded` 拼写异常，建议检查是否应为 `editExcluded` 或类似命名。

---

### `async build_info(record)`
构建单条数据行的显示控件（`DataRow`）。

#### 参数
- `record` (Object | null) - 数据记录；若为空表示构建表头

#### 配置合并
使用 `bricks.extend` 合并默认高度与行选项。

#### 渲染逻辑
- 设置 CSS 类名为 `tabular-row`
- 调用 `dr.render(header)` 控制是否渲染为表头
- 绑定 `check_changed` 事件 → `record_check_changed`

> 🔤 注释掉的部分涉及工具栏事件代理，目前未启用。

---

### `record_check_changed(event)`
处理复选框状态变化事件。

#### 行为
1. 保存最后变更的行到 `this.check_changed_row`
2. 派发 `row_check_changed` 事件，携带用户数据

#### 派发事件
- 事件名：`row_check_changed`
- 参数：`event.params.user_data`

---

### `async renew_record_view(form, row)`
更新指定行的数据视图（如编辑后刷新显示）。

#### 参数
- `form` - 表单控件实例，用于获取最新值
- `row` - 要更新的行控件

#### 步骤
1. 获取表单数据：`form._getValue()`
2. 合并到原记录：`bricks.extend(row.user_data, d)`
3. 调用 `renew(record)` 更新 UI：
   - 若有 `content_view`：仅更新主显示部分 `rec_widget`
   - 否则：直接更新整行

---

### `record_event_handle(event_name, record, row, item)`
通用事件处理器，用于转发来自 `DataRow` 工具栏的操作事件。

#### 参数
- `event_name` - 事件类型字符串
- `record` - 当前行数据
- `row` - 行控件实例
- `item` - 触发事件的具体元素（如按钮）

#### 行为
打印日志，并派发对应事件，携带 `record` 数据。

> 📝 日志输出便于调试，生产环境可考虑移除或降级。

---

### `get_hidefields()`
生成隐藏字段数组，通常用于向后端提交额外参数。

#### 返回值
- Array<{name, value, uitype}>: 每个字段设置 `uitype: 'hide'`

#### 数据源
从 `this.data_params` 对象提取键值对，转换为字段格式。

#### 示例输出
```js
[
  { name: "user_id", value: 123, uitype: "hide" },
  { name: "mode", value: "preview", uitype: "hide" }
]
```

---

## 事件系统

| 事件名 | 触发时机 | 携带参数 |
|-------|---------|--------|
| `row_check_changed` | 行复选框状态改变 | `record`（用户数据） |
| `row_selected` | 用户点击某行 | `record`（用户数据） |
| （转发）任意 `event_name` | 来自 `DataRow.toolbar_w` 的事件 | `record` |

---

## 样式类说明

| CSS 类名 | 用途 |
|--------|------|
| `tabular-header-row` | 表头行样式 |
| `tabular-row` | 普通行样式 |
| `tabular-row-selected` | 选中行高亮样式 |

---

## 工厂注册

```js
bricks.Factory.register('Tabular', bricks.Tabular);
```

允许通过描述符 `{type: 'Tabular', ...}` 动态创建实例。

---

## 使用示例（伪代码）

```js
var tabular = new bricks.Tabular({
  cheight: 30,
  row_options: {
    fields: [
      { name: 'name', label: '姓名' },
      { name: 'age', label: '年龄' }
    ],
    editexclouded: ['age'] // age 不参与编辑
  },
  content_view: {
    type: 'Form',
    items: [
      { field: 'detail', uitype: 'textarea' }
    ]
  }
});

tabular.bind('row_selected', function(data) {
  console.log('Selected:', data);
});

// 加载数据
tabular.setData(records);
```

---

## 注意事项

1. **拼写问题**：`editexclouded` 应为 `editExcluded` 或 `excludedFields`，建议修正。
2. **依赖项**：依赖 `bricks.DataRow`, `bricks.VBox`, `bricks.widgetBuild`, `objcopy`, `bricks.apply_data` 等模块，请确保已加载。
3. **异步安全**：多数方法标记为 `async`，调用时需使用 `await`。
4. **事件解绑**：未见销毁生命周期管理，长期运行可能导致内存泄漏。

---
```