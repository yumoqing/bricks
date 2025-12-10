# `TabPanel` 组件技术文档

> **命名空间**: `bricks.TabPanel`  
> **继承自**: `bricks.Layout`  
> **注册名称**: `'TabPanel'`（可通过工厂创建）

---

## 概述

`TabPanel` 是一个可切换内容区域的布局组件，支持多标签页管理。每个标签页可以包含独立的内容组件（如其他 widget），并支持动态加载、缓存和事件通知机制。

标签位置可配置为上下左右四种方向，内容区自动适配布局顺序。

---

## 构造函数

```js
new bricks.TabPanel(options)
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `options` | Object | 配置选项对象，继承自 `bricks.Layout` 并扩展以下属性 |

### Options 配置项

```js
{
  tab_pos: "top",        // 标签栏位置: 'top', 'bottom', 'left', 'right'
  tab_long: "100%",      // 标签宽度或高度（CSS 值字符串）
  items: [               // 标签项数组
    {
      name: "tab1",      // 标签唯一标识名（必填）
      label: "Tab 1",    // 显示文本
      icon: "",          // 图标类名（可选）
      removable: false,  // 是否可关闭（显示删除按钮）
      refresh: false,    // 是否每次点击都重新构建内容
      content: {         // 内容描述对象，用于构建子 Widget
        widgettype: "..."// 如: "Text", "Grid" 等
        // 其他 widget 特定参数
      }
    }
  ],
  css: ""                // 自定义 CSS 类名（附加到根元素）
}
```

> ⚠️ 注意：`content` 可以是标准 widget 描述对象，也可以直接是一个 `bricks.JsWidget` 实例。

---

## 布局结构

根据 `tab_pos` 不同，整体采用 `vbox` 或 `hbox` 布局：

| `tab_pos` | 主轴方向 | 子组件排列顺序 |
|-----------|----------|----------------|
| `"top"` / `"bottom"` | 垂直 (`vbox`) | 上/下：标签 → 内容；下/上：内容 → 标签 |
| `"left"` / `"right"` | 水平 (`hbox`) | 左/右：标签 → 内容；右/左：内容 → 标签 |

- **标签容器**：`this.tab_container`（VBox 容器）
- **内容容器**：`this.content_container`（Filler 容器，用于动态替换内容）

---

## 样式类（CSS Classes）

组件使用如下 CSS 类进行样式控制：

| 类名 | 作用 |
|------|------|
| `.tabpanel` | 根元素样式 |
| `.tab-button` | 单个标签按钮默认样式 |
| `.tab-button-active` | 当前激活标签样式 |
| `.tab-button-hover` | 鼠标悬停时标签样式 |
| `.tab-content` | 内容区域样式（已通过 `set_css('tabpanel-content')` 设置） |
| `.vbox`, `.hbox` | 布局方向控制 |

> 开发者可在主题 CSS 中覆盖这些类以自定义外观。

---

## 事件系统

### 1. `switch` 事件（在 TabPanel 上触发）

当标签切换导致内容变更时触发。

- **事件名**: `'switch'`
- **回调参数**: 被激活的内容 widget 实例
- **示例**:

```js
tabpanel.bind('switch', function(widget) {
  console.log("当前显示内容组件:", widget);
});
```

### 2. `active` 事件（在内容 widget 上触发）

当该内容面板被切换为可见状态时，在其自身上触发 `active` 事件。

- **用途**: 用于内容初始化、数据刷新等操作。
- **示例**:

```js
contentWidget.bind('active', function() {
  this.refreshData(); // 自定义刷新逻辑
});
```

### 3. Toolbar 内部事件（自动绑定）

- `'command'`: 用户点击标签时触发 → 调用 `show_tabcontent`
- `'remove'`: 用户关闭标签时触发 → 调用 `tab_removed`
- `'ready'`: Toolbar 初始化完成后 → 自动显示第一个标签

---

## 方法说明

### `constructor(options)`

初始化 TabPanel 实例，创建标签栏与内容容器，并根据配置设置布局方向。

#### 关键行为：
- 创建内部 `toolbar` 和 `content_container`
- 根据 `tab_pos` 设置主轴布局（`vbox` / `hbox`）
- 调用 `createToolbar()` 构建标签工具栏
- 最后调用 `show_first_tab()` 显示首个标签页

---

### `show_first_tab()`

手动触发第一个标签页的显示。

```js
this.show_first_tab();
```

> 通常由 `'ready'` 事件自动调用。

---

### `createToolbar()`

基于 `options.items` 创建一个 `bricks.Toolbar` 作为标签栏。

#### 行为：
- 设置 `orientation`：
  - `top` / `bottom` → `horizontal`
  - `left` / `right` → `vertical`
- 绑定事件：
  - `'command'` → `show_tabcontent`
  - `'remove'` → `tab_removed`
  - `'ready'` → `show_first_tab`
- 添加至 `tab_container`

---

### `async show_tabcontent(event)`

处理标签点击事件，加载并显示对应内容。

#### 流程：
1. 若点击的是当前标签，忽略重复操作。
2. 查找匹配的 `item` 配置。
3. 尝试从缓存 `content_buffer` 获取已有 widget：
   - 若存在且 `refresh: false`，直接复用。
4. 否则异步构建新 widget：
   - 支持直接传入 `bricks.JsWidget` 实例
   - 或通过 `bricks.widgetBuild()` 解析配置生成
5. 缓存 widget，调用 `switch_content(w)` 切换显示

> 错误捕获：构建失败会输出 debug 日志。

---

### `switch_content(w)`

切换内容区域为指定 widget。

#### 动作：
- 清空当前内容容器：`clear_widgets()`
- 添加新 widget
- 触发 `switch` 事件（携带 widget 参数）
- 触发内容 widget 的 `active` 事件

```js
this.switch_content(widgetInstance);
```

---

### `add_tab(desc)`

动态添加一个新的标签页。

#### 参数：
- `desc`: 符合 `items` 结构的对象（必须含 `name`, `label` 等）

#### 行为：
- 调用 `toolbar.createTool(desc)` 添加按钮
- 若 `removable === true`，启用关闭功能（需手动实现 UI 支持）

> 示例：

```js
tabpanel.add_tab({
  name: 'dynamic',
  label: '动态标签',
  content: { widgettype: 'Text', text: '这是动态添加的内容' },
  removable: true
});
```

---

### `tab_removed(event)`

处理标签被移除后的逻辑。

#### 参数：
- `event.params.name`: 被删除标签的 `name`

#### 行为：
- 从 `content_buffer` 中清除缓存
- 如果当前正在显示该标签，则自动切换回第一个标签页

---

## 缓存机制

- 所有已加载的 content widget 缓存在 `this.content_buffer` 对象中（键为 `name`）
- 默认不重复加载（除非设置 `refresh: true`）
- 删除标签时自动清理缓存

> 提升性能，避免频繁重建复杂组件。

---

## 使用示例

### 基本用法

```js
var tabpanel = new bricks.TabPanel({
  tab_pos: 'top',
  items: [
    {
      name: 'home',
      label: '首页',
      content: { widgettype: 'Text', text: '欢迎来到首页' }
    },
    {
      name: 'settings',
      label: '设置',
      icon: 'icon-gear',
      removable: true,
      content: { widgettype: 'Form', fields: [...] }
    }
  ]
});

