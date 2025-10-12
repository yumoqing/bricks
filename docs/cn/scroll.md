# Bricks.js 滚动面板组件技术文档

> **项目名称**：`bricks.js`  
> **模块**：`HScrollPanel` 与 `VScrollPanel`  
> **功能描述**：提供可监听滚动位置阈值的水平和垂直滚动容器组件。

---

## 目录

- [概述](#概述)
- [依赖说明](#依赖说明)
- [核心类说明](#核心类说明)
  - [`low_handle`](#low_handle)
  - [`bricks.HScrollPanel`](#bricksHScrollPanel)
  - [`bricks.VScrollPanel`](#bricksVScrollPanel)
- [事件机制](#事件机制)
- [工厂注册](#工厂注册)
- [使用示例](#使用示例)
- [注意事项](#注意事项)

---

## 概述

`bricks.HScrollPanel` 和 `bricks.VScrollPanel` 是基于 `bricks.HBox` 和 `bricks.VBox` 的扩展类，用于创建具有滚动能力的容器，并在用户滚动接近内容边界时触发自定义事件（如 `min_threshold` 或 `max_threshold`），适用于实现“无限滚动”、“触底加载”等功能。

该组件通过封装原生 DOM 滚动行为，在关键滚动位置触发语义化事件，便于上层逻辑响应。

---

## 依赖说明

本模块依赖以下环境或模块：

- 全局对象 `window.bricks`：框架主命名空间。
- `bricks.debug()`：调试日志输出函数（仅用于开发期）。
- `bricks.HBox` / `bricks.VBox`：基础布局容器类。
- `bricks.Widget.dispatch()`：事件派发方法。
- `bricks.Factory.register()`：组件工厂注册接口。

---

## 核心类说明

### `low_handle`

#### 功能
通用滚动阈值判断函数，根据当前滚动位置判断是否到达最小或最大阈值，并触发相应事件。

#### 函数签名
```js
function low_handle(widget, dim, last_pos, cur_pos, maxlen, winsize)
```

#### 参数说明

| 参数名       | 类型     | 描述 |
|-------------|----------|------|
| `widget`    | Object   | 触发事件的组件实例（需支持 `.dispatch()` 方法） |
| `dim`       | String   | 滚动方向标识（`'x'` 或 `'y'`，目前未实际使用但预留） |
| `last_pos`  | Number   | 上一次记录的滚动位置 |
| `cur_pos`   | Number   | 当前滚动位置（例如 `scrollLeft` 或 `scrollTop`） |
| `maxlen`    | Number   | 整体滚动内容长度（`scrollWidth` 或 `scrollHeight`） |
| `winsize`   | Number   | 可见区域大小（`clientWidth` 或 `clientHeight`） |

#### 行为逻辑

1. 如果当前滚动位置接近右/下边缘（差值小于5像素），则触发 `max_threshold` 事件。
2. 如果当前滚动位置接近左/上边缘（小于1像素），则触发 `min_threshold` 事件。
3. 使用 `bricks.debug()` 输出调试信息。

#### 示例调用
```js
low_handle(this, 'x', this.last_scrollLeft, e.scrollLeft, e.scrollWidth, e.clientWidth);
```

---

### bricks.HScrollPanel

水平滚动面板组件，继承自 `bricks.HBox`。

#### 继承关系
```js
class HScrollPanel extends bricks.HBox
```

#### 构造函数
```js
constructor(opts)
```

##### 参数
| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `opts.width` | String | 否 | `'100%'` | 宽度设置 |
| `opts.height` | String | 否 | `'100%'` | 高度设置 |
| `opts.css` | String | 否 | `''` | 自定义 CSS 类名，自动附加 `scrollpanel` |
| `opts.overflow` | String | 否 | `'auto'` | 溢出处理方式 |
| `opts.min_threshold` | Number | 否 | `0.01` | 最小滚动比例阈值（暂未使用） |
| `opts.max_threshold` | Number | 否 | `0.99` | 最大滚动比例阈值（暂未使用） |

> ⚠️ 注：虽然传入了 `min_threshold` 和 `max_threshold`，但在当前版本中并未参与计算，而是直接使用像素差值判断。

##### 初始化行为
- 设置默认宽高为 100%。
- 添加 `scrollpanel` CSS 类。
- 设置 `overflow: auto` 以启用滚动条。
- 注册 `scroll` 事件监听器。
- 记录初始 `scrollLeft` 值。

#### 方法

##### `scroll_handle(event)`

处理滚动事件的核心方法。

###### 参数
- `event`: DOM 滚动事件对象。

###### 逻辑流程
1. 确保事件源是当前组件的 DOM 元素。
2. 检查是否有实际可滚动空间（`scrollWidth > clientWidth + 1`）。
3. 调用 `low_handle` 判断是否触发边界事件。
4. 更新 `scroll_info` 状态对象及 `last_scrollLeft`。

###### `scroll_info` 结构
```js
{
  left: number,           // 当前 scrollLeft
  scroll_width: number,   // scrollWidth
  client_width: number    // clientWidth
}
```

---

### bricks.VScrollPanel

垂直滚动面板组件，继承自 `bricks.VBox`。

#### 继承关系
```js
class VScrollPanel extends bricks.VBox
```

#### 构造函数
```js
constructor(opts)
```

##### 参数
与 `HScrollPanel` 类似，区别如下：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `min_threshold` | `0.02` | 垂直方向最小阈值 |
| `max_threshold` | `0.95` | 垂直方向最大阈值 |

> ⚠️ 当前版本中这些阈值仍未被算法使用。

##### 初始化行为
- 设置默认宽高。
- 添加 `scrollpanel` 类。
- 开启 `overflow: auto`。
- 绑定 `scroll` 事件。
- 记录初始 `scrollTop`。

#### 方法

##### `scroll_handle(event)`

处理垂直滚动事件。

###### 逻辑流程
1. 验证事件目标。
2. 检查是否存在可滚动高度。
3. 调用 `low_handle` 判断上下边界。
4. 更新 `scroll_info` 与 `last_scrollTop`。

###### `scroll_info` 结构
```js
{
  top: number,             // scrollTop
  scroll_height: number,   // scrollHeight
  client_height: number    // clientHeight
}
```

---

## 事件机制

组件会在特定滚动条件下自动派发事件：

| 事件名            | 触发条件 |
|------------------|---------|
| `'min_threshold'` | 滚动位置接近顶部或左侧（`< 1px`） |
| `'max_threshold'` | 滚动位置接近底部或右侧（距离末端 < 5px） |

可通过 `.bind()` 方法监听这些事件：

```js
panel.bind('min_threshold', function(){
  console.log('到达顶部/起点');
});
```

---

## 工厂注册

为了支持动态创建，两个组件均注册到 `bricks.Factory`：

```js
bricks.Factory.register('VScrollPanel', bricks.VScrollPanel);
bricks.Factory.register('HScrollPanel', bricks.HScrollPanel);
```

这意味着可以通过工厂方式实例化：
```js
var vpanel = bricks.Factory.create('VScrollPanel', { ... });
```

---

## 使用示例

### 创建一个垂直滚动面板并监听边界事件

```js
var panel = new bricks.VScrollPanel({
  css: 'my-scroll-container',
  min_threshold: 0.02,
  max_threshold: 0.95
});

panel.bind('min_threshold', function() {
  console.log('已滚动到顶部，可加载更多...');
});

panel.bind('max_threshold', function() {
  console.log('已滚动到底部，加载新数据...');
});

// 将 panel 添加到父容器中
parent.append(panel);
```

### 创建水平滚动面板

```js
var hpanel = new bricks.HScrollPanel({
  css: 'horizontal-list'
});

hpanel.bind('max_threshold', function() {
  alert('已滑动到最右侧！');
});
```

---

## 注意事项

1. **阈值未生效问题**：尽管构造函数接受 `min_threshold` 和 `max_threshold`，但当前 `low_handle` 使用的是固定像素判断（`<1` 和 `<5`），未来建议改为基于比例的动态判断以提升灵活性。

2. **性能优化建议**：
   - 可添加防抖（debounce）机制避免频繁触发。
   - 在复杂场景下考虑使用 `requestAnimationFrame` 控制检测频率。

3. **兼容性要求**：
   - 支持现代浏览器。
   - 依赖标准 DOM 属性如 `scrollLeft`, `scrollTop`, `scrollWidth`, `clientHeight` 等。

4. **调试模式**：
   - 使用 `bricks.debug()` 输出日志，上线前应关闭或重定向。

5. **CSS 要求**：
   - 推荐为 `.scrollpanel` 设置明确的尺寸和 `overflow` 样式，确保滚动正常工作。

---

## 版本信息

- 编写时间：2025年4月
- 模块版本：v1.0（基础功能版）
- 维护建议：增加对比例阈值的支持，提升可配置性。

--- 

✅ **文档完**