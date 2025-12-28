# `bricks.Message` 与 `bricks.Error` 技术文档

> 基于 Bricks UI 框架的消息弹窗组件

---

## 概述

`bricks.Message` 和 `bricks.Error` 是基于 `bricks.PopupWindow` 构建的轻量级消息提示组件，用于在 Web 应用中显示文本信息或错误提示。该模块提供统一的 API 接口（`bricks.show_message` 和 `bricks.show_error`），便于快速调用。

- `bricks.Message`：通用消息弹窗。
- `bricks.Error`：专用于显示错误信息的弹窗，样式上更突出。
- 支持国际化（i18n）、自动换行、居中对齐等特性。

---

## 继承结构

```
bricks.PopupWindow
    └── bricks.Message
            └── bricks.Error
```

---

## 类定义

### `bricks.Message`

继承自 `bricks.PopupWindow`，用于创建可配置的消息提示窗口。

#### 构造函数

```js
new bricks.Message(opts)
```

##### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `opts` | Object | ✅ | 配置选项对象 |

###### `opts` 属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `title` | String | - | 弹窗标题 |
| `message` | String | - | 要显示的消息正文内容 |
| `auto_open` | Boolean | `true` | 是否在构造后自动打开窗口（由构造函数内部设置） |
| `cheight` | Number | `9` | 内容区域高度（单位：网格） |
| `cwidth` | Number | `16` | 内容区域宽度（单位：网格） |

> ⚠️ 注意：`auto_open` 在构造函数中被强制设为 `true`，因此所有 `Message` 实例创建后会立即显示。

#### 方法

##### `create_message_widget()`

私有方法，负责构建消息内容区域的 UI 结构。

**UI 结构如下：**

```
Filler (填充容器)
└── VScrollPanel (垂直滚动面板)
    └── Text (文本控件，支持换行和居中)
```

- 使用 `bricks.Filler` 作为内容填充层。
- 使用 `bricks.VScrollPanel` 包裹文本以支持长文本滚动。
- 使用 `bricks.Text` 显示消息，启用：
  - 自动换行 (`wrap: true`)
  - 水平居中对齐 (`halign: 'middle'`)
  - 国际化支持 (`i18n: true`)

##### `set_css(cssClass)`

设置弹窗的 CSS 样式类前缀为 `'message'`，用于应用主题样式。

---

### `bricks.Error`

继承自 `bricks.Message`，专用于显示错误信息。

#### 构造函数

```js
new bricks.Error(opts)
```

##### 参数

同 `bricks.Message` 的 `opts`。

##### 行为差异

- 调用父类构造函数（即 `super(opts)`）完成初始化。
- 额外调用 `this.set_css('error')`，将样式类切换为 `'error'`，通常表现为红色边框/背景等视觉警示。

---

## 全局快捷函数

### `bricks.show_message(opts)`

快速显示一条普通消息。

```js
bricks.show_message({
    title: "提示",
    message: "操作已成功完成。"
});
```

#### 参数

同 `bricks.Message` 的 `opts`。

> 若未指定 `cheight` 或 `cwidth`，则默认使用 `9` 和 `16`。

---

### `bricks.show_error(opts)`

快速显示一条错误消息。

```js
bricks.show_error({
    title: "出错了",
    message: "无法连接到服务器，请检查网络。"
});
```

#### 参数

同 `bricks.Message` 的 `opts`。

> 视觉样式通过 `set_css('error')` 强化，适合错误场景。

---

## 工厂注册

为支持动态创建机制，两类组件已在 `bricks.Factory` 中注册：

```js
bricks.Factory.register('Message', bricks.Message);
bricks.Factory.register('Error', bricks.Error);
```

这意味着可以通过工厂模式按名称实例化这些组件：

```js
var msg = bricks.Factory.create('Message', { title: "Hello", message: "World" });
```

---

## 使用示例

### 显示普通消息

```js
bricks.show_message({
    title: "欢迎",
    message: "欢迎使用 Bricks 框架！这是一个示例消息。",
    cheight: 10,
    cwidth: 20
});
```

### 显示错误消息

```js
bricks.show_error({
    title: "加载失败",
    message: "请求的数据未能获取，请稍后再试。长时间失败请联系管理员。",
    cheight: 12
});
```

---

## 样式说明

| 组件 | CSS Class 前缀 | 典型用途 |
|------|----------------|----------|
| `bricks.Message` | `.message-*` | 一般通知、提示 |
| `bricks.Error`   | `.error-*`   | 错误、警告信息 |

开发者应在 CSS 中定义相应的样式规则以实现美观的视觉效果。

---

## 依赖项

确保以下组件已加载：

- `bricks.PopupWindow`
- `bricks.Filler`
- `bricks.VScrollPanel`
- `bricks.Text`
- `bricks.Factory`

---

## 版本信息

- 创建时间：未知
- 框架版本：Bricks UI（假设）
- 作者：Bricks 团队 / 开发者社区

--- 

✅ **推荐使用 `bricks.show_message()` 和 `bricks.show_error()` 快捷函数进行调用，避免手动管理窗口生命周期。**