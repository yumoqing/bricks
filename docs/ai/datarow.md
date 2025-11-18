# DataRow

**控件功能**：用于在表格或列表中展示一行数据，支持表头和数据行的渲染，可包含字段显示、复选框选择以及工具栏操作。常用于数据浏览界面中的行级交互。

**类型**：容器控件  
**父类控件**：`bricks.HBox`

## 初始化参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `opts.toolbar` | Array | 工具栏配置数组，定义该行上可显示的操作图标按钮（仅非表头行生效）。每个工具项将触发对应事件。 |
| `opts.fields` | Array | 字段定义数组，每个元素描述一个显示字段，包括 `name`、`label`、`uitype`、`cwidth` 等属性。 |
| `opts.css` | String/Object | 自定义样式类名或 CSS 属性对象，应用于该控件根元素。 |
| `opts.browserfields` | Object | 浏览模式下的字段控制选项：<br> - `exclouded`: 排除显示的字段名数组；<br> - `cwidth`: 指定各字段的列宽（以字符单位计）。 |
| `opts.editexclouded` | Array | 编辑模式下排除的字段列表（当前未使用）。 |
| `opts.header_css` | String/Object | 表头行专用的自定义样式。 |
| `opts.checkField` | String | 若设置，则在行首添加复选框控件，绑定到指定字段名，用于选择/反选记录。 |

> 注：`DataRow` 继承自 `HBox`，因此也支持其布局相关参数如 `height: 'auto'`。

## 主要事件

| 事件名 | 触发时机 | 传递参数 |
|--------|----------|---------|
| `check_changed` | 当行内复选框状态改变时触发 | 触发该事件的 `DataRow` 实例本身 |
| `[tool.name]`（动态） | 点击工具栏中某个非空白图标按钮时触发，事件名为按钮的 `name` | 由 `IconBar` 触发，携带点击信息，通过 `my_dispatch` 转发至外部监听器 |

> 示例：若 `toolbar.tools` 中有 `{ name: 'delete' }`，则点击该图标会触发名为 `delete` 的事件。