document.body.appendChild(tabpanel.get_dom());
```

### 监听切换事件

```js
tabpanel.bind('switch', function(activeWidget) {
  console.log('切换到了:', activeWidget);
});

// 在内容组件中监听激活事件
var dashboardWidget = {
  widgettype: 'Dashboard',
  init: function() {
    this.bind('active', function() {
      this.loadData(); // 仅在显示时加载数据
    });
  }
};
```

---

## 注册信息

```js
bricks.Factory.register('TabPanel', bricks.TabPanel);
```

可通过工厂方式创建：

```js
bricks.widgetBuild({ widgettype: 'TabPanel', ... }, parent);
```

---

## 调试信息

- 重复点击相同标签：输出调试日志
- 内容构建失败：记录错误日志
- 未匹配的点击事件：提示“无响应”

> 使用 `bricks.debug()` 输出信息（生产环境建议关闭）

---

## 注意事项

1. **name 字段必须唯一**，否则缓存和查找将出错。
2. **content 必须合法**，确保能被 `widgetBuild` 正确解析。
3. 若需实时刷新内容，请设置 `refresh: true`。
4. 移除标签不会销毁 widget，但会清除缓存，防止内存泄漏。

---

## 版本兼容性

- 依赖 `bricks.Layout`, `bricks.Toolbar`, `bricks.Filler`, `bricks.VBox`
- 需支持 ES6 class 语法
- 异步加载依赖 Promise 环境

---

✅ **推荐场景**：后台管理系统、多文档界面、配置面板切换等需要标签式导航的 UI 场景。