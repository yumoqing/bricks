# HBox

**控件功能**：水平布局容器，用于将子控件沿水平方向排列。  
**类型**：容器控件  
**父类控件**：`bricks.Layout`

## 初始化参数

- `options` (Object, 可选)：配置选项对象，继承自 `Layout` 的通用选项。
  - 无特有参数，构造函数中仅调用父类并设置 CSS 类 `'hcontainer'`。

## 主要事件

- 无特有事件。
- 继承自 `Layout` 的键盘导航事件支持（当启用 `keyselectable` 时）：
  - `keydown`：处理方向键（左/右切换层级，上/下切换选中项，Enter 触发点击）。

---

# FHBox

**控件功能**：固定水平布局容器，防止子元素换行，适用于不可折行的水平排列场景。  
**类型**：容器控件  
**父类控件**：`bricks.HBox` → `bricks.Layout`

## 初始化参数

- `options` (Object, 可选)：配置选项对象。
  - 无额外参数，构造函数中调用父类后设置样式 `flexWrap: 'nowrap'`。

## 主要事件

- 与 `HBox` 相同，依赖 `Layout` 提供的键盘导航逻辑。
- 支持通过方向键进行焦点控制和 Enter 键触发点击。

---

# VBox

**控件功能**：垂直布局容器，用于将子控件沿垂直方向排列。  
**类型**：容器控件  
**父类控件**：`bricks.Layout`

## 初始化参数

- `options` (Object, 可选)：配置选项对象。
  - 无特有参数，构造函数中仅设置 CSS 类 `'vcontainer'`。

## 主要事件

- 无特有事件。
- 同样支持 `Layout` 定义的键盘导航机制（上下选择、左右进入/退出层级等）。

---

# FVBox

**控件功能**：固定垂直布局容器，防止子元素换行，适用于不可折行的垂直排列。  
**类型**：容器控件  
**父类控件**：`bricks.VBox` → `bricks.Layout`

## 初始化参数

- `options` (Object, 可选)：配置选项对象。
  - 无额外参数，构造函数中设置 `flexWrap: 'nowrap'`。

## 主要事件

- 与 `VBox` 相同，支持完整的键盘导航行为。

---

# Filler

**控件功能**：弹性填充控件，用于在 Flex 布局中占据剩余空间，实现动态布局平衡。通常用于撑开其他组件间距。  
**类型**：容器控件（但一般不添加子控件）  
**父类控件**：`bricks.Layout`

## 初始化参数

- `options` (Object, 可选)：配置选项对象。
  - 无特有参数，构造函数中设置 CSS 类 `'filler'`。
  - 注释代码中曾计划设置 `flexGrow: 1` 和 `overflow: auto`，当前未启用。

## 主要事件

- 无特有事件。
- 支持被纳入键盘导航栈（若显式启用 `keyselectable`），但实际用途较少。

---

# ResponsableBox

> （注：类名可能应为 "ResponsiveBox"，拼写疑似笔误）

**控件功能**：响应式布局容器，能根据自身宽高比自动切换为横向或纵向布局模式。宽度大于高度时为横向（hcontainer），否则为纵向（vcontainer）。  
**类型**：容器控件  
**父类控件**：`bricks.Layout`

## 初始化参数

- `opts` (Object, 可选)：配置选项对象，传递给父类 `Layout`。
  - 构造函数中绑定 `'element_resize'` 事件以监听尺寸变化。

## 主要事件

- `element_resize`：当容器尺寸发生变化时触发，驱动 `reset_type()` 方法重新判断布局方向。
- 自动调整 CSS 类和宽高样式：
  - 宽 > 高：应用 `'hcontainer'`，高度 100%，宽度自适应。
  - 高 ≥ 宽：应用 `'vcontainer'`，宽度 100%，高度自适应。
- 支持嵌套键盘导航，行为由 `Layout` 统一管理。

---

# Layout

> 虽未直接注册工厂名（但其子类已注册），`Layout` 是所有上述容器的基类，核心功能集中在此。

**控件功能**：基础布局容器类，提供通用的子控件管理、键盘可选支持、标题/描述构建、工具栏集成等功能。是所有布局控件的共同父类。  
**类型**：容器控件  
**父类控件**：`bricks.JsWidget`

## 初始化参数

- `options` (Object, 可选)
  - `keyselectable` (Boolean)：是否启用键盘选择功能，默认 `false`。
  - `title` (String)：可选标题文本，会生成 `Title3` 控件。
  - `description` (String)：可选描述文本，会生成 `Text` 控件。
  - `toolbar` (Object)：工具栏配置，用于创建 `FloatTextIconBar`。
  - 其他继承自 `JsWidget` 的通用参数。

## 主要事件

- `keydown`：全局绑定，由 `enable_key_select()` 激活，处理以下按键：
  - `ArrowUp` / `ArrowDown`：上下切换选中子控件。
  - `ArrowLeft`：调用 `up_level()`，返回上一层级。
  - `ArrowRight`：调用 `down_level()`，进入下一层级。
  - `Enter`：触发当前选中控件的 `click` 事件。
- `on_parent`：当控件被添加或移除出父容器时分发，通知子控件其父级变更。
- `element_resize`：仅 `ResponsableBox` 使用，但 `Layout` 提供 DOM 元素操作能力。
- `click`：可通过 `enter_handler()` 手动派发给选中子控件。

此外还提供以下关键方法（虽非事件，但影响事件流）：

- `enable_key_select()` / `disable_key_select()`：启用/禁用键盘导航，并维护全局栈 `key_selectable_stack`。
- `add_widget(w, index)`：添加子控件，自动插入 DOM 并建立父子关系。
- `remove_widget(w)` / `clear_widgets()`：移除控件，清理 DOM 与事件关联。
- `select_item(w)`：高亮指定子控件（需支持 `.selected(bool)` 方法）。

