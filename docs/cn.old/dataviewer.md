# `bricks.DataViewer` 技术文档

> **版本：1.0**  
> **继承自：`bricks.VBox`**  
> **用途：通用数据展示组件，支持分页加载、滚动加载、工具栏操作与动态表单交互**

---

## 概述

`bricks.DataViewer` 是一个可扩展的数据视图组件，用于在 Web 界面中以可视化方式展示和管理结构化数据。它基于 `bricks.VBox` 容器构建，具备以下核心功能：

- 支持异步分页加载远程数据（通过 `PageDataLoader`）
- 垂直滚动区域自动加载上一页/下一页
- 可配置的工具栏（支持增删改查等操作）
- 行选择与事件通知机制
- 内置编辑表单弹窗（新增、更新、克隆、删除）
- 高度可定制化（可通过子类重写关键方法实现自定义渲染）

该组件通常作为列表、表格或卡片式数据展示的基础容器使用。

---

## 组件结构

```js
var bricks = window.bricks || {};
bricks.DataViewer = class extends bricks.VBox { ... }
```

### 注册名称
```js
bricks.Factory.register('DataViewer', bricks.DataViewer);
```
可通过工厂创建：
```js
let viewer = bricks.Factory.build('DataViewer', opts);
```

---

## 构造函数

```js
constructor(opts)
```

### 参数说明

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `opts.data_url` | String | 是 | 数据请求 URL |
| `opts.data_params` | Object | 否 | 请求附加参数 |
| `opts.page_rows` | Number | 否 | 每页行数，默认由 `PageDataLoader` 控制 |
| `opts.data_method` | String | 否 | HTTP 方法（如 `'GET'`, `'POST'`），默认 `'GET'` |
| `opts.cache_limit` | Number | 否 | 缓存页面数量限制 |
| `opts.editable` | Object | 否 | 编辑配置对象（见下文） |
| `opts.toolbar` | Object | 否 | 工具栏自定义项 |
| `opts.row_options` | Object | 否 | 行级选项（字段、排除字段等） |

### 初始化行为

1. 设置默认布局样式：
   - 宽高为 `100%`
   - 溢出隐藏（`overflow: hidden`）
2. 创建 `PageDataLoader` 实例用于数据加载
3. 初始化状态变量（选中行、加载锁、偏移量等）
4. 绑定事件：`row_check_changed`
5. 延迟调用 `build_all()` 进行 UI 构建

---

## 核心属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `loader` | `PageDataLoader` | 负责数据分页加载 |
| `scrollpanel` | `VScrollPanel` | 主内容滚动容器 |
| `filler_widget` | `Filler` | 占位容器，容纳 `scrollpanel` |
| `toolbar_w` | `IconTextBar` | 工具栏组件 |
| `select_row` | Widget | 当前选中的记录行 widget |
| `active_item` | Widget | 当前激活项目（保留字段） |
| `loading` | Boolean | 是否正在加载数据 |
| `data_offset` | Number | 数据起始偏移位置（用于反向插入） |
| `old_params` | Object | 上次请求参数，防止重复加载 |
| `key_select_items` | Array | 支持键盘导航的选择项集合 |
| `check_changed_row` | Object | 最近一次变更的行数据 |
| `keyselectable` | Boolean | 是否允许键盘选择 |

---

## 生命周期方法

### `async build_all()`

主 UI 构建入口，按顺序执行以下步骤：

```js
await this.build_other();
this.scrollpanel.bind('min_threshold', this.load_previous_page.bind(this));
this.scrollpanel.bind('max_threshold', this.load_next_page.bind(this));
await this.render();
this.set_key_select_items();
```

#### 子构建方法：
| 方法 | 功能 |
|------|------|
| `build_title_widget()` | （预留）构建标题区 |
| `build_description_widget()` | （预留）构建描述区 |
| `build_toolbar_widget()` | 构建顶部工具栏 |
| `build_records_area()` | 创建滚动面板用于显示数据行 |
| `build_other()` | 子类可扩展的额外构建逻辑（空实现） |

---

### `async render(params)`

重新加载并渲染数据。

#### 参数
- `params`: 请求参数（合并到原始 `data_params`）

#### 流程
1. 若参数未变化 → 返回
2. 使用 `loader.loadData(params)` 获取数据
3. 清空当前内容
4. 执行前置处理 `before_data_handle()`
5. 处理数据 `dataHandle(d)`

> ⚠️ 自动去重：若 `params === old_params` 则跳过。

---

### `async before_data_handle()`

钩子函数，在数据处理前调用。可用于预处理或状态清理。

> 默认为空，供子类覆盖。

---

### `async dataHandle(d)`

