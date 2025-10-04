# `bricks.ChartPie` 技术文档

## 概述

`bricks.ChartPie` 是基于 `bricks.EchartsExt` 扩展的类，用于创建可配置的饼图组件。它利用 ECharts 作为底层图表引擎，支持通过数据接口动态加载数据，并自动生成饼图及其图例。

该组件适用于需要展示分类占比数据的场景，如统计分析、仪表盘等。

---

## 继承关系

```js
class ChartPie extends bricks.EchartsExt
```

继承自 `bricks.EchartsExt`，具备基础的图表初始化、数据获取和事件处理能力。

---

## 构造函数

### `constructor(opts)`

#### 参数

| 参数名 | 类型   | 说明 |
|--------|--------|------|
| `opts` | Object | 配置选项对象，传递给父类及内部逻辑使用 |

#### 示例

```js
var pieChart = new bricks.ChartPie({
    nameField: 'category',
    valueFields: ['sales'],
    data_url: '/api/pie-data',
    pie_options: {
        type: 'pie',
        radius: '70%'
    },
    legend: {
        show: true,
        orient: 'vertical'
    }
});
```

> ⚠️ 注意：构造函数中调用了 `super(opts)`，因此所有父类支持的配置项也适用。

---

## 配置选项（Options）

| 属性名         | 类型     | 必填 | 默认值 | 说明 |
|----------------|----------|------|--------|------|
| `title`        | String   | 否   | -      | 图表标题 |
| `description`  | String   | 否   | -      | 图表描述信息（可用于辅助提示） |
| `legend`       | Object   | 否   | `{}`   | 图例配置项，将直接传入 ECharts 的 `legend` 配置 |
| `pie_options`  | Object   | 是   | -      | 饼图系列的核心配置，如 `type`, `radius`, `center` 等 |
| `data_url`     | String   | 否   | -      | 数据接口 URL，若提供则自动异步加载数据 |
| `nameField`    | String   | 是   | -      | 指定哪一字段作为饼图扇区的名称（即类别） |
| `valueFields`  | Array    | 是   | -      | 数组形式指定值字段（目前仅取第一个字段用于数值） |
| `data_params`  | Object   | 否   | -      | 请求 `data_url` 时携带的额外参数 |
| `data`         | Array    | 否   | `[]`   | 直接传入的静态数据数组 |

---

## 核心方法

### `setup_options(data)`

根据传入的数据生成符合 ECharts 要求的图表配置项。

#### 参数

| 参数名 | 类型  | 说明 |
|-------|-------|------|
| `data` | Array | 原始数据数组，通常来自 API 或静态赋值 |

#### 返回值

返回一个符合 ECharts schema 的配置对象，结构如下：

```js
{
    legend: { ... },           // 图例配置
    tooltip: {
        trigger: 'item'        // 鼠标悬停显示单项详情
    },
    series: [
        { /* 处理后的饼图系列配置 */ }
    ]
}
```

#### 内部逻辑说明

1. **数据映射**：
   - 使用 `this.nameField` 映射为每个扇区的 `name`
   - 使用 `this.valueFields[0]` 映射为 `value`
   - 构建新的数据格式：`{ name: '类别A', value: 100 }`

2. **合并饼图配置**：
   - 使用 `bricks.extend({}, this.pie_options)` 深拷贝避免污染原始配置
   - 将处理后的数据注入到 `series[0].data`

3. **图例处理**：
   - 若设置了 `legend`，则保留其配置
   - 注释代码表明原计划支持多字段图例，当前未启用

#### 示例输出

假设输入数据为：

```js
[
    { category: "手机", sales: 60 },
    { category: "平板", sales: 40 }
]
```

且配置为：

```js
{
    nameField: 'category',
    valueFields: ['sales'],
    pie_options: { type: 'pie', radius: '80%' }
}
```

则 `setup_options` 输出为：

```js
{
    legend: {},
    tooltip: { trigger: 'item' },
    series: [{
        type: 'pie',
        radius: '80%',
        data: [
            { name: '手机', value: 60 },
            { name: '平板', value: 40 }
        ]
    }]
}
```

---

## 支持的事件

### `element_click`

当用户点击饼图中的某个扇区时触发。

#### 回调参数

ECharts 提供的标准事件参数对象，包含：

- `name`: 扇区名称
- `value`: 对应数值
- `data`: 原始数据项
- `seriesName`: 系列名称（如有）

#### 使用方式

```js
pieChart.on('element_click', function(e) {
    console.log('Clicked:', e.name, e.value);
});
```

---

## 注册与使用

### 注册组件

```js
bricks.Factory.register('ChartPie', bricks.ChartPie);
```

通过工厂模式注册，后续可通过字符串标识符创建实例：

```js
var chart = bricks.Factory.create('ChartPie', options);
```

---

## 完整示例

```js
// 初始化饼图
var myPie = new bricks.ChartPie({
    nameField: 'product',
    valueFields: ['revenue'],
    data_url: '/report/sales-by-product',
    data_params: { year: 2024 },
    pie_options: {
        type: 'pie',
        radius: ['50%', '70%'],
        label: {
            show: true,
            formatter: '{b}: {d}%'
        }
    },
    legend: {
        show: true,
        orient: 'horizontal',
        bottom: '0%'
    },
    title: '2024 年产品收入分布'
});

// 渲染到 DOM 元素
myPie.renderTo('#chart-container');

// 绑定点击事件
myPie.on('element_click', function(e) {
    alert(`您点击了：${e.name}`);
});
```

---

## 注意事项

1. **`valueFields` 仅支持单个值字段**  
   当前实现只取数组的第一个字段作为数值来源，不支持多维度饼图。

2. **数据格式要求**  
   从接口或手动传入的数据必须是对象数组，且包含 `nameField` 和 `valueFields[0]` 字段。

3. **依赖 `bricks.extend` 工具函数**  
   用于安全拷贝 `pie_options`，确保不影响原始配置。

4. **需提前引入 ECharts**  
   本组件依赖全局 ECharts 库，请确保页面已正确加载。

---

## 版本信息

- 创建时间：未知
- 最后更新：根据代码注释推断近期维护中
- 所属框架：`bricks.js` 可视化组件库

--- 

✅ **建议扩展方向**：
- 支持多层环形图（嵌套饼图）
- 添加动画配置开关
- 支持主题颜色自定义
- 增加空数据状态提示