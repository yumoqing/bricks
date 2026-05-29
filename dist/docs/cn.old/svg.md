# `bricks.Svg` 与相关组件技术文档

本文件为 `bricks.Svg` 及其派生类（`StatedSvg` 和 `MultipleStateIcon`）的详细技术说明文档。这些类用于在网页中动态加载、渲染和控制 SVG 图标的行为，支持颜色设置、闪烁动画、URL 动态更新以及状态切换功能。

---

## 模块结构

```js
var bricks = window.bricks || {};
```

所有组件均挂载于全局命名空间 `bricks` 下，并通过 `bricks.Factory.register()` 注册为可实例化的 UI 组件。

---

## 1. `bricks.Svg` 类

### 简介
`bricks.Svg` 是一个继承自 `bricks.VBox` 的类，用于显示并控制单个 SVG 图标的可视化行为。它支持从远程 URL 加载 SVG 内容，动态着色、闪烁动画等特性。

### 继承关系
```js
class Svg extends bricks.VBox
```

---

### 构造函数：`constructor(opts)`

#### 参数
| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `opts.rate` | Number | 否 | `1` | 缩放比例，影响宽度和高度 |
| `opts.url` | String | 否 | - | SVG 文件的 URL 地址 |
| `opts.blink` | Boolean | 否 | `false` | 是否启用闪烁效果 |
| `opts.color` | String (CSS Color) | 否 | 由 `bricks.app.get_color()` 获取 | SVG 填充颜色 |
| `opts.blinkcolor` | String (CSS Color) | 否 | 由 `bricks.app.get_bgcolor()` 获取 | 闪烁时的颜色 |
| `opts.blinktime` | Number | 否 | `0.5` | 闪烁间隔时间（秒） |

> ⚠️ 注意：`opts.cwidth` 和 `opts.cheight` 将被自动设为 `opts.rate`，实现等比缩放。

#### 行为说明
- 调用父类 `super(opts)` 初始化容器。
- 若未指定 `color` 或 `blinkcolor`，则使用应用级默认前景/背景色。
- 若提供了 `url`，调用 `set_url(url)` 加载 SVG 内容。
- 支持动态尺寸（`dynsize: true`）。

---

### 方法列表

#### `set_url(url)`
从指定 URL 加载 SVG 内容并插入到 DOM。

##### 参数
- `url` (String | null)：SVG 文件路径或网址；若为 `null` 或空，则清空内容。

##### 流程
1. 清除当前内容（若无 `url`）。
2. 使用 `fetch()` 请求 SVG 文本。
3. 验证响应是否以 `<svg ` 开头（防止 XSS）。
4. 存储原始 SVG 文本至 `this.svgText`。
5. 调用 `set_colored_svg(color)` 渲染带颜色的 SVG。
6. 如果启用了 `blink`，启动闪烁动画。

> ✅ 安全提示：仅允许标准 `<svg ...>` 标签开头的内容，避免注入风险。

---

#### `set_color(color)`
设置 SVG 的填充颜色，并立即重新渲染。

##### 参数
- `color` (String)：合法 CSS 颜色值（如 `"red"`, `"#00ff00"`, `"rgb(255,0,0)"`）

##### 行为
- 更新 `this.color`
- 调用 `set_colored_svg(color)`

---

#### `set_blinkcolor(color)`
设置闪烁状态下的颜色。

##### 参数
- `color` (String)：目标闪烁颜色

##### 行为
- 更新 `this.blinkcolor`
- 自动补全 `blinktime` 为 `0.5`（如果尚未设置）

---

#### `set_colored_svg(color)`
将模板中的 `{color}` 占位符替换为实际颜色值，并更新 DOM。

##### 参数
- `color` (String)：要应用的颜色

##### 实现
```js
var svgText = bricks.obj_fmtstr({color: color}, this.svgText);
this.dom_element.innerHTML = svgText;
```

> 📌 依赖 `bricks.obj_fmtstr` 实现字符串模板替换（类似 `{color}` → `"#ff0000"`）

---

#### `start_blink()`
启动周期性颜色闪烁动画。

##### 条件
- 必须设置了 `blinktime > 0`
- 必须定义了 `blinkcolor`

##### 行为
- 若当前没有运行任务（`!this.blink_task`），调用 `_blink()` 启动首次切换。

---

#### `_blink()`
私有方法：执行一次颜色切换，并安排下一次调用。

##### 逻辑
- 当前颜色是正常色 → 切换为 `blinkcolor`
- 当前颜色是 `blinkcolor` → 切换回正常 `color`
- 使用 `schedule_once(fn, delayInSeconds)` 安排下次执行（避免阻塞主线程）

> 🔁 此方法形成递归循环，直到 `end_blink()` 被调用。

---

#### `end_blink()`
停止闪烁动画。

##### 行为
- 设置 `this.blink_task = null`，中断 `_blink()` 的递归调度链。

---

#### `set_ancent_color(e)`
从父元素的计算样式中获取文本颜色，并设置为 SVG 颜色。

##### 应用场景
适用于希望图标跟随上下文主题色的情况。

##### 实现
```js
var pstyle = getComputedStyle(this.parent);
this.set_color(pstyle.color);
```

---

## 2. `bricks.StatedSvg` 类

### 简介
继承自 `bricks.Svg`，支持多个状态（state），每个状态对应不同的 SVG 资源。点击可按顺序切换状态。

### 构造函数：`constructor(opts)`

