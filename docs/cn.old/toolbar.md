# `bricks.Toolbar` 技术文档

> **模块**：`bricks.Toolbar`  
> **继承自**：`bricks.Layout`  
> **用途**：创建可配置的工具栏组件，支持水平/垂直布局、动态工具项生成、点击事件分发及可移除按钮功能。

---

## 概述

`bricks.Toolbar` 是一个基于 `bricks.Layout` 的类，用于构建可视化工具栏。它支持横向或纵向排列的按钮工具项，并提供灵活的配置选项，包括图标、标签、样式、事件绑定等。工具栏中的每个工具项可以触发命令事件，并可选择性地添加“删除”图标以支持动态移除。

该组件使用异步方式创建工具项，确保渲染性能，并通过 `bricks.widgetBuild` 工厂方法统一创建子控件。

---

## 构造函数

### `constructor(options)`

初始化工具栏实例。

#### 参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `options` | Object | 配置对象，继承自 `bricks.Layout` 并扩展以下属性 |

#### `options` 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `orientation` | String | `'horizontal'` | 布局方向：`'horizontal'` 或 `'vertical'` |
| `target` | Any | `undefined` | 可选的目标引用，会在事件数据中传递 |
| `interval` | String 或 Number | `'10px'` | 工具项之间的间隔尺寸（CSS 单位） |
| `tools` | Array&lt;Object&gt; | `[]` | 工具项描述数组，每项包含图标、名称、标签等信息 |
| `css` | String | `'toolbar'` | 自定义 CSS 前缀类名 |

#### 示例

```js
var toolbar = new bricks.Toolbar({
    orientation: 'horizontal',
    target: myComponent,
    interval: '15px',
    css: 'my-toolbar',
    tools: [
        { name: 'save', label: '保存', icon: 'save-icon.svg' },
        { name: 'delete', label: '删除', icon: 'del-icon.svg', removable: true }
    ]
});
```

#### 实现细节

- 根据 `orientation` 创建 `HScrollPanel`（水平）或 `VScrollPanel`（垂直）作为内部容器。
- 添加对应 CSS 类：`.htoolbar` 或 `.vtoolbar`。
- 启用键盘选择：`enable_key_select()`。
- 使用 `schedule_once` 延迟调用 `createTools()`，避免阻塞主线程。

---

## 成员变量

| 变量 | 类型 | 描述 |
|------|------|------|
| `bar` | `bricks.HScrollPanel` / `bricks.VScrollPanel` | 内部滚动面板容器 |
| `toolList` | Array&lt;Widget&gt; | 存储所有已创建的工具按钮实例 |
| `clicked_btn` | Widget 或 null | 当前被激活（点击）的按钮 |
| `preffix_css` | String | CSS 类前缀，用于激活状态样式 |

---

## 方法说明

### `add_interval_box()`

在当前工具栏中插入一个间隔空白区域（`JsWidget`），其大小由 `options.interval` 控制，方向根据 `orientation` 决定。

#### 行为逻辑

- 若为垂直布局 → 设置高度
- 若为水平布局 → 设置宽度

#### 示例效果

```css
width: 10px; /* 水平间距 */
height: 10px; /* 垂直间距 */
```

> 调用时机：在 `createTools()` 中，两个工具之间自动插入。

---

### `async createTools()`

异步批量创建所有工具项。

#### 流程

1. 遍历 `this.opts.tools`
2. 调用 `createTool(desc)` 逐个创建
3. 在非最后一个工具后调用 `add_interval_box()`

#### 注意事项

- 使用 `await` 确保顺序执行（可用于动画或依赖加载）
- 初始延迟 10ms 执行（通过 `schedule_once(..., 0.01)`）

---

### `async createTool(desc)`

创建单个工具按钮。

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `desc` | Object | 工具描述对象，结构如下 |

##### `desc` 结构（工具项配置）

| 属性 | 类型 | 是否必需 | 说明 |
|------|------|----------|------|
| `name` | String | ✅ | 工具唯一标识符（用于事件名） |
| `label` | String | ❌ | 显示文本 |
| `icon` | String | ❌ | 图标 URL 或 class 名称 |
| `css` | String | ❌ | 自定义按钮 CSS 类 |
| `removable` | Boolean | ❌ | 是否显示删除图标，默认 `false` |

#### 返回值

- `{Promise<bricks.Widget>}`：成功时返回按钮控件；失败返回 `undefined`

#### 内部逻辑

1. 构造 `widgetBuild` 所需的选项
2. 调用 `bricks.widgetBuild(options)` 异步创建按钮
3. 绑定 `click` 事件到 `do_handle`
4. 将按钮加入 `toolList` 和 `bar` 容器
5. 若 `removable == true`，调用 `add_removable(w)`
6. 触发 `remove` 事件（当用户点击删除图标时）

---

### `remove_item(w, event)`

