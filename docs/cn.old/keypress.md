# `bricks.KeyPress` 组件技术文档

> 一个用于监听键盘按键并实时显示按键信息的 UI 组件。

---

## 概述

`bricks.KeyPress` 是基于 `bricks.VBox` 的扩展类，用于创建一个能够监听全局键盘事件（`keydown`）的组件。当用户按下任意键时，该组件会清除当前内容，并显示被按下的键名。

此组件常用于调试、快捷键提示或交互式输入反馈场景。

---

## 继承关系

- **继承自**: `bricks.VBox`
- **类型**: 类（Class）
- **注册名称**: `'KeyPress'`（通过 `bricks.Factory` 注册）

---

## 构造函数

```js
constructor(opts)
```

### 参数

| 参数名 | 类型   | 说明 |
|--------|--------|------|
| `opts` | Object | 传递给父类 `VBox` 的配置选项，如布局、样式等。 |

### 行为

1. 调用 `super(opts)` 初始化父类 `VBox`。
2. 使用 `bricks.app.bind('keydown', ...)` 绑定全局键盘按下事件，将 `this.key_handler` 作为回调函数，并确保其上下文指向当前实例。

---

## 方法

### `key_handler(event)`

处理键盘按下事件的回调函数。

#### 参数

| 参数名  | 类型        | 说明                   |
|---------|-------------|------------------------|
| `event` | KeyboardEvent | 浏览器原生键盘事件对象。 |

#### 实现逻辑

1. 获取 `event.key` 字符串表示（例如 `"a"`, `"Enter"`, `"Shift"` 等）。
2. 如果 `event.key` 不存在，则直接返回，不进行后续操作。
3. 调用 `this.clear_widgets()` 清除当前容器内的所有子控件。
4. 创建一个新的 `bricks.Text` 控件，显示文本：`"key press is: <key>"`。
5. 使用 `this.add_widget(w)` 将新文本控件添加到当前容器中。

#### 示例输出

- 按下字母 A → 显示：`key press is: a`
- 按下回车键 → 显示：`key press is: Enter`
- 按下空格键 → 显示：`key press is: `（后面是一个空格）

---

## 工厂注册

```js
bricks.Factory.register('KeyPress', bricks.KeyPress);
```

注册后可通过工厂方法动态创建该组件：

```js
var keyPressWidget = bricks.Factory.create('KeyPress', { /* opts */ });
```

---

## 使用示例

```js
// 创建 KeyPress 组件实例
var keyDisplay = new bricks.KeyPress({
    style: {
        padding: '10px',
        border: '1px solid #ccc'
    }
});

// 添加到页面某个容器中
someContainer.add_widget(keyDisplay);
```

---

## 注意事项

- 依赖全局对象 `bricks.app` 必须实现 `.bind(eventType, handler)` 方法来绑定 DOM 事件。
- 仅响应 `keydown` 事件，不处理 `keyup` 或 `keypress`。
- 每次按键都会清空原有内容，仅保留最新一次按键信息。

---

## 依赖项

- `bricks.VBox` —— 布局容器基类。
- `bricks.Text` —— 文本显示组件。
- `bricks.Factory` —— 组件工厂，用于注册和创建组件。
- `bricks.app` —— 应用级事件管理器。

---

## 版本信息

- **模块**: `bricks`
- **组件**: `KeyPress`
- **最后更新**: 请根据实际项目填写

--- 

✅ *可用于开发调试面板、快捷键教学模块等场景。*