处理从 `loader` 返回的数据对象。

#### 输入格式示例
```json
{
  "rows": [...],
  "add_page": 1,
  "delete_page": 2
}
```

#### 行为
- 调用 `renderPageData(rows, add_page)`
- 如果有 `delete_page`，调用 `delete_page(page_num)` 删除旧页

---

## 数据渲染相关

### `build_records_area()`

创建主数据显示区域：

```js
this.filler_widget = new bricks.Filler({});
this.add_widget(this.filler_widget);
this.scrollpanel = new bricks.VScrollPanel({});
this.filler_widget.add_widget(this.scrollpanel);
```

> 使用 `Filler + VScrollPanel` 结构确保布局适应。

---

### `async renderPageData(data, page)`

将一批数据渲染成可视行。

#### 参数
- `data`: 数组，每项是一个数据记录
- `page`: 页面编号

#### 特殊逻辑
- 如果不是最大页（历史页）：数据逆序，并从前部插入（维护时间顺序）
- 否则：正常追加至末尾

内部循环调用 `build_row()`。

---

### `async build_record_view(record)`

**抽象方法**：生成单条记录的 UI 组件。

#### 默认实现
```js
var w = new bricks.VBox({width: '100px', height:'100px'});
w.set_css('test_box');
return w;
```

> ✅ 必须由子类重写以实现具体展示样式（如表格行、卡片等）

---

### `async build_row(record, page, pos)`

将一条记录添加到 `scrollpanel` 中。

#### 参数
- `record`: 数据对象
- `page`: 所属页码
- `pos`: 插入位置（null 表示末尾）

#### 步骤
1. 调用 `build_record_view(record)` 创建 widget
2. 设置属性 `data-page` 便于后续删除
3. 添加到 `scrollpanel` 指定位置

---

## 工具栏与用户交互

### `build_toolbar_widget()`

根据配置生成工具栏按钮。

#### 支持的操作（当 `editable` 存在时）
| 名称 | 图标 | 条件 | 提示 |
|------|------|------|------|
| `add` | `add_icon` 或默认图标 | 总是显示 | 新增记录 |
| `update` | `update_icon` | 需选中行 | 更新选中项 |
| `clone` | `clone_icon` | 需选中行 | 克隆选中项 |
| `delete` | `delete_icon` | 需选中行 | 删除选中项 |

> 图标路径通过 `bricks_resource()` 解析 SVG 资源。

此外，支持合并外部传入的 `toolbar.tools`。

最终创建 `IconTextBar` 并绑定命令事件。

---

### `command_event_handle(event)`

处理工具栏点击事件。

#### 分发逻辑
| 命令名 | 行为 |
|--------|------|
| `add` | 调用 `add_record()` |
| `update` | 调用 `update_record(select_row)` |
| `clone` | 调用 `clone_record(select_row)` |
| `delete` | 调用 `delete_record(select_row)` |
| 其他 | 触发全局事件 `dispatch(name, data)` |

> 若操作需要选中行但无选中项，则提示错误。

---

## 编辑功能

### 字段控制

#### `get_edit_fields()`
提取可编辑字段，过滤掉 `editexclouded` 中指定的字段。

> 结果保存在 `this.fields` 数组中。

#### `get_hidefields()`
获取应隐藏提交的字段（来自 `data_params`），转换为 `{name, value, uitype: 'hide'}` 形式。

---

### 表单构建

| 方法 | 功能 |
|------|------|
| `build_add_form()` | 构建“新增”表单 |
| `build_update_form(data)` | 构建“更新”表单（带 id 隐藏域） |
| `build_clone_form(data)` | 构建“克隆”表单（不包含 id） |

所有表单均基于 `bricks.Form`，并注入隐藏字段和编辑字段。

---

### 弹窗管理

#### `build_window(icon, title, form)`
创建通用弹窗（`PopupWindow`）封装表单。

##### 配置
- 居中定位 (`archor: "cc"`)
- 可移动、可缩放
- 尺寸：宽 90%，高 70%
- 绑定表单的 `cancel` 事件关闭窗口

---

### 编辑流程

#### `add_record()`
1. 创建新增表单
2. 弹出窗口
3. 监听 `submited` 事件 → 调用 `add_record_finish(win, event)`

#### `add_record_finish(f, event)`
1. 关闭窗口
2. 重新加载数据
3. 解析响应 JSON 并构建反馈组件（如消息提示）

#### `update_record()`
1. 获取当前选中行数据
2. 创建更新表单（含 `id` 隐藏域）
3. 弹窗并监听 `submited` → `update_record_finish()`

#### `update_record_finish(win, form, event)`
1. 调用 `renew_record_view(form, row)` 更新本地视图
2. 显示服务器返回结果组件
3. 关闭窗口

