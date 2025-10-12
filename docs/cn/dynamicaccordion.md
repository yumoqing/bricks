# `DynamicAccordion` 技术文档

> **模块名称：** `bricks.DynamicAccordion`  
> **继承自：** `bricks.VScrollPanel`  
> **用途：** 动态可折叠列表组件，支持分页加载、内容动态渲染、编辑操作（增删改）、工具栏扩展等高级功能。

---

## 目录

- [1. 概述](#1-概述)
- [2. 核心类结构](#2-核心类结构)
  - [2.1 `bricks.AccordionItem`](#21-bricksaccordionitem)
  - [2.2 `bricks.AccordionInfo`](#22-bricksaccordioninfo)
  - [2.3 `bricks.DynamicAccordion`](#23-bricksdynamicaccordion)
- [3. 配置选项 (`opts`)](#3-配置选项-opts)
- [4. 生命周期与构建流程](#4-生命周期与构建流程)
- [5. 主要方法说明](#5-主要方法说明)
  - [5.1 渲染控制](#51-渲染控制)
  - [5.2 内容生成](#52-内容生成)
  - [5.3 数据处理与分页](#53-数据处理与分页)
  - [5.4 编辑功能](#54-编辑功能)
  - [5.5 事件系统](#55-事件系统)
- [6. CSS 类名约定](#6-css-类名约定)
- [7. 使用示例](#7-使用示例)
- [8. 注意事项](#8-注意事项)

---

## 1. 概述

`bricks.DynamicAccordion` 是一个基于 `VScrollPanel` 的高级可折叠面板组件，用于展示大量条目数据。每个条目由标题区域和可展开的内容区组成，支持：

- 分页异步加载数据
- 可配置的记录视图模板（`record_view`）
- 展开后动态加载详细内容（`content_view`）
- 行内工具栏（支持自定义按钮及编辑操作）
- 增删改查（CRUD）交互支持
- 条件性内容显示（依赖字段值）

适用于需要高效展示并操作大量结构化数据的场景，如后台管理界面中的日志、订单、用户列表等。

---

## 2. 核心类结构

### 2.1 `bricks.AccordionItem`

```js
class extends bricks.VBox
```

表示单个可折叠项的容器，包含两个子部件：
- `AccordionInfo`：点击触发展开/收起的头部
- `VBox`：隐藏的内容区域（默认不显示）

#### 构造函数
```js
constructor(opts) {
  super(opts);
  this.set_css('accordion-item');
}
```

#### 特性
- 自动添加 CSS 类 `accordion-item`
- 继承 `VBox` 布局特性（垂直排列）

---

### 2.2 `bricks.AccordionInfo`

```js
class extends bricks.FHBox
```

代表折叠项的标题部分，通常用于显示摘要信息，并绑定点击事件以切换内容可见性。

#### 构造函数
```js
constructor(opts) {
  super(opts);
  this.set_css('accordion-item-info');
}
```

#### 特性
- 使用 `FHBox` 实现水平布局
- 添加 CSS 类 `accordion-item-info`
- 存储关联的数据记录在 `user_data` 属性中

---

### 2.3 `bricks.DynamicAccordion`

主控件类，负责整体逻辑调度、数据加载、UI 构建与交互响应。

```js
class extends bricks.VScrollPanel
```

#### 注册方式
```js
bricks.Factory.register('DynamicAccordion', bricks.DynamicAccordion);
```

允许通过工厂方法创建实例：
```js
bricks.createWidget("DynamicAccordion", {...});
```

---

## 3. 配置选项 (`opts`)

| 参数 | 类型 | 说明 |
|------|------|------|
| `data_url` | String | 获取数据的 API 地址 |
| `data_method` | String (可选) | 请求方法，默认为 `'GET'` |
| `data_params` | Object (可选) | 发送请求时附加的参数 |
| `cache_limit` | Number (可选) | 缓存页数上限 |
| `page_rows` | Number (可选) | 每页返回的行数 |
| `row_cheight` | Number (可选, 默认: `1.5`) | 每行高度倍率（影响布局计算） |
| `record_view` | Widget 描述对象 | 定义每行摘要区域的 UI 结构 |
| `content_rely_on` | String (可选) | 控制是否展开内容的字段名 |
| `content_rely_value` | Any (可选) | 上述字段应匹配的值才能展开内容 |
| `editable` | Object (可选) | 启用编辑模式的相关配置 |
| &nbsp;&nbsp;`.add_icon`, `.update_icon`, `.delete_icon` | String | 图标路径或资源引用 |
| &nbsp;&nbsp;`.form_cheight` | Number | 表单高度系数 |
| &nbsp;&nbsp;`.new_data_url`, `.update_data_url`, `.delete_data_url` | String | 对应操作的提交 URL |
| `fields` | Array\<Field\> | 字段定义数组，用于表单和列头渲染 |
| `record_toolbar` | Object (可选) | 自定义行工具栏按钮配置 |
| `record_toolbar_collapsable` | Boolean (可选) | 工具栏是否可折叠（未完全实现） |
| `header` | Object (可选) | 头部固定行配置（暂未启用） |
| `content_view` | Widget 描述对象 | 展开后显示的详情内容模板 |
| `title` | String (可选) | 页面标题文本（i18n 支持） |
| `description` | String (可选) | 页面描述文本 |

> ⚠️ 所有字符串文本均支持国际化（`i18n: true`）。

---

## 4. 生命周期与构建流程

`build_all()` 方法是初始化入口，在构造完成后延迟执行（`schedule_once(..., 0.1)`）：

```js
async build_all() {
  if (this.title)        this.build_title();
  if (this.description)  this.build_description();
  await this.build_toolbar();
  await this.build_header();

  this.container = new bricks.VScrollPanel({});
  this.add_widget(new bricks.Filler().add_widget(this.container));

  this.container.bind('min_threshold', this.load_previous_page.bind(this));
  this.container.bind('max_threshold', this.load_next_page.bind(this));

  await this.render();
}
```

### 流程图解：
```
[初始化] 
   ↓
build_title() → 添加标题
build_description() → 添加描述
build_toolbar() → 添加全局工具栏
build_header() → 创建表头（模拟）
   ↓
创建内部容器 container (VScrollPanel)
   ↓
绑定滚动触底/触顶事件 → 分页加载
   ↓
render() → 加载并渲染第一页数据
```

---

## 5. 主要方法说明

### 5.1 渲染控制

#### `render(params)`
根据参数重新加载数据并刷新 UI。

- 若参数未变，则跳过
- 调用 `loader.loadData(params)` 获取数据
- 成功后调用 `dataHandle(d)`

#### `dataHandle(d)`
处理服务器返回的数据包：
```js
{
  rows: [...],       // 当前页数据
  add_page: 2,       // 新增页码
  delete_page: 1     // 应删除的旧页码（超出缓存限制）
}
```

调用 `renderAccordionItems(data, page)` 渲染新项，并清理过期页。

---

### 5.2 内容生成

#### `build_item(record)`
构建单个可折叠项：
- 创建 `AccordionItem`
- 调用 `build_info(item, record)` 构建标题区
- 创建隐藏的 `content` 区域
- 绑定点击事件：`line_clicked(info, content, record)`
- 返回完整 `item`

若 `record === null`，则作为“表头”使用。

#### `build_info(item, record)`
生成标题区域 UI：
- 使用 `widgetBuild(this.record_view, info, record)` 渲染摘要内容
- 插入 `record_toolbar`（含编辑图标）
- 设置 `info.user_data = record`
- 返回 `AccordionInfo` 实例

当无 `record` 时，用于生成列头标签。

---

### 5.3 数据处理与分页

#### `load_previous_page() / load_next_page()`
滚动接近边界时自动加载前后页：
- 显示加载动画（`Running` 提示）
- 设置 `this.loading = true` 防止重复请求
- 调用 `loader.loadPreviousPage()` 或 `loadNextPage()`
- 成功后调用 `dataHandle()` 并恢复滚动位置
- 错误捕获并输出调试日志

#### `delete_page(page)`
移除指定页的所有 DOM 元素：
```js
querySelectorAll('[data-page="X"]')
→ 移除对应 widget
```

确保内存和 DOM 不泄漏。

---

### 5.4 编辑功能

#### 新增记录
- `add_record(info)`：打开内嵌表单
- `add_record_abort()`：取消新增
- `add_record_finish()`：提交成功后刷新列表

#### 更新记录
- `update_record(info, record)`：弹出编辑表单
- `update_cancel()`：取消编辑
- `update_record_finish()`：保存后更新视图或提示

#### 删除记录
- `delete_record(info, record)`：弹出确认框
- `delete_record_act()`：发送删除请求，删除成功则移除该项

#### 新建表单快捷入口
- `build_new_form()`：顶部添加“+”按钮和隐藏表单
- 点击按钮展开/收起新建表单
- 提交后自动调用 `render()` 刷新列表

---

### 5.5 事件系统

#### 内部事件绑定
- `info.bind('click', line_clicked)`：行点击展开内容
- `IconBar` 工具按钮绑定各种事件（`add`, `update`, `delete`）
- 自定义工具按钮通过 `fire_event(name, data)` 派发事件

#### 外部可监听事件
| 事件名 | 触发时机 | 参数 |
|--------|----------|------|
| `row_selected` | 用户点击某一行 | `info` widget |
| `conformed` | 删除确认后 | —— |
| `submited` | 表单提交成功 | 响应对象 |
| `[custom_tool_name]` | 自定义工具按钮被点击 | `record` 数据 |

可通过 `bind(event, handler)` 监听。

---

## 6. CSS 类名约定

| 类名 | 作用 |
|------|------|
| `.accordion-item` | 整个折叠项外层容器 |
| `.accordion-item-info` | 折叠项标题区域 |
| `.accordion-item-info-selected` | 当前行被选中状态 |
| `.accordion-item-content` | 内容区域样式基类 |
| `.filler` | 占位填充容器（用于自适应高度） |

建议配合 SCSS 定义主题风格，例如圆角、阴影、过渡动画等。

---

## 7. 使用示例

```js
var accordion = new bricks.DynamicAccordion({
  title: "User List",
  description: "Manage all registered users.",
  data_url: "/api/users",
  page_rows: 10,
  cache_limit: 5,

  fields: [
    { name: "name", label: "Name" },
    { name: "email", label: "Email" },
    { name: "status", label: "Status" }
  ],

  record_view: {
    widgettype: "HBox",
    options: { cheight: 1.5 },
    subwidgets: [
      { widgettype: "Text", options: { otext: "{{name}}" } },
      { widgettype: "Text", options: { otext: "{{email}}", halign: "right" } }
    ]
  },

  content_view: {
    widgettype: "Form",
    options: {
      fields: [
        { name: "name", uitype: "text" },
        { name: "email", uitype: "email" },
        { name: "bio", uitype: "textarea" }
      ]
    }
  },

  editable: {
    form_cheight: 8,
    new_data_url: "/api/users/create",
    update_data_url: "/api/users/update",
    delete_data_url: "/api/users/delete",
    add_icon: "/static/icons/add.svg"
  },

  record_toolbar: {
    tools: [
      { name: "view_logs", tip: "View operation logs", icon: "/icons/logs.svg" }
    ]
  }
});

// 监听自定义操作
accordion.bind("view_logs", function(record){
  console.log("查看日志:", record);
});
```

---

## 8. 注意事项

1. **性能优化**
   - 支持分页缓存，避免一次性加载过多数据
   - 滚动加载机制减少初始等待时间
   - `cache_limit` 应合理设置以防内存占用过高

2. **内容懒加载**
   - `content_view` 仅在点击展开时构建，节省资源
   - 再次点击会清除内容（`clear_widgets()`），防止状态残留

3. **国际化支持**
   - 所有文本建议使用 `otext` + `i18n: true` 配合语言包

4. **DOM 清理**
   - 删除页面时主动移除 widgets 和事件监听（依赖框架 GC）

5. **扩展性**
   - 可通过 `record_toolbar` 添加自定义操作按钮
   - `fire_event()` 支持插件式开发

6. **兼容性**
   - 依赖 `bricks.PageDataLoader`, `bricks.HttpJson`, `bricks.widgetBuild` 等基础模块
   - 需确保这些模块已正确加载

---

✅ **推荐搭配组件：**
- `bricks.Form`：用于编辑表单
- `bricks.Conform`：删除确认对话框
- `bricks.Running`：加载指示器
- `bricks.IconBar`：工具栏按钮组

📦 此组件适合集成于管理系统、数据看板等复杂前端应用中。