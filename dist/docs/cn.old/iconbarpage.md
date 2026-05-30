# `IconbarPage` 技术文档

> **模块路径**: `bricks.IconbarPage`  
> **继承自**: `bricks.VBox`  
> **用途**: 提供一个带有图标工具栏的页面容器，支持顶部或底部布局，并可动态加载内容组件。

---

## 概述

`bricks.IconbarPage` 是一个基于 `bricks.VBox` 的复合组件，用于构建具有图标文本工具栏（`IconTextBar`）和内容区域的页面。工具栏可置于页面顶部或底部，点击工具项时会触发对应的内容展示逻辑。

该组件适用于需要导航式界面的应用场景，如设置页、功能面板或多标签界面。

---

## 类定义

```javascript
bricks.IconbarPage = class extends bricks.VBox { ... }
```

---

## 构造函数

### `constructor(opts)`

初始化 `IconbarPage` 实例。

#### 参数

| 参数名 | 类型 | 说明 |
|-------|------|------|
| `opts` | Object | 配置选项对象 |

##### `opts` 结构

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `bar_opts` | Object | 是 | - | 图标工具栏的配置选项，传递给 `bricks.IconTextBar` |
| `bar_at` | String | 否 | `'top'` | 工具栏位置，可选 `'top'` 或 `'bottom'` |
| `height` | String | 否 | `'100%'` | 自动设置为 100%，确保占满父容器高度 |

##### `bar_opts` 子属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `margin` | Number/String | 工具栏外边距 |
| `rate` | Number | 布局占比（在 VBox 中使用的伸缩比例） |
| `tools` | Array\<Tool\> | 工具项列表，每个工具项定义一个可点击的操作 |

##### `tools` 数组中的 `tool` 对象结构

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | String | 是 | 工具名称，作为唯一标识 |
| `icon` | String | 是 | 图标类名（如 Font Awesome 类名） |
| `label` | String | 否 | 显示文本（可选） |
| `tip` | String | 是 | 鼠标悬停提示文本 |
| `dynsize` | Boolean | 否 | 是否动态调整大小 |
| `rate` | Number | 否 | 在布局中所占比例 |
| `context` | Object | 否 | 附加上下文数据，可用于命令处理 |
| `content` | WidgetConfig / Function / Promise | 是 | 要加载的内容组件配置或异步构造逻辑 |

---

## 成员属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `bar_at` | String | 存储工具栏位置（`'top'` 或 `'bottom'`） |
| `content` | `bricks.Filler` | 内容容器，用于动态插入当前选中的工具对应的内容组件 |
| `bar` | `bricks.IconTextBar` | 创建的图标文本工具栏实例 |

---

## 方法

### `command_handle(event) → Promise<void>`

处理来自工具栏的命令事件（例如点击某个工具按钮），并加载对应的内容。

#### 参数

- `event`: 事件对象
  - `params`: 触发事件的 `tool` 对象（即被点击的工具项）

#### 行为

1. 获取触发事件的 `tool`
2. 调用 `show_content(tool)` 异步加载内容

> ⚠️ 使用 `bind(this)` 绑定上下文，在构造时通过 `bar.bind('command', ...)` 注册。

---

### `show_content(tool) → Promise<void>`

根据传入的 `tool` 动态创建并显示其对应的内容组件。

#### 参数

- `tool`: 工具项对象（包含 `content` 字段）

#### 流程

1. 使用 `bricks.widgetBuild(tool.content, this)` 异步生成组件实例
2. 若组件存在且尚未添加到 DOM 树，则将其加入 `this.content` 容器
3. 替换当前内容区域的内容（旧内容会被自动移除？取决于 `Filler` 实现）

> ✅ 支持异步组件加载，适合懒加载或远程模块。

---

## 生命周期与初始化行为

1. 设置默认高度为 `'100%'`
2. 确定工具栏位置（默认为 `'top'`）
3. 调用父类 `super(opts)` 初始化 VBox 布局
4. 创建 `IconTextBar` 实例并传入 `bar_opts`
5. 创建 `Filler` 作为内容占位符
6. 根据 `bar_at` 决定工具栏与内容的排列顺序：
   - `'top'`: 先工具栏，后内容
   - `'bottom'`: 先内容，后工具栏
7. 绑定 `command` 事件监听器到 `command_handle`
8. 使用 `schedule_once` 延迟 0.1 秒自动显示第一个工具项的内容

> 🕒 `schedule_once(..., 0.1)` 可避免渲染冲突，确保 DOM 就绪后再加载初始内容。

---

## 示例用法

```javascript
var page = new bricks.IconbarPage({
    bar_at: 'top',
    bar_opts: {
        margin: 5,
        rate: 0,
        tools: [
            {
                name: 'dashboard',
                icon: 'fa fa-tachometer',
                label: '仪表盘',
                tip: '查看系统状态',
                rate: 1,
                content: { type: 'DashboardWidget', opts: {} }
            },
            {
                name: 'settings',
                icon: 'fa fa-cog',
                tip: '系统设置',
                content: async function() {
                    let mod = await import('./SettingsPanel.js');
                    return new mod.SettingsPanel();
                }
            }
        ]
    }
});

document.body.appendChild(page.root);
```

---

## 事件机制

- **事件类型**: `command`
- **触发源**: `bricks.IconTextBar`
- **携带参数**: `event.params` 包含完整的 `tool` 对象
- **监听方式**: 在 `IconTextBar` 上绑定 `command` 事件

---

## 注册信息

```javascript
bricks.Factory.register('IconbarPage', bricks.IconbarPage);
```

可通过工厂方法创建：

```javascript
bricks.Factory.create('IconbarPage', {...opts});
```

---

## 注意事项

1. **内容清理**：当前实现未显式清除旧内容，依赖 `Filler` 组件的行为。若需手动管理，请扩展 `show_content` 方法。
2. **性能优化**：首次加载延迟 0.1s，建议确认是否必要；可考虑使用 `requestAnimationFrame` 或更精确的时机控制。
3. **错误处理**：`widgetBuild` 失败时无异常捕获，建议包裹 `try-catch` 增强健壮性。

---

## 依赖组件

- `bricks.VBox` —— 垂直布局容器
- `bricks.IconTextBar` —— 图标+文本工具栏
- `bricks.Filler` —— 内容填充容器
- `bricks.widgetBuild` —— 异步构建组件的工具函数
- `schedule_once` —— 延迟执行工具函数（通常为 `setTimeout` 封装）

---

## 版本历史

| 日期 | 修改人 | 说明 |
|------|--------|------|
| 2025-04-05 | AutoDoc Generator | 根据源码生成技术文档 |

--- 

✅ **文档完成**  
📌 推荐配合 `IconTextBar` 文档一起阅读以理解完整交互逻辑。