从工具栏中移除指定工具项。

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `w` | Widget | 要移除的按钮控件 |
| `event` | Event | DOM 事件对象 |

#### 动作

- 从 `bar` 中移除控件
- 取消选中状态
- 从 `toolList` 数组中删除
- 解绑 `click` 事件监听器
- 分发 `remove` 事件，携带 `tool_opts`
- 阻止事件冒泡和默认行为

---

### `do_handle(tool, event)`

处理工具按钮点击事件。

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `tool` | Widget | 被点击的按钮实例 |
| `event` | Event | 原始事件对象 |

#### 功能

1. 输出调试日志
2. 构建事件数据 `d`，合并 `tool.tool_opts` 和可选 `target`
3. 在 `bar` 上标记该按钮为选中状态
4. 分发两个事件：
   - `'command'`：通用命令事件
   - `[tool.name]`：以工具名命名的特定事件（如 `'save'`, `'delete'`）
5. 更新激活按钮的 CSS 样式：
   - 清除上一个激活按钮的样式
   - 为当前按钮添加 `prefix-css + '-button-active'` 类
6. 记录当前点击按钮至 `this.clicked_btn`

#### 示例事件数据

```js
{
    name: "save",
    label: "保存",
    icon: "save-icon.svg",
    target: myComponent
}
```

---

### `add_removable(item)`

为指定工具项添加可删除的 SVG “×” 图标。

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `item` | Widget | 支持移除的工具按钮 |

#### 条件判断

- 仅当 `item.tool_opts.removable === true` 时执行

#### 实现步骤

1. 加载 SVG 删除图标（路径来自 `bricks_resource('imgs/delete.svg')`）
2. 创建 `bricks.Svg` 控件并插入按钮内
3. 绑定点击事件到 `remove_item`
4. 输出调试信息

#### 错误处理

- 若 `Svg` 创建失败，输出错误日志

---

### `click(name)`

模拟点击某个工具按钮（通过名称查找）。

#### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | String | 工具项的 `name` 字段 |

#### 行为

遍历 `toolList`，找到匹配 `name` 的按钮并触发其原生 DOM 的 `.click()` 方法，从而激活 `do_handle`。

#### 应用场景

- 外部程序化触发某个命令
- 快捷键绑定

---

## 事件系统

`Toolbar` 支持以下事件分发：

| 事件名 | 触发条件 | 携带数据 |
|--------|----------|---------|
| `command` | 任意工具被点击 | 合并后的工具选项 + target |
| `[tool.name]` | 特定工具被点击 | 同上 |
| `remove` | 用户点击删除图标 | 被删除工具的原始 `tool_opts` |

可通过 `bind(event, handler)` 监听这些事件。

#### 示例监听

```js
toolbar.bind('save', function(data) {
    console.log('保存操作触发:', data);
});

toolbar.bind('command', function(cmd) {
    console.log('收到命令:', cmd.name);
});
```

---

## 样式类说明

| CSS 类 | 作用 |
|-------|------|
| `.htoolbar` | 水平工具栏根元素样式 |
| `.vtoolbar` | 垂直工具栏根元素样式 |
| `.toolbar-button-active` | 激活按钮状态（默认前缀） |
| `[custom]-button-active` | 自定义前缀激活样式（由 `css` 选项控制） |

> 推荐在主题 CSS 中定义相关样式。

---

## 注册与工厂模式

```js
bricks.Factory.register('Toolbar', bricks.Toolbar);
```

允许通过字符串标识符创建实例：

```js
bricks.create({
    widgettype: 'Toolbar',
    options: { ... }
});
```

---

## 使用示例

### 完整 HTML 示例

```html
<div id="toolbar-container"></div>

<script>
var toolbar = new bricks.Toolbar({
    container: document.getElementById('toolbar-container'),
    orientation: 'horizontal',
    interval: '12px',
    target: app.mainView,
    css: 'app-toolbar',
    tools: [
        { name: 'new', label: '新建', icon: 'icons/new.svg' },
        { name: 'open', label: '打开', icon: 'icons/open.svg' },
        { name: 'save', label: '保存', icon: 'icons/save.svg', removable: true }
    ]
});

// 监听事件
toolbar.bind('save', function(data) {
    console.log('正在保存...', data.target);
});

// 程序触发
setTimeout(() => toolbar.click('new'), 1000);
</script>
```

---

## 调试信息

启用 `bricks.debug` 后，会输出以下信息：

- 工具构建失败
- 删除图标加载结果
- 点击事件详情
- 可移除功能启用状态

建议开发阶段开启调试模式。

---

## 总结

`bricks.Toolbar` 提供了一个现代化、可扩展的工具栏解决方案，具备以下特性：

✅ 支持横竖布局  
✅ 动态工具生成  
✅ 事件驱动架构  
✅ 支持可删除项  
✅ 样式可定制  
✅ 兼容工厂创建模式  

适合集成于富客户端应用、编辑器、IDE 工具条等场景。