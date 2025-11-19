# `bricks.Conform` 技术文档

> 一个基于 `bricks.PopupWindow` 的确认对话框类，用于展示消息并提供“确认”与“取消”操作选项。

---

## 概述

`bricks.Conform` 是 `bricks` UI 框架中的一个模态弹窗组件，继承自 `bricks.PopupWindow`。它被设计用于在用户执行关键操作前进行确认，例如删除数据或提交表单。该组件自动显示，并包含可自定义的确认/取消按钮，支持国际化文本和事件回调。

---

## 类定义

```javascript
class bricks.Conform extends bricks.PopupWindow
```

---

## 构造函数

### `constructor(opts)`

初始化一个 `Conform` 实例。

#### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `opts` | Object | 配置选项对象，继承自 `PopupWindow` 并扩展以下属性： |

##### 扩展配置项 (`opts`)

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `message` | String | 必填 | 要显示的消息内容，支持换行和国际化（i18n）。 |
| `timeout` | Number | `0` (自动覆盖为 0) | 弹窗自动关闭时间（毫秒），此组件中强制设为 `0`，即不自动关闭。 |
| `auto_open` | Boolean | `true` (自动设置) | 是否在创建后立即打开弹窗，此处固定为 `true`。 |
| `conform` | Object | 可选 | “确认”按钮的自定义配置，如标签、事件等。 |
| `discard` | Object | 可选 | “取消”按钮的自定义配置。 |

> ⚠️ 注意：构造函数内部会强制设置 `opts.timeout = 0` 和 `opts.auto_open = true`，以确保用户必须手动选择操作。

#### 示例

```javascript
var confirmDialog = new bricks.Conform({
    message: "确定要删除此文件吗？",
    conform: {
        label: "删除",
        handler: function(){ console.log("已确认"); }
    },
    discard: {
        label: "保留"
    }
});
```

---

## 方法说明

### `create_conform()`

创建主容器布局并将消息区域与工具栏添加进去。

- 使用 `VBox` 布局占满整个窗口。
- 调用 `create_message()` 和 `create_toolbar()` 分别构建内容区与操作区。
- 将整体布局通过 `add_widget()` 添加到弹窗中。

---

### `create_message(widget)`

创建消息显示区域，支持长文本滚动和居中对齐。

#### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `widget` | `bricks.VBox` | 容器部件，用于承载消息内容。 |

#### 内部结构

1. 创建一个 `Filler` 占位符，允许内容拉伸填充。
2. 在 `Filler` 中嵌入 `VScrollPanel` 支持垂直滚动。
3. 添加 `Text` 组件显示消息：
   - 启用文本换行 (`wrap: true`)
   - 水平居中对齐 (`halign: 'middle'`)
   - 支持国际化 (`i18n: true`)

---

### `create_toolbar(widget)`

创建底部操作工具栏，包含“确认”和“取消”两个按钮。

#### 参数

| 参数 | 类型 | 描述 |
|------|------|------|
| `widget` | `bricks.VBox` | 容器部件，用于添加工具栏。 |

#### 工具栏配置

使用 `bricks.IconTextBar` 创建图标+文字按钮栏：

| 按钮名称 | 图标 | 默认标签 | 自定义来源 |
|---------|------|----------|------------|
| `conform` | `imgs/conform.svg` | "Conform" | `this.opts.conform` |
| `discard` | `imgs/cancel.svg` | "Discard" | `this.opts.discard` |

> ✅ 所有自定义属性将通过 `bricks.extend()` 合并到默认配置中。

#### 事件绑定

- `conform` → 触发 `conform_hndl`
- `discard` → 触发 `discard_hndl`

---

### `conform_hndl(event)`

“确认”按钮点击处理函数。

#### 行为

1. 调用 `this.dismiss()` 关闭弹窗。
2. 触发名为 `'conformed'` 的自定义事件，供外部监听。

#### 示例监听

```javascript
confirmDialog.on('conformed', function(){
    // 执行确认逻辑
});
```

---

### `discard_hndl(event)`

“取消”按钮点击处理函数。

#### 行为

1. 调用 `this.dismiss()` 关闭弹窗。
2. 触发名为 `'cancelled'` 的自定义事件。

#### 示例监听

```javascript
confirmDialog.on('cancelled', function(){
    // 执行取消后的逻辑
});
```

---

## 事件列表

| 事件名 | 触发时机 | 携带数据 |
|-------|----------|--------|
| `conformed` | 用户点击“确认”按钮后 | 无 |
| `cancelled` | 用户点击“取消”按钮后 | 无 |

可通过 `.on(event, handler)` 或 `.bind(event, handler)` 注册监听。

---

## 注册信息

```javascript
bricks.Factory.register('Conform', bricks.Conform);
```

- 通过工厂模式注册名称为 `'Conform'` 的可实例化组件。
- 可通过 `bricks.Factory.create('Conform', options)` 动态创建实例。

---

## 布局结构图

```plaintext
PopupWindow
└── VBox (100% x 100%)
    ├── Filler
    │   └── VScrollPanel
    │       └── Text (消息内容)
    └── IconTextBar
        ├── [✔] Conform 按钮
        └── [✖] Discard 按钮
```

---

## 样式与资源依赖

- **图标资源路径**：
  - 确认图标：`bricks_resource('imgs/conform.svg')`
  - 取消图标：`bricks_resource('imgs/cancel.svg')`
- 使用 `i18n: true`，需配合国际化语言包解析多语言文本。

---

## 使用建议

✅ 推荐场景：

- 删除、覆盖、退出等危险操作前的二次确认。
- 需要用户明确响应的操作流程中断点。

❌ 不适用场景：

- 非阻塞性提示（应使用 Toast 或 Banner）。
- 需长时间停留的信息展示（考虑使用普通窗口）。

---

## 完整示例

```javascript
var dialog = new bricks.Conform({
    message: "您确定要退出编辑模式吗？未保存的内容将会丢失。",
    conform: { label: "退出", style: "danger" },
    discard: { label: "继续编辑" }
});

dialog.on('conformed', function(){
    window.location.href = "/home";
});

dialog.on('cancelled', function(){
    console.log("用户选择保留");
});
```

---

## 版本信息

- **框架版本**：`bricks.js`
- **组件作者**：未知（基于命名空间推断）
- **最后更新**：根据代码逻辑推断为现代 ES6+ 风格实现

--- 

📌 *文档生成于：2025年4月*