# `bricks.Button` 技术文档

> 继承自：`bricks.Layout`

`bricks.Button` 是一个可交互的按钮组件，支持图标、文本标签、自定义样式以及点击事件处理。它基于 Flexbox 布局进行内容排列，适用于水平或垂直方向的内容展示。

---

## 目录

- [概述](#概述)
- [配置选项（Options）](#配置选项options)
- [结构与布局](#结构与布局)
- [方法说明](#方法说明)
  - [`constructor(opts)`](#constructoro)
  - [`create()`](#create)
  - [`opts_setup()`](#opts_setup)
  - [`target_clicked(event)`](#target_clickedevent)
- [事件机制](#事件机制)
- [注册信息](#注册信息)

---

## 概述

`bricks.Button` 提供了一个封装良好的按钮控件，可用于触发操作或导航。该组件可以包含：

- 图标（通过 `bricks.Icon`）
- 文本标签（通过 `bricks.Text`）
- 自定义 CSS 样式
- 工具提示（tooltip）
- 可配置的布局方向（横向/纵向）

所有子元素使用 Flexbox 排列，并可通过 `item_rate` 控制尺寸比例。

---

## 配置选项（Options）

| 属性名         | 类型     | 描述 |
|----------------|----------|------|
| `orientation`  | String   | 布局方向，可选 `'horizontal'` 或默认为垂直 `'vertical'`。影响内部图标的排列方式。 |
| `height`       | CSS value | 容器高度，默认 `100%`（由父级控制）。 |
| `width`        | CSS value | 容器宽度，默认 `100%`。 |
| `item_rate`    | Number   | 子元素（图标/文字）的缩放比率，默认为 `1`。用于调整大小。 |
| `tooltip`      | String   | 鼠标悬停时显示的提示文本，设置到 DOM 的 `title` 属性上。 |
| `color`        | String   | 文字颜色（传递给 `Text` 组件）。 |
| `bgcolor`      | String   | 背景颜色（传递给 `Text` 组件）。 |
| `nonepack`     | Boolean  | 是否移除内边距和边框；若为 `true`，则 padding 设为 `0px`，border 为 `0`。 |
| `name`         | String   | 组件名称，用作 DOM 元素 ID 的基础。 |
| `icon`         | String   | 图标资源 URL 或路径，用于创建 `bricks.Icon` 实例。 |
| `label`        | String   | 显示的文字标签，支持国际化（i18n）。 |
| `css`          | Object   | 自定义 CSS 样式对象，将被合并到 DOM 元素的 `style` 中。 |
| `action`       | Object   | 点击按钮后执行的动作配置，详见下表。 |

### `action` 对象结构

| 子属性         | 类型     | 描述 |
|----------------|----------|------|
| `target`       | String   | 目标组件或模块名称。 |
| `datawidget`   | String   | 数据源控件名。 |
| `datamethod`   | String   | 数据获取方法名。 |
| `datascript`   | String   | 自定义脚本逻辑（如函数体字符串）。 |
| `dataparams`   | Object   | 发送至数据接口的参数。 |
| `rtdata`       | Boolean  | 是否实时刷新数据。 |
| `actiontype`   | String   | 动作类型，例如 `"navigate"`、`"submit"` 等。 |
| `...`          | Any      | 其他扩展字段，根据业务需求定义。 |

---

## 结构与布局

- 使用 `<button>` 元素作为根节点。
- 内部采用 `display: flex` 进行布局：
  - 水平布局：`flex-direction: row`
  - 垂直布局：`flex-direction: column`
- 支持图标在上、文字在下的垂直排布，或并排的水平排布。
- 默认具有 `0.5rem` 的内边距，除非设置了 `nonepack: true`。

```css
{
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0.5rem; /* 或 0px（当 nonepack=true） */
}
```

---

## 方法说明

### `constructor(opts)`

初始化按钮实例，继承自 `Layout` 并设置基本样式和属性。

#### 参数

- `opts` (Object): 配置选项对象。

#### 行为

1. 调用父类构造函数 `super(opts)`。
2. 初始化默认样式对象（Flex 布局相关）。
3. 根据 `nonepack` 设置是否去除 padding 和 border。
4. 根据 `orientation` 设置 `flexDirection` 并记录简写形式（`this.orient = 'h'|'v'`）。
5. 设置组件 ID 为 `opts.name`。
6. 执行 `opts_setup()` 创建子组件（图标/文本）。
7. 合并默认样式与用户自定义样式到 `dom_element.style`。

---

### `create()`

创建底层 DOM 元素。

```js
this.dom_element = document.createElement('button');
```

> 此方法在组件生命周期中自动调用，无需手动执行。

---

### `opts_setup()`

根据配置项创建子控件（图标和/或文本），并将它们添加到当前容器中。

#### 行为

- 如果存在 `opts.icon`，创建一个 `bricks.Icon` 实例，并绑定点击事件。
- 如果存在 `opts.label`，创建一个 `bricks.Text` 实例，启用 i18n 支持，并绑定点击事件。
- 所有子控件均通过 `add_widget()` 加入布局。
- 文本控件引用保存在 `this.text_w` 上，便于后续更新。

#### 示例代码片段

```js
if (this.opts.icon) {
  const icon = new bricks.Icon({
    rate: this.item_rate,
    url: this.opts.icon
  });
  this.add_widget(icon);
  icon.bind('click', this.target_clicked.bind(this));
}
```

---

### `target_clicked(event)`

处理按钮点击事件的核心方法。

#### 参数

- `event` (Event): 浏览器原生事件对象。

#### 行为

1. 输出调试日志：`bricks.debug('target_clicked() .... called ')`
2. 阻止事件冒泡（`event.stopPropagation()`）
3. 触发组件自身的 `'click'` 事件，并携带完整 `opts` 数据。
4. 若配置了 `action`，且启用了 `debug` 模式，则输出完整的 `opts` 到控制台。

#### 示例输出（debug 模式）

```text
debug:opts= { name: "btn_save", action: { target: "form", actiontype: "submit" }, ... }
```

---

## 事件机制

| 事件名   | 触发时机               | 携带数据           |
|----------|------------------------|--------------------|
| `click`  | 用户点击按钮时         | `this.opts` 对象   |

可通过 `.bind('click', handler)` 监听此事件：

```js
button.bind('click', function(data) {
  console.log('Button clicked:', data.action);
});
```

---

## 注册信息

```js
bricks.Factory.register('Button', bricks.Button);
```

使得可以通过工厂模式动态创建按钮：

```js
const btn = bricks.Factory.create('Button', {
  name: 'my_button',
  label: 'Submit',
  icon: '/icons/save.svg',
  action: {
    actiontype: 'submit',
    target: 'form1'
  }
});
```

---

## 使用示例

```js
const myButton = new bricks.Button({
  name: 'btn_ok',
  label: 'OK',
  icon: '/icons/check.png',
  orientation: 'horizontal',
  item_rate: 1.2,
  color: '#fff',
  bgcolor: '#007bff',
  tooltip: 'Click to confirm',
  action: {
    actiontype: 'navigate',
    target: 'page_home'
  },
  debug: true
});

document.body.appendChild(myButton.dom_element);
```

---

## 注意事项

- 推荐配合 `bricks.Icon` 和 `bricks.Text` 使用以保持 UI 一致性。
- 若需完全自定义外观，请使用 `css` 属性覆盖样式。
- `nonepack: true` 适合嵌入紧凑型 UI 区域。
- 所有文本自动支持国际化（i18n），前提是 `bricks.app.i18n` 已正确配置。

---

## 版本信息

- **框架**：Bricks.js
- **组件路径**：`bricks.Button`
- **最后更新**：根据代码注释推断为近期维护版本

--- 

✅ *文档完*