#### `clone_record()`
同 `add_record`，但初始值为原记录数据

#### `delete_record(row, record)`
弹出确认对话框（`Conform`），确认后调用 `delete_record_act()`

#### `delete_record_act()`
1. 发送 DELETE 请求（POST with body）
2. 接收响应并构建反馈组件
3. 若成功（返回 Message 类型），移除对应行并刷新

---

## 滚动加载机制

### `load_previous_page()`

加载前一页数据（向上滚动触底）

#### 流程
1. 检查是否已在加载 → 防抖
2. 显示 loading 指示器（`Running`）
3. 调用 `loader.loadPreviousPage()`
4. 成功则调用 `dataHandle(d)`
5. 恢复滚动位置（按 `pos_rate`）
6. 隐藏 loading

> 错误被捕获并打印 debug 日志。

---

### `load_next_page()`

加载下一页数据（向下滚动触底）

逻辑类似 `load_previous_page()`，但无需调整滚动位置。

---

## 辅助方法

### `set_key_select_items()`
设置支持键盘导航的元素集合（除去第一个 filler widget）。

用于后续方向键选择。

---

### `delete_page(page)`
批量删除属于某一页的所有 DOM 元素。

通过 `[data-page="X"]` 查询 selector 获取 widgets 并逐个移除。

---

### `record_check_changed(event)`
处理行内复选框变更事件。

转发事件为 `row_check_changed`，携带 `user_data`。

---

### `renew_record_view(form, row)`
用表单最新值更新某行的 `user_data`。

```js
row.user_data = { ...row.user_data, ...form._getValue() };
row.renew(data); // 视图刷新
```

> `renew()` 是 widget 的生命周期方法，需子类实现。

---

## 事件系统

| 事件名 | 触发时机 | 参数 |
|-------|---------|------|
| `row_check_changed` | 行内复选框改变 | `{user_data}` |
| `command` | 工具栏按钮点击 | `{name, selected_row}` |
| `submited` | 表单提交成功 | `{params: Response}` |
| `conformed` / `discard` | 删除确认框选择 | —— |

---

## 设计原则与扩展建议

### 可扩展点（推荐子类覆盖）

| 方法 | 用途 |
|------|------|
| `build_other()` | 添加自定义组件 |
| `build_title_widget()` | 自定义标题 |
| `build_record_view(record)` | 自定义行渲染模板 |
| `before_data_handle()` | 数据加载前准备 |
| `renew(record)` in row widget | 行内容更新逻辑 |

---

### 性能优化特性

- 数据缓存与懒加载
- 滚动阈值触发分页
- 请求去重（参数比对）
- 页面级删除释放内存

---

## 使用示例（伪代码）

```js
let viewer = new bricks.DataViewer({
  data_url: '/api/users',
  data_params: { dept_id: 101 },
  page_rows: 20,
  editable: {
    add_icon: 'imgs/user_add.svg',
    new_data_url: '/api/users/create',
    update_data_url: '/api/users/update',
    delete_data_url: '/api/users/delete'
  },
  row_options: {
    fields: [
      { name: 'name', label: '姓名', uitype: 'text' },
      { name: 'age', label: '年龄', uitype: 'number' }
    ],
    editexclouded: ['created_at']
  }
});

// 自定义行渲染
viewer.build_record_view = function(record) {
  let w = new bricks.HBox({ width: '100%', padding: 10 });
  w.add_widget(new bricks.Label({ text: record.name }));
  w.add_widget(new bricks.Label({ text: record.age }));
  w.user_data = record;
  return w;
};
```

---

## 调试信息

- `bricks.debug_obj = this.scrollpanel;` —— 方便调试滚动容器
- 所有关键操作均有 `bricks.debug()` 输出
- 支持 `bricks.show_error()` 提示用户错误

---

## 依赖组件

| 组件 | 作用 |
|------|------|
| `bricks.VBox` | 布局基类 |
| `bricks.VScrollPanel` | 滚动容器 |
| `bricks.PageDataLoader` | 分页数据加载器 |
| `bricks.IconTextBar` | 工具栏 |
| `bricks.Form` | 表单引擎 |
| `bricks.PopupWindow` | 弹窗容器 |
| `bricks.Conform` | 确认对话框 |
| `bricks.Running` | 加载指示器 |
| `bricks.HttpJson` | JSON 请求客户端 |
| `bricks.widgetBuild` | 动态组件构建 |

---

## 版本历史

| 版本 | 修改内容 |
|------|----------|
| 1.0 | 初始公开文档版本 |

---

> 📝 文档生成时间：2025-04-05  
> © 2025 Bricks Framework Team