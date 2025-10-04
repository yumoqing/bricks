# `bricks.ChartLine` 技术文档

> 基于 ECharts 扩展的折线图组件，用于快速渲染多系列折线图。

---

## 概述

`bricks.ChartLine` 是 `bricks.EchartsExt` 的子类，封装了基于 ECharts 的折线图配置逻辑。它支持从远程数据源或本地数据动态生成折线图，并自动构建图表所需的 `options` 配置对象。

该组件通过工厂模式注册为 `'ChartLine'` 类型，可通过 `bricks.Factory.create('ChartLine', config)` 实例化。

---

## 依赖

- `bricks.EchartsExt`：基础 ECharts 扩展类。
- `bricks.Factory`：用于组件注册与创建的工厂类。

---

## 属性（配置项）

| 属性名         | 类型     | 必填 | 描述 |
|----------------|----------|------|------|
| `data_url`     | String   | 否   | 数据请求的 URL 地址。若提供，则通过 AJAX 获取数据。 |
| `data_params`  | Object   | 否   | 请求数据时携带的参数（GET 或 POST）。 |
| `method`       | String   | 否   | 请求方法，默认为 `'GET'`。可选 `'POST'`。 |
| `data`         | Array    | 否   | 直接传入的本地数据数组，格式为对象数组。例如：`[{name: 'A', value1: 10, value2: 20}]`。 |
| `line_options` | Object   | 否   | 自定义 ECharts 配置的扩展选项，会合并到最终的 `options` 中。 |
| `nameField`    | String   | 是   | 用作 X 轴分类字段的键名（如时间、类别等）。 |
| `valueFields`  | Array<String> | 是 | 一个字符串数组，表示需要绘制为折线的字段名称（Y 轴数据）。每个字段将生成一条折线。 |

> ⚠️ 注意：`data` 和 `data_url` 二选一。若两者都存在，优先使用 `data_url` 异步加载数据。

---

## 方法

### `values_from_data(data, name)`

从数据数组中提取指定字段的所有值。

#### 参数
- `data` (Array<Object>)：数据对象数组。
- `name` (String)：要提取的字段名。

#### 返回值
- Array：包含所有 `data[i][name]` 值的数组。

#### 示例
```js
const data = [{x: 'A', y: 1}, {x: 'B', y: 2}];
this.values_from_data(data, 'y'); // 返回 [1, 2]
```

---

### `lineinfo_from_data(data, name)`

生成单条折线的 ECharts 系列配置项。

#### 参数
- `data` (Array<Object>)：原始数据。
- `name` (String)：对应 `valueFields` 中的字段名，作为该折线的名称和数据来源。

#### 返回值
```js
{
  name: String,
  type: 'line',
  data: Array // 提取自 data 中对应字段的值
}
```

#### 示例
```js
this.lineinfo_from_data(data, 'sales');
// 返回：
// {
//   name: 'sales',
//   type: 'line',
//   data: [100, 150, 200]
// }
```

---

### `setup_options(data)`

根据输入数据构建完整的 ECharts 配置对象。

#### 参数
- `data` (Array<Object>)：待处理的数据数组。

#### 返回值
返回标准的 ECharts `options` 对象，结构如下：

```js
{
  tooltip: { trigger: 'axis' },
  legend: { data: valueFields },
  xAxis: {
    type: 'category',
    data: [/* 所有 nameField 对应的值 */]
  },
  yAxis: {
    type: 'value'
  },
  series: [/* 多个 lineinfo_from_data 生成的对象 */]
}
```

#### 内部流程
1. 提取 `nameField` 字段作为 X 轴数据。
2. 遍历 `valueFields`，每项生成一条折线系列。
3. 构建图例（legend）为 `valueFields` 数组。
4. 设置提示框为轴触发（`axis`）。
5. 返回完整配置。

---

## 使用示例

### HTML 结构
```html
<div id="chart-line" style="width: 800px; height: 400px;"></div>
```

### JavaScript 初始化

#### 方式一：使用本地数据
```js
const chart = new bricks.ChartLine({
  data: [
    { month: 'Jan', sales: 100, profit: 60 },
    { month: 'Feb', sales: 130, profit: 70 },
    { month: 'Mar', sales: 145, profit: 65 }
  ],
  nameField: 'month',
  valueFields: ['sales', 'profit']
});

chart.renderTo('#chart-line');
```

#### 方式二：从接口加载数据
```js
const chart = new bricks.ChartLine({
  data_url: '/api/chart-data',
  data_params: { year: 2023 },
  method: 'GET',
  nameField: 'date',
  valueFields: ['pv', 'uv', 'orders']
});

chart.renderTo('#chart-line');
```

---

## 图表效果说明

- 支持多条折线同时展示。
- X 轴为类目轴（category），显示 `nameField` 的值。
- Y 轴为数值轴（value）。
- 鼠标悬停时显示坐标轴对齐的提示框（tooltip）。
- 图例自动根据 `valueFields` 生成。

---

## 注册信息

```js
bricks.Factory.register('ChartLine', bricks.ChartLine);
```

可通过工厂方式创建：
```js
const chart = bricks.Factory.create('ChartLine', config);
```

---

## 注意事项

1. 数据必须是对象数组格式。
2. `nameField` 和 `valueFields` 中的字段必须存在于数据对象中。
3. 若使用 `data_url`，后端需返回 JSON 格式数组。
4. 可通过 `line_options` 进行高级定制（如颜色、样式、动画等），会深度合并至最终 options。

---

## 版本信息

- 创建者：`bricks` 框架团队
- 类型名称：`ChartLine`
- 继承自：`bricks.EchartsExt`
- 注册标识符：`'ChartLine'`

--- 

✅ 推荐用于快速搭建基于 ECharts 的多系列折线图场景。