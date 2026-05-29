# `EchartsExt` 技术文档

> **模块路径**: `bricks.EchartsExt`  
> **继承自**: `bricks.VBox`  
> **依赖库**: [Apache ECharts](https://echarts.apache.org/)（需全局引入）

---

## 概述

`bricks.EchartsExt` 是一个基于 `ECharts` 的可扩展图表组件，封装在 `bricks.js` 前端框架中。它继承自 `VBox` 容器类，支持动态数据加载、响应式布局以及点击事件处理，适用于展示多维数据的可视化图表（如柱状图、折线图、饼图等）。

该组件支持从本地数据或远程 URL 加载数据，并能自动将“长格式”数据透视为“宽格式”，便于多系列图表渲染。

---

## 初始化选项（Constructor Options）

```js
new bricks.EchartsExt({
  title:        String,     // 图表标题
  description:  String,     // 图表描述（可选）
  data_url:     String,     // 远程数据接口地址
  data_params:  Object,     // 请求参数（附加到 data_url）
  method:       String,     // HTTP 方法，默认 'GET'
  user_data:    Array,      // 本地数据数组（优先级高于 data_url）
  nameField:    String,     // 分组字段名（如：类别名称），默认 'name'
  valueField:   String,     // 数值字段名（单系列时使用），默认 'value'
  serieField:   String,     // 系列字段名（用于区分多个数据系列）
  valueFields:  Array,      // 多数值字段数组（若未设置，则根据 serieField 自动提取）
  pie_options:  Object,     // 特定于饼图的配置项（可选）
  idField:      String      // 唯一标识字段，默认 'id'
})
```

> ⚠️ 注意：`user_data` 和 `data_url` 二选一。若两者都存在，优先使用 `user_data`。

---

## 属性说明

| 属性 | 类型 | 描述 |
|------|------|------|
| `idField` | String | 数据对象唯一标识字段，默认 `'id'` |
| `nameField` | String | 作为 X 轴或分类维度的字段，默认 `'name'` |
| `valueField` | String | 主数值字段，默认 `'value'`（仅单系列有效） |
| `serieField` | String | 区分不同数据系列的字段（例如：“类型”、“年份”） |
| `valueFields` | Array | 所有需要显示的数据系列名称列表（自动从 `serieField` 提取） |
| `user_data` | Array | 当前加载的数据集（原始格式） |
| `data_url` | String | 数据请求地址 |
| `data_params` | Object | 额外请求参数 |
| `holder` | `bricks.Filler` | 内部占位容器，用于承载 ECharts 实例 |
| `chart` | `echarts.ECharts` | ECharts 实例对象 |
| `method` | String | HTTP 请求方法，默认 `'GET'` |

---

## 方法详解

### `constructor(opts)`

初始化图表组件，执行以下操作：

- 设置默认字段；
- 创建标题和描述组件；
- 初始化内部容器 `holder`；
- 初始化 ECharts 实例；
- 若存在 `user_data` 则立即渲染；否则尝试通过 `data_url` 异步加载数据；
- 绑定窗口/元素重绘事件以触发图表 resize。

```js
this.bind('element_resize', this.chart.resize.bind(this.chart));
```

---

### `pivotify(data) → Array`

将“长格式”数据转换为“宽格式”数据，便于多系列图表展示。

#### 输入数据示例（长格式）：
```json
[
  { "name": "A", "type": "销量", "value": 100 },
  { "name": "A", "type": "利润", "value": 30 },
  { "name": "B", "type": "销量", "value": 150 }
]
```

#### 输出结果（宽格式）：
```json
[
  { "name": "A", "销量": 100, "利润": 30 },
  { "name": "B", "销量": 150 }
]
```

#### 处理逻辑：
1. 提取所有唯一的 `serieField` 值作为新字段；
2. 按 `nameField` 排序；
3. 构建以 `nameField` 为键的对象字典；
4. 将每个记录映射到对应行并填充相应系列值；
5. 返回对象值数组并排序。

> ✅ 使用场景：当 `serieField` 存在时，自动启用透视功能。

---

### `get_series(data) → Array`

提取数据中所有唯一的系列名称（基于 `this.serieField`）。

#### 示例：
```js
data = [
  { type: 'sales', value: 100 },
  { type: 'profit', value: 20 },
  { type: 'sales', value: 80 }
]
// get_series(data) → ['sales', 'profit']
```

返回值用于生成图例（legend）或系列配置。

---

### `render_data()`

根据当前 `user_data` 渲染图表。

#### 步骤：
1. 若存在 `serieField`，则调用 `pivotify()` 转换数据；
2. 初始化新的 ECharts 实例（防止内存泄漏）；
3. 调用 `setup_options(data)` 获取图表配置；
4. 补充 `grid` 布局配置；
5. 若有多系列且存在 `legend`，更新其 `data` 字段；
6. 应用配置到 ECharts 实例；
7. 绑定点击事件处理器 `click_handle`。

> 🔁 支持热更新：每次调用此方法都会重新绘制图表。

---

### `click_handle(params)`

ECharts 点击事件回调函数。

#### 参数：
- `params`: ECharts 返回的点击事件参数对象

#### 动作：
- 打印调试信息至控制台；
- 触发自定义事件 `'element_click'`，携带原始数据项：

```js
this.dispatch('element_click', this.user_data[params.dataIndex]);
```

> 🎯 可用于外部监听数据项点击行为，实现联动交互。

---

### `async render_urldata(params = {})`

异步从远程 URL 加载数据并渲染图表。

#### 流程：
1. 合并默认参数 `this.data_params` 与传入参数；
2. 使用 `bricks.HttpJson` 发起 HTTP 请求；
3. 成功后保存响应数据至 `this.user_data`；
4. 调用 `render_data()` 渲染图表。

#### 示例请求：
```js
await jc.httpcall(this.data_url, {
  method: this.method || 'GET',
  params: _params
});
```

> ⏱️ 默认延迟 0.1 秒调度，避免构造期间 DOM 未就绪。

---

## 事件（Events）

| 事件名 | 触发时机 | 携带数据 |
|--------|----------|---------|
| `element_click` | 用户点击图表中的某个数据点 | 对应的原始数据项（来自 `user_data`） |
| `element_resize` | 元素尺寸变化时（由父容器触发） | —— |

可通过 `bind()` 监听这些事件：

```js
chart.bind('element_click', function(dataItem) {
  console.log('Clicked:', dataItem);
});
```

---

## 数据结构要求

### 本地数据（`user_data`）格式

```json
[
  {
    "name": "类别A",
    "value": 120,
    "type": "线上"
  },
  {
    "name": "类别A",
    "value": 80,
    "type": "线下"
  },
  ...
]
```

- 必须是对象数组；
- 至少包含 `nameField` 和 `valueField` 字段；
- 若使用多系列，需提供 `serieField` 字段。

---

## 样式与布局

- 图表容器自动适应父元素大小；
- `grid` 配置留白 3%，确保标签不被裁剪；
- 支持响应式设计，绑定 `element_resize` 事件自动调整图表尺寸。

---

## 使用示例

### 示例 1：使用本地数据创建多系列柱状图

```js
var chart = new bricks.EchartsExt({
  title: "销售统计",
  description: "各区域线上线下销售额对比",
  user_data: [
    { name: "北京", type: "线上", value: 200 },
    { name: "北京", type: "线下", value: 150 },
    { name: "上海", type: "线上", value: 180 },
    { name: "上海", type: "线下", value: 170 }
  ],
  nameField: "name",
  valueField: "value",
  serieField: "type"
});

chart.bind('element_click', function(item) {
  alert("点击了：" + item.name);
});
```

### 示例 2：从 API 加载数据

```js
var chart = new bricks.EchartsExt({
  title: "实时订单量",
  data_url: "/api/orders",
  data_params: { period: "today" },
  nameField: "hour",
  valueField: "count",
  method: "GET"
});
```

---

## 注意事项

1. **ECharts 必须已全局加载**，否则 `echarts.init` 会报错；
2. `setup_options(data)` 方法需子类实现，用于定义具体图表类型（如 bar、line、pie）；
3. 若未定义 `serieField`，则不会进行数据透视；
4. `valueFields` 若手动指定，则忽略自动提取逻辑；
5. 建议对大数据集做分页或聚合处理，避免性能问题。

---

## 调试提示

- 查看浏览器控制台输出 `opts=` 可检查最终传递给 ECharts 的配置；
- 确保 `this.holder.dom_element` 已正确挂载且非空；
- 检查网络请求是否成功返回合法 JSON 数据。

---

## 版本信息

- **Bricks Framework**: v1.x+
- **ECharts 支持版本**: ≥ 5.0
- **兼容性**: 支持现代浏览器（Chrome / Firefox / Edge / Safari）

---

> 💡 提示：建议结合 `bricks.Layout` 系统使用，实现复杂仪表盘布局。