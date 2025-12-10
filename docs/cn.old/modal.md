# `bricks` 模态组件技术文档

> **版本：1.0**  
> **模块：Modal, BaseModal, ModalForm**

本文档描述了 `bricks` 框架中与模态窗口相关的类，包括 `BaseModal`、`Modal` 和 `ModalForm`。这些类用于创建可重用的弹出层（Modal）组件，支持自定义定位、样式、自动关闭、超时关闭等功能。

---

## 目录

- [概述](#概述)
- [核心类结构](#核心类结构)
- [`bricks.BaseModal`](#bricksbasemodal)
  - [构造函数参数](#构造函数参数-base-modal)
  - [属性](#属性-base-modal)
  - [方法](#方法-base-modal)
- [`bricks.Modal`](#bricksmodal)
  - [构造函数参数](#构造函数参数-modal)
  - [属性](#属性-modal)
  - [方法](#方法-modal)
- [`bricks.ModalForm`](#bricksmodalfom)
  - [构造函数参数](#构造函数参数-modalfom)
  - [属性](#属性-modalfom)
  - [方法](#方法-modalfom)
- [注册与使用](#注册与使用)
- [示例代码](#示例代码)

---

## 概述

`bricks` 提供了一套基于布局系统的模态对话框系统：

- `BaseModal` 是所有模态组件的基础类。
- `Modal` 是一个带标题栏和内容区域的标准模态窗口。
- `ModalForm` 是一个用于展示表单的模态窗口，集成 `Form` 组件并处理提交逻辑。
- 所有模态窗口通过 Z-index 管理堆叠顺序，并支持锚点对齐（`archor`）、目标容器绑定等特性。

---

## 核心类结构

```text
bricks.Layout
└── bricks.BaseModal
    ├── bricks.Modal
    └── bricks.ModalForm (extends PopupWindow)
```

> 注意：`ModalForm` 实际继承自 `PopupWindow` 而非 `Modal`，但功能上属于模态系列组件。

---

## `bricks.BaseModal`

基础模态类，提供通用的模态行为，如显示/隐藏、Z-index 控制、目标挂载等。

### 构造函数参数 (Base Modal)

| 参数 | 类型 | 描述 |
|------|------|------|
| `target` | `string` 或 `Layout` | 模态窗口挂载的目标容器。字符串表示 ID，对象为 Layout 实例。默认为 `bricks.Body`。 |
| `auto_open` | `boolean` | 是否在添加子组件后自动打开模态。 |
| `auto_close` | `boolean` | （未启用）是否点击背景关闭模态。 |
| `org_index` | `number` | 初始 z-index 值（暂未使用）。 |
| `width` | `string` | 内容面板宽度（如 `'500px'`, `'80%'`）。 |
| `height` | `string` | 内容面板高度。 |
| `bgcolor` | `string` | 内容面板背景色，默认 `#e8e8e8`。 |
| `title` | `string` | 标题文本（仅被 `Modal` 使用）。 |
| `timeout` | `number` | 自动关闭延迟时间（毫秒），0 表示不自动关闭。 |
| `archor` | `string` | 锚点位置，控制内容居中方式：<br>`tl`, `tc`, `tr`, `cl`, `cc`, `cr`, `bl`, `bc`, `br`<br>默认值：`'cc'`（居中） |

### 属性 (Base Modal)

| 属性 | 类型 | 描述 |
|------|------|------|
| `panel` | `VBox` | 实际内容容器，内部垂直布局。 |
| `timeout` | `number` | 自动关闭延时（ms）。 |
| `timeout_task` | `Task` | 定时任务句柄，用于取消定时关闭。 |
| `target_w` | `Layout` | 解析后的目标挂载容器。 |
| `ancestor_add_widget` | `Function` | 保存父类 `add_widget` 方法的引用。 |

### 方法 (Base Modal)

#### `create()`
创建模态外层 DOM 元素：
- 使用 `<div>` 作为遮罩层。
- 设置 `position: fixed` 遮罩全屏。
- 背景颜色为半透明黑色 (`rgba(0,0,0,0.4)`)。
- 初始隐藏（`display: none`）。
- 自动分配递增的 `z-index`。

#### `get_zindex() → number`
获取下一个可用的 `z-index` 值，从 `bricks.min_zindex` 开始递增。

> 默认起始值：`5000`

#### `add_widget(widget, index)`
向 `panel` 添加子控件。如果设置了 `auto_open: true`，则立即调用 `open()`。

#### `open()`
显示模态窗口：
- 将 `dom_element.style.display` 设为空字符串（即显示）。
- 若设置了 `timeout > 0`，启动延迟关闭任务。
- 触发 `opened` 事件。

#### `dismiss()`
关闭并移除模态窗口：
- 隐藏元素。
- 取消超时任务。
- 从父容器中移除自身。
- 触发 `dismissed` 事件。
- 异常捕获防止中断。

---

## `bricks.Modal`

标准模态对话框，继承自 `BaseModal`，带有可关闭标题栏。

### 构造函数参数 (Modal)

同 `BaseModal`，额外支持：

| 参数 | 类型 | 描述 |
|------|------|------|
| `title` | `string` | 显示在标题栏中的文字。 |

### 属性 (Modal)

| 属性 | 类型 | 描述 |
|------|------|------|
| `title_box` | `HBox` | 水平布局的标题栏容器。 |
| `title_w` | `Filler` | 标题文本占位容器。 |
| `content` | `Filler` | 主体内容容器，填充剩余空间。 |

### 方法 (Modal)

#### `create_title()`
创建标题栏：
- 包含一个水平盒子 `HBox`。
- 左侧显示标题文本（使用 `Text` 组件，支持国际化 `i18n` 和动态尺寸 `dynsize`）。
- 右侧放置关闭图标（SVG 图标，绑定 `click → dismiss()`）。
- 添加 CSS 类名 `title`。

#### `add_widget(widget, index)`
将组件添加到 `content` 区域。若 `auto_open` 为真，则自动打开模态。

#### `click_handler(event)`
点击事件处理器（当前注释状态）：
- 如果点击的是模态遮罩层（非内容区域），触发 `dismiss()`。
- 用于实现“点击背景关闭”功能（目前未启用）。

> ⚠️ 当前该功能已被注释，需手动启用。

---

## `bricks.ModalForm`

用于快速弹出表单的模态窗口，集成异步表单构建和提交处理。

### 构造函数参数 (ModalForm)

| 参数 | 类型 | 描述 |
|------|------|------|
| `title` | `string` | 表单标题。 |
| `description` | `string` | 表单描述信息。 |
| `fields` | `Array<FieldOptions>` | 表单字段定义数组。 |
| `binds` | `Array<BindConfig>` | 数据绑定配置。 |
| `user_data` | `any` | 用户自定义数据（可选）。 |
| `submit_url` | `string` | 提交 URL（可通过实例设置）。 |
| 其他 | 同 `PopupWindow` | 如 `width`, `height`, `archor` 等。 |

### 属性 (ModalForm)

| 属性 | 类型 | 描述 |
|------|------|------|
| `form` | `Form` | 动态生成的表单实例。 |
| `submit_url` | `string` | 表单提交地址（可选）。 |

### 方法 (ModalForm)

#### `build_form() → Promise<void>`
异步构建表单：
- 延迟 200ms 执行（确保 DOM 就绪）。
- 使用 `bricks.widgetBuild()` 动态创建 `Form` 组件。
- 添加至模态内容区。
- 绑定以下事件：
  - `submit`: 触发 `form_submit`
  - `submited`: 转发服务器响应
  - `cancel`: 关闭模态
- 最后调用 `open()` 显示。

#### `_getValue() → any`
获取原始表单数据（未经格式化）。

#### `getValue() → any`
获取经过验证和处理的表单数据。

#### `form_submit()`
处理表单提交：
- 获取数据并派发 `submit` 事件。
- 立即关闭模态（`dismiss()`）。

#### `form_submited(event)`
当表单成功提交后，转发 `submited` 事件及其参数。

---

## 注册与使用

```js
// 注册工厂类，便于通过字符串创建
bricks.Factory.register('Modal', bricks.Modal);
bricks.Factory.register('ModalForm', bricks.ModalForm);
```

这意味着你可以使用如下方式动态创建：

```js
let modal = bricks.Factory.create('Modal', { title: '提示', width: '400px' });
```

---

## 示例代码

### 创建一个简单模态窗口

```js
let modal = new bricks.Modal({
  title: '欢迎',
  width: '500px',
  height: '300px',
  auto_open: true,
  archor: 'cc'
});

modal.add_widget(new bricks.Text({ otext: '这是模态内容！' }));
```

### 创建一个表单模态

```js
let formModal = new bricks.ModalForm({
  title: '用户信息',
  description: '请填写以下信息',
  fields: [
    { name: 'name', label: '姓名', type: 'text' },
    { name: 'age', label: '年龄', type: 'number' }
  ],
  binds: [
    ['name', 'user.name'],
    ['age', 'user.age']
  ]
});

formModal.bind('submit', function(data) {
  console.log('提交数据:', data);
});
```

---

## 注意事项

1. **Z-index 管理**：所有模态共享全局 `last_zindex` 计数器，确保新窗口总在最上层。
2. **锚点定位**：依赖外部函数 `archorize(el, pos)` 实现元素定位，请确保其存在。
3. **资源路径**：关闭图标使用 `bricks_resource('imgs/delete.svg')` 加载，需正确配置资源路径。
4. **事件解绑**：`click_handler` 的绑定/解绑逻辑目前被注释，如需启用请解除注释并测试。

---

## 依赖说明

- `bricks.Layout`, `bricks.VBox`, `bricks.HBox`, `bricks.Filler`, `bricks.Text`, `bricks.Svg` —— 布局与基础组件。
- `bricks.widgetBuild()` —— 异步组件构建工具。
- `schedule_once(fn, delay)` —— 延迟执行工具函数。
- `objget(obj, key, default)` —— 安全取值工具。
- `archorize(element, position)` —— 锚点定位函数。

---

✅ **建议用途**：适用于消息提示、确认框、登录弹窗、动态表单提交等场景。

🔧 **扩展建议**：
- 支持键盘 ESC 关闭。
- 添加动画过渡效果。
- 支持拖拽移动（针对 `ModalForm`）。

--- 

📖 *文档版本：1.0*  
📅 *最后更新：2025年4月5日*