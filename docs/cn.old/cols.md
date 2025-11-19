# `bricks.Cols` 技术文档

> **模块**：`bricks.Cols`  
> **继承自**：`bricks.VBox`  
> **用途**：用于展示分页数据的列式布局组件，支持滚动加载、点击事件、动态渲染记录等特性。

---

## 概述

`bricks.Cols` 是一个基于 `VBox` 布局容器构建的数据展示控件，专为高效展示大量可分页数据而设计。它通过垂直滚动加载前后页内容（懒加载），并以列的形式排列每条记录，适用于移动端和桌面端的响应式布局。

该组件常用于新闻列表、商品展示、用户卡片墙等场景。

---

## 继承结构

```
bricks.Widget
 └── bricks.Container
      └── bricks.Box
           └── bricks.VBox
                └── bricks.Cols
```

---

## 配置选项（Constructor Options）

| 参数 | 类型 | 说明 |
|------|------|------|
| `data_url` | `String` | 获取数据的 API 地址，用于异步加载分页数据。 |
| `data_params` | `Object` | 初始请求参数对象，在每次请求时合并发送。 |
| `data_method` | `String` | 请求方法（如 `"GET"` 或 `"POST"`），默认由 `PageDataLoader` 决定。 |
| `page_rows` | `Number` | 每页显示的数据行数。 |
| `cache_limit` | `Number` | 缓存的最大页数，超出后自动清理旧页。 |
| `col_width` | `String/Number` | 单个列的宽度（CSS 格式，如 `"200px"`）。 |
| `col_cwidth` | `String` | 列的弹性宽度（CSS `flex` 值，如 `"1fr"`）。 |
| `mobile_cols` | `Number` | 移动端每行显示的列数，默认为 `2`。 |
| `record_view` | `Object` | 记录项的视图配置，定义如何使用 `widgetBuild` 渲染单条数据。 |
| `title` | `String` | 可选标题文本（支持国际化）。 |
| `description` | `String` | 可选描述文本（支持 Markdown）。 |
| `toolbar` | `Object` | 工具栏配置对象，将被构造成 `bricks.Toolbar` 实例。 |

---

## 事件（Events）

| 事件名 | 触发条件 | 参数 |
|--------|----------|------|
| `record_click` | 用户点击某条记录时触发 | `(recordData)` — 当前记录的原始数据对象 |
| `command` | 工具栏发出命令时转发此事件（通过 `dispatch`） | 命令名称及参数 |

> 使用 `.bind(event, handler)` 方法监听这些事件。

---

## 属性（Properties）

| 属性 | 类型 | 描述 |
|------|------|------|
| `loader` | `bricks.PageDataLoader` | 分页数据加载器实例，负责管理前后页数据获取与缓存。 |
| `container` | `bricks.VScrollPanel` | 外层垂直滚动容器，监听滚动阈值以触发分页加载。 |
| `main` | `bricks.DynamicColumn` | 实际存放记录项的动态列容器。 |
| `select_record` | `Widget` | 当前选中的记录对应的 widget 实例。 |
| `loading` | `Boolean` | 是否正在加载数据，防止重复请求。 |
| `title_w` | `bricks.Title4` | 标题组件实例（如果设置了 `title`）。 |
| `desc_w` | `bricks.MdWidget` | 描述组件实例（如果设置了 `description`）。 |
| `toolbar_w` | `bricks.Toolbar` | 工具栏组件实例（如果设置了 `toolbar`）。 |

---

## 方法（Methods）

### `constructor(opts)`

初始化 `Cols` 组件，并创建子组件结构。

#### 流程说明：
1. 调用父类构造函数。
2. 初始化 `PageDataLoader` 加载器。
3. 创建滚动容器 `VScrollPanel` 并绑定滚动边界事件。
4. 根据配置添加标题、描述、工具栏。
5. 创建主内容区域 `DynamicColumn`。
6. 延迟 0.5 秒调用 `load_first_page()` 加载首屏数据。

---

### `command_handle(event)`

处理来自工具栏的命令事件，并将其转为 `dispatch` 派发出去。

```js
this.toolbar_w.bind('command', this.command_handle.bind(this));
```

---

### `async handle_click(rw, event)`

处理单个记录项的点击事件。

#### 功能：
- 阻止事件冒泡。
- 取消上一个选中项的高亮样式。
- 设置当前项为选中状态并添加 `selected_record` CSS 类。
- 打印日志并派发 `record_click` 事件，携带 `user_data`。

> `rw.user_data` 存储的是该记录的原始数据对象。

---

### `async dataHandle(d)`

处理从 `loader` 返回的数据包，并渲染到界面。

#### 参数：
- `d`: 数据对象，格式如下：
  ```js
  {
    rows: [...],         // 数据数组
    add_page: Number,    // 添加到哪一页
    delete_page: Number, // （可选）需删除的页码（用于翻页替换）
    pos_rate: Number     // 滚动位置比例（0~1）
  }
  ```

