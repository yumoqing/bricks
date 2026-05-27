# `bricks.IconBar` 及相关组件技术文档

---

## 概述

`bricks.IconBar` 是一个基于 `bricks.HBox` 的 UI 组件类，用于创建水平排列的图标工具栏。它支持动态图标、点击事件分发、响应式尺寸调整等功能。该模块还包含多个扩展类：

- `bricks.IconTextBar`：带文本标签的图标栏。
- `bricks.FloatIconBar`：浮动式图标栏，鼠标悬停时显示完整图标组。
- `bricks.FloatIconTextBar`：结合浮动与图文混合的增强型工具栏。

这些组件常用于构建轻量级、可定制的工具栏或操作面板。

---

## 基础结构

```js
var bricks = window.bricks || {};
```

确保 `bricks` 全局命名空间存在，避免覆盖已有内容。

---

## 1. `bricks.IconBar`

### 类继承关系
```js
class extends bricks.HBox
```

继承自 `HBox`（水平布局容器），实现横向排列子控件。

### 配置参数 (`opts`)
| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `cheight` | Number | `2` | 子项高度倍率（相对于字符单位） |
| `rate` | Number | `1` | 缩放比例因子 |
| `margin` | String | `'10px'` | 图标之间的左右边距 |
| `tools` | Array | `[]` | 工具定义数组，每个元素为一个工具描述对象 |

#### `tools` 数组项结构
| 属性 | 类型 | 是否必需 | 说明 |
|------|------|----------|------|
| `name` | String | 否 | 图标的唯一标识名称（用于事件分发和 DOM ID） |
| `icon` | String | 是（非 blankicon） | SVG 图标 URL 或资源路径 |
| `rate` | Number | 否 | 单独设置该图标的缩放比例（优先于全局 rate） |
| `dynsize` | Boolean | 否 | 是否启用动态尺寸调整 |
| `tip` | String | 否 | 提示文本（暂未在 IconBar 中直接使用） |

> 特殊情况：若 `name === 'blankicon'`，则生成空白占位符图标。

### 构造函数行为

```js
constructor(opts)
```

1. **默认值填充**：
   - 若未指定 `cheight`，默认设为 `2`
   - 若未指定 `rate`，默认设为 `1`

2. **调用父类构造器**：
   ```js
   super(opts);
   ```

3. **样式设置**：
   - 添加 CSS 类名 `'childrensize'`
   - 设置主轴对齐方式为居中（`alignItems: center`）

4. **遍历 `tools` 创建子控件**：
   - 复制每个工具配置并补充通用属性（如 `cheight`, `cwidth`, `dynsize`）
   - 调用 `build_item(opts)` 创建具体控件
   - 设置左右 margin 和 cursor 样式为 pointer
   - 若有 `name`，设置对应 widget 的 ID
   - 绑定点击事件并通过 `regen_event` 分发事件
   - 将控件加入容器

5. **内部高度记录**：
   - 使用 `this.height_int` 记录所有子控件中的最大高度（像素值），便于外部布局参考。

---

### 方法详解

#### `build_item(opts) → Widget`

根据配置创建单个图标控件。

##### 行为逻辑：
- 计算实际高度：`h = bricks.app.charsize * rate * opts.cheight`
- 更新 `this.height_int` 以保持最大高度
- 判断是否为 `blankicon`：
  - 是 → 返回 `new bricks.BlankIcon({...})`
  - 否 → 使用 `opts.icon` 作为 `url` 创建 `bricks.Svg` 实例
- 绑定点击事件到 `regen_event(desc, event)`
- 返回创建的控件

#### `regen_event(desc, event)`

处理图标点击事件，并触发两个事件：

```js
this.dispatch(desc.name, desc);        // 以 name 为事件类型分发
this.dispatch('command', desc);        // 统一命令事件
```

同时阻止事件冒泡和默认行为：

```js
event.preventDefault();
event.stopPropagation();
```

> 此设计适用于菜单/按钮点击后不希望影响页面其他部分的操作场景。

---

## 2. `bricks.IconTextBar`（图文混合图标栏）

### 类继承关系
```js
class extends bricks.IconBar
```

重写了 `build_item` 方法以支持图标+文字组合。

### `build_item(opts)` 实现细节

返回一个 `HBox` 容器，内含：

1. **SVG 图标（可选）**
   - 来源：`opts.icon`
   - 属性包括 `rate`, `dynsize`

2. **文本标签（可选）**
   - 使用 `bricks.Text` 显示 `opts.label`
   - 支持国际化（`i18n: true`）、自动换行（`wrap: true`）、左对齐（`haligh: 'left'`）

3. **整体包装**
   - 包裹在一个 `HBox` 中，宽度自适应，高度自动计算
   - 绑定点击事件至 `regen_event(opts)`
   - 更新 `height_int`（基于 `charsize * rate`）

> ⚠️ 注意：图标与文本共存时垂直居中对齐由外层 HBox 控制。

---

## 3. `bricks.FloatIconBar`（浮动图标栏）

### 类继承关系
```js
class extends bricks.HBox
```

