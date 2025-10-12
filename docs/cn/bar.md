# `bricks.ChartBar` 技术文档

> 基于 ECharts 的柱状图组件，用于快速生成基于数据配置的柱状图表。

---

## 概述

`bricks.ChartBar` 是 `bricks` 框架中的一个图表扩展类，继承自 `bricks.EchartsExt`。它封装了使用 [Apache ECharts](https://echarts.apache.org/) 绘制**柱状图（Bar Chart）**所需的基本逻辑，支持通过配置项动态加载数据并渲染图表。

该组件适用于需要展示分类维度下多个指标对比的场景，例如销量统计、用户增长等。

---

## 类定义

```javascript
bricks.ChartBar = class extends bricks.EchartsExt
```

- **命名空间**: `bricks.ChartBar`
- **父类**: `bricks.EchartsExt`
- **注册名称**: `'ChartBar'`（通过 `bricks.Factory.register` 注册）

---

## 配置参数

`ChartBar` 支持以下初始化配置项：

| 参数 | 类型 | 说明 |
|------|------|------|
| `data_url` | `String` (可选) | 数据请求的 URL 地址。若提供，则通过 AJAX 获取数据。 |
| `data_params` | `Object` (可选) | 发送请求时携带的参数（与 `data_url` 配合使用）。 |
| `method` | `String` (可选) | 请求方法，默认为 `'GET'`，可设为 `'POST'` 等。 |
| `data` | `Array<Object>` (可选) | 直接传入的数据数组，格式为对象列表。优先级高于 `data_url`。 |
| `nameField` | `String` | 指定作为 X 轴分类字段的键名（如：地区、时间等）。 |
| `valueFields` | `Array<String>` | 指定作为系列（Series）值字段的键名数组（即多个指标列）。 |

### 示例数据结构

```json
[
  { "category": "A", "sales": 120, "profit": 80 },
  { "category": "B", "sales": 150, "profit": 90 }
]
```

对应配置：
```js
{
  data: [...],
  nameField: "category",
  valueFields: ["sales", "profit"]
}
```

---

## 方法说明

### `values_from_data(data, name)`

从数据集中提取指定字段的所有值。

#### 参数
- `data`: `Array<Object>` - 数据源数组。
- `name`: `String` - 要提取的字段名。

#### 返回值
- `Array` - 包含所有 `data[i][name]` 值的数组。

#### 示例
```js
this.values_from_data([
  { year: '2020', sales: 100 },
  { year: '2021', sales: 130 }
], 'sales');
// → [100, 130]
```

---

### `lineinfo_from_data(data, name)`

构建单个 ECharts Series 配置对象（类型为 bar）。

#### 参数
- `data`: `Array<Object>` - 数据源。
- `name`: `String` - 字段名，用作 series 名称和数据提取依据。

#### 返回值
```js
{
  name: String,
  type: 'bar',
  data: Array // 提取自 data 中该字段的值
}
```

#### 示例
```js
this.lineinfo_from_data(data, 'sales');
// → { name: 'sales', type: 'bar', data: [100, 130] }
```

---

### `setup_options(data)`

根据输入数据生成完整的 ECharts 配置选项（`option` 对象）。

#### 参数
- `data`: `Array<Object>` - 处理后的数据集。

#### 返回值 (`Object`)
返回标准的 ECharts 配置对象，包含：

```js
{
  tooltip: { trigger: 'axis' },
  legend: { data: [...] },         // 分类名称列表
  xAxis: {
    type: 'category',
    data: [...]                    // nameField 对应的值列表
  },
  yAxis: {
    type: 'value'
  },
  series: [ ... ]                  // 每个 valueField 对应一个 bar series
}
```

#### 内部逻辑
1. 提取 `nameField` 的值作为 X 轴和图例数据；
2. 遍历 `valueFields`，为每个字段创建一个柱状图系列；
3. 整合成最终的 `options` 对象供 ECharts 渲染使用。

---

## 使用示例

```js
var chart = new bricks.ChartBar({
  data_url: '/api/sales-data',
  nameField: 'month',
  valueFields: ['income', 'expense']
});

chart.renderTo('#chart-container');
```

或直接传入数据：

```js
var chart = new bricks.ChartBar({
  data: [
    { month: 'Jan', income: 5000, expense: 3000 },
    { month: 'Feb', income: 6000, expense: 3500 }
  ],
  nameField: 'month',
  valueFields: ['income', 'expense']
});

chart.renderTo(document.getElementById('main'));
```

---

## 图表渲染效果

- **X 轴**：显示 `nameField` 的值（类别轴）。
- **Y 轴**：数值轴，自动适配最大最小值。
- **Tooltip**：开启轴触发提示，鼠标悬停显示各系列数值。
- **Legend**：图例显示所有 `valueFields` 名称。
- **Series**：每个 `valueField` 显示为一组柱子（支持多组并列柱状图）。

---

## 注册机制

```js
bricks.Factory.register('ChartBar', bricks.ChartBar);
```

允许通过工厂模式创建实例：

```js
bricks.Factory.create('ChartBar', config);
```

---

## 注意事项

1. 必须确保页面已引入 ECharts 库且 `bricks.EchartsExt` 已正确定义。
2. `nameField` 和 `valueFields` 必须存在于数据对象中。
3. 若同时设置了 `data` 和 `data_url`，将优先使用 `data`。
4. 支持异步数据加载，`data_url` 返回的数据应为 JSON 数组。

---

## 版本信息

- **作者**: bricks framework team
- **版本**: 1.0.0
- **依赖**: `ECharts`, `bricks.EchartsExt`

--- 

📌 *文档生成时间：2025-04-05*