#### 行为逻辑：
- 若是向前翻页（非最大页），则反转数据顺序以便插入顶部。
- 使用 `widgetBuild(record_view, parent, data)` 动态生成每个记录 widget。
- 绑定点击事件。
- 设置 `data-page` 属性用于后续删除。
- 插入至 `main` 容器开头或末尾。
- 如有 `delete_page`，调用 `delete_page()` 清理旧页。

---

### `delete_page(page)`

删除指定页码的所有 DOM 元素及其 widget。

#### 实现方式：
- 查询所有 `[data-page="X"]` 的元素。
- 获取其关联的 `bricks_widget` 实例。
- 从 `main` 中移除对应 widget。

---

### `create_main_widget()`

重新创建主内容区域（`DynamicColumn`），通常在刷新或重置布局时调用。

```js
this.main = new bricks.DynamicColumn({
  width: "100%",
  col_cwidth: this.col_cwidth,
  mobile_cols: this.mobile_cols || 2
});
```

---

### `async show_with_data(data)`

直接传入本地数据进行展示（绕过 `data_url` 请求）。

> ⚠️ 注意：目前代码中存在错误，应为 `await this.load_first_page(params);` 而不是 `await load_first_page(params);`

#### 正确实现建议：
```js
async show_with_data(data){
  this.data = data;
  this.data_url = null;
  await this.load_first_page(); // 不需要参数
}
```

---

### `async load_first_page(params)`

加载第一页数据。

#### 流程：
1. 显示加载动画（`Running` 组件）。
2. 检查是否已在加载中，避免重复请求。
3. 合并 `data_params` 与传入的 `params`。
4. 调用 `loader.loadData()` 获取数据。
5. 成功后清空主容器并调用 `dataHandle(d)`。
6. 出错时打印调试信息。
7. 最终隐藏加载动画，释放锁。

---

### `async load_previous_page()`

向上滚动触底时加载前一页。

- 自动计算滚动位置并恢复。
- 支持 `pos_rate` 定位。
- 错误时仅输出 debug 日志。

---

### `async load_next_page()`

向下滚动触底时加载下一页。

- 类似于 `load_previous_page`，但加载下一页。
- 注释掉的 `scrollTop` 表示暂未启用精确滚动定位。

---

## 内部机制

### 分页加载策略

利用 `bricks.PageDataLoader` 实现智能分页：

- 支持双向分页（上一页 / 下一页）。
- 支持缓存控制（`cache_pages`）。
- 数据按“页”组织，可通过 `data-page` 属性追踪来源。

### 滚动加载触发

通过 `VScrollPanel` 的两个事件实现无限滚动：

| 事件 | 触发条件 |
|------|----------|
| `min_threshold` | 滚动到顶部附近 → 加载前一页 |
| `max_threshold` | 滚动到底部附近 → 加载下一页 |

绑定方式：
```js
this.container.bind('min_threshold', this.load_previous_page.bind(this));
this.container.bind('max_threshold', this.load_next_page.bind(this));
```

---

## 使用示例

### 基本用法

```js
var cols = new bricks.Cols({
  title: "Latest Articles",
  description: "A list of recent posts.",
  data_url: "/api/articles",
  data_params: { category: "tech" },
  page_rows: 10,
  cache_limit: 5,
  col_cwidth: "1fr",
  mobile_cols: 2,
  record_view: {
    type: "CardView",
    fields: ["title", "summary", "image"]
  }
});

cols.bind("record_click", function(data) {
  console.log("Selected:", data);
});

document.body.appendChild(cols.dom_element);
```

### 手动加载本地数据

```js
cols.show_with_data({
  rows: [
    {id: 1, name: "Item 1"},
    {id: 2, name: "Item 2"}
  ]
});
```

---

## 注意事项

1. **性能优化**：只保留可视区域附近的页面，其他页面可手动卸载。
2. **内存管理**：长时间运行应用应注意 `cache_limit` 设置，避免内存泄漏。
3. **事件绑定**：确保 `handle_click` 使用 `.bind(this, w)` 正确绑定上下文。
4. **CSS 样式**：
   - `.selected_record`：用于标记选中项，请在 CSS 中定义高亮样式。
   - `.filler`：应用于 `container`，可能影响背景或间距。

---

## 注册信息

```js
bricks.Factory.register('Cols', bricks.Cols);
```

可在模板中通过 `<widget type="Cols" ...>` 方式声明使用。

---

## 版本信息

- **作者**：Bricks Framework Team
- **最后更新**：根据代码推断为现代异步 JS 架构（ES6+）
- **兼容性**：需支持 Promise、async/await、Custom Elements

---

## 相关组件

| 组件 | 作用 |
|------|------|
| `bricks.PageDataLoader` | 提供分页数据加载能力 |
| `bricks.VScrollPanel` | 提供滚动检测与阈值事件 |
| `bricks.DynamicColumn` | 实现响应式多列布局 |
| `bricks.widgetBuild` | 动态构建子组件的核心函数 |

---

✅ **文档完成度**：完整覆盖功能、接口、流程与使用方式。  
🔧 **待修复问题**：`show_with_data` 方法中对 `load_first_page` 的调用缺少 `this.` 上下文。