实现“仅显示浮出按钮，悬停时展开全部图标”的交互模式。

### 配置参数 (`opts`)
同 `IconBar`，但只显示一个小浮点按钮，其余图标隐藏。

### 构造函数逻辑

1. 创建浮出按钮：
   ```js
   this.float_w = new bricks.Svg({ url: bricks_resource('imgs/float-out.png') });
   ```
   - 绑定 `mousemove` 事件显示图标栏
   - 添加到容器

2. 创建图标主体：
   ```js
   this.icons_box = this.build_bar(opts);
   ```
   - 默认调用 `new bricks.IconBar(opts)`
   - 初始隐藏（`display: none`）

3. 设置容器高度等于 `icons_box.height_int`
4. 绑定全局点击事件隐藏图标栏（通过 `Body.click`）

### 方法说明

| 方法 | 功能 |
|------|------|
| `build_bar(opts)` | 工厂方法，创建内部图标栏实例（可被子类重写） |
| `show_icons()` | 显示图标栏（`display: flex`） |
| `hide_icons()` | 隐藏图标栏（`display: none`） |

> 📌 交互逻辑：鼠标移上浮点按钮 → 显示图标；点击任意空白区域 → 隐藏图标。

---

## 4. `bricks.FloatIconTextBar`（浮动图文栏）

### 类继承关系
```js
class extends bricks.FloatIconBar
```

扩展 `FloatIconBar`，使其内部使用 `IconTextBar` 替代 `IconBar`。

### 核心重写方法

```js
build_bar(opts) {
    return new bricks.IconTextBar(opts);
}
```

> ✅ 效果：浮出后显示带文字说明的图标按钮组，适合需要语义化提示的场景。

---

## 工厂注册

以下语句将各组件注册到 `bricks.Factory`，支持通过字符串名称动态创建实例：

```js
bricks.Factory.register('IconBar', bricks.IconBar);
bricks.Factory.register('IconTextBar', bricks.IconTextBar);
bricks.Factory.register('FloatIconBar', bricks.FloatIconBar);
bricks.Factory.register('FloatIconTextBar', bricks.FloatIconTextBar);
```

### 使用示例（工厂方式）
```js
var bar = bricks.Factory.create('IconTextBar', {
    tools: [
        { name: 'save', icon: '/icons/save.svg', label: 'Save File' },
        { name: 'print', icon: '/icons/print.svg', label: 'Print' }
    ],
    margin: '8px',
    rate: 1.2
});
```

---

## 示例配置

### 简单图标栏
```js
new bricks.IconBar({
    cheight: 2,
    rate: 1,
    margin: '12px',
    tools: [
        { name: 'home', icon: '/icons/home.svg', tip: 'Go Home' },
        { name: 'settings', icon: '/icons/settings.svg' },
        { name: 'blankicon' }, // 占位符
        { name: 'logout', icon: '/icons/logout.svg' }
    ]
});
```

### 图文混合栏
```js
new bricks.IconTextBar({
    rate: 1.1,
    tools: [
        { name: 'new', icon: '/icons/new.svg', label: 'New', tip: 'Create new file' },
        { name: 'open', icon: '/icons/open.svg', label: 'Open' },
        { name: 'help', label: 'Help', icon: '/icons/help.svg' }
    ]
});
```

### 浮动图文工具栏
```js
new bricks.FloatIconTextBar({
    tools: [
        { name: 'cut', icon: '/icons/cut.svg', label: 'Cut' },
        { name: 'copy', icon: '/icons/copy.svg', label: 'Copy' },
        { name: 'paste', icon: '/icons/paste.svg', label: 'Paste' }
    ],
    rate: 1
});
```

---

## 设计特点总结

| 特性 | 描述 |
|------|------|
| 🔧 **模块化设计** | 所有功能拆分为可复用类，便于扩展 |
| 🖱️ **交互友好** | 支持点击、悬停展开、事件拦截 |
| 📏 **响应式尺寸** | 基于 `charsize` 和 `rate` 实现相对缩放 |
| 🔔 **事件驱动** | 通过 `dispatch` 发送命名事件，解耦 UI 与业务逻辑 |
| 🧩 **工厂模式支持** | 可通过字符串动态创建组件 |

---

## 注意事项

1. **依赖前提**：
   - 必须已加载 `bricks.HBox`, `bricks.Svg`, `bricks.Text`, `bricks.BlankIcon`, `bricks.Body`
   - `bricks.app.charsize` 需已初始化
   - `bricks_resource()` 函数需可用（用于资源路径解析）

2. **性能建议**：
   - 工具数量较多时建议使用 `FloatIconBar` 减少视觉干扰
   - 避免频繁重建整个 `IconBar`，应缓存实例

3. **样式定制**：
   - 推荐通过 `set_style()` 或外部 CSS 修改外观
   - 不推荐直接修改内部 DOM 结构

---

## 版本信息

- **作者**：Bricks Framework Team
- **版本**：1.0
- **最后更新**：2025年4月5日

--- 

📌 **文档结束**