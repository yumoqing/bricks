以下是为提供的 JavaScript 代码编写的 **Markdown 格式技术文档**，涵盖了核心类结构、继承关系、属性、方法和使用说明。

---

# Bricks UI 组件库技术文档

`bricks.JsWidget` 是 Bricks 框架中的基础 UI 组件类，提供通用的 DOM 管理、样式设置、事件绑定、弹窗支持等功能。其他文本类组件（如 `Text`, `Title`, `Tooltip` 等）均继承自该基类或其子类。

---

## 目录

- [1. 基础结构](#1-基础结构)
- [2. `JsWidget` 类](#2-jswidget-类)
  - [构造函数](#构造函数)
  - [实例属性](#实例属性)
  - [公共方法](#公共方法)
    - [DOM 操作](#dom-操作)
    - [样式与 CSS](#样式与-css)
    - [事件处理](#事件处理)
    - [尺寸与布局](#尺寸与布局)
    - [弹窗功能](#弹窗功能)
    - [全屏控制](#全屏控制)
    - [显示/隐藏控制](#显示隐藏控制)
    - [ID 与属性管理](#id-与属性管理)
- [3. `TextBase` 类](#3-textbase-类)
- [4. 文本组件系列](#4-文本组件系列)
  - [`Text`](#text)
  - [`KeyinText`](#keyintext)
  - [`Title1` ~ `Title6`](#title1--title6)
- [5. Tooltip 组件](#5-tooltip-组件)
- [6. 工厂注册](#6-工厂注册)
- [7. 使用示例](#7-使用示例)

---

## 1. 基础结构

```js
var bricks = window.bricks || {};
```

确保 `bricks` 全局命名空间存在，并在此基础上定义各类组件。

所有组件以 ES6 Class 形式实现，支持继承和模块化扩展。

---

## 2. `JsWidget` 类

> 基础 UI 组件类，封装了 DOM 创建、样式设置、事件监听、动态尺寸调整等通用能力。

### 构造函数

```js
constructor(options)
```

#### 参数：
| 参数名 | 类型 | 说明 |
|-------|------|------|
| `options` | Object | 配置选项对象，可选 |

#### 支持的配置项：

| 属性 | 类型 | 说明 |
|------|------|------|
| `baseURI` | String | 基础资源路径 |
| `css` | String | 添加到元素的 CSS 类名（空格分隔） |
| `csses` | String | 同 `css`，兼容旧写法 |
| `tip` | String | 鼠标悬停提示文字（自动绑定 tooltip） |
| `popup` | Object | 弹窗配置对象 |
| &nbsp;&nbsp;`.popup_event` | String | 触发弹窗的事件类型（如 `'click'`） |
| &nbsp;&nbsp;`.popup_desc` | WidgetDesc | 弹窗内容描述（用于构建内部组件） |
| &nbsp;&nbsp;`.popupwindow` | Boolean | 是否使用独立窗口模式弹窗 |
| &nbsp;&nbsp;`.options` | Object | 传递给 Popup/PoupWindow 的参数 |
| `bgimage` | String (URL) | 背景图片 URL |
| `width`, `height` | String/Number | 宽高（支持像素或字符串如 `'100%'`） |
| `x`, `y` | Number | X/Y 偏移（暂未实际定位） |
| `dynsize` | Boolean | 启用字符单位动态缩放 |
| `cwidth`, `cheight` | Number | 字符宽度/高度单位（乘以 `charsize` 得到真实 px） |
| `cfontsize` | Number | 字体大小（相对于字符单位） |
| `color`, `bgcolor` | String | 文字颜色 / 背景色（`bgcolor` 映射为 `backgroundColor`） |
| `align`, `textAlign` | String | 对齐方式 |
| `margin`, `padding` 等 | Any | 支持多种标准 CSS 属性直接传入 |

> ⚠️ 注意：`opts_set_style()` 方法会将匹配的 `options` 键自动映射到 DOM 样式上。

---

### 实例属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `dom_element` | HTMLElement | 关联的 DOM 元素（默认为 `<div>`） |
| `id` | String | 自动生成的唯一 ID（通过 `bricks.uuid()`） |
| `baseURI` | String | 当前组件的基础 URI |
| `opts` | Object | 传入的原始配置对象 |
| `parent` | JsWidget | 父级组件（尚未在代码中赋值） |
| `_container` | Boolean | 是否为容器组件（默认 `false`） |
| `sizable_elements` | Array | 参与字体缩放的子元素列表 |
| `user_data` | Any | 用户自定义数据存储 |
| `popup_widget` | Popup \| PopupWindow | 当前打开的弹窗实例（延迟创建） |

---

### 公共方法

#### DOM 操作

##### `.create()`
创建一个 `<div>` 作为根元素并赋值给 `this.dom_element`。

##### `.is_in_dom() → Boolean`
检查当前组件是否已插入文档树中。

##### `.showRectage() → DOMRect`
返回组件的边界矩形（调用 `getBoundingClientRect()`）。

---

#### 样式与 CSS

##### `.set_style(key, value)`
设置单个 CSS 样式属性。

```js
widget.set_style('color', 'red');
```

##### `.set_css(css, remove_flg)`
添加或移除 CSS 类名（支持多个类名空格分隔）。

```js
widget.set_css('btn primary');        // 添加类
widget.set_css('hidden', true);       // 移除类
```

##### `.set_csses(csses, remove_flg)`
同 `.set_css()`，保留向后兼容。

##### `.unset_css(css)`
移除指定 CSS 类。

##### `.set_cssObject(cssobj)`
批量设置内联样式对象（通过 `bricks.extend` 扩展）。

##### `.opts_set_style()`
根据 `options` 中的键值自动设置对应样式，支持别名映射（如 `bgcolor → backgroundColor`），并处理 `cwidth`/`cheight` 字符单位转换。

##### `.charsize_sizing()`
响应全局 `charsize` 变化的回调函数，重新计算基于字符单位的宽高和字体大小。

> 自动绑定于 `dynsize: true` 时。

##### `.set_bg_image(url)`
设置背景图，应用以下样式：
- `background-size: cover`
- `background-position: center`
- `background-repeat: no-repeat`

---

#### 事件处理

##### `.bind(eventname, handler)`
绑定 DOM 事件。

```js
widget.bind('click', () => console.log('clicked'));
```

##### `.unbind(eventname, handler)`
解绑事件。

##### `.dispatch(eventname, params)`
派发自定义事件，携带 `params` 数据。

```js
widget.dispatch('changed', { data: 'new value' });
```

> 注：`params` 会挂载在事件对象的 `.params` 属性上。

---

#### 尺寸与布局

##### `.get_width() → Number`
返回客户端宽度（`clientWidth`）。

##### `.get_height() → Number`
返回客户端高度（`clientHeight`）。

##### `.set_width(width)`
设置宽度，若传入数字则自动加 `'px'`。

##### `.set_height(height)`
同上，设置高度。

##### `.h_center()`, `.h_left()`, `.h_right()`
水平对齐：
- `h_center`: `margin: auto`
- `h_left`: `marginLeft: 0`
- `h_right`: `marginRight: 0`

##### `.ht_center()`, `.ht_left()`, `.ht_right()`
文本对齐：
- 设置 `textAlign` 样式。

---

#### 弹窗功能

##### `.popup_action() → Promise<void>`
异步处理弹窗显示/关闭逻辑：
- 若已有弹窗，则销毁；
- 否则根据 `popup.popupwindow` 决定创建 `PopupWindow` 或 `Popup`；
- 使用 `bricks.widgetBuild(popup_desc, parent, userData)` 动态构建内容；
- 显示并定位弹窗。

##### `.destroy_popup()`
销毁当前弹窗实例，清空引用。

> 绑定在弹窗的 `'dismissed'` 事件上。

> 💡 提示：`popup_desc` 应符合框架的组件描述格式。

---

#### 全屏控制

##### `.enter_fullscreen()`
请求进入全屏模式，兼容各浏览器 API（Fullscreen API）。

##### `.exit_fullscreen()`
退出全屏模式（调用 `document.exitFullscreen()`）。

---

#### 显示/隐藏控制

##### `.show()`
显示组件（`display = ''`）。

##### `.hide()`
隐藏组件（`display = 'none'`）。

##### `.toggle_hide()`
切换显隐状态。

##### `.is_hide() → Boolean`
判断是否处于隐藏状态。

---

#### ID 与属性管理

##### `.set_id(id)`
设置组件 ID，并同步到 DOM。

##### `.set_baseURI(uri)`
更新 `baseURI`，若为容器则递归通知子组件更新。

##### `.set_attribute(attr, value)`
设置 DOM 属性。

##### `.get_attribute(attr) → String`
获取 DOM 属性（⚠️ 当前实现有误，缺少 `return`）。

> ❌ 修正建议：
```js
get_attribute(attr) {
  return this.dom_element.getAttribute(attr);
}
```

##### `.selected(flag)`
添加或移除 `selected` CSS 类。

---

#### 辅助方法

##### `.observable(name, value)`
创建一个可观察对象（绑定到当前组件），用于响应式数据管理。

##### `.disabled(flag)`
启用/禁用交互（通过 `pointerEvents: none/auto` 控制）。

##### `.getUserData() → Any`
获取用户数据。

##### `.setUserData(v)`
设置用户数据。

---

## 3. `TextBase` 类

> 文本组件基类，继承自 `JsWidget`，支持国际化（i18n）、文本渲染、字体缩放。

### 构造函数

```js
constructor(options)
```

#### 特有配置项：

| 属性 | 类型 | 说明 |
|------|------|------|
| `text` | String | 初始文本内容 |
| `otext` | String | 原始文本（用于 i18n 查找） |
| `i18n` | Boolean | 是否启用国际化 |
| `rate` | Number | 字体缩放系数（默认 1） |
| `halign`, `valign` | String | 水平/垂直对齐（未在代码中使用） |
| `color`, `bgtcolor` | String | 文字/背景色（后者未使用） |

### 方法

##### `.set_attrs()`
初始化文本内容：
- 优先使用 `text`
- 若提供 `otext` 和 `i18n`，则通过 `I18n._()` 转换
- 设置 `innerHTML`

##### `.set_text(text)`
更新文本内容（同时更新 `this.text` 和 DOM）。

##### `.set_otext(otxt)`
更新原始文本，并重新国际化渲染。

##### `.set_i18n_text()`
触发国际化文本刷新（通常由语言变更事件驱动）。

---

## 4. 文本组件系列

### `Text`

> 普通文本组件，字体大小为 `1 × charsize`。

```js
new bricks.Text({ text: "Hello" })
```

- 继承 `TextBase`
- 默认 `cfontsize = 1`
- 自动调用 `charsize_sizing()`

---

### `KeyinText`

> 可输入文本组件，模拟键盘输入行为。

#### 功能：
- 监听全局 `keydown` 事件（绑定至 `bricks.app`）
- 支持：
  - 输入单字符
  - Backspace 删除末尾字符
  - Delete 清空内容
- 每次变更后派发 `changed` 事件，携带 `{ name: text }` 数据
- 默认 `name = 'data'`

#### 方法：
- `dispatch_changed()`：封装事件派发逻辑

> 📝 示例用途：简易输入框、密码输入、命令行模拟。

---

### `Title1` ~ `Title6`

> 六级标题组件，字体加粗，字号逐级递减。

| 组件 | `cfontsize` |
|------|------------|
| `Title1` | 1.96 |
| `Title2` | 1.80 |
| `Title3` | 1.64 |
| `Title4` | 1.48 |
| `Title5` | 1.32 |
| `Title6` | 1.16 |

均设置 `fontWeight: bold`，并自动适配字符尺寸。

---

## 5. Tooltip 组件

> 工具提示组件，继承自 `Text`，预设样式。

### 构造选项
- `rate: 0.8`：较小字体
- `tip: null`：避免递归绑定提示
- 添加 `modal` CSS 类
- 最小宽度 `90px`
- 自动隐藏任务调度器（`auto_task`）

### 方法

##### `.show(otext, event)`
显示提示框：
- 设置文本
- 设为可见且高 `zIndex`
- 定位到鼠标事件位置（`bricks.relocate_by_eventpos`）
- 启动 6 秒后自动隐藏（可取消）

##### `.hide()`
隐藏提示框，清除定时任务。

> ✅ 支持防抖和重复触发清理。

---

## 6. 工厂注册

所有组件通过 `bricks.Factory.register` 注册，便于动态创建：

```js
bricks.Factory.register('Tooltip', bricks.Tooltip);
bricks.Factory.register('Text', bricks.Text);
// ... 其他组件
```

支持通过名称字符串动态实例化组件。

---

## 7. 使用示例

### 创建普通文本
```js
const text = new bricks.Text({
  text: 'Welcome!',
  css: 'text-primary bold',
  width: 200,
  tip: 'This is a welcome message'
});
document.body.appendChild(text.dom_element);
```

### 创建可输入文本
```js
const input = new bricks.KeyinText({
  name: 'username',
  cwidth: 20
});
input.bind('changed', e => {
  console.log('Input changed:', e.params);
});
```

### 创建标题
```js
const title = new bricks.Title1({
  otext: 'Main Title',
  i18n: true
});
```

### 创建带弹窗的按钮（假设）
```js
const btn = new bricks.Text({
  text: 'Click Me',
  popup: {
    popup_event: 'click',
    popup_desc: { type: 'Panel', children: [...] },
    popupwindow: false
  }
});
```

### 设置背景图
```js
widget.set_bg_image('/images/bg.jpg');
```

---

## 总结

`bricks.JsWidget` 提供了一个灵活、可扩展的前端组件基类，具备以下优势：

✅ 模块化设计  
✅ 支持动态尺寸（字符单位）  
✅ 内建弹窗、tooltip、国际化支持  
✅ 易于继承和定制  
✅ 与 Bricks 框架深度集成（event bus, factory, resize observer）

适用于构建响应式、多语言、高交互性的 Web 应用界面。

--- 

> 📚 *文档版本：v1.0*  
> © 2025 Bricks Framework Team