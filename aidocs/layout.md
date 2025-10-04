# `bricks.Layout` 及其子类技术文档

本技术文档详细描述了 `bricks.Layout` 类及其相关布局组件（如 `VBox`, `HBox`, `Filler`, `ResponsableBox` 等）的功能、结构和使用方式。这些类是基于 `bricks.JsWidget` 构建的 UI 容器组件，支持键盘导航、动态内容管理与响应式布局。

---

## 目录

- [概述](#概述)
- [核心模块](#核心模块)
  - [`bricks.Layout`](#brickslayout)
  - [`bricks.VBox`](#bricksvbox)
  - [`bricks.HBox`](#brickshbox)
  - [`bricks.FHBox`](#bricksfhbox)
  - [`bricks.FVBox`](#bricksfvbox)
  - [`bricks.Filler`](#bricksfiller)
  - [`bricks.ResponsableBox`](#bricksresponsablebox)
- [键盘选择机制](#键盘选择机制)
- [事件处理](#事件处理)
- [方法说明](#方法说明)
- [工厂注册](#工厂注册)
- [示例用法](#示例用法)

---

## 概述

`bricks` 是一个前端 UI 组件框架，`Layout` 是其基础容器类，用于组织和管理子控件（widgets）。所有布局类均继承自 `bricks.Layout`，并可通过 CSS 类实现水平或垂直排列。此外，该系统支持**键盘导航**，允许用户通过方向键在可聚焦元素之间切换，并通过 Enter 键触发操作。

主要特性包括：

- 支持嵌套布局结构
- 提供标题、描述、工具栏构建方法
- 内置键盘导航支持（上下左右 + Enter）
- 基于栈的层级导航机制
- 动态添加/删除子控件
- 响应式设计支持（`ResponsableBox`）

---

## 核心模块

### `bricks.Layout`

#### 继承关系
```js
class Layout extends bricks.JsWidget
```

#### 属性

| 属性名 | 类型 | 描述 |
|-------|------|------|
| `_container` | Boolean | 标记为容器组件 |
| `keyselectable` | Boolean | 是否启用键盘选择功能 |
| `children` | Array | 子控件列表 |
| `selected_item` | Widget | 当前选中的子控件 |
| `title` | String (可选) | 容器标题文本 |
| `description` | String (可选) | 描述文本 |
| `toolbar` | Object (可选) | 工具栏配置对象 |
| `use_key_select` | Boolean (可选) | 初始化时是否自动启用键盘选择 |

> ⚠️ 注意：`use_key_select` 在代码中未明确定义于构造函数参数，但被条件判断引用，建议作为选项传入。

#### 构造函数
```js
constructor(options)
```
- **参数**：
  - `options` `{Object}` 配置项，支持以下字段：
    - `title`: 显示标题
    - `description`: 显示描述
    - `toolbar`: 工具栏配置
    - `keyselectable`: 是否允许键盘选择（默认 `false`）
    - `use_key_select`: 若为真，则自动调用 `enable_key_select()`

- **行为**：
  - 调用父类构造函数
  - 初始化内部状态
  - 若设置了 `use_key_select`，则立即启用键盘选择模式

---

### `bricks.VBox`

垂直布局容器，子元素垂直堆叠。

```js
class VBox extends Layout
```

- **构造函数**：
  - 自动设置 CSS 类：`vcontainer`
- **用途**：创建纵向排列的内容区域。

---

### `bricks.HBox`

水平布局容器，子元素水平排列。

```js
class HBox extends Layout
```

- **构造函数**：
  - 设置 CSS 类：`hcontainer`
- **用途**：横向排布控件。

---

### `bricks.FHBox`

固定行水平盒子（不换行）。

```js
class FHBox extends HBox
```

- **构造函数**：
  - 调用 `super(options)`
  - 设置样式：`flexWrap: 'nowrap'`
- **用途**：确保子元素始终在同一行显示。

---

### `bricks.FVBox`

固定列垂直盒子（不换行）。

```js
class FVBox extends VBox
```

- **构造函数**：
  - 设置样式：`flexWrap: 'nowrap'`
- **用途**：防止垂直方向上的内容换列（较少见，通常用于嵌套场景）。

---

### `bricks.Filler`

弹性填充占位符，常用于 Flex 布局中占据剩余空间。

```js
class Filler extends Layout
```

- **构造函数**：
  - 设置 CSS 类：`filler`
  - 注释中包含潜在增强样式（如 `flexGrow: 1`），可用于扩展
- **用途**：在布局中插入空白区域以平衡界面。

---

### `bricks.ResponsableBox`

响应式布局容器，根据宽高比动态调整布局方向。

```js
class ResponsableBox extends Layout
```

- **事件绑定**：
  - 监听 `'element_resize'` 事件，自动调用 `reset_type()`
- **`reset_type(event)` 行为**：
  - 判断当前容器宽度与高度：
    - 若 `width > height` → 视为横向，应用 `hcontainer` 并设 `height: 100%`
    - 否则 → 视为纵向，应用 `vcontainer` 并设 `width: 100%`
  - 输出调试日志到控制台

> 💡 此类适合移动端或窗口缩放频繁的场景，实现“自适应”UI 排列。

---

## 键盘选择机制

### 全局栈管理

```js
bricks.key_selectable_stack = [];
```

- 所有启用了键盘选择的 `Layout` 实例按进入顺序压入栈。
- 最顶层的实例才响应按键事件（通过 `is_currkeyselectable()` 判断）。

### 关键方法

| 方法 | 说明 |
|------|------|
| `enable_key_select()` | 启用键盘选择，注册事件监听，推入栈 |
| `disable_key_select()` | 停止监听，从栈顶弹出自身（若为当前层） |
| `is_currkeyselectable()` | 判断自己是否处于栈顶且可选 |

### 导航逻辑

| 键盘按键 | 功能 |
|--------|------|
| `ArrowDown` | 选择下一个子项（循环） |
| `ArrowUp`   | 选择上一个子项（循环） |
| `ArrowRight` | 进入下一级（进入当前选中项的子菜单） |
| `ArrowLeft`  | 返回上一级（退出当前层级） |
| `Enter`      | 触发当前选中项的 `click` 事件 |

> 🔄 循环选择：到达末尾后回到开头，反之亦然。

---

## 事件处理

### `key_handler(event)`

主键盘事件处理器，仅当实例位于 `key_selectable_stack` 栈顶时生效。

- 使用 `event.key` 匹配方向键与回车
- 分发对应操作（上下选择、进出层级、确认）

### 生命周期事件

- `on_parent`：当控件被添加或移除父容器时派发，通知父子关系变更

---

## 方法说明

### 控件管理

| 方法 | 参数 | 描述 |
|------|------|------|
| `add_widget(w, index)` | `w`: widget, `index?`: number | 将控件插入指定位置或追加至末尾 |
| `remove_widget(w)` | `w`: widget | 移除指定控件，清理 DOM 和事件 |
| `clear_widgets()` | 无 | 清空所有子控件及 DOM 子节点 |
| `remove_widgets_at_begin(cnt)` | `cnt`: number | 移除前 `cnt` 个子控件 |
| `remove_widgets_at_end(cnt)` | `cnt`: number | 移除后 `cnt` 个子控件 |

> ✅ `insertBefore` / `appendChild` 被合理使用以维持 DOM 结构一致性。

---

### UI 构建方法

| 方法 | 功能 |
|------|------|
| `build_title()` / `build_title_widget()` | 创建并添加标题控件（`Title3`） |
| `build_description()` / `build_description_widget()` | 添加描述文本（`Text`） |
| `build_toolbar_widget(ext_tools)` | 构建浮动图标工具栏（`FloatTextIconBar`） |

> 🔔 多数构建方法检查是否存在对应属性（如 `this.title`）后再创建。

---

### 选择控制方法

| 方法 | 功能 |
|------|------|
| `select_item(w)` | 选中指定控件，取消之前的选择 |
| `select_default_item()` | 默认选择第一个子控件 |
| `select_next_item()` | 向下循环选择 |
| `select_previous_item()` | 向上循环选择 |
| `find_first_keyselectable_child()` | 深度优先查找首个支持键盘选择的后代 |

---

### 层级跳转

| 方法 | 功能 |
|------|------|
| `down_level()` | 进入当前选中控件的子层级（需支持 keyselectable） |
| `up_level()` | 退出当前层级，返回上级 |

> 🧭 类似菜单树导航模型，利用栈维护路径。

---

## 工厂注册

以下类型已向 `bricks.Factory` 注册，可用于声明式创建：

```js
bricks.Factory.register('HBox', bricks.HBox);
bricks.Factory.register('FHBox', bricks.FHBox);
bricks.Factory.register('VBox', bricks.VBox);
bricks.Factory.register('FVBox', bricks.FVBox);
bricks.Factory.register('Filler', bricks.Filler);
bricks.Factory.register('HFiller', bricks.Filler); // 水平填充
bricks.Factory.register('VFiller', bricks.Filler); // 垂直填充（同 Fillers）
bricks.Factory.register('ResponsableBox', bricks.ResponsableBox);
```

> ✅ 支持模板引擎或 JSON 配置动态生成界面。

---

## 示例用法

### 创建带标题的垂直布局

```js
let vbox = new bricks.VBox({
  title: "用户设置",
  description: "请选择要修改的选项",
  keyselectable: true
});

// 添加子控件
let btn1 = new bricks.Button({ otext: "个人资料" });
let btn2 = new bricks.Button({ otext: "安全设置" });

vbox.add_widget(btn1);
vbox.add_widget(btn2);

document.body.appendChild(vbox.dom_element);
```

### 启用手动键盘导航

```js
vbox.enable_key_select(); // 激活键盘控制
```

此时可用 ↑↓ 键切换按钮，Enter 执行点击，← 返回上级（如果有）。

### 响应式容器示例

```js
let responsive = new bricks.ResponsableBox();
responsive.add_widget(new bricks.Label({ otext: "此布局会随尺寸变化!" }));
document.body.appendChild(responsive.dom_element);
```

窗口大小改变时，布局方向将自动调整。

---

## 注意事项与最佳实践

1. **避免重复启用 `keyselectable`**
   - 确保 `enable_key_select()` 不被多次调用导致重复绑定事件
2. **手动管理栈结构风险**
   - `key_selectable_stack` 是全局状态，跨组件交互需谨慎
3. **DOM 更新同步**
   - 所有 `add_widget` / `remove_widget` 都应及时更新 DOM 和 `children` 数组
4. **性能优化建议**
   - `find_first_keyselectable_child()` 使用递归，深层嵌套可能影响性能，可缓存结果
5. **i18n 支持**
   - 所有文本控件启用 `i18n: true`，便于国际化

---

## 总结

`bricks.Layout` 提供了一个强大而灵活的基础布局系统，结合键盘导航与响应式能力，非常适合构建复杂的桌面风格 Web 应用界面（如仪表盘、菜单系统、表单布局等）。其模块化设计使得扩展新布局类型变得简单，同时工厂模式支持运行时动态渲染。

> ✅ 推荐在需要高可访问性（Accessibility）和键盘操作支持的应用中使用此组件体系。

--- 

📌 **版本信息**：本文档基于提供的 JavaScript 代码片段撰写  
📅 **最后更新**：2025年4月5日