#### 扩展参数
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `opts.states` | Array<{state: String, url: String}> | 是 | 状态数组，每项包含状态名与对应的 SVG URL |
| `opts.state` | String | 否 | 初始状态；若不提供，默认取第一个状态 |

#### 初始化行为
- 设置初始状态 `this.curstate`
- 调用 `set_state(state)` 加载对应 SVG
- 绑定 `click` 事件处理器 `trigger`

---

### 方法列表

#### `trigger(event)`
处理点击事件，顺序切换到下一个状态（循环）。

##### 事件处理
- `stopPropagation()` 和 `preventDefault()` 阻止冒泡与默认行为

##### 切换逻辑
- 查找当前状态索引 `i`
- 下一状态索引：`k = i + 1`，若已达末尾则回到 `0`
- 调用 `set_state(states[k].state)`
- 触发 `state_changed` 事件

---

#### `set_state(state)`
切换到指定状态。

##### 参数
- `state` (String)：目标状态名称

##### 行为
- 若已处于该状态，直接返回
- 遍历 `this.states` 查找匹配项
- 找到后调用 `set_url(s.url)`
- 广播 `state_changed` 事件
- 若未找到匹配项，清除 SVG 内容（`set_url(null)`）

---

## 3. `bricks.MultipleStateIcon` 类

### 简介
另一种多状态图标实现方式，使用对象字典管理 URL 映射，适合命名清晰的状态切换（如开关、模式选择等）。

### 构造函数：`constructor(opts)`

#### 参数
| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `opts.urls` | Object<String, String> | 是 | 状态名到 SVG URL 的映射表，例如 `{on: 'on.svg', off: 'off.svg'}` |
| `opts.state` | String | 是 | 初始状态键名 |

#### 初始化流程
- 从 `urls[state]` 提取初始 URL
- 调用 `super(opts)` 创建基础 SVG
- 记录 `this.urls` 和当前 `this.state`
- 绑定 `click` 事件到 `change_state`

---

### 方法列表

#### `change_state(event)`
点击时切换到下一个状态（按 `Object.keys(urls)` 顺序循环）。

##### 流程
- 获取所有状态键名数组
- 查找当前 `state` 的索引
- 计算下一索引（越界则归零）
- 调用 `set_state(newState)`
- 触发 `state_changed` 事件

---

#### `set_state(state)`
设置当前状态并加载对应 SVG。

##### 参数
- `state` (String)：目标状态键名

##### 行为
- 更新 `this.state`
- 调用 `set_url(this.urls[state])`

---

## 工厂注册

以下三类组件均已向 `bricks.Factory` 注册，可在声明式模板中使用：

```js
bricks.Factory.register('Svg', bricks.Svg);
bricks.Factory.register('StatedSvg', bricks.StatedSvg);
bricks.Factory.register('MultipleStateIcon', bricks.MultipleStateIcon);
```

这意味着可以通过如下方式创建实例（假设框架支持）：
```html
<div data-widget="Svg" data-options='{"url": "icon.svg", "color": "blue"}'></div>
```

---

## 使用示例

### 示例 1：基础彩色 SVG
```js
const icon = new bricks.Svg({
  url: '/icons/home.svg',
  color: 'green',
  blink: true,
  blinkcolor: 'yellow',
  blinktime: 0.8
});
document.body.appendChild(icon.dom_element);
```

### 示例 2：三态切换图标（StatedSvg）
```js
const light = new bricks.StatedSvg({
  states: [
    { state: 'red',   url: '/svg/red.svg' },
    { state: 'yellow', url: '/svg/yellow.svg' },
    { state: 'green', url: '/svg/green.svg' }
  ],
  state: 'red'
});

light.on('state_changed', (state) => {
  console.log('Current state:', state);
});
```

### 示例 3：双态图标（MultipleStateIcon）
```js
const toggle = new bricks.MultipleStateIcon({
  urls: {
    on: '/icons/power-on.svg',
    off: '/icons/power-off.svg'
  },
  state: 'off'
});

toggle.on('state_changed', s => console.log('Power is now:', s));
```

---

## 注意事项与最佳实践

| 项目 | 建议 |
|------|------|
| **安全性** | 不要加载不可信来源的 SVG，尤其是含 `<script>` 或内联事件的文件 |
| **性能** | 多次调用 `set_color` 会触发重绘，建议批量操作 |
| **闪烁控制** | 使用 `start_blink()` / `end_blink()` 显式控制动画生命周期 |
| **异步加载** | `set_url()` 是异步操作，后续逻辑应放在监听器或 Promise 中处理 |
| **颜色同步** | 推荐使用 `set_ancent_color()` 实现主题适配 |

---

## 依赖说明

| 依赖项 | 来源 | 用途 |
|--------|------|------|
| `bricks.VBox` | 基础布局容器 | 提供 DOM 容器能力 |
| `bricks.app.get_color()` | 应用配置模块 | 获取默认前景色 |
| `bricks.app.get_bgcolor()` | 应用配置模块 | 获取默认背景色 |
| `bricks.obj_fmtstr()` | 字符串工具 | 替换 `{color}` 模板 |
| `schedule_once(fn, sec)` | 异步调度工具 | 实现非阻塞定时任务 |

---

## 版本信息

- 编写日期：2025年4月5日
- 框架版本兼容性：BricksJS v1.x+
- 维护者：前端组件团队

--- 

✅ **文档完成**  
如有扩展需求，请参考现有接口进行子类化开发。